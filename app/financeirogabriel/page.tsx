"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type Status = "pago" | "pendente" | "vazio";
type Despesa = {
  id: string;
  ano: number;
  nome: string;
  vencimento: number; // dia do mes (1-31)
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
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [mesAtual, setMesAtual] = useState<number>(new Date().getMonth());
  const [senhaInput, setSenhaInput] = useState<string>("");
  const [senhaErro, setSenhaErro] = useState<boolean>(false);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [novoNome, setNovoNome] = useState("");
  const [novoVencimento, setNovoVencimento] = useState<number>(10);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [ultimoSalvo, setUltimoSalvo] = useState<string>("");
  const [erro, setErro] = useState<string>("");
  const [editandoNome, setEditandoNome] = useState<string | null>(null);
  const [nomeTemp, setNomeTemp] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const primeiraCarga = useRef(true);

  // Verifica sessao ao abrir
  useEffect(() => {
    if (typeof window !== "undefined") {
      const salvo = localStorage.getItem("fin_auth");
      if (salvo === "ok") setAutenticado(true);
    }
  }, []);

  function tentarLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (senhaInput === "ogabrielslma") {
      setAutenticado(true);
      setSenhaErro(false);
      localStorage.setItem("fin_auth", "ok");
      setSenhaInput("");
    } else {
      setSenhaErro(true);
      setTimeout(() => setSenhaErro(false), 2000);
    }
  }

  function sair() {
    if (confirm("Sair da sessao?")) {
      localStorage.removeItem("fin_auth");
      setAutenticado(false);
    }
  }

  useEffect(() => {
    if (!autenticado) return;
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
  }, [autenticado]);

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
    // Cria com todos os 12 meses ja como "pendente"
    const valores: Record<number, { valor: number; status: Status }> = {};
    for (let m = 0; m < 12; m++) {
      valores[m] = { valor: 0, status: "pendente" as Status };
    }
    setDespesas([
      ...despesas,
      { id: Math.random().toString(36).slice(2), ano, nome, vencimento: novoVencimento, valores },
    ]);
    setNovoNome("");
  }

  function atualizarVencimento(id: string, dia: number) {
    setDespesas(despesas.map((d) => (d.id === id ? { ...d, vencimento: dia } : d)));
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

  // Se nao autenticado, mostra tela de login
  if (!autenticado) {
    return (
      <>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #f8f9fa; font-family: 'Google Sans', Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
          .login-wrap {
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            padding: 20px;
          }
          .login-card {
            background: #fff; border: 1px solid #e0e0e0; border-radius: 12px;
            padding: 40px 32px; width: 100%; max-width: 360px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          .login-titulo { font-size: 20px; font-weight: 500; color: #202124; margin-bottom: 8px; text-align: center; }
          .login-sub { font-size: 13px; color: #5f6368; margin-bottom: 28px; text-align: center; }
          .login-input {
            width: 100%; border: 1px solid #dadce0; border-radius: 6px;
            padding: 12px 14px; font-size: 14px; color: #202124;
            font-family: inherit; outline: none; margin-bottom: 12px;
          }
          .login-input:focus { border-color: #1a73e8; }
          .login-input.erro { border-color: #d93025; animation: shake 0.4s; }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-6px); }
            75% { transform: translateX(6px); }
          }
          .login-btn {
            width: 100%; background: #1a73e8; color: #fff; border: none;
            padding: 12px; border-radius: 6px; font-size: 14px; font-weight: 500;
            cursor: pointer; transition: background 0.15s;
          }
          .login-btn:hover { background: #1765cc; }
          .login-erro-msg { color: #d93025; font-size: 12px; margin-top: 8px; text-align: center; }
        `}</style>
        <div className="login-wrap">
          <form className="login-card" onSubmit={tentarLogin}>
            <div className="login-titulo">Financeiro · Gabriel</div>
            <div className="login-sub">Area protegida. Digite a senha para continuar.</div>
            <input
              className={`login-input ${senhaErro ? "erro" : ""}`}
              type="password"
              placeholder="Senha"
              value={senhaInput}
              onChange={(e) => setSenhaInput(e.target.value)}
              autoFocus
            />
            <button className="login-btn" type="submit">Entrar</button>
            {senhaErro && <div className="login-erro-msg">Senha incorreta</div>}
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { overflow-x: hidden; max-width: 100vw; } body { background: #fff; color: #202124; font-family: 'Google Sans', Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased; font-size: 13px; }
        .barra { border-bottom: 1px solid #e0e0e0; padding: 10px 20px; display: flex; align-items: center; gap: 16px; background: #fff; position: sticky; top: 0; z-index: 10; max-width: 100vw; overflow: hidden; }
        .titulo { font-size: 15px; font-weight: 500; color: #202124; }
        .barra-info { color: #5f6368; font-size: 12px; }
        .barra-status { margin-left: auto; font-size: 12px; color: #5f6368; display: flex; align-items: center; gap: 8px; }
        .salvando { color: #1a73e8; }
        .salvo { color: #188038; }
        .erro-msg { color: #d93025; }

        .toolbar { background: #f8f9fa; border-bottom: 1px solid #e0e0e0; padding: 6px 20px; display: flex; gap: 8px; align-items: center; font-size: 12px; max-width: 100vw; overflow: hidden; flex-wrap: wrap; }
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
        .cor-pendente { color: #F9AB00; }

        .planilha { overflow-x: auto; background: #fff; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
        th, td { border-right: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; padding: 0; text-align: center; vertical-align: middle; height: 30px; }
        th { background: #f8f9fa; color: #5f6368; font-weight: 500; font-size: 11px; padding: 6px 8px; position: sticky; top: 0; z-index: 2; }
        th.col-idx { background: #f1f3f4; width: 32px; }
        th.col-nome { text-align: left; padding-left: 10px; min-width: 110px; width: 110px; }
        th.col-vencimento { min-width: 55px; width: 55px; background: #f8f9fa; color: #5f6368; }
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
        td.celula.st-pendente { background: rgba(251,188,4,0.15); }
        td.celula.st-pago:hover { background: rgba(24,128,56,0.15); }
        td.celula.st-pendente:hover { background: rgba(251,188,4,0.25); }
        td.total { background: #f1f3f4; font-weight: 600; color: #1a73e8; padding: 4px 8px; text-align: right; font-size: 11px; }
        td.acao { background: #f8f9fa; padding: 0; }
        td.vencimento { background: #f8f9fa; padding: 0; text-align: center; }
        .venc-input { width: 100%; height: 100%; border: none; background: transparent; text-align: center; font-size: 11px; color: #5f6368; font-family: inherit; outline: none; padding: 4px 0; font-weight: 500; }
        .venc-input:focus { background: #fff; box-shadow: inset 0 0 0 2px #1a73e8; }
        .venc-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

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
        td.celula.st-pendente .cel-seta { color: #F9AB00; background: rgba(251,188,4,0.2); }
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

        

        /* ========== MOBILE VIEW (cards estilo app) ========== */
        .mobile-view { display: none; }
        .desktop-view { display: block; }

        @media (max-width: 900px) {
          .desktop-view { display: none; }
          .mobile-view { display: block; padding: 12px; background: #f8f9fa; min-height: calc(100vh - 100px); max-width: 100vw; overflow-x: hidden; }
          .toolbar { display: none !important; }
          .barra { padding: 10px 12px; }
          .barra .titulo { font-size: 14px; }

          /* Seletor de mes no topo */
          .mes-seletor { display: flex; gap: 6px; overflow-x: auto; padding: 8px 4px 12px; margin-bottom: 8px; -webkit-overflow-scrolling: touch; }
          .mes-seletor::-webkit-scrollbar { display: none; }
          .mes-btn {
            flex-shrink: 0; padding: 8px 14px; border-radius: 20px; border: 1px solid #dadce0;
            background: #fff; color: #5f6368; font-size: 12px; font-weight: 500;
            cursor: pointer; white-space: nowrap; transition: all 0.15s;
          }
          .mes-btn.ativo { background: #1a73e8; color: #fff; border-color: #1a73e8; font-weight: 600; }
          .mes-btn:not(.ativo):hover { background: #f1f3f4; }

          /* Header do mes */
          .mes-header { display: flex; justify-content: space-between; align-items: baseline; padding: 8px 4px 16px; }
          .mes-titulo { font-size: 22px; font-weight: 600; color: #202124; }
          .mes-total-info { text-align: right; }
          .mes-total-valor { font-size: 20px; font-weight: 700; color: #202124; letter-spacing: -0.02em; }
          .mes-total-label { font-size: 11px; color: #5f6368; }

          /* Card de conta */
          .conta-card {
            background: #fff; border-radius: 12px; padding: 14px 16px;
            margin-bottom: 10px; display: flex; align-items: center; gap: 12px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            transition: all 0.15s;
          }
          .conta-card.st-pago { border-left: 4px solid #34a853; }
          .conta-card.st-pendente { border-left: 4px solid #f9ab00; }
          .conta-card.st-vazio { border-left: 4px solid #dadce0; }

          .conta-nome { font-size: 15px; font-weight: 500; color: #202124; margin-bottom: 2px; }
          .conta-venc { font-size: 11px; color: #5f6368; display: flex; align-items: center; gap: 4px; }
          .conta-info { flex: 1; min-width: 0; }
          .conta-valor-wrap { text-align: right; flex-shrink: 0; }
          .conta-valor-input {
            border: none; background: transparent; font-size: 18px; font-weight: 700;
            color: #202124; text-align: right; width: 120px; padding: 4px 0; outline: none;
            letter-spacing: -0.01em;
          }
          .conta-valor-input:focus { color: #1a73e8; }
          .conta-valor-input.pago { color: #188038; }
          .conta-valor-input.pendente { color: #f9ab00; }

          .conta-status-btn {
            width: 40px; height: 40px; border-radius: 50%; border: 2px solid #dadce0;
            background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
            font-size: 18px; font-weight: 700; color: #dadce0; flex-shrink: 0;
            transition: all 0.15s;
          }
          .conta-status-btn.pago { background: #34a853; border-color: #34a853; color: #fff; }
          .conta-status-btn.pendente { background: #f9ab00; border-color: #f9ab00; color: #fff; }
          .conta-status-btn:active { transform: scale(0.9); }

          /* Resumo do mes no rodape */
          .resumo-mes {
            background: #fff; border-radius: 12px; padding: 16px;
            margin-top: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          .resumo-linha { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
          .resumo-linha b { font-weight: 600; }
          .resumo-linha.total { border-top: 1px solid #e0e0e0; margin-top: 6px; padding-top: 12px; font-size: 15px; }
          .resumo-pago b { color: #188038; }
          .resumo-pendente b { color: #f9ab00; }

          /* Adicionar/toolbar mobile */
          .toolbar-mobile {
            background: #fff; padding: 12px; display: flex; flex-direction: column; gap: 8px;
            border-bottom: 1px solid #e0e0e0;
          }
          .toolbar-mobile-linha { display: flex; gap: 8px; }
          .toolbar-mobile input {
            flex: 1; padding: 10px 12px; font-size: 14px; border: 1px solid #dadce0;
            border-radius: 6px; outline: none;
          }
          .toolbar-mobile input:focus { border-color: #1a73e8; }
          .toolbar-mobile .venc-mobile { max-width: 80px; text-align: center; }
          .toolbar-mobile button {
            background: #1a73e8; color: #fff; border: none; padding: 10px 18px;
            border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;
          }
          .toolbar-mobile button:disabled { opacity: 0.5; }

          .totais-topo {
            display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;
            padding: 12px; background: #fff; border-bottom: 1px solid #e0e0e0;
          }
          .totais-topo-item { text-align: center; }
          .totais-topo-label { font-size: 10px; color: #5f6368; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
          .totais-topo-valor { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; }

          .vazio-mobile {
            text-align: center; padding: 40px 20px; color: #5f6368; font-size: 13px;
            background: #fff; border-radius: 12px; margin: 12px 0;
          }

          /* Botao de acao inferior */
          .btn-lixo-mobile {
            background: transparent; border: none; color: #d93025; font-size: 18px;
            padding: 8px 12px; cursor: pointer; opacity: 0.6;
          }

          /* Ocultar barra info no mobile */
          .barra-info { display: none; }
          .barra-status { font-size: 11px; }
        }


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
          <button
            onClick={sair}
            style={{
              background: "transparent",
              border: "1px solid #dadce0",
              color: "#5f6368",
              padding: "4px 10px",
              borderRadius: 4,
              fontSize: 11,
              cursor: "pointer",
              marginLeft: 8
            }}
            title="Sair"
          >Sair</button>
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
        <span style={{ color: "#5f6368", fontSize: 11 }}>Venc.:</span>
        <input
          className="campo"
          type="number"
          min="1"
          max="31"
          value={novoVencimento}
          onChange={(e) => setNovoVencimento(parseInt(e.target.value) || 10)}
          style={{ minWidth: 60, width: 60, textAlign: "center" }}
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

      <div className="desktop-view planilha">
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
                <th className="col-vencimento">Venc.</th>
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
                  <td className="vencimento">
                    <input
                      className="venc-input"
                      type="number"
                      min="1"
                      max="31"
                      value={d.vencimento || 10}
                      onChange={(e) => {
                        const dia = parseInt(e.target.value);
                        if (dia >= 1 && dia <= 31) atualizarVencimento(d.id, dia);
                      }}
                      title="Dia do vencimento"
                    />
                  </td>
                  {MESES.map((_, mesIdx) => {
                    const dados = d.valores[mesIdx] || { valor: 0, status: "vazio" as Status };
                    const setaLabel = dados.status === "pago" ? "✓" : dados.status === "pendente" ? "●" : "○";
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
                <td></td>
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

      {/* ========== MOBILE VIEW ========== */}
      <div className="mobile-view">
        <div className="toolbar-mobile">
          <div className="toolbar-mobile-linha">
            <input
              type="text"
              placeholder="Nome da despesa (ex: Água)"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionar()}
            />
            <input
              className="venc-mobile"
              type="number"
              placeholder="Dia"
              min="1"
              max="31"
              value={novoVencimento}
              onChange={(e) => setNovoVencimento(parseInt(e.target.value) || 10)}
            />
          </div>
          <button onClick={adicionar} disabled={!novoNome.trim()}>+ Adicionar despesa</button>
        </div>

        <div className="totais-topo">
          <div className="totais-topo-item">
            <div className="totais-topo-label">Total</div>
            <div className="totais-topo-valor">{formatarMoeda(totalAnual()) || "R$ 0"}</div>
          </div>
          <div className="totais-topo-item">
            <div className="totais-topo-label">Pago</div>
            <div className="totais-topo-valor cor-pago" style={{ color: "#188038" }}>{formatarMoeda(totalPago()) || "R$ 0"}</div>
          </div>
          <div className="totais-topo-item">
            <div className="totais-topo-label">Pendente</div>
            <div className="totais-topo-valor" style={{ color: "#f9ab00" }}>{formatarMoeda(totalPendente()) || "R$ 0"}</div>
          </div>
        </div>

        <div className="mes-seletor">
          {MESES.map((m, i) => (
            <button
              key={m}
              className={`mes-btn ${mesAtual === i ? "ativo" : ""}`}
              onClick={() => setMesAtual(i)}
            >{m}</button>
          ))}
        </div>

        <div className="mes-header">
          <div className="mes-titulo">{MESES[mesAtual]} {ano}</div>
          <div className="mes-total-info">
            <div className="mes-total-valor">{formatarMoeda(totalMes(mesAtual)) || "R$ 0"}</div>
            <div className="mes-total-label">total do mes</div>
          </div>
        </div>

        {despesasDoAno.length === 0 ? (
          <div className="vazio-mobile">
            Nenhuma despesa em {ano}.<br />Adicione uma acima pra comecar.
          </div>
        ) : (
          <>
            {despesasDoAno.map((d) => {
              const dados = d.valores[mesAtual] || { valor: 0, status: "vazio" as Status };
              return (
                <div key={d.id} className={`conta-card st-${dados.status}`}>
                  <div className="conta-info">
                    <div className="conta-nome">{d.nome}</div>
                    <div className="conta-venc">
                      Vence dia {d.vencimento || 10}
                    </div>
                  </div>
                  <div className="conta-valor-wrap">
                    <input
                      className={`conta-valor-input ${dados.status}`}
                      type="text"
                      placeholder="R$ 0"
                      value={dados.valor > 0 ? formatarMoeda(dados.valor) : ""}
                      onChange={(e) => atualizarValor(d.id, mesAtual, parseInputMoeda(e.target.value))}
                    />
                  </div>
                  <button
                    className={`conta-status-btn ${dados.status}`}
                    onClick={() => toggleStatus(d.id, mesAtual)}
                    title="Toque pra mudar status"
                  >
                    {dados.status === "pago" ? "✓" : dados.status === "pendente" ? "●" : "○"}
                  </button>
                </div>
              );
            })}

            <div className="resumo-mes">
              <div className="resumo-linha resumo-pago">
                <span>Pago em {MESES[mesAtual]}</span>
                <b>{formatarMoeda(despesasDoAno.reduce((s, d) => s + (d.valores[mesAtual]?.status === "pago" ? d.valores[mesAtual].valor : 0), 0)) || "R$ 0"}</b>
              </div>
              <div className="resumo-linha resumo-pendente">
                <span>Pendente em {MESES[mesAtual]}</span>
                <b>{formatarMoeda(despesasDoAno.reduce((s, d) => s + (d.valores[mesAtual]?.status === "pendente" ? d.valores[mesAtual].valor : 0), 0)) || "R$ 0"}</b>
              </div>
              <div className="resumo-linha total">
                <span>Total do mes</span>
                <b>{formatarMoeda(totalMes(mesAtual)) || "R$ 0"}</b>
              </div>
            </div>
          </>
        )}
      </div>

    </>
  );
}
