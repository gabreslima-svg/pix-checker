"use client";

import { useState } from "react";

const WHATSAPP = "5516988297943";
const MENSAGEM = "Ola%2C%20vim%20do%20site%20e%20quero%20testar%20a%20YouFlix%20por%2012h%20gratis";
const LINK_WHATSAPP = `https://wa.me/${WHATSAPP}?text=${MENSAGEM}`;

export default function YouFlixLanding() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');
        :root {
          --bg: #000000;
          --bg-2: #0a0a0a;
          --bg-3: #141414;
          --roxo: #C70102;
          --roxo-claro: #FF3B3B;
          --roxo-glow: rgba(199, 1, 2, 0.25);
          --vermelho: #C70102;
          --vermelho-claro: #E01820;
          --dourado: #F59E0B;
          --branco: #FFFFFF;
          --cinza-1: #A3A3A3;
          --cinza-2: #737373;
          --cinza-borda: #262626;
          --verde: #10B981;
          --sans: 'Inter', system-ui, sans-serif;
          --serif: 'Instrument Serif', Georgia, serif;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: var(--sans); color: var(--branco); background: var(--bg); -webkit-font-smoothing: antialiased; line-height: 1.5; overflow-x: hidden; }
        a { color: inherit; text-decoration: none; }
        button { cursor: pointer; font-family: inherit; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* NAV */
        .nav { position: sticky; top: 0; z-index: 100; background: #000000; backdrop-filter: blur(12px); border-bottom: 1px solid var(--cinza-borda); }
        .nav-inner { display: flex; justify-content: space-between; align-items: center; height: 72px; }
        .logo { display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 900; letter-spacing: -0.03em; }
        .logo-you { color: var(--branco); }
        .logo-flix { background: linear-gradient(135deg, var(--vermelho) 0%, var(--roxo) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .badge-oficial { font-size: 10px; padding: 3px 8px; background: rgba(16,185,129,0.15); color: var(--verde); border-radius: 4px; font-weight: 600; margin-left: 8px; letter-spacing: 0.05em; }
        .nav-links { display: flex; gap: 28px; font-size: 14px; color: var(--cinza-1); font-weight: 500; }
        .nav-links a:hover { color: var(--branco); }
        .nav-cta { background: linear-gradient(135deg, var(--vermelho), var(--roxo)); color: var(--branco); padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 20px rgba(199,1,2,0.3); }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(199,1,2,0.4); }
        @media (max-width: 768px) { .nav-links { display: none; } }

        /* HERO */
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%);
          pointer-events: none;
          z-index: 0;
        }
        .hero .container { position: relative; z-index: 5; }
        .hero::after { display: none; }
        .hero-inner { display: block; max-width: 720px; margin: 0 auto; position: relative; z-index: 1; text-align: center; }
        .hero {
          padding: 80px 0 0;
          position: relative;
          overflow: hidden;
          background-color: #000000;
          background-image: url('/youflix-heropc.jpg');
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
        }
        
        
        
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 16px; border: 1px solid rgba(245,158,11,0.3);
          background: rgba(245,158,11,0.1); border-radius: 999px;
          font-size: 12px; color: var(--dourado); margin-bottom: 24px; font-weight: 500;
        }
        .hero-badge::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: var(--dourado); box-shadow: 0 0 8px var(--dourado);
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .hero h1 {
          font-size: clamp(40px, 5vw, 66px);
          font-weight: 800; line-height: 1.02;
          letter-spacing: -0.04em; margin-bottom: 24px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.8);
        }
        .hero h1 .strike { color: var(--cinza-2); text-decoration: line-through; text-decoration-thickness: 4px; text-decoration-color: var(--vermelho); }
        .hero h1 .grad {
          background: linear-gradient(135deg, var(--vermelho) 0%, var(--roxo) 50%, var(--roxo-claro) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-sub {
          font-size: 18px; color: #E5E5E5;
          margin: 0 auto 32px; line-height: 1.55; max-width: 520px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.7);
        }
        .hero-sub strong { color: var(--branco); }
        
        
        
        
        

        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px; justify-content: center; }
        .btn-primary {
          background: linear-gradient(135deg, var(--vermelho), var(--roxo));
          color: var(--branco); padding: 16px 28px; border-radius: 10px;
          font-size: 15px; font-weight: 700; transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 10px; border: none;
          box-shadow: 0 8px 25px rgba(199,1,2,0.35);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(199,1,2,0.5); }
        .btn-primary svg { transition: transform 0.15s; }
        .btn-primary:hover svg { transform: translateX(4px); }
        .btn-secondary {
          background: var(--bg-2); color: var(--branco);
          padding: 16px 24px; border-radius: 10px; font-size: 15px;
          font-weight: 600; border: 1px solid var(--cinza-borda); transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-secondary:hover { border-color: var(--roxo); background: var(--bg-3); }

        .garantia { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--cinza-1); }
        .garantia strong { color: var(--verde); }

        /* MOCKUP TV NO HERO */
        .mockup { position: relative; perspective: 1200px; }
        .mockup-tv {
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
          border-radius: 20px; padding: 20px 16px; box-shadow: 0 25px 60px rgba(199,1,2,0.35), 0 0 0 1px rgba(199,1,2,0.15);
          transform: rotateY(-8deg) rotateX(4deg);
          position: relative;
        }
        .mockup-tv::before {
          content: ''; position: absolute; inset: 12px; border-radius: 14px;
          background: linear-gradient(180deg, rgba(255,255,255,0.03), transparent);
          pointer-events: none;
        }
        .mockup-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 16px; padding: 0 4px;
        }
        .mockup-titulo { font-size: 14px; font-weight: 700; }
        .mockup-tabs { display: flex; gap: 4px; }
        .mockup-tab { font-size: 9px; color: var(--cinza-1); padding: 3px 8px; border-radius: 4px; }
        .mockup-tab.ativa { background: var(--roxo); color: var(--branco); }
        .mockup-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .mockup-card {
          aspect-ratio: 2/3; border-radius: 6px; position: relative;
          background: linear-gradient(135deg, var(--roxo), var(--vermelho));
          overflow: hidden;
          animation: shimmer 3s ease-in-out infinite;
        }
        .mockup-card:nth-child(1) { background: linear-gradient(135deg, #C70102, #FF3B3B); animation-delay: 0s; }
        .mockup-card:nth-child(2) { background: linear-gradient(135deg, #C70102, #FF6B00); animation-delay: 0.3s; }
        .mockup-card:nth-child(3) { background: linear-gradient(135deg, #C70102, #FF3B3B); animation-delay: 0.6s; }
        .mockup-card:nth-child(4) { background: linear-gradient(135deg, #C70102, #E01820); animation-delay: 0.9s; }
        .mockup-card:nth-child(5) { background: linear-gradient(135deg, #FF6B00, #C70102); animation-delay: 1.2s; }
        .mockup-card:nth-child(6) { background: linear-gradient(135deg, #C70102, #FF3B3B); animation-delay: 1.5s; }
        .mockup-card:nth-child(7) { background: linear-gradient(135deg, #E01820, #C70102); animation-delay: 1.8s; }
        .mockup-card:nth-child(8) { background: linear-gradient(135deg, #FF6B00, #C70102); animation-delay: 2.1s; }
        @keyframes shimmer {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        .mockup-card::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%);
        }
        .mockup-live {
          position: absolute; top: 6px; left: 6px;
          background: var(--vermelho); color: var(--branco);
          font-size: 8px; font-weight: 700; padding: 2px 5px;
          border-radius: 3px; letter-spacing: 0.05em; z-index: 1;
          display: flex; align-items: center; gap: 3px;
        }
        .mockup-live::before {
          content: ''; width: 4px; height: 4px; background: white; border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
        .mockup-img {
          width: 100%;
          height: auto;
          border-radius: 20px;
          box-shadow: 0 25px 60px rgba(199,1,2,0.35), 0 0 0 1px rgba(199,1,2,0.2);
          display: block;
          transform: rotateY(-8deg) rotateX(4deg);
          transition: transform 0.4s;
        }
        .mockup-img:hover {
          transform: rotateY(-4deg) rotateX(2deg) scale(1.02);
        }
        
        
        
        
        
        
        
        .preco-card {
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
          padding: 14px 22px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .preco-label {
          font-size: 12px;
          color: var(--cinza-1);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-right: 4px;
        }
        .preco-valor {
          font-size: 32px;
          font-weight: 800;
          color: var(--branco);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .preco-valor .cents {
          font-size: 18px;
          color: var(--cinza-1);
          font-weight: 600;
          margin-left: -2px;
        }
        .preco-mes {
          font-size: 14px;
          color: var(--cinza-1);
          font-weight: 500;
        }
        

        /* ============ FAIXA DE DISPOSITIVOS NO HERO ============ */
        .hero-dispositivos {
          margin: 60px -20px 0;
          padding: 14px 20px;
          background: rgba(0,0,0,0.35);
          border-top: 1px solid rgba(255,255,255,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          position: relative;
          z-index: 1;
        }
        .hero-disp-titulo {
          display: none;
        }
        .hero-disp-lista {
          display: flex;
          gap: 28px;
          justify-content: center;
          flex-wrap: nowrap;
          align-items: center;
          margin-bottom: 8px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .hero-disp-lista::-webkit-scrollbar { display: none; }
        .hero-disp-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          color: var(--branco);
          flex-shrink: 0;
        }
        .hero-disp-item:hover {
          transform: translateY(-2px);
        }
        .hero-disp-item svg {
          opacity: 0.85;
        }
        .hero-disp-item span {
          font-size: 11px;
          font-weight: 500;
          color: var(--cinza-1);
          letter-spacing: 0.02em;
        }
        .hero-disp-marcas {
          font-size: 10px;
          color: var(--cinza-2);
          text-align: center;
          font-weight: 400;
          letter-spacing: 0.02em;
          border-top: none;
          padding-top: 0;
          margin-top: 4px;
          opacity: 0.7;
        }
        @media (max-width: 600px) {
          .hero-dispositivos { padding: 10px 12px; margin-top: 200px; }
          .hero-disp-lista { gap: 18px; margin-bottom: 4px; }
          .hero-disp-item span { font-size: 10px; }
          .hero-disp-marcas { font-size: 9px; }
        }

        @media (max-width: 900px) {
          .hero-inner { text-align: center; margin: 0 auto; }
          .hero-sub { margin: 0 auto 32px; }
          .hero-actions { justify-content: center; }
          .hero-inner { grid-template-columns: 1fr; }
          .mockup { display: none; }
          .hero {
            background-image: url('/youflix-fundo.jpg');
            background-size: cover;
            background-position: center 40%;
            background-repeat: no-repeat;
            position: relative;
            min-height: 100vh;
            padding: 60px 0 80px;
            display: flex;
            align-items: flex-start;
          }
          .hero::before {
            display: block !important;
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.73) 30%, rgba(0,0,0,0.68) 55%, rgba(0,0,0,0.83) 80%, rgba(0,0,0,1) 100%);
            pointer-events: none;
            z-index: 0;
          }
          .hero .container {
            position: relative;
            z-index: 1;
            width: 100%;
          }
          .hero h1, .hero-sub, .hero-badge {
            text-shadow: 0 2px 20px rgba(0,0,0,0.9);
          }
        }

        /* SECOES */
        section { padding: 100px 0; position: relative; }
        .section-eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--roxo-claro); font-weight: 600; margin-bottom: 16px; }
        .section-titulo { font-size: clamp(34px, 4.5vw, 52px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 24px; max-width: 720px; }
        .section-titulo em { font-style: italic; font-family: var(--serif); font-weight: 400; background: linear-gradient(135deg, var(--vermelho), var(--roxo)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .section-sub { font-size: 18px; color: var(--cinza-1); max-width: 620px; margin-bottom: 56px; line-height: 1.55; }

        /* CONTEUDO */
        .conteudo { background: var(--bg-2); border-top: 1px solid var(--cinza-borda); border-bottom: 1px solid var(--cinza-borda); }
        .conteudo-header { text-align: center; margin-bottom: 64px; }
        .conteudo-header .section-titulo, .conteudo-header .section-sub { margin-left: auto; margin-right: auto; }
        .categorias { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .categoria {
          padding: 32px 24px; background: var(--bg-3);
          border: 1px solid var(--cinza-borda); border-radius: 16px;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .categoria::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--vermelho), var(--roxo));
          opacity: 0; transition: opacity 0.3s;
        }
        .categoria:hover { transform: translateY(-4px); border-color: var(--roxo); }
        .categoria:hover::before { opacity: 1; }
        .categoria-icone {
          width: 48px; height: 48px; border-radius: 12px;
          background: linear-gradient(135deg, rgba(199,1,2,0.2), rgba(199,1,2,0.2));
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px; color: var(--roxo-claro);
        }
        .categoria h3 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .categoria-num { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, var(--vermelho), var(--roxo)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px; }
        .categoria p { font-size: 13px; color: var(--cinza-1); line-height: 1.5; }
        @media (max-width: 768px) { .categorias { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .categorias { grid-template-columns: 1fr; } }

        /* DISPOSITIVOS */
        .dispositivos-header { text-align: center; margin-bottom: 60px; }
        .dispositivos-header .section-titulo, .dispositivos-header .section-sub { margin-left: auto; margin-right: auto; }
        .dispositivos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .dispositivo {
          padding: 40px 20px; background: var(--bg-2);
          border: 1px solid var(--cinza-borda); border-radius: 16px;
          text-align: center; transition: all 0.3s;
        }
        .dispositivo:hover { border-color: var(--roxo); transform: translateY(-4px); background: var(--bg-3); }
        .dispositivo-icone { width: 56px; height: 56px; margin: 0 auto 16px; color: var(--roxo-claro); display: flex; align-items: center; justify-content: center; }
        .dispositivo h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .dispositivo p { font-size: 12px; color: var(--cinza-1); }
        @media (max-width: 640px) { .dispositivos-grid { grid-template-columns: 1fr 1fr; } }

        /* COMO FUNCIONA */
        .como-funciona-wrap { background: var(--bg-2); border-top: 1px solid var(--cinza-borda); border-bottom: 1px solid var(--cinza-borda); }
        .cf-header { text-align: center; margin-bottom: 60px; }
        .cf-header .section-titulo, .cf-header .section-sub { margin-left: auto; margin-right: auto; }
        .passos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .passo {
          padding: 32px 28px; background: var(--bg-3);
          border: 1px solid var(--cinza-borda); border-radius: 16px;
          transition: all 0.3s;
        }
        .passo:hover { border-color: var(--roxo); }
        .passo-num {
          display: inline-block; font-size: 12px; font-weight: 700;
          padding: 4px 12px; border-radius: 999px;
          background: linear-gradient(135deg, var(--vermelho), var(--roxo));
          color: var(--branco); margin-bottom: 20px; letter-spacing: 0.05em;
        }
        .passo h3 { font-size: 20px; font-weight: 700; margin-bottom: 10px; letter-spacing: -0.02em; }
        .passo p { font-size: 14px; color: var(--cinza-1); line-height: 1.55; }
        @media (max-width: 768px) { .passos { grid-template-columns: 1fr; } }

        /* OFERTA */
        .oferta-wrap { padding: 100px 0; text-align: center; position: relative; overflow: hidden; }
        .oferta-wrap::before { display: none; }
        .oferta-card {
          background: linear-gradient(180deg, var(--bg-2) 0%, var(--bg-3) 100%);
          border: 1px solid rgba(199,1,2,0.3);
          border-radius: 24px; padding: 60px 40px; max-width: 620px;
          margin: 0 auto; position: relative; overflow: hidden;
          box-shadow: 0 25px 60px rgba(199,1,2,0.2);
        }
        .oferta-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, var(--vermelho), var(--roxo));
        }
        .oferta-tag {
          display: inline-block; padding: 6px 14px;
          background: rgba(245,158,11,0.15); color: var(--dourado);
          border-radius: 999px; font-size: 12px; font-weight: 600;
          letter-spacing: 0.05em; margin-bottom: 20px;
        }
        .oferta-card h2 { font-size: clamp(28px, 4vw, 40px); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 12px; line-height: 1.1; }
        .oferta-card p { font-size: 16px; color: var(--cinza-1); margin-bottom: 32px; max-width: 460px; margin-left: auto; margin-right: auto; line-height: 1.55; }
        .oferta-preco { display: flex; align-items: baseline; justify-content: center; gap: 8px; margin-bottom: 12px; }
        .oferta-preco-simbolo { font-size: 24px; color: var(--cinza-1); font-weight: 600; margin-top: 12px; }
        .oferta-preco-valor { font-size: 80px; font-weight: 900; letter-spacing: -0.05em; line-height: 1; background: linear-gradient(135deg, var(--vermelho), var(--roxo)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .oferta-preco-cents { font-size: 40px; font-weight: 800; color: var(--branco); margin-top: 16px; }
        .oferta-periodo { font-size: 14px; color: var(--cinza-1); margin-bottom: 32px; }
        .oferta-cta { padding: 18px 40px; font-size: 16px; }
        .oferta-garantia { margin-top: 24px; font-size: 13px; color: var(--cinza-1); display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
        .oferta-garantia strong { color: var(--verde); }

        /* FAQ */
        .faq-wrap { max-width: 800px; margin: 0 auto; }
        .faq-header { text-align: center; margin-bottom: 48px; }
        .faq-header .section-titulo, .faq-header .section-sub { margin-left: auto; margin-right: auto; }
        .faq-item { border: 1px solid var(--cinza-borda); border-radius: 12px; margin-bottom: 12px; background: var(--bg-2); transition: border 0.2s; }
        .faq-item.aberto { border-color: var(--roxo); }
        .faq-pergunta { width: 100%; background: none; border: none; padding: 20px 24px; text-align: left; font-size: 16px; font-weight: 600; color: var(--branco); display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .faq-icon { flex-shrink: 0; transition: transform 0.2s; color: var(--roxo-claro); }
        .faq-item.aberto .faq-icon { transform: rotate(45deg); }
        .faq-resposta { max-height: 0; overflow: hidden; transition: max-height 0.3s, padding 0.3s; font-size: 14px; color: var(--cinza-1); line-height: 1.6; padding: 0 24px; }
        .faq-item.aberto .faq-resposta { max-height: 500px; padding: 0 24px 24px; }

        /* FOOTER */
        footer { padding: 60px 0 40px; border-top: 1px solid var(--cinza-borda); background: var(--bg); }
        .footer-inner { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .footer-brand { max-width: 360px; }
        .footer-desc { color: var(--cinza-1); font-size: 13px; margin-top: 16px; line-height: 1.55; }
        .footer h4 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--cinza-1); margin-bottom: 16px; font-weight: 600; }
        .footer ul { list-style: none; }
        .footer li { margin-bottom: 8px; font-size: 14px; color: var(--branco); }
        .footer li a:hover { color: var(--roxo-claro); }
        .footer-baixo { padding-top: 32px; border-top: 1px solid var(--cinza-borda); display: flex; justify-content: space-between; font-size: 12px; color: var(--cinza-1); flex-wrap: wrap; gap: 12px; }
        @media (max-width: 768px) { .footer-inner { grid-template-columns: 1fr; gap: 32px; } }

        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      <Nav />
      <Hero />
      <Conteudo />
      <ComoFunciona />
      <Oferta />
      <Faq />
      <Footer />
    </>
  );
}

function Nav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <a href="#" className="logo">
          <img src="/youflix-logo.png" alt="YouFlix" style={{ height: 40, width: 'auto' }} />
          
        </a>
        <div className="nav-links">
          <a href="#conteudo">Conteudo</a>
          <a href="#oferta">Assinar</a>
          <a href="#faq">FAQ</a>
        </div>
        <a href={LINK_WHATSAPP} target="_blank" rel="noopener noreferrer" className="nav-cta">Assinar</a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div>
            <h1>Filmes, séries e esportes.<br /><span className="grad">Sem limites.</span></h1>
            <p className="hero-sub">Assista onde e quando quiser. Cancele quando quiser.</p>
            <div className="preco-card">
              <span className="preco-label">A partir de</span>
              <span className="preco-valor">R$ 29<span className="cents">,90</span></span>
              <span className="preco-mes">/mês</span>
            </div>
            <div className="hero-actions">
              <a href={LINK_WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Testar grátis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#conteudo" className="btn-secondary">Explorar</a>
            </div>

            <div className="hero-dispositivos">
              <div className="hero-disp-titulo">Assista em qualquer tela</div>
              <div className="hero-disp-lista">
                <div className="hero-disp-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="14" rx="2"/>
                    <path d="M8 21h8M12 18v3"/>
                  </svg>
                  <span>Smart TV</span>
                </div>
                <div className="hero-disp-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="8" width="18" height="10" rx="2"/>
                    <circle cx="8" cy="13" r="1" fill="currentColor"/>
                    <path d="M12 13h5"/>
                  </svg>
                  <span>TV Box</span>
                </div>
                <div className="hero-disp-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="2" width="12" height="20" rx="2"/>
                    <path d="M11 18h2"/>
                  </svg>
                  <span>Celular</span>
                </div>
                <div className="hero-disp-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="3" width="16" height="18" rx="2"/>
                    <path d="M11 18h2"/>
                  </svg>
                  <span>Tablet</span>
                </div>
                <div className="hero-disp-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="12" rx="2"/>
                    <path d="M2 20h20"/>
                  </svg>
                  <span>PC</span>
                </div>
              </div>
              <div className="hero-disp-marcas">Samsung · LG · Roku · TCL · Fire Stick · Android · iOS · Windows · Mac</div>
            </div>
            
          </div>

          </div>
      </div>
    </section>
  );
}

function Conteudo() {
  const categorias = [
    {
      icone: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="15" rx="2"/>
          <path d="M8 22h8M12 19v3"/>
          <path d="M7 8h10M7 12h10M7 16h6"/>
        </svg>
      ),
      num: "500+",
      titulo: "Canais ao vivo",
      desc: "Canais abertos e fechados, esportes ao vivo, notícias"
    },
    {
      icone: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M2 8h20M6 4v4M10 4v4M14 4v4M18 4v4"/>
          <path d="M2 16h20M6 20v-4M10 20v-4M14 20v-4M18 20v-4"/>
        </svg>
      ),
      num: "30 mil+",
      titulo: "Filmes",
      desc: "Lançamentos e clássicos em HD e 4K"
    },
    {
      icone: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 3v18"/>
          <circle cx="15" cy="15" r="1.5" fill="currentColor"/>
        </svg>
      ),
      num: "10 mil+",
      titulo: "Séries",
      desc: "Temporadas completas, dublado e legendado"
    },
    {
      icone: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15 15 0 0 1 0 20"/>
          <path d="M12 2a15 15 0 0 0 0 20"/>
          <path d="M2 12h20"/>
        </svg>
      ),
      num: "24/7",
      titulo: "Esportes",
      desc: "Futebol, UFC, NBA, Fórmula 1 ao vivo"
    },
  ];
  return (
    <section className="conteudo" id="conteudo">
      <div className="container">
        <div className="conteudo-header">
          <div className="section-eyebrow">O que voce recebe</div>
          <h2 className="section-titulo">Tudo o que você quer assistir.</h2>
          <p className="section-sub">Filmes, séries, ao vivo, esportes. Em qualidade HD e 4K.</p>
        </div>
        <div className="categorias">
          {categorias.map((c, i) => (
            <div className="categoria" key={i}>
              <div className="categoria-icone">{c.icone}</div>
              <div className="categoria-num">{c.num}</div>
              <h3>{c.titulo}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComoFunciona() {
  const passos = [
    { num: "PASSO 1", titulo: "Fale com a gente", desc: "Um clique no WhatsApp, sem cadastro." },
    { num: "PASSO 2", titulo: "Teste gratuito", desc: "12 horas de acesso completo, sem pagar." },
    { num: "PASSO 3", titulo: "Ative por R$ 29,90", desc: "Pagamento via Pix. Ativação imediata." },
  ];
  return (
    <section className="como-funciona-wrap">
      <div className="container">
        <div className="cf-header">
          <div className="section-eyebrow">Como funciona</div>
          <h2 className="section-titulo">Comece em 3 passos.</h2>
          <p className="section-sub">Do primeiro contato ao primeiro filme, em minutos.</p>
        </div>
        <div className="passos">
          {passos.map((p, i) => (
            <div className="passo" key={i}>
              <div className="passo-num">{p.num}</div>
              <h3>{p.titulo}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Oferta() {
  return (
    <section className="oferta-wrap" id="oferta">
      <div className="container">
        <div className="oferta-card">
          <div className="oferta-tag">Comece hoje</div>
          <h2>Assine em <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 400, background: "linear-gradient(135deg, var(--vermelho), var(--roxo))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>menos de 5 minutos.</em></h2>
          <p>Sem cartão. Sem cadastro.</p>
          <div className="oferta-preco">
            <span className="oferta-preco-simbolo">R$</span>
            <span className="oferta-preco-valor">29</span>
            <span className="oferta-preco-cents">,90</span>
          </div>
          <div className="oferta-periodo">por mes · pagamento via Pix</div>
          <a href={LINK_WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-primary oferta-cta">
            Começar no WhatsApp
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <div className="oferta-garantia"><span>Cancele quando quiser · Suporte humano · Teste 12h grátis</span></div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [aberto, setAberto] = useState<number | null>(0);
  const perguntas = [
    { q: "Como funciona o teste gratuito de 12h?", a: "Chame no WhatsApp e envie 'quero testar'. Você recebe as credenciais em minutos e assiste 12 horas sem pagar." },
    { q: "Preciso pagar antes de testar?", a: "Não. O teste é gratuito, sem cartão." },
    { q: "Quantos dispositivos posso usar ao mesmo tempo?", a: "Até 3 dispositivos ao mesmo tempo na mesma assinatura." },
    { q: "O YouFlix funciona em Smart TV?", a: "Sim. Funciona em qualquer Smart TV recente (Samsung, LG, Sony, TCL, Roku), TV Box (Android TV, Fire Stick, Mi Box), celular, tablet e PC." },
    { q: "E se eu tiver problema?", a: "Suporte via WhatsApp em horario comercial. Nossa equipe ajuda desde a instalacao ate qualquer problema tecnico. Sem robo, resposta humana." },
    { q: "Tem fidelidade?", a: "Nao. Voce paga mes a mes, sem contrato ou multa. Se em algum momento quiser cancelar, e so parar de pagar." },
    { q: "O conteudo e legalizado?", a: "Somos credenciada oficial autorizada. Todo conteudo passa por licenciamento adequado." },
    { q: "Como e feito o pagamento?", a: "Via Pix. Voce paga R$ 29,90 no primeiro dia do mes e a assinatura fica ativa por 30 dias." },
  ];
  return (
    <section id="faq">
      <div className="container">
        <div className="faq-wrap">
          <div className="faq-header">
            <div className="section-eyebrow">FAQ</div>
            <h2 className="section-titulo">Duvidas <em>frequentes</em></h2>
          </div>
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

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="#" className="logo"><img src="/youflix-logo.png" alt="YouFlix" style={{ height: 40, width: "auto" }} /></a>
            <p className="footer-desc">Netflix, Prime, Globoplay, esportes e canais fechados em um so app por R$ 29,90/mes.</p>
          </div>
          <div>
            <h4>Navegacao</h4>
            <ul>
              <li><a href="#conteudo">Conteudo</a></li>
              <li><a href="#dispositivos">Dispositivos</a></li>
              <li><a href="#oferta">Assinar</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4>Contato</h4>
            <ul>
              <li><a href={LINK_WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li>Atendimento diario</li>
            </ul>
          </div>
        </div>
        <div className="footer-baixo">
          <div>© 2026 YouFlix · </div>
          <div>Sem fidelidade · Cancele quando quiser</div>
        </div>
      </div>
    </footer>
  );
}
