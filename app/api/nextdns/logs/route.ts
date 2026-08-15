import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const NEXTDNS_API = "https://api.nextdns.io";

export async function GET(req: NextRequest) {
  const apiKey = process.env.NEXTDNS_API_KEY;
  const profileId = process.env.NEXTDNS_PROFILE_ID;

  if (!apiKey || !profileId) {
    return NextResponse.json(
      { ok: false, erro: "NEXTDNS_API_KEY ou NEXTDNS_PROFILE_ID nao configurado" },
      { status: 500 }
    );
  }

  // Parametros de query da URL do frontend
  const searchParams = req.nextUrl.searchParams;
  const from = searchParams.get("from"); // ISO date string
  const to = searchParams.get("to");
  const limit = searchParams.get("limit") || "500";
  const cursor = searchParams.get("cursor") || "";
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || ""; // "allowed" | "blocked" | ""

  // Monta URL da API do NextDNS
  const params = new URLSearchParams();
  params.set("limit", limit);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (cursor) params.set("cursor", cursor);
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  const url = `${NEXTDNS_API}/profiles/${profileId}/logs?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-Api-Key": apiKey,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const texto = await res.text();
      return NextResponse.json(
        { ok: false, status: res.status, erro: texto.slice(0, 500) },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, ...data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, erro: e?.message || "Erro na chamada" },
      { status: 500 }
    );
  }
}
