// Consulta o endpoint do PSP e extrai status da cobrança PIX

export type ConsultaResult = {
  ok: boolean;
  status?: string;
  valor?: string;
  horario?: string;
  endToEndId?: string;
  pagadorNome?: string;
  pagadorDocumento?: string;
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

  // Dados do pagador podem vir em devedor (na cobranca ATIVA) ou pix[].pagador (na CONCLUIDA)
  if (payload?.devedor) {
    out.pagadorNome = payload.devedor.nome;
    out.pagadorDocumento = payload.devedor.cpf || payload.devedor.cnpj;
  }

  if (Array.isArray(payload.pix) && payload.pix.length > 0) {
    const ultimo = payload.pix[payload.pix.length - 1];
    out.endToEndId = ultimo.endToEndId;
    out.horario = ultimo.horario;
    if (!out.valor && ultimo.valor) out.valor = ultimo.valor;

    // Algumas PSPs retornam dados do pagador dentro do pix[]
    if (ultimo.pagador) {
      out.pagadorNome = out.pagadorNome || ultimo.pagador.nome;
      out.pagadorDocumento = out.pagadorDocumento || ultimo.pagador.cpf || ultimo.pagador.cnpj;
    }
    // Variantes nao-padrao
    if (ultimo.infoPagador && typeof ultimo.infoPagador === "string") {
      out.pagadorNome = out.pagadorNome || ultimo.infoPagador;
    }
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

    if (!res.ok) {
      if (res.status === 404) {
        return { ok: true, httpStatus: 404, status: "NAO_ENCONTRADA" };
      }
      if (res.status === 410) {
        return { ok: true, httpStatus: 410, status: "REMOVIDA_PERMANENTE" };
      }
      if (res.status === 401 || res.status === 403) {
        return { ok: true, httpStatus: res.status, status: "PSP_FECHADO" };
      }
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
    if (e.name === "AbortError") {
      return { ok: true, status: "PSP_INACESSIVEL", erro: "Timeout - PSP bloqueia consulta publica" };
    }
    const msg = e.message || String(e);
    if (msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED") || msg.includes("fetch failed")) {
      return { ok: true, status: "PSP_INACESSIVEL", erro: msg };
    }
    return { ok: false, erro: msg };
  }
}
