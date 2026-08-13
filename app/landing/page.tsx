"use client";

import { useState } from "react";

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
        :root {
          --bg: #0a0a0a; --bg-2: #111111; --bg-3: #171717;
          --azul: #2563EB; --azul-claro: #3B82F6; --azul-glow: rgba(37,99,235,0.15);
          --branco: #FFFFFF; --cinza-1: #A3A3A3; --cinza-2: #737373; --cinza-borda: #262626;
          --sans: 'Inter', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: var(--sans); color: var(--branco); background: var(--bg); -webkit-font-smoothing: antialiased; line-height: 1.5; }
        a { color: inherit; text-decoration: none; }
        button { cursor: pointer; font-family: inherit; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        .nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid var(--cinza-borda); }
        .nav-inner { display: flex; justify-content: space-between; align-items: center; height: 68px; }
        .logo { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
        .logo-badge { width: 32px; height: 32px; background: var(--azul); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: var(--branco); box-shadow: 0 0 20px var(--azul-glow); }
        .nav-links { display: flex; gap: 32px; font-size: 14px; color: var(--cinza-1); font-weight: 500; }
        .nav-links a:hover { color: var(--branco); }
        .nav-cta { background: var(--azul); color: var(--branco); padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; transition: all 0.2s; }
        .nav-cta:hover { background: var(--azul-claro); transform: translateY(-1px); }
        @media (max-width: 768px) { .nav-links { display: none; } }

        .hero { padding: 100px 0 80px; position: relative; overflow: hidden; text-align: center; }
        .hero::before { content: ''; position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 800px; height: 400px; background: radial-gradient(ellipse, var(--azul-glow) 0%, transparent 60%); pointer-events: none; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid var(--cinza-borda); background: var(--bg-2); border-radius: 999px; font-size: 12px; color: var(--cinza-1); margin-bottom: 40px; position: relative; z-index: 1; }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .hero h1 { font-size: clamp(48px, 8vw, 96px); font-weight: 800; line-height: 0.95; letter-spacing: -0.04em; margin-bottom: 32px; max-width: 950px; margin-left: auto; margin-right: auto; position: relative; z-index: 1; }
        .hero h1 span { background: linear-gradient(135deg, var(--azul-claro), #60A5FA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-sub { font-size: 20px; color: var(--cinza-1); max-width: 640px; margin: 0 auto 48px; line-height: 1.5; position: relative; z-index: 1; }
        .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 80px; position: relative; z-index: 1; }
        .btn-primary { background: var(--azul); color: var(--branco); padding: 16px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; border: none; box-shadow: 0 4px 20px rgba(37,99,235,0.3); }
        .btn-primary:hover { background: var(--azul-claro); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(37,99,235,0.4); }
        .btn-secondary { background: var(--bg-2); color: var(--branco); padding: 16px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; border: 1px solid var(--cinza-borda); transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--azul); background: var(--bg-3); }

        .pilares { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; max-width: 800px; margin: 0 auto; position: relative; z-index: 1; }
        .pilar { text-align: center; padding: 24px; border-right: 1px solid var(--cinza-borda); }
        .pilar:last-child { border-right: none; }
        .pilar-num { font-family: var(--mono); font-size: 32px; font-weight: 700; color: var(--branco); line-height: 1; margin-bottom: 8px; }
        .pilar-label { font-size: 12px; color: var(--cinza-1); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; }
        @media (max-width: 640px) { .pilares { grid-template-columns: 1fr; } .pilar { border-right: none; border-bottom: 1px solid var(--cinza-borda); } .pilar:last-child { border-bottom: none; } }

        section { padding: 100px 0; position: relative; }
        .section-eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--azul-claro); font-weight: 600; margin-bottom: 16px; }
        .section-titulo { font-size: clamp(36px, 5vw, 56px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 24px; max-width: 720px; }
        .section-sub { font-size: 18px; color: var(--cinza-1); max-width: 560px; margin-bottom: 56px; }

        .beneficios { background: var(--bg-2); border-top: 1px solid var(--cinza-borda); border-bottom: 1px solid var(--cinza-borda); }
        .beneficios-header { text-align: center; margin-bottom: 64px; }
        .beneficios-header .section-titulo, .beneficios-header .section-sub { margin-left: auto; margin-right: auto; }
        .beneficios-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .beneficio { padding: 32px 24px; background: var(--bg-3); border: 1px solid var(--cinza-borda); border-radius: 16px; transition: all 0.3s; }
        .beneficio:hover { border-color: var(--azul); transform: translateY(-4px); }
        .beneficio-icone { width: 44px; height: 44px; background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.3); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: var(--azul-claro); }
        .beneficio h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.01em; }
        .beneficio p { font-size: 14px; color: var(--cinza-1); line-height: 1.55; }
        @media (max-width: 768px) { .beneficios-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .beneficios-grid { grid-template-columns: 1fr; } }

        .passos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 60px; }
        .passo { padding: 32px 24px; background: var(--bg-2); border: 1px solid var(--cinza-borda); border-radius: 16px; position: relative; transition: all 0.3s; }
        .passo:hover { border-color: var(--azul); background: var(--bg-3); }
        .passo-numero { font-family: var(--mono); font-size: 13px; font-weight: 600; color: var(--azul-claro); margin-bottom: 24px; display: inline-flex; align-items: center; gap: 8px; padding: 4px 10px; background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.3); border-radius: 999px; }
        .passo h3 { font-size: 20px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.02em; }
        .passo p { font-size: 14px; color: var(--cinza-1); line-height: 1.55; }
        @media (max-width: 900px) { .passos-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .passos-grid { grid-template-columns: 1fr; } }

        .servicos { background: var(--bg-2); border-top: 1px solid var(--cinza-borda); border-bottom: 1px solid var(--cinza-borda); }
        .servicos-titulo { text-align: center; margin-bottom: 64px; }
        .servicos-titulo .section-titulo, .servicos-titulo .section-sub { margin-left: auto; margin-right: auto; }
        .servicos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .servico { padding: 40px 32px; background: var(--bg-3); border: 1px solid var(--cinza-borda); border-radius: 20px; transition: all 0.3s; }
        .servico:hover { border-color: var(--azul); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(37,99,235,0.1); }
        .servico.destaque { background: linear-gradient(180deg, rgba(37,99,235,0.08) 0%, var(--bg-3) 100%); border-color: rgba(37,99,235,0.4); position: relative; }
        .servico.destaque::before { content: 'MAIS ESCOLHIDO'; position: absolute; top: 20px; right: 20px; background: var(--azul); padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; }
        .servico-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--azul-claro); font-weight: 600; margin-bottom: 12px; }
        .servico h3 { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; }
        .servico-preco { font-size: 14px; color: var(--cinza-1); margin-bottom: 24px; }
        .servico-preco strong { color: var(--branco); font-size: 32px; font-weight: 800; font-family: var(--mono); letter-spacing: -0.02em; margin-right: 4px; }
        .servico ul { list-style: none; margin-bottom: 32px; }
        .servico li { padding: 10px 0; border-bottom: 1px solid var(--cinza-borda); font-size: 14px; color: var(--cinza-1); display: flex; align-items: flex-start; gap: 10px; }
        .servico li:last-child { border-bottom: none; }
        .servico li strong { color: var(--branco); font-weight: 600; }
        .check-icon { color: var(--azul-claro); flex-shrink: 0; margin-top: 2px; }
        .servico-cta { display: block; text-align: center; padding: 14px; background: var(--bg); border: 1px solid var(--cinza-borda); border-radius: 10px; font-size: 14px; font-weight: 600; transition: all 0.2s; }
        .servico-cta:hover { background: var(--azul); border-color: var(--azul); }
        .servico.destaque .servico-cta { background: var(--azul); border-color: var(--azul); }
        .servico.destaque .servico-cta:hover { background: var(--azul-claro); }
        @media (max-width: 900px) { .servicos-grid { grid-template-columns: 1fr; } }

        .stats { background: var(--bg); }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; padding: 60px 0; border-top: 1px solid var(--cinza-borda); border-bottom: 1px solid var(--cinza-borda); }
        .stat { text-align: center; }
        .stat-num { font-family: var(--mono); font-size: 48px; font-weight: 700; letter-spacing: -0.03em; color: var(--branco); line-height: 1; margin-bottom: 12px; }
        .stat-num span { color: var(--azul-claro); }
        .stat-label { font-size: 13px; color: var(--cinza-1); }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr 1fr; gap: 32px; } }

        .depoimentos { padding: 100px 0; }
        .depoimentos-titulo { text-align: center; margin-bottom: 64px; }
        .depoimentos-titulo .section-titulo, .depoimentos-titulo .section-sub { margin-left: auto; margin-right: auto; }
        .depoimentos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .depoimento { padding: 32px; background: var(--bg-2); border: 1px solid var(--cinza-borda); border-radius: 16px; }
        .depoimento-estrelas { color: #FBBF24; margin-bottom: 16px; font-size: 16px; letter-spacing: 2px; }
        .depoimento-texto { font-size: 15px; line-height: 1.6; color: var(--cinza-1); margin-bottom: 24px; }
        .depoimento-autor { display: flex; align-items: center; gap: 12px; padding-top: 20px; border-top: 1px solid var(--cinza-borda); }
        .autor-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--azul), #1e40af); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
        .autor-nome { font-size: 14px; font-weight: 600; }
        .autor-cargo { font-size: 12px; color: var(--cinza-1); }
        @media (max-width: 900px) { .depoimentos-grid { grid-template-columns: 1fr; } }

        .faq-lista { max-width: 800px; margin: 0 auto; }
        .faq-item { border: 1px solid var(--cinza-borda); border-radius: 12px; margin-bottom: 12px; background: var(--bg-2); transition: border 0.2s; }
        .faq-item.aberto { border-color: var(--azul); }
        .faq-pergunta { width: 100%; background: none; border: none; padding: 20px 24px; text-align: left; font-size: 16px; font-weight: 600; color: var(--branco); display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .faq-icon { flex-shrink: 0; transition: transform 0.2s; color: var(--azul-claro); }
        .faq-item.aberto .faq-icon { transform: rotate(45deg); }
        .faq-resposta { max-height: 0; overflow: hidden; transition: max-height 0.3s, padding 0.3s; font-size: 14px; color: var(--cinza-1); line-height: 1.6; padding: 0 24px; }
        .faq-item.aberto .faq-resposta { max-height: 400px; padding: 0 24px 24px; }

        .cta-final { background: linear-gradient(180deg, var(--bg) 0%, rgba(37,99,235,0.05) 100%); padding: 100px 0 120px; text-align: center; border-top: 1px solid var(--cinza-borda); position: relative; overflow: hidden; }
        .cta-final::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 900px; height: 500px; background: radial-gradient(ellipse, var(--azul-glow) 0%, transparent 60%); pointer-events: none; }
        .cta-final > * { position: relative; z-index: 1; }
        .cta-final h2 { font-size: clamp(36px, 6vw, 64px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 24px; max-width: 750px; margin-left: auto; margin-right: auto; }
        .cta-final h2 span { background: linear-gradient(135deg, var(--azul-claro), #60A5FA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .cta-final p { font-size: 18px; color: var(--cinza-1); margin-bottom: 40px; max-width: 560px; margin-left: auto; margin-right: auto; }
        .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

        footer { padding: 60px 0 40px; border-top: 1px solid var(--cinza-borda); background: var(--bg); }
        .footer-inner { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .footer-brand { max-width: 320px; }
        .footer-desc { color: var(--cinza-1); font-size: 13px; margin-top: 16px; line-height: 1.55; }
        .footer h4 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--cinza-1); margin-bottom: 16px; font-weight: 600; }
        .footer ul { list-style: none; }
        .footer li { margin-bottom: 8px; font-size: 14px; color: var(--branco); }
        .footer li a:hover { color: var(--azul-claro); }
        .footer-baixo { padding-top: 32px; border-top: 1px solid var(--cinza-borda); display: flex; justify-content: space-between; font-size: 12px; color: var(--cinza-1); flex-wrap: wrap; gap: 12px; }
        @media (max-width: 768px) { .footer-inner { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .footer-inner { grid-template-columns: 1fr; } }

        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      <Nav />
      <Hero />
      <Beneficios />
      <ComoFunciona />
      <Servicos />
      <Stats />
      <Depoimentos />
      <Faq />
      <CtaFinal />
      <Footer />
    </>
  );
}

function Nav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <a href="#" className="logo">
          <span className="logo-badge">GA</span>
          <span>Ativos</span>
        </a>
        <div className="nav-links">
          <a href="#beneficios">Beneficios</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#servicos">Servicos</a>
          <a href="#faq">FAQ</a>
        </div>
        <a href="#contato" className="nav-cta">Falar com especialista</a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          Vagas abertas · Analise gratuita em 48h
        </div>
        <h1>Google Ads que <span>faz vender</span>, nao so aparecer.</h1>
        <p className="hero-sub">
          Gestao de trafego pago focada em resultado real. Auditamos, estruturamos e otimizamos suas campanhas ate o ROI aparecer no caixa — nao so no dashboard.
        </p>
        <div className="hero-actions">
          <a href="#contato" className="btn-primary">
            Solicitar analise gratuita
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#como-funciona" className="btn-secondary">Como funciona</a>
        </div>
        <div className="pilares">
          <div className="pilar"><div className="pilar-num">R$47M+</div><div className="pilar-label">Gerenciados</div></div>
          <div className="pilar"><div className="pilar-num">4.2x</div><div className="pilar-label">ROAS medio</div></div>
          <div className="pilar"><div className="pilar-num">120+</div><div className="pilar-label">Empresas ativas</div></div>
        </div>
      </div>
    </section>
  );
}

