// Consulta o endpoint do PSP e extrai status da cobrança PIX
// Interpreta corretamente HTTP 200, 404, 410, 401/403

export type ConsultaResult = {
  ok: boolean;
  status?: string;
  valor?: string;
  horario?: string;
  endToEndId?: string;
  expiracao?: number;
  raw?: any;
  erro?: string;
  httpStatus?: number;
};

function base64UrlDecode(input: string): string {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  if (typeof Buffer !== "undefined") {
    return Buffer.from(s, "base64").toString("utf-8");
  }
  return atob(s);
}

function extractFromPayload(payload: any): Partial<ConsultaResult> {
  const out: Partial<ConsultaResult> = { raw: payload };
  if (!payload || typeof payload !== "object") return out;

  out.status = payload.status;
  out.valor = payload?.valor?.original;

  if (payload?.calendario?.expiracao) {
    out.expiracao = payload.calendario.expiracao;
  }

  if (Array.isArray(payload.pix) && payload.pix.length > 0) {
    const ultimo = payload.pix[payload.pix.length - 1];
    out.endToEndId = ultimo.endToEndId;
    out.horario = ultimo.horario;
    if (!out.valor && ultimo.valor) out.valor = ultimo.valor;
  }

  return out;
}

export async function consultarPix(url: string, timeoutMs = 8000): Promise<ConsultaResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/jose, application/json",
        "User-Agent": "PixChecker/1.0",
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    // Interpretar códigos HTTP que NÃO são 200
    if (!res.ok) {
      // 404 = cobrança nunca existiu
      if (res.status === 404) {
        return { ok: true, httpStatus: 404, status: "NAO_ENCONTRADA", erro: null as any };
      }
      // 410 = cobrança foi deletada permanentemente pelo PSP
      if (res.status === 410) {
        return { ok: true, httpStatus: 410, status: "REMOVIDA_PERMANENTE", erro: null as any };
      }
      // 401/403 = precisa de autenticação (PSP fechado)
      if (res.status === 401 || res.status === 403) {
        return { ok: true, httpStatus: res.status, status: "AUTH_NECESSARIA", erro: null as any };
      }
      // Outros
      return { ok: false, httpStatus: res.status, erro: "HTTP " + res.status };
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const body = await res.text();

    if (contentType.includes("jose") || (body.split(".").length === 3 && !body.trim().startsWith("{"))) {
      try {
        const parts = body.trim().split(".");
        if (parts.length !== 3) {
          return { ok: false, erro: "JWS malformado", httpStatus: res.status };
        }
        const payloadJson = base64UrlDecode(parts[1]);
        const payload = JSON.parse(payloadJson);
        return { ok: true, httpStatus: res.status, ...extractFromPayload(payload) };
      } catch (e: any) {
        return { ok: false, erro: "Erro decodificar JWS: " + e.message, httpStatus: res.status };
      }
    }

    try {
      const payload = JSON.parse(body);
      return { ok: true, httpStatus: res.status, ...extractFromPayload(payload) };
    } catch {
      return {
        ok: false,
        erro: "Resposta nao e JSON nem JWS",
        httpStatus: res.status,
        raw: body.substring(0, 500),
      };
    }
  } catch (e: any) {
    clearTimeout(timer);
    if (e.name === "AbortError") return { ok: false, erro: "Timeout na consulta" };
    return { ok: false, erro: e.message || String(e) };
  }
}
