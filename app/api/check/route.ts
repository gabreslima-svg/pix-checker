import { NextRequest, NextResponse } from "next/server";
import { consultarPix } from "@/lib/consulta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url: string | undefined = body?.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ ok: false, erro: "URL nao informada" }, { status: 400 });
    }

    if (!url.startsWith("https://")) {
      return NextResponse.json(
        { ok: false, erro: "URL precisa comecar com https://" },
        { status: 400 }
      );
    }

    const result = await consultarPix(url);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ ok: false, erro: e?.message || "Erro interno" }, { status: 500 });
  }
}
