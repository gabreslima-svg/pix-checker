"use client";

import { useEffect, useState } from "react";
import { parseBrCode } from "@/lib/brcode";
import { supabase } from "@/lib/supabase";

type Cobranca = {
  id: string;
  brcode: string;
  tipo: "dinamico" | "estatico" | "invalido";
  url: string | null;
  psp: string | null;
  merchant_name: string | null;
  txid: string | null;
  status: string | null;
  valor: string | null;
  end_to_end_id: string | null;
  horario_pagamento: string | null;
  ultima_checagem: string | null;
  erro: string | null;
  observacao: string | null;
  created_at: string;
};

const STATUS_LABELS: { [k: string]: string } = {
  ATIVA: "ATIVA / pendente",
  CONCLUIDA: "CONCLUIDA / paga",
  REMOVIDA_PELO_USUARIO_RECEBEDOR: "removida pelo recebedor",
  REMOVIDA_PELO_PSP: "removida pelo PSP",
  REMOVIDA_PERMANENTE: "410 / removida permanentemente",
  NAO_ENCONTRADA: "404 / nao encontrada",
  AUTH_NECESSARIA: "auth necessaria",
};

export default function Home() {
  const [input, setInput] = useState("");
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [loading, setLoading] = useState(false);
  const [checagemAtiva, setChecagemAtiva] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function carregar() {
    const { data, error } = await supabase
      .from("cobrancas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error && data) setCobrancas(data as Cobranca[]);
  }

  useEffect(() => { carregar(); }, []);

  async function consultarPorId(id: string, url: string) {
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      await supabase.from("cobrancas").update({
        status: data.status || null,
        valor: data.valor || null,
        end_to_end_id: data.endToEndId || null,
        horario_pagamento: data.horario || null,
        ultima_checagem: new Date().toISOString(),
        erro: data.ok ? null : data.erro || "Erro desconhecido",
      }).eq("id", id);
    } catch (e: any) {
      await supabase.from("cobrancas").update({
        ultima_checagem: new Date().toISOString(),
        erro: e?.message || "Erro na chamada",
      }).eq("id", id);
    }
  }

  async function adicionar() {
    if (!input.trim()) return;
    setLoading(true);
    setMsg("");

    const linhas = input.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean);

    let dinamicosNovos = 0, estaticosNovos = 0, invalidos = 0, duplicados = 0;
    const idsParaConsultar: { id: string; url: string }[] = [];

    for (const linha of linhas) {
      const parsed = parseBrCode(linha);

      // Verifica duplicado pelo brcode exato
      const { data: existente } = await supabase
        .from("cobrancas")
        .select("id, tipo, url")
        .eq("brcode", linha)
        .maybeSingle();

      if (existente) {
        duplicados++;
        // Se for dinamico, ja agenda re-consulta
        if (existente.tipo === "dinamico" && existente.url) {
          idsParaConsultar.push({ id: existente.id, url: existente.url });
        }
        continue;
      }

      if (parsed.tipo === "estatico") {
        estaticosNovos++;
        await supabase.from("cobrancas").insert({
          brcode: linha,
          tipo: "estatico",
          merchant_name: parsed.merchantName,
          observacao: "Estatico: nao da pra consultar status",
        });
        continue;
      }

      if (parsed.tipo === "invalido") {
        invalidos++;
        await supabase.from("cobrancas").insert({
          brcode: linha.substring(0, 200),
          tipo: "invalido",
          erro: parsed.erro,
        });
        continue;
      }

      dinamicosNovos++;
      const { data } = await supabase.from("cobrancas").insert({
        brcode: linha,
        tipo: "dinamico",
        url: parsed.url,
        psp: parsed.psp,
        merchant_name: parsed.merchantName,
        txid: parsed.txid,
      }).select("id").single();

      if (data?.id && parsed.url) {
        idsParaConsultar.push({ id: data.id, url: parsed.url });
      }
    }

    const partes: string[] = [];
    const novos = dinamicosNovos + estaticosNovos;
    if (novos > 0) partes.push(novos + " novo(s)");
    if (duplicados > 0) partes.push(duplicados + " duplicado(s) re-consultado(s)");
    if (invalidos > 0) partes.push(invalidos + " invalido(s)");

    setMsg(linhas.length + " processado(s): " + (partes.join(", ") || "nada"));
    setInput("");
    await carregar();

    // Consulta os dinamicos (novos + duplicados re-consultados)
    if (idsParaConsultar.length > 0) {
      for (let i = 0; i < idsParaConsultar.length; i++) {
        const item = idsParaConsultar[i];
        setMsg("consultando " + (i + 1) + " de " + idsParaConsultar.length + "...");
        await consultarPorId(item.id, item.url);
      }
      await carregar();
      const final: string[] = [];
      if (novos > 0) final.push(novos + " novo(s)");
      if (duplicados > 0) final.push(duplicados + " duplicado(s) atualizado(s)");
      if (invalidos > 0) final.push(invalidos + " invalido(s)");
      setMsg(linhas.length + " processado(s) · " + final.join(", "));
    }

    setLoading(false);
  }

  async function verificarUma(c: Cobranca) {
    if (c.tipo !== "dinamico" || !c.url) return;
    setChecagemAtiva(c.id);
    try {
      await consultarPorId(c.id, c.url);
      await carregar();
    } finally {
      setChecagemAtiva(null);
    }
  }

  async function verificarTodas() {
    const aVerificar = cobrancas.filter((c) => c.tipo === "dinamico" && c.url);
    setLoading(true);
    for (let i = 0; i < aVerificar.length; i++) {
      const c = aVerificar[i];
      setMsg("re-consultando " + (i + 1) + " de " + aVerificar.length + "...");
      await consultarPorId(c.id, c.url!);
    }
    setMsg(aVerificar.length + " consultada(s)");
    await carregar();
    setLoading(false);
  }

  async function remover(id: string) {
    await supabase.from("cobrancas").delete().eq("id", id);
    await carregar();
  }

  const ordenadas = [...cobrancas].sort((a, b) => {
    const aT = a.ultima_checagem ? new Date(a.ultima_checagem).getTime() : 0;
    const bT = b.ultima_checagem ? new Date(b.ultima_checagem).getTime() : 0;
    if (aT === 0 && bT === 0) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (aT === 0) return 1;
    if (bT === 0) return -1;
    return bT - aT;
  });

  const exibidas = filtroStatus === "todos"
    ? ordenadas
    : filtroStatus === "nao_consultados"
    ? ordenadas.filter((c) => !c.status && c.tipo === "dinamico")
    : filtroStatus === "estaticos"
    ? ordenadas.filter((c) => c.tipo === "estatico")
    : ordenadas.filter((c) => c.status === filtroStatus);

  const totais = {
    total: cobrancas.length,
    dinamicas: cobrancas.filter((c) => c.tipo === "dinamico").length,
    estaticas: cobrancas.filter((c) => c.tipo === "estatico").length,
    pagas: cobrancas.filter((c) => c.status === "CONCLUIDA").length,
    pendentes: cobrancas.filter((c) => c.status === "ATIVA").length,
    removidas: cobrancas.filter((c) => c.status && c.status.startsWith("REMOVIDA")).length,
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.logo}>
              <span style={styles.logoDot}>●</span> PIX<span style={styles.logoAccent}>CHECKER</span>
            </div>
            <p style={styles.tagline}>
              <span style={styles.taglineSerif}>recupere </span>
              vendas pagas que o webhook nao entregou
            </p>
          </div>
          <div style={styles.stats}>
            <Stat label="total" value={totais.total} />
            <Stat label="dinamicas" value={totais.dinamicas} />
            <Stat label="estaticas" value={totais.estaticas} dim />
            <Stat label="pendentes" value={totais.pendentes} color="var(--yellow)" />
            <Stat label="pagas" value={totais.pagas} color="var(--green)" />
            <Stat label="removidas" value={totais.removidas} color="var(--red)" />
          </div>
        </header>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>01 · adicionar e consultar BR Codes</span>
            <span style={styles.cardHelp}>um por linha · duplicados sao re-consultados</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="00020126850014br.gov.bcb.pix2563pix.onlyup.com.br/qr/v3/at/..."
            style={styles.textarea}
            rows={5}
          />
          <div style={styles.actions}>
            <button onClick={adicionar} disabled={loading || !input.trim()} style={{ ...styles.btn, ...styles.btnPrimary }}>
              {loading ? "processando..." : "adicionar e consultar"}
            </button>
            {msg && <span style={styles.msg}>{msg}</span>}
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>02 · lista de cobrancas</span>
            <div style={styles.cardActions}>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={styles.select}>
                <option value="todos">todos os status</option>
                <option value="nao_consultados">nao consultados</option>
                <option value="ATIVA">ATIVA / pendente</option>
                <option value="CONCLUIDA">CONCLUIDA / paga</option>
                <option value="REMOVIDA_PERMANENTE">removida permanente (410)</option>
                <option value="REMOVIDA_PELO_USUARIO_RECEBEDOR">removida pelo recebedor</option>
                <option value="REMOVIDA_PELO_PSP">removida pelo PSP</option>
                <option value="NAO_ENCONTRADA">nao encontrada (404)</option>
                <option value="AUTH_NECESSARIA">auth necessaria</option>
                <option value="estaticos">apenas estaticos</option>
              </select>
              <button onClick={verificarTodas} disabled={loading || totais.dinamicas === 0} style={{ ...styles.btn, ...styles.btnSecondary }}>
                re-consultar todas
              </button>
            </div>
          </div>

          {exibidas.length === 0 ? (
            <div style={styles.empty}>
              <span style={styles.emptyText}>
                {cobrancas.length === 0 ? "nenhuma cobranca ainda" : "nenhuma cobranca nesse filtro"}
              </span>
            </div>
          ) : (
            <div style={styles.table}>
              <div style={styles.tableHead}>
                <div style={{ flex: "0 0 90px" }}>tipo</div>
                <div style={{ flex: "1 1 160px" }}>PSP</div>
                <div style={{ flex: "1 1 200px" }}>merchant / txid</div>
                <div style={{ flex: "0 0 100px" }}>valor</div>
                <div style={{ flex: "0 0 200px" }}>status</div>
                <div style={{ flex: "0 0 140px" }}>checagem</div>
                <div style={{ flex: "0 0 90px" }}>acao</div>
              </div>
              {exibidas.map((c) => (
                <CobrancaRow key={c.id} c={c} verificando={checagemAtiva === c.id} onVerificar={() => verificarUma(c)} onRemover={() => remover(c.id)} />
              ))}
            </div>
          )}
        </section>

        <footer style={styles.footer}>
          <span>consulta direta no endpoint publico do PSP · sem mover dinheiro</span>
        </footer>
      </div>
    </main>
  );
}

