"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type Status = "pago" | "pendente" | "vazio";
type Despesa = {
  id: string;
  ano: number;
  nome: string;
  valores: Record<number, { valor: number; status: Status }>;
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatarMoeda(n: number): string {
  if (!n || n === 0) return "";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Formata enquanto digita: "1500" -> "R$ 15,00", "150000" -> "R$ 1.500,00"
function formatarInputMoeda(valorBruto: string): string {
  const soDigitos = valorBruto.replace(/\D/g, "");
  if (!soDigitos) return "";
  const numero = parseInt(soDigitos, 10) / 100;
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Converte "R$ 1.500,00" -> 1500
function parseInputMoeda(valorFormatado: string): number {
  const soDigitos = valorFormatado.replace(/\D/g, "");
  if (!soDigitos) return 0;
  return parseInt(soDigitos, 10) / 100;
}

export default function FinanceiroGabrielPage() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [novoNome, setNovoNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [ultimoSalvo, setUltimoSalvo] = useState<string>("");
  const [erro, setErro] = useState<string>("");
  const [editandoNome, setEditandoNome] = useState<string | null>(null);
  const [nomeTemp, setNomeTemp] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const primeiraCarga = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/financeiro");
        const data = await res.json();
        if (data.ok && Array.isArray(data.despesas)) {
          setDespesas(data.despesas);
        } else if (data.erro) {
          setErro(data.erro);
        }
      } catch (e: any) {
        setErro("Erro ao carregar do servidor");
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const salvarNoServidor = useCallback(async (novasDespesas: Despesa[]) => {
    try {
      setSalvando(true);
      setErro("");
      const res = await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ despesas: novasDespesas }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.erro || "Erro ao salvar");
      const agora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      setUltimoSalvo(agora);
    } catch (e: any) {
      setErro(e.message || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }, []);

  useEffect(() => {
    if (primeiraCarga.current) {
      if (!carregando) primeiraCarga.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      salvarNoServidor(despesas);
    }, 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [despesas, carregando, salvarNoServidor]);

  function adicionar() {
    const nome = novoNome.trim();
    if (!nome) return;
    setDespesas([
      ...despesas,
      { id: Math.random().toString(36).slice(2), ano, nome, valores: {} },
    ]);
    setNovoNome("");
  }

  function remover(id: string) {
    if (!confirm("Remover essa despesa?")) return;
    setDespesas(despesas.filter((d) => d.id !== id));
  }

  function iniciarEdicaoNome(id: string, nomeAtual: string) {
    setEditandoNome(id);
    setNomeTemp(nomeAtual);
  }

  function salvarNome(id: string) {
    const novoNome = nomeTemp.trim();
    if (!novoNome) {
      setEditandoNome(null);
      return;
    }
    setDespesas(despesas.map((d) => (d.id === id ? { ...d, nome: novoNome } : d)));
    setEditandoNome(null);
    setNomeTemp("");
  }

  function atualizarValor(id: string, mes: number, val: number) {
    setDespesas(despesas.map((d) => {
      if (d.id !== id) return d;
      const atual = d.valores[mes] || { valor: 0, status: "vazio" as Status };
      return { ...d, valores: { ...d.valores, [mes]: { ...atual, valor: val } } };
    }));
  }

  function toggleStatus(id: string, mes: number) {
    const d = despesas.find((x) => x.id === id);
    if (!d) return;
    const atual = d.valores[mes]?.status || "vazio";
    const prox: Status = atual === "vazio" ? "pendente" : atual === "pendente" ? "pago" : "vazio";
    setDespesas(despesas.map((dd) => {
      if (dd.id !== id) return dd;
      const at = dd.valores[mes] || { valor: 0, status: "vazio" as Status };
      return { ...dd, valores: { ...dd.valores, [mes]: { ...at, status: prox } } };
    }));
  }

  const despesasDoAno = despesas.filter((d) => d.ano === ano);

  const totalMes = (m: number) => despesasDoAno.reduce((s, d) => s + (d.valores[m]?.valor || 0), 0);
  const totalDespesa = (d: Despesa) => Object.values(d.valores).reduce((s, v) => s + (v?.valor || 0), 0);
  const totalAnual = () => despesasDoAno.reduce((s, d) => s + totalDespesa(d), 0);
  const totalPendente = () =>
    despesasDoAno.reduce(
      (s, d) => s + Object.values(d.valores).reduce((sd, v) => sd + (v?.status === "pendente" ? v.valor : 0), 0),
      0
    );
  const totalPago = () =>
    despesasDoAno.reduce(
      (s, d) => s + Object.values(d.valores).reduce((sd, v) => sd + (v?.status === "pago" ? v.valor : 0), 0),
      0
    );

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #fff; color: #202124; font-family: 'Google Sans', Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased; font-size: 13px; }
        .barra { border-bottom: 1px solid #e0e0e0; padding: 10px 20px; display: flex; align-items: center; gap: 16px; background: #fff; position: sticky; top: 0; z-index: 10; }
        .titulo { font-size: 15px; font-weight: 500; color: #202124; }
        .barra-info { color: #5f6368; font-size: 12px; }
        .barra-status { margin-left: auto; font-size: 12px; color: #5f6368; display: flex; align-items: center; gap: 8px; }
        .salvando { color: #1a73e8; }
        .salvo { color: #188038; }
        .erro-msg { color: #d93025; }

        .toolbar { background: #f8f9fa; border-bottom: 1px solid #e0e0e0; padding: 6px 20px; display: flex; gap: 8px; align-items: center; font-size: 12px; }
        select, .campo { background: #fff; border: 1px solid #dadce0; border-radius: 4px; padding: 5px 8px; font-size: 12px; color: #202124; font-family: inherit; outline: none; }
        select:focus, .campo:focus { border-color: #1a73e8; }
        .campo { min-width: 200px; }
        .btn { background: #1a73e8; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 500; cursor: pointer; }
        .btn:hover { background: #1765cc; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .sep { width: 1px; height: 20px; background: #e0e0e0; margin: 0 4px; }
        .contador { color: #5f6368; font-size: 11px; margin-left: auto; display: flex; gap: 16px; }
        .contador b { color: #202124; font-weight: 500; }
        .cor-pago { color: #188038; }
        .cor-pendente { color: #d93025; }

        .planilha { overflow-x: auto; background: #fff; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
        th, td { border-right: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; padding: 0; text-align: center; vertical-align: middle; height: 30px; }
        th { background: #f8f9fa; color: #5f6368; font-weight: 500; font-size: 11px; padding: 6px 8px; position: sticky; top: 0; z-index: 2; }
        th.col-idx { background: #f1f3f4; width: 32px; }
        th.col-nome { text-align: left; padding-left: 10px; min-width: 110px; width: 110px; }
        th.col-mes { min-width: 65px; width: 65px; }
        th.col-total { background: #e8f0fe; color: #1a73e8; font-weight: 600; min-width: 80px; width: 80px; }
        th.col-acao { width: 36px; background: #f1f3f4; }

        td { position: relative; }
        td.idx { background: #f8f9fa; color: #5f6368; font-size: 11px; padding: 4px; }
        td.nome { text-align: left; padding: 4px 12px; font-weight: 500; color: #202124; background: #fff; }
        td.nome:hover { background: #f8f9fa; }
        td.celula { padding: 0; }
        td.celula:hover { background: #f8f9fa; }
        td.celula.st-pago { background: rgba(24,128,56,0.08); }
        td.celula.st-pendente { background: rgba(217,48,37,0.08); }
        td.celula.st-pago:hover { background: rgba(24,128,56,0.15); }
        td.celula.st-pendente:hover { background: rgba(217,48,37,0.15); }
        td.total { background: #f1f3f4; font-weight: 600; color: #1a73e8; padding: 4px 8px; text-align: right; font-size: 11px; }
        td.acao { background: #f8f9fa; padding: 0; }

        .nome-wrap { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .nome-texto { flex: 1; }
        .btn-editar {
          background: transparent; border: none; color: #5f6368; cursor: pointer;
          padding: 4px; border-radius: 3px; opacity: 0; transition: opacity 0.15s;
          font-size: 12px; line-height: 1;
        }
        tr:hover .btn-editar { opacity: 0.6; }
        .btn-editar:hover { opacity: 1 !important; background: rgba(0,0,0,0.05); }
        .nome-input {
          width: 100%; border: 1px solid #1a73e8; border-radius: 4px;
          padding: 4px 8px; font-size: 12px; color: #202124; font-family: inherit;
          outline: none; background: #fff;
        }

        .cel-wrap { display: flex; align-items: center; padding: 0 2px 0 4px; height: 32px; }
        .cel-input {
          flex: 1; border: none; background: transparent;
          text-align: right; padding: 0 2px 0 0; font-size: 10px;
          color: #202124; font-family: inherit; outline: none;
          min-width: 0;
        }
        .cel-input:focus { background: #fff; box-shadow: inset 0 0 0 2px #1a73e8; border-radius: 2px; }
        .cel-input::placeholder { color: #bdc1c6; font-weight: 400; }

        .cel-seta {
          background: transparent; border: none; cursor: pointer;
          width: 14px; height: 14px; border-radius: 3px;
          display: flex; align-items: center; justify-content: center;
          color: #bdc1c6; font-size: 9px; font-weight: 700;
          padding: 0; flex-shrink: 0; margin-left: 2px;
          transition: all 0.15s;
        }
        td.celula:hover .cel-seta { color: #5f6368; }
        td.celula.st-pago .cel-seta { color: #188038; background: rgba(24,128,56,0.15); }
        td.celula.st-pendente .cel-seta { color: #d93025; background: rgba(217,48,37,0.15); }
        .cel-seta:hover { transform: scale(1.15); }
        td.celula.st-vazio .cel-seta { color: #bdc1c6; }

        .btn-lixo { background: transparent; border: none; color: #5f6368; cursor: pointer; padding: 6px; font-size: 14px; line-height: 1; opacity: 0.5; }
        tr:hover .btn-lixo { opacity: 1; }
        .btn-lixo:hover { color: #d93025; }

        tfoot td { background: #e8f0fe; font-weight: 600; color: #1a73e8; padding: 8px; }
        tfoot td.nome { color: #1a73e8; }
        tfoot td.idx { background: #d2e3fc; color: #1a73e8; }

        .vazio { padding: 40px; text-align: center; color: #5f6368; font-size: 13px; }
        .vazio-dica { margin-top: 8px; color: #80868b; font-size: 12px; }

        .spinner { display: inline-block; width: 10px; height: 10px; border: 2px solid #e0e0e0; border-top-color: #1a73e8; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .campo { min-width: 140px; }
          .contador { display: none; }
        }
      `}</style>

      <div className="barra">
        <div className="titulo">Financeiro · Gabriel</div>
        <div className="barra-info">Sincronizado na nuvem</div>
        <div className="barra-status">
          {erro && <span className="erro-msg">⚠ {erro}</span>}
          {salvando && <><span className="spinner" /> <span className="salvando">Salvando...</span></>}
          {!salvando && ultimoSalvo && !erro && <span className="salvo">✓ Salvo às {ultimoSalvo}</span>}
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
        <button className="btn" onClick={adicionar} disabled={!novoNome.trim()}>
          + Adicionar
        </button>
        <div className="sep" />
        <span style={{ color: "#5f6368" }}>Ano:</span>
        <select value={ano} onChange={(e) => setAno(parseInt(e.target.value))}>
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <div className="contador">
          <span>Total: <b>{formatarMoeda(totalAnual()) || "R$ 0,00"}</b></span>
          <span className="cor-pago">Pago: <b>{formatarMoeda(totalPago()) || "R$ 0,00"}</b></span>
          <span className="cor-pendente">Pendente: <b>{formatarMoeda(totalPendente()) || "R$ 0,00"}</b></span>
        </div>
      </div>

      <div className="planilha">
        {carregando ? (
          <div className="vazio"><span className="spinner" /> Carregando...</div>
        ) : despesasDoAno.length === 0 ? (
          <div className="vazio">
            Nenhuma despesa cadastrada em {ano}.
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
              {despesasDoAno.map((d, idx) => (
                <tr key={d.id}>
                  <td className="idx">{idx + 1}</td>
                  <td className="nome">
                    {editandoNome === d.id ? (
                      <input
                        className="nome-input"
                        type="text"
                        value={nomeTemp}
                        autoFocus
                        onChange={(e) => setNomeTemp(e.target.value)}
                        onBlur={() => salvarNome(d.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") salvarNome(d.id);
                          if (e.key === "Escape") setEditandoNome(null);
                        }}
                      />
                    ) : (
                      <div className="nome-wrap">
                        <span className="nome-texto">{d.nome}</span>
                        <button
                          className="btn-editar"
                          onClick={() => iniciarEdicaoNome(d.id, d.nome)}
                          title="Editar nome"
                        >✎</button>
                      </div>
                    )}
                  </td>
                  {MESES.map((_, mesIdx) => {
                    const dados = d.valores[mesIdx] || { valor: 0, status: "vazio" as Status };
                    const setaLabel = dados.status === "pago" ? "✓" : dados.status === "pendente" ? "!" : "○";
                    return (
                      <td key={mesIdx} className={`celula st-${dados.status}`}>
                        <div className="cel-wrap">
                          <input
                            className="cel-input"
                            type="text"
                            placeholder="—"
                            value={dados.valor > 0 ? formatarMoeda(dados.valor) : ""}
                            onChange={(e) => atualizarValor(d.id, mesIdx, parseInputMoeda(e.target.value))}
                          />
                          <button
                            className="cel-seta"
                            onClick={(e) => { e.stopPropagation(); toggleStatus(d.id, mesIdx); }}
                            title={
                              dados.status === "pago" ? "Pago (clique pra pendente)" :
                              dados.status === "pendente" ? "Pendente (clique pra pago)" :
                              "Vazio (clique pra pendente)"
                            }
                          >{setaLabel}</button>
                        </div>
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
