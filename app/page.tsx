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
  pagador_nome: string | null;
  pagador_documento: string | null;
  ultima_checagem: string | null;
  erro: string | null;
  observacao: string | null;
  created_at: string;
  mudanca_nao_vista: boolean;
};

type HistoricoItem = {
  id: string;
  cobranca_id: string;
  status: string | null;
  valor: string | null;
  end_to_end_id: string | null;
  horario_pagamento: string | null;
  pagador_nome: string | null;
  pagador_documento: string | null;
  erro: string | null;
  consultado_em: string;
};

const STATUS_LABELS: { [k: string]: string } = {
  ATIVA: "ATIVA / pendente",
  CONCLUIDA: "CONCLUIDA / paga",
  REMOVIDA_PELO_USUARIO_RECEBEDOR: "removida pelo recebedor",
  REMOVIDA_PELO_PSP: "removida pelo PSP",
  REMOVIDA_PERMANENTE: "410 / removida permanentemente",
  NAO_ENCONTRADA: "404 / nao encontrada",
  AUTH_NECESSARIA: "auth necessaria",
  PSP_FECHADO: "PSP fechado (401/403)",
  PSP_INACESSIVEL: "PSP bloqueia consulta",
};

function extrairBrCodes(input: string): string[] {
  const limpo = input.replace(/\s+/g, "");
  const regex = /00020[0-9]\d{2,4}.*?6304[0-9A-Fa-f]{4}/g;
  const matches = limpo.match(regex);
  if (matches && matches.length > 0) return matches;
  return input.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean);
}

