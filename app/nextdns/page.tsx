"use client";

import { useEffect, useState, useCallback } from "react";

type LogEntry = {
  timestamp: string;
  domain: string;
  root?: string;
  type?: string;
  encrypted?: boolean;
  clientIp?: string;
  status?: "default" | "allowed" | "blocked";
  reasons?: Array<{ id: string; name: string }>;
  device?: { id?: string; name?: string; model?: string; localIp?: string };
  matchedName?: string;
  protocol?: string;
  clientName?: string;
  dnssec?: boolean;
  lists?: Array<{ id: string; name: string }>;
};

type Resposta = {
  ok: boolean;
  data?: LogEntry[];
  meta?: { pagination?: { cursor?: string | null } };
  erro?: string;
  status?: number;
};

function formatarData(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function isoInicioHoje() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function isoAgora() {
  return new Date().toISOString();
}

function paraInputLocal(iso: string) {
  // Converte ISO para valor de datetime-local input
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

function paraIso(inputLocal: string) {
  return new Date(inputLocal).toISOString();
}

export default function NextDNSPage() {
  const [from, setFrom] = useState<string>(paraInputLocal(isoInicioHoje()));
  const [to, setTo] = useState<string>(paraInputLocal(isoAgora()));
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [busca, setBusca] = useState<string>("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string>("");
  const [totalCarregado, setTotalCarregado] = useState(0);

  const buscar = useCallback(async (novoCursor: string | null = null) => {
    setCarregando(true);
    setErro("");

    try {
      const params = new URLSearchParams();
      params.set("from", paraIso(from));
      params.set("to", paraIso(to));
      params.set("limit", "500");
      if (statusFiltro) params.set("status", statusFiltro);
      if (busca.trim()) params.set("search", busca.trim());
      if (novoCursor) params.set("cursor", novoCursor);

      const res = await fetch(`/api/nextdns/logs?${params.toString()}`);
      const data: Resposta = await res.json();

      if (!data.ok) {
        setErro(data.erro || `Erro HTTP ${data.status || res.status}`);
        return;
      }

      const novosLogs = data.data || [];
      if (novoCursor) {
        setLogs((prev) => [...prev, ...novosLogs]);
        setTotalCarregado((prev) => prev + novosLogs.length);
      } else {
        setLogs(novosLogs);
        setTotalCarregado(novosLogs.length);
      }

      setCursor(data.meta?.pagination?.cursor || null);
    } catch (e: any) {
      setErro(e?.message || "Erro na chamada");
    } finally {
      setCarregando(false);
    }
  }, [from, to, statusFiltro, busca]);

  useEffect(() => {
    buscar(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function aplicarFiltros() {
    setLogs([]);
    setCursor(null);
    buscar(null);
  }

  function carregarMais() {
    if (cursor) buscar(cursor);
  }

  function presetHoje() {
    setFrom(paraInputLocal(isoInicioHoje()));
    setTo(paraInputLocal(isoAgora()));
  }

  function presetOntem() {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 1);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio);
    fim.setHours(23, 59, 59, 999);
    setFrom(paraInputLocal(inicio.toISOString()));
    setTo(paraInputLocal(fim.toISOString()));
  }

  function preset7dias() {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 7);
    inicio.setHours(0, 0, 0, 0);
    setFrom(paraInputLocal(inicio.toISOString()));
    setTo(paraInputLocal(isoAgora()));
  }

  function preset30dias() {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 30);
    inicio.setHours(0, 0, 0, 0);
    setFrom(paraInputLocal(inicio.toISOString()));
    setTo(paraInputLocal(isoAgora()));
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a; color: #fff; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .wrap { max-width: 1400px; margin: 0 auto; padding: 32px 24px 60px; }
        h1 { font-size: 24px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.02em; }
        .sub { color: #a3a3a3; font-size: 13px; margin-bottom: 28px; }
        .card { background: #111; border: 1px solid #262626; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .filtros { display: grid; grid-template-columns: repeat(2, 1fr) 180px 1fr; gap: 12px; align-items: end; margin-bottom: 12px; }
        .filtro-grupo { display: flex; flex-direction: column; gap: 6px; }
        .filtro-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #737373; font-weight: 500; }
        input, select { background: #0a0a0a; border: 1px solid #262626; border-radius: 6px; padding: 10px 12px; color: #fff; font-size: 13px; font-family: inherit; outline: none; }
        input:focus, select:focus { border-color: #4285F4; }
        input[type="datetime-local"] { color-scheme: dark; }
        .presets { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .preset-btn { background: #171717; border: 1px solid #262626; color: #a3a3a3; padding: 6px 12px; border-radius: 999px; font-size: 12px; cursor: pointer; transition: all 0.15s; }
        .preset-btn:hover { color: #fff; border-color: #4285F4; }
        .acoes { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .btn { background: #4285F4; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .btn:hover { background: #5B9BFF; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-ghost { background: transparent; color: #a3a3a3; border: 1px solid #262626; }
        .btn-ghost:hover { color: #fff; border-color: #4285F4; }
        .info { color: #a3a3a3; font-size: 12px; }
        .erro { background: rgba(234,67,53,0.1); border: 1px solid rgba(234,67,53,0.3); color: #F87171; padding: 12px; border-radius: 6px; font-size: 13px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { text-align: left; padding: 10px 12px; background: #171717; color: #737373; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; font-weight: 600; border-bottom: 1px solid #262626; }
        td { padding: 10px 12px; border-bottom: 1px solid #171717; vertical-align: top; }
        tr:hover td { background: #171717; }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .st-allowed { background: rgba(52,168,83,0.15); color: #34A853; }
        .st-blocked { background: rgba(234,67,53,0.15); color: #EA4335; }
        .st-default { background: rgba(163,163,163,0.15); color: #a3a3a3; }
        .domain-cell { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #fff; word-break: break-all; }
        .device-cell { color: #a3a3a3; font-size: 11px; }
        .reason-cell { font-size: 11px; color: #FBBC04; }
        .tipo-cell { color: #737373; font-size: 11px; font-family: monospace; }
        .vazio { text-align: center; padding: 60px 20px; color: #737373; }
        .rodape-tabela { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-top: 1px solid #262626; }
        @media (max-width: 900px) { .filtros { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .filtros { grid-template-columns: 1fr; } table { font-size: 11px; } }
      `}</style>

      <div className="wrap">
        <h1>NextDNS · Logs</h1>
        <p className="sub">Consulta de logs do perfil configurado no NextDNS.</p>

        <div className="card">
          <div className="presets">
            <button className="preset-btn" onClick={presetHoje}>Hoje</button>
            <button className="preset-btn" onClick={presetOntem}>Ontem</button>
            <button className="preset-btn" onClick={preset7dias}>Últimos 7 dias</button>
            <button className="preset-btn" onClick={preset30dias}>Últimos 30 dias</button>
          </div>

          <div className="filtros">
            <div className="filtro-grupo">
              <label className="filtro-label">De</label>
              <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="filtro-grupo">
              <label className="filtro-label">Até</label>
              <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="filtro-grupo">
              <label className="filtro-label">Status</label>
              <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                <option value="">Todos</option>
                <option value="allowed">Allowed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div className="filtro-grupo">
              <label className="filtro-label">Buscar domínio</label>
              <input type="text" placeholder="ex: google.com" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
          </div>

          <div className="acoes">
            <button className="btn" onClick={aplicarFiltros} disabled={carregando}>
              {carregando ? "Buscando..." : "Aplicar filtros"}
            </button>
            <span className="info">{totalCarregado} log(s) carregado(s)</span>
          </div>
        </div>

        {erro && <div className="erro">{erro}</div>}

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {logs.length === 0 && !carregando ? (
            <div className="vazio">
              {erro ? "Erro ao carregar logs" : "Nenhum log encontrado para o período selecionado"}
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 130 }}>Data/hora</th>
                      <th>Domínio</th>
                      <th style={{ width: 90 }}>Status</th>
                      <th style={{ width: 60 }}>Tipo</th>
                      <th style={{ width: 160 }}>Dispositivo</th>
                      <th>Motivo bloqueio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => {
                      const statusClass = log.status === "blocked" ? "st-blocked" : log.status === "allowed" ? "st-allowed" : "st-default";
                      return (
                        <tr key={`${log.timestamp}-${i}`}>
                          <td style={{ whiteSpace: "nowrap", color: "#a3a3a3" }}>{formatarData(log.timestamp)}</td>
                          <td className="domain-cell">{log.domain}</td>
                          <td><span className={`status-badge ${statusClass}`}>{log.status || "—"}</span></td>
                          <td className="tipo-cell">{log.type || "—"}</td>
                          <td className="device-cell">
                            {log.device?.name || log.clientIp || "—"}
                            {log.device?.model && <div style={{ fontSize: 10, color: "#737373" }}>{log.device.model}</div>}
                          </td>
                          <td className="reason-cell">
                            {log.reasons?.map((r) => r.name).join(", ") || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="rodape-tabela">
                <span className="info">Mostrando {logs.length} log(s)</span>
                {cursor && (
                  <button className="btn btn-ghost" onClick={carregarMais} disabled={carregando}>
                    {carregando ? "Carregando..." : "Carregar mais"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
