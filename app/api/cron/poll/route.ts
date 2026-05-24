import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { consultarPix } from "@/lib/consulta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function deveConsultar(c: any, exec: number): boolean {
  const inicio = new Date(c.polling_inicio || c.created_at).getTime();
  const idadeMin = (Date.now() - inicio) / 60000;
  if (idadeMin > 360) return false;
  if (idadeMin < 30) return true;
  if (idadeMin < 120) return exec % 3 === 0;
  return exec % 6 === 0;
}

function expirou(c: any): boolean {
  const inicio = new Date(c.polling_inicio || c.created_at).getTime();
  return (Date.now() - inicio) / 60000 > 360;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== "Bearer " + expected) {
    return NextResponse.json({ ok: false, erro: "nao autorizado" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const exec = Math.floor(Date.now() / 120000);

  const { data: cobrancas, error } = await supabase
    .from("cobrancas")
    .select("id, url, status, end_to_end_id, valor, horario_pagamento, pagador_nome, pagador_documento, polling_inicio, created_at, tipo, polling_ativo")
    .eq("tipo", "dinamico")
    .eq("polling_ativo", true)
    .limit(200);

  if (error) {
    return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });
  }

  const stats = { total: cobrancas?.length || 0, consultadas: 0, capturado_e2e: 0, desativadas: 0, erros: 0 };

  for (const c of cobrancas || []) {
    if (expirou(c)) {
      await supabase.from("cobrancas").update({ polling_ativo: false }).eq("id", c.id);
      stats.desativadas++;
      continue;
    }
    if (!deveConsultar(c, exec)) continue;
    if (!c.url) continue;

    stats.consultadas++;

    try {
      const result = await consultarPix(c.url, 6000);

      const e2eFinal = result.endToEndId || c.end_to_end_id || null;
      const horarioFinal = result.horario || c.horario_pagamento || null;
      const valorFinal = result.valor || c.valor || null;
      const nomeFinal = result.pagadorNome || c.pagador_nome || null;
      const docFinal = result.pagadorDocumento || c.pagador_documento || null;

      if (result.endToEndId && !c.end_to_end_id) stats.capturado_e2e++;

      const mudou = c.status !== result.status || c.end_to_end_id !== e2eFinal;

      const updates: any = {
        status: result.status || null,
        valor: valorFinal,
        end_to_end_id: e2eFinal,
        horario_pagamento: horarioFinal,
        pagador_nome: nomeFinal,
        pagador_documento: docFinal,
        ultima_checagem: new Date().toISOString(),
        erro: result.ok ? null : result.erro || "Erro desconhecido",
      };

      if (mudou) updates.mudanca_nao_vista = true;

      if (result.status === "REMOVIDA_PERMANENTE" && e2eFinal) {
        updates.polling_ativo = false;
        stats.desativadas++;
      }

      await supabase.from("cobrancas").update(updates).eq("id", c.id);

      await supabase.from("cobrancas_historico").insert({
        cobranca_id: c.id,
        status: result.status || null,
        valor: result.valor || null,
        end_to_end_id: result.endToEndId || null,
        horario_pagamento: result.horario || null,
        pagador_nome: result.pagadorNome || null,
        pagador_documento: result.pagadorDocumento || null,
        erro: result.ok ? null : result.erro || "Erro desconhecido",
      });
    } catch (e: any) {
      stats.erros++;
    }
  }

  return NextResponse.json({ ok: true, exec, stats, timestamp: new Date().toISOString() });
}
