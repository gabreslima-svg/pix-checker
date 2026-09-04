"use client";

import { useEffect, useState } from "react";

type Status = "pago" | "pendente" | "vazio";
type Despesa = {
  id: string;
  nome: string;
  valores: Record<number, { valor: number; status: Status }>;
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const KEY_DESPESAS = "financeirogabriel_despesas";
const KEY_ANO = "financeirogabriel_ano";

function formatarMoeda(n: number): string {
  if (n === 0) return "";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseValor(s: string): number {
  if (!s) return 0;
  const limpo = s.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(limpo);
  return isNaN(num) ? 0 : num;
}

export default function FinanceiroGabrielPage() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [novoNome, setNovoNome] = useState("");
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const d = localStorage.getItem(KEY_DESPESAS);
      const a = localStorage.getItem(KEY_ANO);
      if (d) setDespesas(JSON.parse(d));
      if (a) setAno(parseInt(a, 10));
    } catch {}
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    localStorage.setItem(KEY_DESPESAS, JSON.stringify(despesas));
    localStorage.setItem(KEY_ANO, ano.toString());
  }, [despesas, ano, carregado]);

  function adicionar() {
    const nome = novoNome.trim();
    if (!nome) return;
    setDespesas([...despesas, { id: Math.random().toString(36).slice(2), nome, valores: {} }]);
    setNovoNome("");
  }

  function remover(id: string) {
    if (confirm("Remover essa despesa?")) {
      setDespesas(despesas.filter((d) => d.id !== id));
    }
  }

  function atualizar(id: string, mes: number, campo: "valor" | "status", val: any) {
    setDespesas(despesas.map((d) => {
      if (d.id !== id) return d;
      const atual = d.valores[mes] || { valor: 0, status: "vazio" as Status };
      return { ...d, valores: { ...d.valores, [mes]: { ...atual, [campo]: val } } };
    }));
  }

  function toggleStatus(id: string, mes: number) {
    const d = despesas.find((x) => x.id === id);
    if (!d) return;
    const atual = d.valores[mes]?.status || "vazio";
    const prox: Status = atual === "vazio" ? "pendente" : atual === "pendente" ? "pago" : "vazio";
    atualizar(id, mes, "status", prox);
  }

  const totalMes = (m: number) => despesas.reduce((s, d) => s + (d.valores[m]?.valor || 0), 0);
  const totalDespesa = (d: Despesa) => Object.values(d.valores).reduce((s, v) => s + (v?.valor || 0), 0);
  const totalAnual = () => despesas.reduce((s, d) => s + totalDespesa(d), 0);
  const totalPendente = () => despesas.reduce((s, d) => s + Object.values(d.valores).reduce((sd, v) => sd + (v?.status === "pendente" ? v.valor : 0), 0), 0);
  const totalPago = () => despesas.reduce((s, d) => s + Object.values(d.valores).reduce((sd, v) => sd + (v?.status === "pago" ? v.valor : 0), 0), 0);

  function exportarJSON() {
    const blob = new Blob([JSON.stringify({ ano, despesas }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro-${ano}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importarJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const arq = e.target.files?.[0];
    if (!arq) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target?.result as string);
        if (d.despesas && Array.isArray(d.despesas)) {
          if (confirm("Substituir dados atuais?")) {
            setDespesas(d.despesas);
            if (d.ano) setAno(d.ano);
          }
        }
      } catch { alert("Arquivo inválido"); }
    };
    r.readAsText(arq);
    e.target.value = "";
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #fff; color: #202124; font-family: 'Google Sans', Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased; font-size: 13px; }

        .barra { border-bottom: 1px solid #e0e0e0; padding: 10px 20px; display: flex; align-items: center; gap: 16px; background: #fff; position: sticky; top: 0; z-index: 10; }
        .titulo { font-size: 15px; font-weight: 500; color: #202124; }
        .barra-info { color: #5f6368; font-size: 12px; }
        .barra-acoes { margin-left: auto; display: flex; gap: 6px; align-items: center; }

        .toolbar { background: #f8f9fa; border-bottom: 1px solid #e0e0e0; padding: 6px 20px; display: flex; gap: 8px; align-items: center; font-size: 12px; }
        select, .campo { background: #fff; border: 1px solid #dadce0; border-radius: 4px; padding: 5px 8px; font-size: 12px; color: #202124; font-family: inherit; outline: none; }
        select:focus, .campo:focus { border-color: #1a73e8; }
        .campo { min-width: 200px; }
        .btn { background: #1a73e8; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 500; cursor: pointer; }
        .btn:hover { background: #1765cc; }
        .btn-ghost { background: #fff; color: #1a73e8; border: 1px solid #dadce0; }
        .btn-ghost:hover { background: #f1f3f4; }
        .sep { width: 1px; height: 20px; background: #e0e0e0; margin: 0 4px; }
        .contador { color: #5f6368; font-size: 11px; margin-left: auto; display: flex; gap: 16px; }
        .contador b { color: #202124; font-weight: 500; }
        .cor-pago { color: #188038; }
        .cor-pendente { color: #d93025; }

        .planilha { overflow-x: auto; background: #fff; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border-right: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; padding: 0; text-align: center; vertical-align: middle; height: 32px; }
        th { background: #f8f9fa; color: #5f6368; font-weight: 500; font-size: 11px; padding: 6px 8px; position: sticky; top: 0; z-index: 2; }
        th.col-idx { background: #f1f3f4; width: 32px; color: #5f6368; }
        th.col-nome { text-align: left; padding-left: 12px; min-width: 160px; }
        th.col-mes { min-width: 90px; }
        th.col-total { background: #e8f0fe; color: #1a73e8; font-weight: 600; min-width: 90px; }
        th.col-acao { width: 36px; background: #f1f3f4; }

        td { position: relative; }
        td.idx { background: #f8f9fa; color: #5f6368; font-size: 11px; padding: 4px; }
        td.nome { text-align: left; padding: 4px 12px; font-weight: 500; color: #202124; background: #fff; }
        td.nome:hover { background: #f8f9fa; }
        td.celula { padding: 0; }
        td.celula:hover { background: #f8f9fa; }
        td.celula.st-pago { background: rgba(24,128,56,0.06); }
        td.celula.st-pendente { background: rgba(217,48,37,0.06); }
        td.celula.st-pago:hover { background: rgba(24,128,56,0.12); }
        td.celula.st-pendente:hover { background: rgba(217,48,37,0.12); }
        td.total { background: #f1f3f4; font-weight: 600; color: #1a73e8; padding: 6px 10px; text-align: right; }
        td.acao { background: #f8f9fa; padding: 0; }

        .cel-input { width: 100%; height: 32px; border: none; background: transparent; text-align: right; padding: 0 8px; font-size: 12px; color: #202124; font-family: inherit; outline: none; }
        .cel-input:focus { background: #fff; box-shadow: inset 0 0 0 2px #1a73e8; }
        .cel-input::placeholder { color: #bdc1c6; font-weight: 400; }

        .cel-status { position: absolute; top: 2px; right: 4px; width: 8px; height: 8px; border-radius: 50%; cursor: pointer; opacity: 0.8; }
        .cel-status.pago { background: #188038; }
        .cel-status.pendente { background: #d93025; }
        .cel-status.vazio { background: #dadce0; }
        .cel-status:hover { transform: scale(1.4); opacity: 1; }

        .btn-lixo { background: transparent; border: none; color: #5f6368; cursor: pointer; padding: 6px; font-size: 14px; line-height: 1; opacity: 0.5; transition: opacity 0.15s; }
        tr:hover .btn-lixo { opacity: 1; }
        .btn-lixo:hover { color: #d93025; }

        tfoot td { background: #e8f0fe; font-weight: 600; color: #1a73e8; padding: 8px; }
        tfoot td.nome { color: #1a73e8; }
        tfoot td.idx { background: #d2e3fc; color: #1a73e8; }

        .vazio { padding: 40px; text-align: center; color: #5f6368; font-size: 13px; }
        .vazio-dica { margin-top: 8px; color: #80868b; font-size: 12px; }

        input[type="file"] { display: none; }
        .file-label { background: #fff; color: #1a73e8; border: 1px solid #dadce0; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; cursor: pointer; display: inline-block; }
        .file-label:hover { background: #f1f3f4; }

        @media (max-width: 768px) {
          .campo { min-width: 140px; }
          .contador { display: none; }
        }
      `}</style>

      <div className="barra">
        <div className="titulo">Financeiro · Gabriel</div>
        <div className="barra-info">Dados salvos neste navegador</div>
        <div className="barra-acoes">
          <button className="btn btn-ghost" onClick={exportarJSON}>Exportar</button>
          <label className="file-label">
            Importar
            <input type="file" accept=".json" onChange={importarJSON} />
          </label>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="campo"
          type="text"
          placeholder="Nome da despesa (ex: Água)"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
        />
        <button className="btn" onClick={adicionar}>+ Adicionar</button>
        <div className="sep" />
        <span style={{ color: "#5f6368" }}>Ano:</span>
        <select value={ano} onChange={(e) => setAno(parseInt(e.target.value))}>
          {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        <div className="contador">
          <span>Total: <b>{formatarMoeda(totalAnual()) || "R$ 0,00"}</b></span>
          <span className="cor-pago">Pago: <b>{formatarMoeda(totalPago()) || "R$ 0,00"}</b></span>
          <span className="cor-pendente">Pendente: <b>{formatarMoeda(totalPendente()) || "R$ 0,00"}</b></span>
        </div>
      </div>

      <div className="planilha">
        {despesas.length === 0 ? (
          <div className="vazio">
            Nenhuma despesa cadastrada.
            <div className="vazio-dica">Digite o nome no campo acima e clique em Adicionar (ou Enter)</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th className="col-idx"></th>
                <th className="col-nome">Despesa</th>
                {MESES.map((m) => <th key={m} className="col-mes">{m}</th>)}
                <th className="col-total">Total</th>
                <th className="col-acao"></th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((d, idx) => (
                <tr key={d.id}>
                  <td className="idx">{idx + 1}</td>
                  <td className="nome">{d.nome}</td>
                  {MESES.map((_, mesIdx) => {
                    const dados = d.valores[mesIdx] || { valor: 0, status: "vazio" as Status };
                    return (
                      <td key={mesIdx} className={`celula st-${dados.status}`}>
                        <input
                          className="cel-input"
                          type="text"
                          placeholder="—"
                          value={dados.valor > 0 ? dados.valor.toString().replace(".", ",") : ""}
                          onChange={(e) => atualizar(d.id, mesIdx, "valor", parseValor(e.target.value))}
                        />
                        <span
                          className={`cel-status ${dados.status}`}
                          onClick={() => toggleStatus(d.id, mesIdx)}
                          title="Clique: vazio → pendente → pago"
                        />
                      </td>
                    );
                  })}
                  <td className="total">{formatarMoeda(totalDespesa(d)) || "—"}</td>
                  <td className="acao">
                    <button className="btn-lixo" onClick={() => remover(d.id)} title="Remover">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="idx"></td>
                <td className="nome">Total mensal</td>
                {MESES.map((_, i) => (
                  <td key={i} style={{ padding: "8px", textAlign: "right" }}>
                    {formatarMoeda(totalMes(i)) || "—"}
                  </td>
                ))}
                <td className="total" style={{ textAlign: "right" }}>{formatarMoeda(totalAnual())}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </>
  );
}
