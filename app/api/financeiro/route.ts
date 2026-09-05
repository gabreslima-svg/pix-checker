import { NextRequest, NextResponse } from "next/server";
import { createClient } from "redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const CHAVE = "financeiro:gabriel:despesas";

async function getClient() {
  const client = createClient({ url: process.env.REDIS_URL });
  client.on("error", (err) => console.error("Redis error:", err));
  await client.connect();
  return client;
}

// GET - retorna todas as despesas
export async function GET() {
  try {
    const client = await getClient();
    const dados = await client.get(CHAVE);
    await client.quit();
    return NextResponse.json({ ok: true, despesas: dados ? JSON.parse(dados) : [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, erro: e.message || "Erro ao ler" }, { status: 500 });
  }
}

// POST - salva todas as despesas (substitui)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!Array.isArray(body.despesas)) {
      return NextResponse.json({ ok: false, erro: "despesas deve ser array" }, { status: 400 });
    }
    const client = await getClient();
    await client.set(CHAVE, JSON.stringify(body.despesas));
    await client.quit();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, erro: e.message || "Erro ao salvar" }, { status: 500 });
  }
}