function Beneficios() {
  const beneficios = [
    { icone: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", titulo: "Estrategia validada", desc: "Nao chutamos. Cada campanha nasce de auditoria + benchmarks reais do seu nicho." },
    { icone: "M22 12h-4l-3 9L9 3l-3 9H2", titulo: "Tracking preciso", desc: "GTM, conversoes offline, integracao com CRM. Rastreamos cada real ate virar cliente." },
    { icone: "M12 20V10M18 20V4M6 20v-4", titulo: "Otimizacao semanal", desc: "Report toda semana com numeros crus. Sem metricas de vaidade, sem enrolacao." },
    { icone: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", titulo: "Suporte direto", desc: "Voce fala com quem opera. Sem intermediario, sem gerente de contas robotico." },
  ];
  return (
    <section className="beneficios" id="beneficios">
      <div className="container">
        <div className="beneficios-header">
          <div className="section-eyebrow">Por que GA Ativos</div>
          <h2 className="section-titulo">Feito pra sua verba nao ser queimada.</h2>
          <p className="section-sub">Trabalhamos como socio da operacao. Se voce nao escala, a gente tambem nao.</p>
        </div>
        <div className="beneficios-grid">
          {beneficios.map((b, i) => (
            <div className="beneficio" key={i}>
              <div className="beneficio-icone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={b.icone}/>
                </svg>
              </div>
              <h3>{b.titulo}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComoFunciona() {
  const passos = [
    { num: "01", titulo: "Auditoria gratuita", desc: "Analisamos sua conta atual, achamos onde ta queimando verba e entregamos plano de acao em 48h." },
    { num: "02", titulo: "Estruturacao", desc: "Montamos campanhas do zero: keywords, criativos, tracking, integracao com CRM." },
    { num: "03", titulo: "Escala controlada", desc: "Comecamos com verba baixa, validamos, e escalamos so o que ja provou converter." },
    { num: "04", titulo: "Otimizacao continua", desc: "Report semanal + reunioes quinzenais. Cortamos rapido, escalamos rapido." },
  ];
  return (
    <section id="como-funciona">
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="section-eyebrow">Como funciona</div>
        <h2 className="section-titulo" style={{ marginLeft: 'auto', marginRight: 'auto' }}>4 passos. Sem enrolacao.</h2>
        <p className="section-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>Do primeiro contato a primeira venda gerada em menos de 30 dias.</p>
        <div className="passos-grid">
          {passos.map((p) => (
            <div className="passo" key={p.num}>
              <div className="passo-numero">{p.num}</div>
              <h3>{p.titulo}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Servicos() {
  const servicos = [
    {
      label: "Basico",
      titulo: "Starter",
      preco: "1.497",
      periodo: "/mes",
      items: [
        { destaque: "Ate R$ 10k/mes em midia" },
        { destaque: "Google Search + Performance Max" },
        { destaque: "Tracking basico via GTM" },
        { destaque: "Report semanal por email" },
        { destaque: "Suporte via WhatsApp" },
      ],
      cta: "Comecar com Starter",
      destaque: false,
    },
    {
      label: "Mais vendido",
      titulo: "Growth",
      preco: "2.997",
      periodo: "/mes",
      items: [
        { destaque: "Ate R$ 50k/mes em midia" },
        { destaque: "Search + PMax + Display + YouTube" },
        { destaque: "Tracking avancado + conversoes offline" },
        { destaque: "Integracao CRM (HubSpot, RD, Pipedrive)" },
        { destaque: "Report semanal + reuniao quinzenal" },
        { destaque: "A/B teste de criativos" },
      ],
      cta: "Comecar com Growth",
      destaque: true,
    },
    {
      label: "Escala",
      titulo: "Enterprise",
      preco: "sob consulta",
      periodo: "",
      items: [
        { destaque: "Verba a partir de R$ 100k/mes" },
        { destaque: "Todas as plataformas Google" },
        { destaque: "Time dedicado (gestor + analista)" },
        { destaque: "BI customizado + dashboards ao vivo" },
        { destaque: "Reunioes semanais + trimestrais" },
        { destaque: "SLA de resposta em 2h uteis" },
      ],
      cta: "Falar com comercial",
      destaque: false,
    },
  ];
  return (
    <section className="servicos" id="servicos">
      <div className="container">
        <div className="servicos-titulo">
          <div className="section-eyebrow">Servicos</div>
          <h2 className="section-titulo">Um plano pra cada momento.</h2>
          <p className="section-sub">Sem taxa de setup, sem letra miuda. Fidelidade minima de 90 dias — tempo que o Google precisa pra performar.</p>
        </div>
        <div className="servicos-grid">
          {servicos.map((s) => (
            <div className={`servico ${s.destaque ? 'destaque' : ''}`} key={s.titulo}>
              <div className="servico-label">{s.label}</div>
              <h3>{s.titulo}</h3>
              <div className="servico-preco">
                {s.preco !== "sob consulta" ? <><strong>R$ {s.preco}</strong>{s.periodo}</> : <strong style={{ fontSize: 24 }}>{s.preco}</strong>}
              </div>
              <ul>
                {s.items.map((item, i) => (
                  <li key={i}>
                    <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>{item.destaque}</span>
                  </li>
                ))}
              </ul>
              <a href="#contato" className="servico-cta">{s.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="stats">
      <div className="container">
        <div className="stats-grid">
          <div className="stat"><div className="stat-num">R$ <span>47M</span></div><div className="stat-label">Investidos em midia (12 meses)</div></div>
          <div className="stat"><div className="stat-num"><span>4.2x</span></div><div className="stat-label">ROAS medio dos clientes ativos</div></div>
          <div className="stat"><div className="stat-num"><span>120+</span></div><div className="stat-label">Empresas escalando com a gente</div></div>
          <div className="stat"><div className="stat-num"><span>12</span>d</div><div className="stat-label">Ate a primeira otimizacao</div></div>
        </div>
      </div>
    </section>
  );
}

function Depoimentos() {
  const deps = [
    { texto: "Trocamos 3 agencias antes de encontrar a GA. Diferenca de mundo — primeira que trata anuncio como investimento, nao despesa fixa. ROAS subiu de 1.8 pra 4.1 em 2 meses.", nome: "Juliano Marques", cargo: "CEO · E-commerce moda" },
    { texto: "Saimos de 40 leads/mes pra mais de 200, com CPA menor. A auditoria inicial ja mostrou onde tava vazando dinheiro. Foram diretos: cortaram 60% das campanhas velhas.", nome: "Renata Souza", cargo: "Diretora · Odontologia" },
    { texto: "Ja duplicamos o investimento duas vezes esse ano. Cada real que colocamos volta em 3 meses. Report semanal e transparente — sem numero inventado, sem dashboard bonito e caixa vazio.", nome: "Lucas Pereira", cargo: "Fundador · SaaS B2B" },
  ];
  return (
    <section className="depoimentos">
      <div className="container">
        <div className="depoimentos-titulo">
          <div className="section-eyebrow">Depoimentos</div>
          <h2 className="section-titulo">Quem ja parou de queimar verba.</h2>
          <p className="section-sub">Cada case abaixo e rastreavel. Quiser conferir dashboard, mostramos.</p>
        </div>
        <div className="depoimentos-grid">
          {deps.map((d, i) => (
            <div className="depoimento" key={i}>
              <div className="depoimento-estrelas">★★★★★</div>
              <p className="depoimento-texto">"{d.texto}"</p>
              <div className="depoimento-autor">
                <div className="autor-avatar">{d.nome.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <div className="autor-nome">{d.nome}</div>
                  <div className="autor-cargo">{d.cargo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [aberto, setAberto] = useState<number | null>(0);
  const perguntas = [
    { q: "Quanto tempo ate ver resultado?", a: "15 a 30 dias pros primeiros resultados consistentes. Google Ads precisa de dados pra otimizar — nas primeiras 2 semanas o algoritmo esta aprendendo. A partir do segundo mes, numeros comecam a estabilizar e escalar." },
    { q: "Qual investimento minimo em midia?", a: "R$ 5.000/mes e o piso tecnico pra dar volume de dados suficiente pro Google otimizar. Abaixo disso os anuncios ficam ineficientes independente da agencia. Ideal e comecar com R$ 10-15k pra ter margem de teste." },
    { q: "Voces cobram taxa fixa ou % sobre midia?", a: "Taxa mensal fixa, independente do quanto voce investe em midia. Assim o incentivo esta alinhado: ganhamos mais quando voce escala, mas nao recebemos comissao por queimar orcamento." },
    { q: "Preciso ter site proprio?", a: "Precisa ter uma pagina de conversao (site, LP, ou loja). Se nao tiver, encaminhamos parceiros que fazem. Nao fazemos internamente — foco 100% em trafego e midia." },
    { q: "Trabalham com quais segmentos?", a: "Todos que geram vendas online: e-commerce, servicos locais, SaaS, educacao, saude (nicho legal), infoprodutos com historico. Nao trabalhamos com apostas, cripto de risco ou nichos proibidos pelo Google." },
    { q: "Existe fidelidade?", a: "Minimo de 90 dias — tempo que o Google precisa pra performar. Depois disso, mensal sem multa. Se quiser sair, sai sem burocracia." },
  ];
  return (
    <section id="faq">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-eyebrow">FAQ</div>
          <h2 className="section-titulo" style={{ marginLeft: 'auto', marginRight: 'auto' }}>Duvidas frequentes</h2>
        </div>
        <div className="faq-lista">
          {perguntas.map((p, i) => (
            <div className={`faq-item ${aberto === i ? 'aberto' : ''}`} key={i}>
              <button className="faq-pergunta" onClick={() => setAberto(aberto === i ? null : i)}>
                <span>{p.q}</span>
                <svg className="faq-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
              <div className="faq-resposta">{p.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaFinal() {
  return (
    <section className="cta-final" id="contato">
      <div className="container">
        <h2>Sua proxima <span>campanha lucrativa</span> comeca agora.</h2>
        <p>Analise gratuita da sua conta em ate 48h. Sem compromisso, sem venda forcada — se nao fizer sentido, a gente fala.</p>
        <div className="cta-actions">
          <a href="https://wa.me/5511999999999?text=Ola%2C%20vim%20do%20site%20e%20quero%20uma%20analise%20gratuita" target="_blank" rel="noopener" className="btn-primary">
            Chamar no WhatsApp
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#servicos" className="btn-secondary">Ver planos</a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-badge">GA</span>
              <span>Ativos</span>
            </div>
            <p className="footer-desc">Gestao de trafego pago em Google Ads focada em ROI real. Auditamos, estruturamos e escalamos.</p>
          </div>
          <div>
            <h4>Servicos</h4>
            <ul>
              <li><a href="#servicos">Starter</a></li>
              <li><a href="#servicos">Growth</a></li>
              <li><a href="#servicos">Enterprise</a></li>
            </ul>
          </div>
          <div>
            <h4>Empresa</h4>
            <ul>
              <li><a href="#beneficios">Beneficios</a></li>
              <li><a href="#como-funciona">Como funciona</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4>Contato</h4>
            <ul>
              <li>contato@gaativos.com.br</li>
              <li>Seg–Sex 9h–19h</li>
            </ul>
          </div>
        </div>
        <div className="footer-baixo">
          <div>© 2026 GA Ativos · Gestao de trafego pago</div>
          <div>Operacao etica · Sem promessa milagrosa</div>
        </div>
      </div>
    </footer>
  );
}
