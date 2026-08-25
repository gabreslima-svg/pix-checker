"use client";

import { useState } from "react";

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
        :root {
          --bg: #0a0a0a; --bg-2: #111111; --bg-3: #171717;
          --azul: #4285F4; --azul-claro: #5B9BFF; --azul-glow: rgba(66,133,244,0.18);
          --google-red: #EA4335; --google-yellow: #FBBC04; --google-green: #34A853; --google-blue: #4285F4;
          --branco: #FFFFFF; --cinza-1: #A3A3A3; --cinza-2: #737373; --cinza-borda: #262626;
          --sans: 'Inter', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: var(--sans); color: var(--branco); background: var(--bg); -webkit-font-smoothing: antialiased; line-height: 1.5; }
        a { color: inherit; text-decoration: none; }
        button { cursor: pointer; font-family: inherit; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        .logo { display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
        .logo-g {
          width: 36px; height: 36px; border-radius: 50%;
          background: conic-gradient(from -45deg, var(--google-blue) 0deg 90deg, var(--google-green) 90deg 180deg, var(--google-yellow) 180deg 270deg, var(--google-red) 270deg 360deg);
          display: flex; align-items: center; justify-content: center;
          position: relative;
          box-shadow: 0 0 20px rgba(66,133,244,0.25);
        }
        .logo-g::before { content: ''; position: absolute; inset: 4px; border-radius: 50%; background: var(--bg); }
        .logo-g::after {
          content: 'G'; position: relative; z-index: 1;
          font-family: 'Inter', sans-serif; font-weight: 700; font-size: 20px;
          background: linear-gradient(135deg, var(--google-blue) 0%, var(--google-green) 33%, var(--google-yellow) 66%, var(--google-red) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          letter-spacing: -0.03em;
        }
        .logo-texto { color: var(--branco); font-weight: 700; letter-spacing: -0.02em; font-size: 20px; }
        .logo-a { background: linear-gradient(135deg, var(--google-blue), var(--google-green)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 800; }

        .nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--cinza-borda); }
        .nav-inner { display: flex; justify-content: space-between; align-items: center; height: 72px; }
        .nav-links { display: flex; gap: 32px; font-size: 14px; color: var(--cinza-1); font-weight: 500; }
        .nav-links a:hover { color: var(--branco); }
        .nav-cta { background: var(--azul); color: var(--branco); padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; transition: all 0.2s; }
        .nav-cta:hover { background: var(--azul-claro); transform: translateY(-1px); }
        @media (max-width: 768px) { .nav-links { display: none; } }

        .hero { padding: 100px 0 80px; position: relative; overflow: hidden; text-align: center; }
        .hero::before { content: ''; position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 900px; height: 500px; background: radial-gradient(ellipse, var(--azul-glow) 0%, transparent 60%); pointer-events: none; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border: 1px solid var(--cinza-borda); background: var(--bg-2); border-radius: 999px; font-size: 12px; color: var(--cinza-1); margin-bottom: 40px; position: relative; z-index: 1; font-weight: 500; }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .hero h1 { font-size: clamp(46px, 7.5vw, 88px); font-weight: 800; line-height: 0.98; letter-spacing: -0.04em; margin-bottom: 32px; max-width: 950px; margin-left: auto; margin-right: auto; position: relative; z-index: 1; }
        .hero h1 .grad { background: linear-gradient(135deg, var(--google-blue) 0%, var(--google-green) 50%, var(--google-yellow) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-sub { font-size: 19px; color: var(--cinza-1); max-width: 640px; margin: 0 auto 48px; line-height: 1.55; position: relative; z-index: 1; }
        .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 80px; position: relative; z-index: 1; }
        .btn-primary { background: var(--azul); color: var(--branco); padding: 16px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; border: none; box-shadow: 0 4px 20px rgba(66,133,244,0.3); }
        .btn-primary:hover { background: var(--azul-claro); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(66,133,244,0.4); }
        .btn-secondary { background: var(--bg-2); color: var(--branco); padding: 16px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; border: 1px solid var(--cinza-borda); transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--azul); background: var(--bg-3); }

        .pilares { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; max-width: 720px; margin: 0 auto; position: relative; z-index: 1; }
        .pilar { text-align: center; padding: 24px; border-right: 1px solid var(--cinza-borda); }
        .pilar:last-child { border-right: none; }
        .pilar-num { font-size: 26px; font-weight: 700; color: var(--branco); line-height: 1; margin-bottom: 8px; letter-spacing: -0.02em; }
        .pilar-label { font-size: 12px; color: var(--cinza-1); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; }
        @media (max-width: 640px) { .pilares { grid-template-columns: 1fr; } .pilar { border-right: none; border-bottom: 1px solid var(--cinza-borda); } .pilar:last-child { border-bottom: none; } }

        section { padding: 100px 0; position: relative; }
        .section-eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--azul-claro); font-weight: 600; margin-bottom: 16px; }
        .section-titulo { font-size: clamp(36px, 5vw, 56px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 24px; max-width: 720px; }
        .section-sub { font-size: 18px; color: var(--cinza-1); max-width: 620px; margin-bottom: 56px; line-height: 1.55; }

        .beneficios { background: var(--bg-2); border-top: 1px solid var(--cinza-borda); border-bottom: 1px solid var(--cinza-borda); }
        .beneficios-header { text-align: center; margin-bottom: 64px; }
        .beneficios-header .section-titulo, .beneficios-header .section-sub { margin-left: auto; margin-right: auto; }
        .beneficios-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .beneficio { padding: 32px 24px; background: var(--bg-3); border: 1px solid var(--cinza-borda); border-radius: 16px; transition: all 0.3s; }
        .beneficio:hover { border-color: var(--azul); transform: translateY(-4px); }
        .beneficio-icone { width: 44px; height: 44px; background: rgba(66,133,244,0.1); border: 1px solid rgba(66,133,244,0.3); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: var(--azul-claro); }
        .beneficio h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.01em; }
        .beneficio p { font-size: 14px; color: var(--cinza-1); line-height: 1.55; }
        @media (max-width: 768px) { .beneficios-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .beneficios-grid { grid-template-columns: 1fr; } }

        .passos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 60px; }
        .passo { padding: 32px 24px; background: var(--bg-2); border: 1px solid var(--cinza-borda); border-radius: 16px; position: relative; transition: all 0.3s; text-align: left; }
        .passo:hover { border-color: var(--azul); background: var(--bg-3); }
        .passo-numero { font-family: var(--mono); font-size: 13px; font-weight: 600; color: var(--azul-claro); margin-bottom: 24px; display: inline-flex; align-items: center; gap: 8px; padding: 4px 10px; background: rgba(66,133,244,0.1); border: 1px solid rgba(66,133,244,0.3); border-radius: 999px; }
        .passo h3 { font-size: 20px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.02em; }
        .passo p { font-size: 14px; color: var(--cinza-1); line-height: 1.55; }
        @media (max-width: 900px) { .passos-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .passos-grid { grid-template-columns: 1fr; } }

        .catalogo { background: var(--bg-2); border-top: 1px solid var(--cinza-borda); border-bottom: 1px solid var(--cinza-borda); }
        .catalogo-titulo { text-align: center; margin-bottom: 64px; }
        .catalogo-titulo .section-titulo, .catalogo-titulo .section-sub { margin-left: auto; margin-right: auto; }
        .catalogo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .ativo { padding: 32px; background: var(--bg-3); border: 1px solid var(--cinza-borda); border-radius: 20px; transition: all 0.3s; display: flex; flex-direction: column; }
        .ativo:hover { border-color: var(--azul); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(66,133,244,0.08); }
        .ativo.destaque { background: linear-gradient(180deg, rgba(66,133,244,0.08) 0%, var(--bg-3) 100%); border-color: rgba(66,133,244,0.4); position: relative; }
        .ativo-badge-recuperacao { position: absolute; top: 20px; right: 20px; background: linear-gradient(135deg, #10B981, #059669); padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: var(--branco); }
        .ativo.destaque::before { content: 'MAIS PROCURADO'; position: absolute; top: 20px; right: 20px; background: var(--azul); padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; }
        .ativo-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--azul-claro); font-weight: 600; margin-bottom: 12px; }
        .ativo h3 { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 4px; }
        .ativo-desc { font-size: 13px; color: var(--cinza-1); margin-bottom: 24px; }
        .ativo-preco-box { padding: 16px; background: var(--bg); border: 1px solid var(--cinza-borda); border-radius: 12px; margin-bottom: 20px; }
        .ativo-preco { display: flex; align-items: baseline; gap: 6px; margin-bottom: 4px; }
        .ativo-preco-antigo { font-size: 13px; color: var(--cinza-2); text-decoration: line-through; }
        .ativo-preco strong { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
        .ativo-preco-info { font-size: 11px; color: var(--cinza-1); }
        .ativo-estoque { font-size: 11px; color: #10B981; margin-top: 6px; display: flex; align-items: center; gap: 6px; }
        .ativo-estoque::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #10B981; }
        .ativo ul { list-style: none; margin-bottom: 24px; flex: 1; }
        .ativo li { padding: 8px 0; font-size: 13px; color: var(--cinza-1); display: flex; align-items: flex-start; gap: 10px; }
        .ativo li strong { color: var(--branco); font-weight: 600; }
        .check-icon { color: var(--azul-claro); flex-shrink: 0; margin-top: 2px; }
        .ativo-cta { display: block; text-align: center; padding: 14px; background: var(--bg); border: 1px solid var(--cinza-borda); border-radius: 10px; font-size: 14px; font-weight: 600; transition: all 0.2s; }
        .ativo-cta:hover { background: var(--azul); border-color: var(--azul); }
        .ativo.destaque .ativo-cta { background: var(--azul); border-color: var(--azul); }
        .ativo.destaque .ativo-cta:hover { background: var(--azul-claro); }
        @media (max-width: 1100px) { .catalogo-grid { grid-template-columns: repeat(2, 1fr); } } @media (max-width: 640px) { .catalogo-grid { grid-template-columns: 1fr; } }

        .stats { background: var(--bg); }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; padding: 60px 0; border-top: 1px solid var(--cinza-borda); border-bottom: 1px solid var(--cinza-borda); }
        .stat { text-align: center; }
        .stat-num { font-size: 44px; font-weight: 800; letter-spacing: -0.03em; color: var(--branco); line-height: 1; margin-bottom: 12px; }
        .stat-num span { background: linear-gradient(135deg, var(--google-blue), var(--google-green)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
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
        .autor-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--google-blue), var(--google-green)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: var(--branco); }
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
        .faq-item.aberto .faq-resposta { max-height: 500px; padding: 0 24px 24px; }

        .cta-final { background: linear-gradient(180deg, var(--bg) 0%, rgba(66,133,244,0.05) 100%); padding: 100px 0 120px; text-align: center; border-top: 1px solid var(--cinza-borda); position: relative; overflow: hidden; }
        .cta-final::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 900px; height: 500px; background: radial-gradient(ellipse, var(--azul-glow) 0%, transparent 60%); pointer-events: none; }
        .cta-final > * { position: relative; z-index: 1; }
        .cta-final h2 { font-size: clamp(36px, 6vw, 64px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 24px; max-width: 750px; margin-left: auto; margin-right: auto; }
        .cta-final h2 .grad { background: linear-gradient(135deg, var(--google-blue), var(--google-green)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
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
      <Catalogo />
      <Stats />
      <Depoimentos />
      <Faq />
      <CtaFinal />
      <Footer />
    </>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span className="logo-g"></span>
      <span className="logo-texto">G <span className="logo-a">ATIVOS</span></span>
    </div>
  );
}

function Nav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <a href="#"><Logo /></a>
        <div className="nav-links">
          <a href="#beneficios">Benefícios</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#catalogo">Catálogo</a>
          <a href="#faq">FAQ</a>
        </div>
        <a href="#contato" className="nav-cta">Falar no WhatsApp</a>
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
          Ativos para escalar com Google Ads
        </div>
        <h1>Anuncie no Google Ads com <span className="grad">precisão</span>, escale com segurança.</h1>
        <p className="hero-sub">
          Ativos criados um por um pensando sempre no melhor para você. Criado por player para player.
        </p>
        <div className="hero-actions">
          <a href="#catalogo" className="btn-primary">
            Ver catálogo
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#como-funciona" className="btn-secondary">Como funciona</a>
        </div>
        <div className="pilares">
          <div className="pilar"><div className="pilar-num">Entrega</div><div className="pilar-label">Imediata</div></div>
          <div className="pilar"><div className="pilar-num">Suporte</div><div className="pilar-label">Humano</div></div>
          <div className="pilar"><div className="pilar-num">Ativos</div><div className="pilar-label">Testados</div></div>
        </div>
      </div>
    </section>
  );
}

