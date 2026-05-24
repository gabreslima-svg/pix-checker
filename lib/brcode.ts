// Parser do BR Code PIX (EMV MPM)
// Lê a string do QR Code, classifica como dinâmico/estático e extrai a URL de consulta

export type BrCodeParsed =
  | {
      tipo: "dinamico";
      url: string;
      psp: string;
      merchantName: string;
      city: string;
      txid: string;
      raw: string;
    }
  | {
      tipo: "estatico";
      chave: string;
      merchantName: string;
      city: string;
      raw: string;
    }
  | {
      tipo: "invalido";
      erro: string;
      raw: string;
    };

function parseTLV(input: string): Map<string, string> {
  const map = new Map<string, string>();
  let i = 0;
  while (i < input.length) {
    if (i + 4 > input.length) break;
    const id = input.substring(i, i + 2);
    const len = parseInt(input.substring(i + 2, i + 4), 10);
    if (isNaN(len)) break;
    const value = input.substring(i + 4, i + 4 + len);
    map.set(id, value);
    i += 4 + len;
  }
  return map;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function parseBrCode(input: string): BrCodeParsed {
  const raw = input.trim();

  if (!raw || raw.length < 20) {
    return { tipo: "invalido", erro: "String muito curta", raw };
  }

  const crcIndex = raw.lastIndexOf("6304");
  if (crcIndex === -1 || crcIndex !== raw.length - 8) {
    return { tipo: "invalido", erro: "Campo CRC (6304) nao encontrado", raw };
  }
  const payloadForCrc = raw.substring(0, crcIndex + 4);
  const providedCrc = raw.substring(crcIndex + 4).toUpperCase();
  const expectedCrc = crc16(payloadForCrc);
  if (providedCrc !== expectedCrc) {
    return {
      tipo: "invalido",
      erro: "CRC invalido (esperado " + expectedCrc + ", recebido " + providedCrc + ")",
      raw,
    };
  }

  const top = parseTLV(raw);
  const merchantAccount = top.get("26");
  if (!merchantAccount) {
    return { tipo: "invalido", erro: "Campo 26 nao encontrado", raw };
  }

  const inner = parseTLV(merchantAccount);
  const gui = inner.get("00");
  if (gui !== "br.gov.bcb.pix") {
    return { tipo: "invalido", erro: "GUI nao e PIX: " + gui, raw };
  }

  const merchantName = top.get("59") || "";
  const city = top.get("60") || "";
  const additionalData = top.get("62");
  const txid = additionalData ? parseTLV(additionalData).get("05") || "" : "";

  const url = inner.get("25");
  const chave = inner.get("01");

  if (url) {
    let fullUrl = url;
    if (!fullUrl.startsWith("http")) {
      fullUrl = "https://" + fullUrl;
    }
    let psp = "";
    try {
      psp = new URL(fullUrl).hostname;
    } catch {
      psp = url.split("/")[0];
    }
    return { tipo: "dinamico", url: fullUrl, psp, merchantName, city, txid, raw };
  }

  if (chave) {
    return { tipo: "estatico", chave, merchantName, city, raw };
  }

  return { tipo: "invalido", erro: "Campo 26 sem URL (25) nem chave (01)", raw };
}
