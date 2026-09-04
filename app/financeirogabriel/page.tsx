"use client";

import { useEffect, useState } from "react";

type Status = "pago" | "pendente" | "vazio";
type Despesa = {
  id: string;
  nome: string;
  valores: Record<number, { valor: number; status: Status }>;
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const STORAGE_KEY_DESPESAS = "financeirogabriel_despesas";
const STORAGE_KEY_ANO = "financeirogabriel_ano";

function formatarMoeda(n: number): string {
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

  // Carregar do localStorage ao abrir
  useEffect(() => {
    try {
      const salvasDespesas = localStorage.getItem(STORAGE_KEY_DESPESAS);
      const salvoAno = localStorage.getItem(STORAGE_KEY_ANO);
      if (salvasDespesas) setDespesas(JSON.parse(salvasDespesas));
      if (salvoAno) setAno(parseInt(salvoAno, 10));
    } catch (e) {
      console.error("Erro carregando dados:", e);
    }
    setCarregado(true);
  }, []);

  // Salvar sempre que mudar
  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(STORAGE_KEY_DESPESAS, JSON.stringify(despesas));
      localStorage.setItem(STORAGE_KEY_ANO, ano.toString());
    } catch (e) {
      console.error("Erro salvando dados:", e);
    }
  }, [despesas, ano, carregado]);

  function adicionarDespesa() {
    const nome = novoNome.trim();
    if (!nome) return;
    const nova: Despesa = {
      id: Math.random().toString(36).slice(2),
      nome,
      valores: {},
    };
    setDespesas([...despesas, nova]);
    setNovoNome("");
  }

  function removerDespesa(id: string) {
    if (confirm("Remover essa despesa? Todos os valores dela serão perdidos.")) {
      setDespesas(despesas.filter((d) => d.id !== id));
    }
  }

  function atualizarValor(despesaId: string, mes: number, campo: "valor" | "status", valor: any) {
    setDespesas(despesas.map((d) => {
      if (d.id !== despesaId) return d;
      const atual = d.valores[mes] || { valor: 0, status: "vazio" as Status };
      return {
        ...d,
        valores: {
          ...d.valores,
          [mes]: { ...atual, [campo]: valor },
        },
      };
    }));
  }

  function toggleStatus(despesaId: string, mes: number) {
    const d = despesas.find((x) => x.id === despesaId);
    if (!d) return;
    const atual = d.valores[mes]?.status || "vazio";
    const proximo: Status = atual === "vazio" ? "pendente" : atual === "pendente" ? "pago" : "vazio";
    atualizarValor(despesaId, mes, "status", proximo);
  }

  function totalPorMes(mes: number): number {
    return despesas.reduce((s, d) => s + (d.valores[mes]?.valor || 0), 0);
  }

  function totalAnualDespesa(despesa: Despesa): number {
    return Object.values(despesa.valores).reduce((s, v) => s + (v?.valor || 0), 0);
  }

  function totalAnual(): number {
    return despesas.reduce((s, d) => s + totalAnualDespesa(d), 0);
  }

  function totalPendente(): number {
    return despesas.reduce((s, d) => {
      return s + Object.values(d.valores).reduce((sd, v) => {
        return sd + (v?.status === "pendente" ? v.valor : 0);
      }, 0);
    }, 0);
  }

  function totalPago(): number {
    return despesas.reduce((s, d) => {
      return s + Object.values(d.valores).reduce((sd, v) => {
        return sd + (v?.status === "pago" ? v.valor : 0);
      }, 0);
    }, 0);
  }

  function exportarJSON() {
    const dados = { ano, despesas };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro-gabriel-${ano}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importarJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const dados = JSON.parse(ev.target?.result as string);
        if (dados.despesas && Array.isArray(dados.despesas)) {
          if (confirm("Substituir os dados atuais pelos do arquivo?")) {
            setDespesas(dados.despesas);
            if (dados.ano) setAno(dados.ano);
          }
        }
      } catch (err) {
        alert("Arquivo inválido");
      }
    };
    reader.readAsText(arquivo);
    e.target.value = "";
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a; color: #fff; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .wrap { max-width: 1600px; margin: 0 auto; padding: 32px 24px 60px; }
        h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.02em; }
        .sub { color: #a3a3a3; font-size: 13px; margin-bottom: 28px; }

        .topo { display: grid; grid-template-columns: 1fr auto auto; gap: 16px; margin-bottom: 24px; align-items: end; }
        .grupo { display: flex; flex-direction: column; gap: 6px; }
        .grupo-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #737373; font-weight: 500; }
        input, select { background: #111; border: 1px solid #262626; border-radius: 6px; padding: 10px 12px; color: #fff; font-size: 13px; font-family: inherit; outline: none; }
        input:focus, select:focus { border-color: #4285F4; }
        .btn { background: #4285F4; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .btn:hover { background: #5B9BFF; }
        .btn-ghost { background: transparent; color: #a3a3a3; border: 1px solid #262626; }
        .btn-ghost:hover { color: #fff; border-color: #4285F4; }

        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat { background: #111; border: 1px solid #262626; padding: 20px; border-radius: 12px; }
        .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #737373; font-weight: 500; margin-bottom: 6px; }
        .stat-valor { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
        .stat-pago .stat-valor { color: #34A853; }
        .stat-pendente .stat-valor { color: #EA4335; }

        .tabela-wrap { background: #111; border: 1px solid #262626; border-radius: 12px; overflow: hidden; }
        .tabela-scroll { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; min-width: 1400px; }
        th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #171717; vertical-align: middle; }
        th { background: #171717; color: #737373; text-transform: uppercase; font-size: 10px; letter-spacing: 0.08em; font-weight: 600; position: sticky; top: 0; z-index: 2; }
        th.mes { text-align: center; min-width: 100px; }
        th.total { text-align: right; background: #1a1a1a; color: #fff; }
        td.nome { font-weight: 600; min-width: 150px; }
        td.mes { text-align: center; }
        td.total { text-align: right; font-weight: 700; background: #0d0d0d; color: #4285F4; }
        tr:hover td:not(.acoes) { background: #141414; }

        .celula-mes { display: flex; flex-direction: column; gap: 4px; align-items: center; }
        .input-valor { background: #0a0a0a; border: 1px solid #222; border-radius: 4px; padding: 4px 6px; font-size: 12px; color: #fff; width: 80px; text-align: right; outline: none; }
        .input-valor:focus { border-color: #4285F4; }
        .status-btn { border: none; background: none; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; min-width: 62px; }
        .status-btn.vazio { background: #171717; color: #525252; }
        .status-btn.pendente { background: rgba(234,67,53,0.15); color: #EA4335; }
        .status-btn.pago { background: rgba(52,168,83,0.15); color: #34A853; }
        .status-btn:hover { transform: scale(1.05); }

        .btn-remover { background: transparent; border: 1px solid #262626; color: #737373; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; }
        .btn-remover:hover { color: #EA4335; border-color: #EA4335; }

        tfoot td { background: #1a1a1a; font-weight: 700; font-size: 12px; color: #fff; padding: 12px 10px; }
        tfoot td.total { color: #4285F4; font-size: 14px; }

        .vazio { text-align: center; padding: 60px 20px; color: #737373; }
        .adicionar { display: flex; gap: 8px; padding: 16px; border-top: 1px solid #262626; background: #0d0d0d; }
        .adicionar input { flex: 1; }

        .acoes-arquivo { display: flex; gap: 8px; margin-top: 16px; }
        input[type="file"] { display: none; }
        .file-label { display: inline-block; background: transparent; color: #a3a3a3; border: 1px solid #262626; padding: 8px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; }
        .file-label:hover { color: #fff; border-color: #4285F4; }

        @media (max-width: 900px) {
          .topo { grid-template-columns: 1fr; }
          .stats { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="wrap">
        <h1>Financeiro · Gabriel</h1>
        <p className="sub">Controle mensal de despesas fixas. Dados salvos automaticamente neste navegador.</p>

        <div className="topo">
          <div className="grupo">
            <label className="grupo-label">Adicionar nova despesa</label>
            <input
              type="text"
              placeholder="Ex: Água, Luz, Internet, Aluguel..."
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarDespesa()}
            />
          </div>
          <button className="btn" onClick={adicionarDespesa}>Adicionar</button>
          <div className="grupo">
            <label className="grupo-label">Ano</label>
            <select value={ano} onChange={(e) => setAno(parseInt(e.target.value))}>
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-label">Despesas cadastradas</div>
            <div className="stat-valor">{despesas.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Total anual {ano}</div>
            <div className="stat-valor">{formatarMoeda(totalAnual())}</div>
          </div>
          <div className="stat stat-pago">
            <div className="stat-label">Pago</div>
            <div className="stat-valor">{formatarMoeda(totalPago())}</div>
          </div>
          <div className="stat stat-pendente">
            <div className="stat-label">Pendente</div>
            <div className="stat-valor">{formatarMoeda(totalPendente())}</div>
          </div>
        </div>

        <div className="tabela-wrap">
          {despesas.length === 0 ? (
            <div className="vazio">Nenhuma despesa cadastrada. Adicione a primeira acima.</div>
          ) : (
            <div className="tabela-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Despesa</th>
                    {MESES.map((mes, i) => (
                      <th key={mes} className="mes">{mes}</th>
                    ))}
                    <th className="total">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {despesas.map((d) => (
                    <tr key={d.id}>
                      <td className="nome">{d.nome}</td>
                      {MESES.map((_, mesIdx) => {
                        const dados = d.valores[mesIdx] || { valor: 0, status: "vazio" as Status };
                        return (
                          <td key={mesIdx} className="mes">
                            <div className="celula-mes">
                              <input
                                className="input-valor"
                                type="text"
                                placeholder="0,00"
                                value={dados.valor > 0 ? dados.valor.toString().replace(".", ",") : ""}
                                onChange={(e) => atualizarValor(d.id, mesIdx, "valor", parseValor(e.target.value))}
                              />
                              <button
                                className={`status-btn ${dados.status}`}
                                onClick={() => toggleStatus(d.id, mesIdx)}
                                title="Clique para alternar: vazio → pendente → pago"
                              >
                                {dados.status === "vazio" ? "—" : dados.status === "pago" ? "Pago" : "Pendente"}
                              </button>
                            </div>
                          </td>
                        );
                      })}
                      <td className="total">{formatarMoeda(totalAnualDespesa(d))}</td>
                      <td className="acoes">
                        <button className="btn-remover" onClick={() => removerDespesa(d.id)}>Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total por mês</td>
                    {MESES.map((_, i) => (
                      <td key={i} className="mes" style={{ textAlign: "center" }}>
                        {totalPorMes(i) > 0 ? formatarMoeda(totalPorMes(i)) : "—"}
                      </td>
                    ))}
                    <td className="total">{formatarMoeda(totalAnual())}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="acoes-arquivo">
          <button className="btn btn-ghost" onClick={exportarJSON}>Exportar backup (.json)</button>
          <label className="file-label">
            Importar backup
            <input type="file" accept=".json" onChange={importarJSON} />
          </label>
        </div>
      </div>
    </>
  );
}