function Beneficios() {
  const beneficios = [
    { icone: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", titulo: "Entrega imediata", desc: "Pagou, o ativo cai no chat do pedido. Sem esperar atendente, sem burocracia." },
    { icone: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", titulo: "Testado antes", desc: "Cada conta passa por verificação. Você não recebe ativo cru pra descobrir problema depois." },
    { icone: "M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2z", titulo: "Preço na tela", desc: "Valor no anúncio e checkout no site. Sem chama no PV pra saber quanto é." },
    { icone: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z", titulo: "Suporte que responde", desc: "Deu problema, manda print no chat do pedido. Resposta rápida, sem enrolação." },
  ];
  return (
    <section className="beneficios" id="beneficios">
      <div className="container">
        <div className="beneficios-header">
          <div className="section-eyebrow">Por que G Ativos</div>
          <h2 className="section-titulo">Feito pra sua operação não parar.</h2>
          <p className="section-sub">Ativos separados por plataforma. Sem mistura, sem improviso.</p>
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
    { num: "01", titulo: "Escolha o ativo", desc: "Catálogo com preço, especificação e estoque na tela. Compara e decide na hora." },
    { num: "02", titulo: "Finalize a compra", desc: "Checkout no próprio site. Pix ou cartão, sem sair da página." },
    { num: "03", titulo: "Receba na hora", desc: "Ativo entregue automaticamente no chat do pedido, em minutos após o pagamento." },
    { num: "04", titulo: "Suba campanha", desc: "Suporte no chat se precisar. Escala com um ativo testado no seu painel." },
  ];
  return (
    <section id="como-funciona">
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="section-eyebrow">Como funciona</div>
        <h2 className="section-titulo" style={{ marginLeft: 'auto', marginRight: 'auto' }}>4 passos. Sem sair do site.</h2>
        <p className="section-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>Do checkout ao ativo no seu painel em minutos.</p>
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

function Catalogo() {
  const ativos = [
    {
      tag: "Gmail",
      titulo: "Gmail Aquecido",
      link: "https://pay.imperiumpay.com.br/c/uW7B38zUyUMq4a5d",
      desc: "Gmail pronto pra criar contas de anúncio e operar sem restrição.",
      precoAntigo: "R$ 49,00",
      preco: "30",
      precoInfo: "por unidade",
      estoque: "156 em estoque",
      items: [
        "Conta Gmail Brasil",
        "Telefone verificado",
        "IP residencial de criação",
        <><strong>Aquecimento realizado</strong> antes da entrega</>,
        "Sem restrição no primeiro login",
      ],
      cta: "Comprar agora",
      destaque: false,
    },
    {
      tag: "Mais vendido",
      titulo: "Conta Google Ads Verificada",
      link: "https://pay.imperiumpay.com.br/c/Dyf9LDeGwZdCzIQh",
      desc: "Conta pronta pra rodar campanha com verificação de anunciante e aquecimento.",
      precoAntigo: "R$ 299,00",
      preco: "200",
      precoInfo: "único",
      estoque: "38 em estoque",
      items: [
        <><strong>✅ Verificação de Anunciante</strong> Completa</>,
        <><strong>✅ Aquecimento de Conta 🔥</strong></>,
        "Conta Google Ads Brasil",
        "Cartão vinculado + faturamento configurado",
        "Suporte pós-venda de 7 dias",
      ],
      cta: "Comprar agora",
      destaque: true,
    },
    {
      tag: "Completa",
      titulo: "Conta Google Ads Completa",
      link: "https://pay.imperiumpay.com.br/c/TzKeAI0RDXGSDNrc",
      desc: "Estrutura completa pra rodar em nicho sensível sem cair na primeira análise.",
      precoAntigo: "R$ 699,00",
      preco: "500",
      precoInfo: "único",
      estoque: "12 em estoque",
      items: [
        <><strong>✅ Verificação de Anunciante</strong> Completa</>,
        <><strong>✅ Verificação G2 Bancária</strong> — totalmente autêntica</>,
        <><strong>✅ Serviços Financeiros</strong> com documentação verificada</>,
        <><strong>✅ Pronta para gastos</strong> — sem limitações</>,
        <><strong>✅ Aquecimento garantido 🔥</strong></>,
        "Suporte pós-venda de 15 dias",
      ],
      cta: "Comprar agora",
      destaque: false,
    },
      {
      tag: "Recuperacao",
      titulo: "Recuperacao de Conta Suspensa",
      link: "https://pay.imperiumpay.com.br/c/ze4ukA4XfW9UDXAg",
      desc: "Sua conta Google Ads foi suspensa? A gente tenta trazer de volta e voce so paga se reativar.",
      precoAntigo: "R$ 350,00",
      preco: "200",
      precoInfo: "so paga se reativar",
      estoque: "Disponivel agora",
      items: [
        <><strong>✅ Sem risco</strong> — pagamento so apos a reativacao</>,
        <><strong>✅ Analise gratuita</strong> do motivo da suspensao</>,
        <><strong>✅ Recurso completo</strong> feito por especialistas</>,
        <><strong>✅ Contato direto com Google</strong> quando necessario</>,
        "Prazo medio: 3 a 7 dias uteis",
        "Nao reativou = nao paga nada",
      ],
      cta: "Recuperar minha conta",
      destaque: false,
      badge: "SEM RISCO",
    },
  ];
  return (
    <section className="catalogo" id="catalogo">
      <div className="container">
        <div className="catalogo-titulo">
          <div className="section-eyebrow">Catálogo</div>
          <h2 className="section-titulo">Ativos e servicos para Google Ads.</h2>
          <p className="section-sub">Preco na tela, estoque real. Se ta listado, ta disponivel — pra entrega imediata ou recuperacao de contas.</p>
        </div>
        <div className="catalogo-grid">
          {ativos.map((a) => (
            <div className={`ativo ${a.destaque ? 'destaque' : ''}`} key={a.titulo} style={{ position: 'relative' }}>
              {a.badge && <div className="ativo-badge-recuperacao">{a.badge}</div>}
              <div className="ativo-tag">{a.tag}</div>
              <h3>{a.titulo}</h3>
              <div className="ativo-desc">{a.desc}</div>
              <div className="ativo-preco-box">
                <div className="ativo-preco">
                  <span className="ativo-preco-antigo">{a.precoAntigo}</span>
                  <strong>R$ {a.preco}</strong>
                </div>
                <div className="ativo-preco-info">Pagamento {a.precoInfo}</div>
                <div className="ativo-estoque">{a.estoque}</div>
              </div>
              <ul>
                {a.items.map((item, i) => (
                  <li key={i}>
                    <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a href={a.link} target="_blank" rel="noopener noreferrer" className="ativo-cta">{a.cta}</a>
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
          <div className="stat"><div className="stat-num"><span>3.2k+</span></div><div className="stat-label">Ativos entregues</div></div>
          <div className="stat"><div className="stat-num"><span>98%</span></div><div className="stat-label">Ativos aprovados no primeiro uso</div></div>
          <div className="stat"><div className="stat-num"><span>{"<"}5min</span></div><div className="stat-label">Tempo médio de entrega</div></div>
          <div className="stat"><div className="stat-num"><span>24/7</span></div><div className="stat-label">Chat de pedidos disponível</div></div>
        </div>
      </div>
    </section>
  );
}

function Depoimentos() {
  const deps = [
    { texto: "Comprei o combo e já subi campanha no mesmo dia. Ativo entregue em 3 minutos, tudo funcionando na primeira. Melhor que 90% dos fornecedores que testei.", nome: "Juliano Marques", cargo: "Player · E-commerce" },
    { texto: "Comprei 5 contas já e não tive nenhum problema. Preço justo, ativo bom, suporte responde na hora. Passei a comprar só aqui pra escala.", nome: "Renata Souza", cargo: "Media Buyer · Info" },
    { texto: "Fugir do PV foi o melhor. Preço na tela, checkout no site, ativo no chat. Do jeito que operação de verdade tem que ser.", nome: "Lucas Pereira", cargo: "Gestor · Agência" },
  ];
  return (
    <section className="depoimentos">
      <div className="container">
        <div className="depoimentos-titulo">
          <div className="section-eyebrow">Depoimentos</div>
          <h2 className="section-titulo">Player que já escala com a gente.</h2>
          <p className="section-sub">Ativos testados na prática por quem opera todo dia.</p>
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
    { q: "Em quanto tempo recebo o ativo?", a: "Entrega imediata, geralmente em menos de 5 minutos após a confirmação do pagamento. Se demorar mais que isso, chama no chat do pedido que resolvemos na hora." },
    { q: "Os ativos vêm testados mesmo?", a: "Sim. Cada conta passa por verificação antes de entrar no estoque: login, aquecimento, histórico de navegação, telefone verificado. Você não recebe ativo cru." },
    { q: "E se der problema no ativo?", a: "Você tem período de garantia pós-venda (7 a 15 dias dependendo do produto). Nesse período, se o ativo cair, damos substituição gratuita. Só mandar print no chat do pedido." },
    { q: "Como faço o pagamento?", a: "Pix ou cartão de crédito, direto no site. Sem sair da página, sem chamar no PV, sem burocracia. Assim que aprovado, entrega automática no chat." },
    { q: "Vocês vendem ativo pra outras plataformas?", a: "Focamos em Google Ads. Se precisar de outras plataformas, chama no WhatsApp que a gente indica parceiros de confiança." },
    { q: "Tem desconto pra compra em volume?", a: "Sim. Se você compra 5+ ativos por mês, entra em contato pelo WhatsApp que fazemos condição especial. Pra players em escala, temos combos exclusivos." },
  ];
  return (
    <section id="faq">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-eyebrow">FAQ</div>
          <h2 className="section-titulo" style={{ marginLeft: 'auto', marginRight: 'auto' }}>Dúvidas frequentes</h2>
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
        <h2>Sua próxima <span className="grad">campanha</span> começa agora.</h2>
        <p>Ativo testado, preço na tela e entrega no chat em minutos. Escolheu, pagou, subiu campanha.</p>
        <div className="cta-actions">
          <a href="https://wa.me/5516988297943?text=Ol%C3%A1%2C%20vim%20do%20site%20e%20quero%20comprar%20um%20ativo" target="_blank" rel="noopener" className="btn-primary">
            Falar no WhatsApp
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#catalogo" className="btn-secondary">Ver catálogo</a>
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
            <Logo />
            <p className="footer-desc">Ativos para operações de tráfego pago no Google Ads. Pagou no site, recebeu no chat.</p>
          </div>
          <div>
            <h4>Catálogo</h4>
            <ul>
              <li><a href="#catalogo">Contas Google Ads</a></li>
              <li><a href="#catalogo">Gmails</a></li>
              <li><a href="#catalogo">Combos</a></li>
            </ul>
          </div>
          <div>
            <h4>Empresa</h4>
            <ul>
              <li><a href="#beneficios">Benefícios</a></li>
              <li><a href="#como-funciona">Como funciona</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4>Contato</h4>
            <ul>
              <li>contato@gativos.com.br</li>
              <li>Chat 24/7 no pedido</li>
            </ul>
          </div>
        </div>
        <div className="footer-baixo">
          <div>© 2026 G Ativos · Ativos para tráfego pago</div>
          <div>Operação ética · Suporte humano</div>
        </div>
      </div>
    </footer>
  );
}