function Stat({ label, value, color, dim }: { label: string; value: number; color?: string; dim?: boolean }) {
  return (
    <div style={styles.statBox}>
      <div style={{ ...styles.statValue, color: color || (dim ? "var(--text-faint)" : "var(--text)") }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function CobrancaRow({ c, verificando, onVerificar, onRemover }: { c: Cobranca; verificando: boolean; onVerificar: () => void; onRemover: () => void }) {
  const statusColor =
    c.status === "CONCLUIDA" ? "var(--green)" :
    c.status === "ATIVA" ? "var(--yellow)" :
    c.status && c.status.startsWith("REMOVIDA") ? "var(--red)" :
    c.status === "NAO_ENCONTRADA" ? "var(--text-faint)" :
    c.status === "AUTH_NECESSARIA" ? "#ff9b3d" :
    "var(--text-faint)";

  const tipoStyle =
    c.tipo === "dinamico" ? { bg: "rgba(46, 230, 141, 0.1)", fg: "var(--green)" } :
    c.tipo === "estatico" ? { bg: "rgba(245, 197, 66, 0.1)", fg: "var(--yellow)" } :
    { bg: "rgba(255, 90, 90, 0.1)", fg: "var(--red)" };

  const statusLabel = c.status ? (STATUS_LABELS[c.status] || c.status) : null;

  return (
    <div style={{ ...styles.tableRow, background: c.status === "CONCLUIDA" ? "rgba(46, 230, 141, 0.05)" : undefined }}>
      <div style={{ flex: "0 0 90px" }}>
        <span style={{ ...styles.tipoBadge, background: tipoStyle.bg, color: tipoStyle.fg }}>{c.tipo}</span>
      </div>
      <div style={{ flex: "1 1 160px", ...styles.cellDim }}>{c.psp || "—"}</div>
      <div style={{ flex: "1 1 200px", overflow: "hidden" }}>
        <div style={styles.cellMain}>{c.merchant_name || "—"}</div>
        <div style={styles.cellSub}>{c.txid || c.erro || "—"}</div>
      </div>
      <div style={{ flex: "0 0 100px" }}>{c.valor ? "R$ " + c.valor : <span style={styles.cellFaint}>—</span>}</div>
      <div style={{ flex: "0 0 200px" }}>
        {statusLabel ? <span style={{ color: statusColor, fontWeight: 500 }}>{statusLabel}</span> : <span style={styles.cellFaint}>nao consultado</span>}
        {c.end_to_end_id && <div style={styles.cellTiny}>E2E: {c.end_to_end_id.substring(0, 16)}</div>}
      </div>
      <div style={{ flex: "0 0 140px", ...styles.cellDim }}>
        {c.ultima_checagem ? new Date(c.ultima_checagem).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
      </div>
      <div style={{ flex: "0 0 90px", display: "flex", gap: 6 }}>
        {c.tipo === "dinamico" && (
          <button onClick={onVerificar} disabled={verificando} style={{ ...styles.btnSmall, ...styles.btnPrimary }}>
            {verificando ? "..." : "↻"}
          </button>
        )}
        <button onClick={onRemover} style={{ ...styles.btnSmall, ...styles.btnGhost }}>×</button>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  main: { minHeight: "100vh", padding: "32px 24px 60px" },
  container: { maxWidth: 1280, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: 40, paddingBottom: 24, borderBottom: "1px solid var(--border)", flexWrap: "wrap" },
  logo: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 8 },
  logoDot: { color: "var(--accent)", fontSize: 12 },
  logoAccent: { color: "var(--accent)", marginLeft: 4 },
  tagline: { color: "var(--text-dim)", margin: "8px 0 0", fontSize: 13 },
  taglineSerif: { fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, color: "var(--text)" },
  stats: { display: "flex", gap: 20, flexWrap: "wrap" },
  statBox: { textAlign: "right" },
  statValue: { fontSize: 26, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" },
  statLabel: { fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 },
  card: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, marginBottom: 20 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 },
  cardLabel: { fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 500 },
  cardHelp: { fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "var(--text-faint)" },
  cardActions: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
  select: { background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border-strong)", borderRadius: 6, padding: "8px 12px", fontSize: 12, fontFamily: "var(--mono)", cursor: "pointer", outline: "none" },
  textarea: { width: "100%", background: "var(--bg)", border: "1px solid var(--border-strong)", borderRadius: 6, padding: 14, color: "var(--text)", fontSize: 12, fontFamily: "var(--mono)", resize: "vertical", minHeight: 100, outline: "none" },
  actions: { display: "flex", gap: 16, alignItems: "center", marginTop: 12, flexWrap: "wrap" },
  btn: { padding: "10px 18px", fontSize: 12, fontWeight: 500, borderRadius: 6, textTransform: "lowercase", letterSpacing: "0.02em", transition: "all 0.15s" },
  btnPrimary: { background: "var(--accent)", color: "var(--bg)" },
  btnSecondary: { background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border-strong)" },
  btnGhost: { background: "transparent", color: "var(--text-faint)", border: "1px solid var(--border)" },
  btnSmall: { padding: "6px 10px", fontSize: 12, borderRadius: 4, fontWeight: 600 },
  msg: { fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "var(--text-dim)" },
  empty: { padding: "60px 20px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 6 },
  emptyText: { color: "var(--text-faint)", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16 },
  table: { border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" },
  tableHead: { display: "flex", gap: 12, padding: "10px 14px", background: "var(--bg-elevated)", fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, borderBottom: "1px solid var(--border)" },
  tableRow: { display: "flex", gap: 12, padding: "12px 14px", fontSize: 12, borderBottom: "1px solid var(--border)", alignItems: "center" },
  tipoBadge: { display: "inline-block", padding: "3px 8px", borderRadius: 3, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 },
  cellMain: { color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cellSub: { color: "var(--text-faint)", fontSize: 10, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cellTiny: { color: "var(--text-faint)", fontSize: 9, marginTop: 3 },
  cellDim: { color: "var(--text-dim)" },
  cellFaint: { color: "var(--text-faint)" },
  footer: { marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--text-faint)", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 13 },
};