export default function Home() {
  const [input, setInput] = useState("");
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [loading, setLoading] = useState(false);
  const [checagemAtiva, setChecagemAtiva] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [historicoAberto, setHistoricoAberto] = useState<Cobranca | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [copiado, setCopiado] = useState<string | null>(null);

  async function carregar() {
    const { data, error } = await supabase
      .from("cobrancas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error && data) setCobrancas(data as Cobranca[]);
  }

  useEffect(() => { carregar(); }, []);

  async function copiarTexto(texto: string, identificador: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(identificador);
      setTimeout(() => setCopiado(null), 1500);
    } catch {}
  }

  async function consultarPorId(id: string, url: string) {
    try {
      const { data: antes } = await supabase
        .from("cobrancas")
        .select("status, valor, end_to_end_id, horario_pagamento")
        .eq("id", id)
        .single();

      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      const novoStatus = data.status || null;
      const novoValor = data.valor || null;
      const novoE2e = data.endToEndId || null;
      const novoHorario = data.horario || null;
      const novoNome = data.pagadorNome || null;
      const novoDoc = data.pagadorDocumento || null;
      const novoErro = data.ok ? null : data.erro || "Erro desconhecido";

      const mudou = !antes || antes.status !== novoStatus
        || antes.valor !== novoValor
        || antes.end_to_end_id !== novoE2e
        || antes.horario_pagamento !== novoHorario;

      await supabase.from("cobrancas").update({
        status: novoStatus,
        valor: novoValor,
        end_to_end_id: novoE2e,
        horario_pagamento: novoHorario,
        pagador_nome: novoNome,
        pagador_documento: novoDoc,
        ultima_checagem: new Date().toISOString(),
        erro: novoErro,
        mudanca_nao_vista: mudou ? true : undefined,
      }).eq("id", id);

      await supabase.from("cobrancas_historico").insert({
        cobranca_id: id,
        status: novoStatus,
        valor: novoValor,
        end_to_end_id: novoE2e,
        horario_pagamento: novoHorario,
        pagador_nome: novoNome,
        pagador_documento: novoDoc,
        erro: novoErro,
      });
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

    const linhas = extrairBrCodes(input);
    let dinamicosNovos = 0, estaticosNovos = 0, invalidos = 0, duplicados = 0;
    const idsParaConsultar: { id: string; url: string }[] = [];

    for (const linha of linhas) {
      const parsed = parseBrCode(linha);

      const { data: existente } = await supabase
        .from("cobrancas")
        .select("id, tipo, url")
        .eq("brcode", linha)
        .maybeSingle();

      if (existente) {
        duplicados++;
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
    if (invalidos > 0) partes.push(invalidos + " invalido(s) ignorado(s)");

    setMsg(linhas.length + " encontrado(s): " + (partes.join(", ") || "nada"));
    setInput("");
    await carregar();

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
      if (invalidos > 0) final.push(invalidos + " invalido(s) ignorado(s)");
      setMsg(linhas.length + " encontrado(s) · " + final.join(", "));
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

  async function limparInvalidos() {
    if (!confirm("Remover todos os registros invalidos da tabela?")) return;
    await supabase.from("cobrancas").delete().eq("tipo", "invalido");
    await carregar();
  }

  async function abrirHistorico(c: Cobranca) {
    setHistoricoAberto(c);
    const { data } = await supabase
      .from("cobrancas_historico")
      .select("*")
      .eq("cobranca_id", c.id)
      .order("consultado_em", { ascending: false });
    setHistorico((data as HistoricoItem[]) || []);

    if (c.mudanca_nao_vista) {
      await supabase.from("cobrancas").update({ mudanca_nao_vista: false }).eq("id", c.id);
      await carregar();
    }
  }

  function fecharHistorico() {
    setHistoricoAberto(null);
    setHistorico([]);
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
    : filtroStatus === "invalidos"
    ? ordenadas.filter((c) => c.tipo === "invalido")
    : filtroStatus === "com_mudanca"
    ? ordenadas.filter((c) => c.mudanca_nao_vista)
    : ordenadas.filter((c) => c.status === filtroStatus);

  const totais = {
    total: cobrancas.length,
    dinamicas: cobrancas.filter((c) => c.tipo === "dinamico").length,
    estaticas: cobrancas.filter((c) => c.tipo === "estatico").length,
    invalidas: cobrancas.filter((c) => c.tipo === "invalido").length,
    pagas: cobrancas.filter((c) => c.status === "CONCLUIDA").length,
    pendentes: cobrancas.filter((c) => c.status === "ATIVA").length,
    removidas: cobrancas.filter((c) => c.status && c.status.startsWith("REMOVIDA")).length,
    comMudanca: cobrancas.filter((c) => c.mudanca_nao_vista).length,
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
            <Stat label="pendentes" value={totais.pendentes} color="var(--yellow)" />
            <Stat label="pagas" value={totais.pagas} color="var(--green)" />
            <Stat label="removidas" value={totais.removidas} color="var(--red)" />
            <Stat label="mudaram" value={totais.comMudanca} color="var(--accent)" />
          </div>
        </header>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>01 · adicionar e consultar BR Codes</span>
            <span style={styles.cardHelp}>cola quantos quiser · quebras de linha sao ignoradas</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="cola um ou mais BR Codes aqui, mesmo que com quebras de linha"
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
                <option value="com_mudanca">apenas com mudanca</option>
                <option value="nao_consultados">nao consultados</option>
                <option value="ATIVA">ATIVA / pendente</option>
                <option value="CONCLUIDA">CONCLUIDA / paga</option>
                <option value="REMOVIDA_PERMANENTE">removida permanente (410)</option>
                <option value="REMOVIDA_PELO_USUARIO_RECEBEDOR">removida pelo recebedor</option>
                <option value="REMOVIDA_PELO_PSP">removida pelo PSP</option>
                <option value="NAO_ENCONTRADA">nao encontrada (404)</option>
                <option value="PSP_FECHADO">PSP fechado</option>
                <option value="PSP_INACESSIVEL">PSP inacessivel</option>
                <option value="estaticos">apenas estaticos</option>
                <option value="invalidos">apenas invalidos</option>
              </select>
              {totais.invalidas > 0 && (
                <button onClick={limparInvalidos} style={{ ...styles.btn, ...styles.btnGhost }}>
                  limpar invalidos ({totais.invalidas})
                </button>
              )}
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
                <div style={{ flex: "0 0 28px" }}></div>
                <div style={{ flex: "0 0 80px" }}>tipo</div>
                <div style={{ flex: "1 1 140px" }}>PSP</div>
                <div style={{ flex: "1 1 160px" }}>merchant / txid</div>
                <div style={{ flex: "0 0 90px" }}>valor</div>
                <div style={{ flex: "0 0 180px" }}>status</div>
                <div style={{ flex: "1 1 220px" }}>E2E / pagador</div>
                <div style={{ flex: "0 0 110px" }}>checagem</div>
                <div style={{ flex: "0 0 110px" }}>acao</div>
              </div>
              {exibidas.map((c) => (
                <CobrancaRow
                  key={c.id}
                  c={c}
                  verificando={checagemAtiva === c.id}
                  copiado={copiado}
                  onVerificar={() => verificarUma(c)}
                  onRemover={() => remover(c.id)}
                  onHistorico={() => abrirHistorico(c)}
                  onCopiar={copiarTexto}
                />
              ))}
            </div>
          )}
        </section>

        {historicoAberto && (
          <HistoricoModal
            cobranca={historicoAberto}
            historico={historico}
            onClose={fecharHistorico}
            onCopiar={copiarTexto}
            copiado={copiado}
          />
        )}

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

function CopyButton({ texto, identificador, copiado, onCopiar }: {
  texto: string; identificador: string; copiado: string | null; onCopiar: (t: string, id: string) => void;
}) {
  const ativo = copiado === identificador;
  return (
    <button
      onClick={() => onCopiar(texto, identificador)}
      style={{ ...styles.copyBtn, color: ativo ? "var(--green)" : "var(--text-faint)" }}
      title="copiar"
    >
      {ativo ? "✓" : "⎘"}
    </button>
  );
}

function CobrancaRow({
  c, verificando, copiado, onVerificar, onRemover, onHistorico, onCopiar,
}: {
  c: Cobranca; verificando: boolean; copiado: string | null;
  onVerificar: () => void; onRemover: () => void; onHistorico: () => void;
  onCopiar: (t: string, id: string) => void;
}) {
  const statusColor =
    c.status === "CONCLUIDA" ? "var(--green)" :
    c.status === "ATIVA" ? "var(--yellow)" :
    c.status && c.status.startsWith("REMOVIDA") ? "var(--red)" :
    c.status === "NAO_ENCONTRADA" ? "var(--text-faint)" :
    c.status === "AUTH_NECESSARIA" || c.status === "PSP_FECHADO" || c.status === "PSP_INACESSIVEL" ? "#ff9b3d" :
    "var(--text-faint)";

  const tipoStyle =
    c.tipo === "dinamico" ? { bg: "rgba(46, 230, 141, 0.1)", fg: "var(--green)" } :
    c.tipo === "estatico" ? { bg: "rgba(245, 197, 66, 0.1)", fg: "var(--yellow)" } :
    { bg: "rgba(255, 90, 90, 0.1)", fg: "var(--red)" };

  const statusLabel = c.status ? (STATUS_LABELS[c.status] || c.status) : null;

  return (
    <div style={{ ...styles.tableRow, background: c.status === "CONCLUIDA" ? "rgba(46, 230, 141, 0.05)" : undefined }}>
      <div style={{ flex: "0 0 28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {c.mudanca_nao_vista && <span style={styles.bolinhaAmarela} title="mudou na ultima consulta"></span>}
      </div>
      <div style={{ flex: "0 0 80px" }}>
        <span style={{ ...styles.tipoBadge, background: tipoStyle.bg, color: tipoStyle.fg }}>{c.tipo}</span>
      </div>
      <div style={{ flex: "1 1 140px", ...styles.cellDim }}>{c.psp || "—"}</div>
      <div style={{ flex: "1 1 160px", overflow: "hidden" }}>
        <div style={styles.cellMain}>{c.merchant_name || "—"}</div>
        <div style={styles.cellSub}>{c.txid || c.erro || "—"}</div>
      </div>
      <div style={{ flex: "0 0 90px" }}>{c.valor ? "R$ " + c.valor : <span style={styles.cellFaint}>—</span>}</div>
      <div style={{ flex: "0 0 180px" }}>
        {statusLabel ? <span style={{ color: statusColor, fontWeight: 500 }}>{statusLabel}</span> : <span style={styles.cellFaint}>nao consultado</span>}
      </div>
      <div style={{ flex: "1 1 220px", overflow: "hidden" }}>
        {c.end_to_end_id ? (
          <>
            <div style={styles.e2eCell}>
              <code style={styles.e2eCode}>{c.end_to_end_id}</code>
              <CopyButton texto={c.end_to_end_id} identificador={"e2e-" + c.id} copiado={copiado} onCopiar={onCopiar} />
            </div>
            {(c.pagador_nome || c.pagador_documento) && (
              <div style={styles.pagadorInfo}>
                {c.pagador_nome && <span>{c.pagador_nome}</span>}
                {c.pagador_nome && c.pagador_documento && <span> · </span>}
                {c.pagador_documento && <span>{c.pagador_documento}</span>}
              </div>
            )}
          </>
        ) : (
          <span style={styles.cellFaint}>—</span>
        )}
      </div>
      <div style={{ flex: "0 0 110px", ...styles.cellDim, fontSize: 11 }}>
        {c.ultima_checagem ? new Date(c.ultima_checagem).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
      </div>
      <div style={{ flex: "0 0 110px", display: "flex", gap: 6 }}>
        <button onClick={onHistorico} style={{ ...styles.btnSmall, ...styles.btnGhost }} title="historico">
          👁
        </button>
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

function HistoricoModal({
  cobranca, historico, onClose, onCopiar, copiado,
}: {
  cobranca: Cobranca; historico: HistoricoItem[]; onClose: () => void;
  onCopiar: (t: string, id: string) => void; copiado: string | null;
}) {
  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalTitle}>historico de consultas</div>
            <div style={styles.modalSubtitle}>{cobranca.merchant_name} · {cobranca.txid || "—"}</div>
          </div>
          <button onClick={onClose} style={styles.modalClose}>×</button>
        </div>

        {historico.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyText}>nenhuma consulta registrada ainda</span>
          </div>
        ) : (
          <div style={styles.timeline}>
            {historico.map((h, idx) => {
              const anterior = historico[idx + 1];
              const mudouStatus = anterior && anterior.status !== h.status;
              const cor =
                h.status === "CONCLUIDA" ? "var(--green)" :
                h.status === "ATIVA" ? "var(--yellow)" :
                h.status && h.status.startsWith("REMOVIDA") ? "var(--red)" :
                "var(--text-faint)";
              return (
                <div key={h.id} style={styles.timelineItem}>
                  <div style={{ ...styles.timelineDot, background: cor }}></div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineWhen}>
                      {new Date(h.consultado_em).toLocaleString("pt-BR")}
                      {idx === 0 && <span style={styles.timelineBadge}> ultima</span>}
                      {mudouStatus && <span style={styles.timelineMudou}> · mudou de "{anterior?.status || "—"}"</span>}
                    </div>
                    <div style={styles.timelineStatus}>
                      <span style={{ color: cor, fontWeight: 600 }}>
                        {h.status ? (STATUS_LABELS[h.status] || h.status) : "—"}
                      </span>
                      {h.valor && <span style={styles.cellDim}> · R$ {h.valor}</span>}
                    </div>
                    {h.end_to_end_id && (
                      <div style={styles.timelineE2eBox}>
                        <code style={styles.timelineE2e}>E2E: {h.end_to_end_id}</code>
                        <CopyButton texto={h.end_to_end_id} identificador={"hist-" + h.id} copiado={copiado} onCopiar={onCopiar} />
                      </div>
                    )}
                    {(h.pagador_nome || h.pagador_documento) && (
                      <div style={styles.timelinePagador}>
                        pagador: {h.pagador_nome || "—"}
                        {h.pagador_documento && <span> · {h.pagador_documento}</span>}
                      </div>
                    )}
                    {h.horario_pagamento && (
                      <div style={styles.timelineExtra}>
                        pago em: {new Date(h.horario_pagamento).toLocaleString("pt-BR")}
                      </div>
                    )}
                    {h.erro && <div style={styles.timelineErro}>{h.erro}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  main: { minHeight: "100vh", padding: "32px 24px 60px" },
  container: { maxWidth: 1400, margin: "0 auto" },
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
  copyBtn: {
    background: "transparent", border: "none", padding: "2px 6px",
    fontSize: 14, cursor: "pointer", borderRadius: 3,
    transition: "all 0.15s",
  },
  e2eCell: {
    display: "flex", alignItems: "center", gap: 4,
  },
  e2eCode: {
    fontFamily: "var(--mono)", fontSize: 11, color: "var(--green)",
    background: "rgba(46, 230, 141, 0.08)", padding: "3px 6px",
    borderRadius: 3, whiteSpace: "nowrap", overflow: "hidden",
    textOverflow: "ellipsis", maxWidth: 240, flex: 1,
  },
  pagadorInfo: {
    fontSize: 10, color: "var(--text-faint)", marginTop: 3,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  msg: { fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "var(--text-dim)" },
  empty: { padding: "60px 20px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 6 },
  emptyText: { color: "var(--text-faint)", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16 },
  table: { border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" },
  tableHead: { display: "flex", gap: 12, padding: "10px 14px", background: "var(--bg-elevated)", fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, borderBottom: "1px solid var(--border)" },
  tableRow: { display: "flex", gap: 12, padding: "12px 14px", fontSize: 12, borderBottom: "1px solid var(--border)", alignItems: "center" },
  tipoBadge: { display: "inline-block", padding: "3px 8px", borderRadius: 3, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 },
  cellMain: { color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cellSub: { color: "var(--text-faint)", fontSize: 10, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cellDim: { color: "var(--text-dim)" },
  cellFaint: { color: "var(--text-faint)" },
  footer: { marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--text-faint)", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 13 },
  bolinhaAmarela: {
    display: "inline-block", width: 10, height: 10, borderRadius: "50%",
    background: "var(--yellow)", boxShadow: "0 0 8px rgba(245, 197, 66, 0.6)",
  },
  modalBackdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100, padding: 20, backdropFilter: "blur(4px)",
  },
  modal: {
    background: "var(--bg-card)", border: "1px solid var(--border-strong)",
    borderRadius: 10, padding: 24, maxWidth: 720, width: "100%",
    maxHeight: "85vh", overflowY: "auto",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)",
  },
  modalTitle: { fontSize: 14, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.15em" },
  modalSubtitle: { fontSize: 16, color: "var(--text)", marginTop: 6 },
  modalClose: {
    background: "transparent", color: "var(--text-faint)", fontSize: 24,
    width: 32, height: 32, borderRadius: 4, border: "none", cursor: "pointer",
  },
  timeline: { display: "flex", flexDirection: "column", gap: 0, position: "relative" },
  timelineItem: { display: "flex", gap: 16, padding: "12px 0", borderLeft: "1px solid var(--border)", marginLeft: 6, paddingLeft: 24, position: "relative" },
  timelineDot: {
    position: "absolute", left: -6, top: 16, width: 13, height: 13,
    borderRadius: "50%", border: "2px solid var(--bg-card)",
  },
  timelineContent: { flex: 1 },
  timelineWhen: { fontSize: 11, color: "var(--text-faint)" },
  timelineBadge: { color: "var(--accent)", fontWeight: 700, marginLeft: 6 },
  timelineMudou: { color: "var(--yellow)", fontStyle: "italic" },
  timelineStatus: { fontSize: 13, marginTop: 4 },
  timelineE2eBox: { marginTop: 6, display: "flex", alignItems: "center", gap: 6 },
  timelineE2e: {
    fontSize: 11, color: "var(--green)", background: "rgba(46, 230, 141, 0.08)",
    padding: "4px 8px", borderRadius: 4, fontFamily: "var(--mono)",
  },
  timelinePagador: { fontSize: 11, color: "var(--text-dim)", marginTop: 4 },
  timelineExtra: { fontSize: 11, color: "var(--text-dim)", marginTop: 2 },
  timelineErro: { fontSize: 11, color: "var(--red)", marginTop: 4 },
};
