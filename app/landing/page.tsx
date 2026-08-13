"use client";

import { useEffect, useState, useRef } from "react";

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        :root {
          --azul: #0052FF; --azul-escuro: #001233; --azul-profundo: #000B1F;
          --azul-hover: #0040CC; --branco: #FFFFFF; --off-white: #F8F9FC;
          --cinza-linha: #E4E7EF; --cinza-texto: #5A6379; --preto: #0A0E1A;
          --serif: 'Instrument Serif', Georgia, serif;
          --sans: 'Inter', system-ui, sans-serif;
          --mono: 'JetBrains Mono', monospace;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: var(--sans); color: var(--preto); background: var(--branco); -webkit-font-smoothing: antialiased; line-height: 1.5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--cinza-linha); }
        .nav-inner { display: flex; justify-content: space-between; align-items: center; height: 64px; }
        .logo { display: flex; align-items: center; gap: 8px; font-family: var(--serif); font-size: 24px; color: var(--preto); letter-spacing: -0.02em; }
        .logo-dot { width: 10px; height: 10px; background: var(--azul); border-radius: 50%; }
        .logo b { font-family: var(--sans); font-weight: 700; font-style: normal; font-size: 18px; letter-spacing: -0.02em; }
        .nav-cta { background: var(--azul); color: var(--branco); padding: 10px 20px; border-radius: 999px; font-size: 13px; font-weight: 600; text-decoration: none; transition: background 0.15s; }
        .nav-cta:hover { background: var(--azul-hover); }
        .hero { padding: 80px 0 100px; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: -200px; right: -200px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,82,255,0.08) 0%, transparent 70%); pointer-events: none; }
        .eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border: 1px solid var(--cinza-linha); border-radius: 999px; font-size: 12px; font-weight: 500; color: var(--cinza-texto); margin-bottom: 32px; background: var(--branco); }
        .eyebrow::before { content: ''; width: 6px; height: 6px; background: #10B981; border-radius: 50%; box-shadow: 0 0 0 3px rgba(16,185,129,0.15); animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .h1 { font-family: var(--serif); font-size: clamp(48px, 7vw, 88px); line-height: 0.98; letter-spacing: -0.03em; font-weight: 400; max-width: 900px; margin-bottom: 32px; }
        .h1 em { font-style: italic; color: var(--azul); }
        .h1 b { font-family: var(--sans); font-weight: 700; font-style: normal; }
        .hero-sub { font-size: 20px; line-height: 1.5; color: var(--cinza-texto); max-width: 620px; margin-bottom: 40px; }
        .hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 48px; }
        .btn-primary { background: var(--azul); color: var(--branco); padding: 16px 28px; border-radius: 999px; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.15s; border: none; cursor: pointer; }
        .btn-primary:hover { background: var(--azul-hover); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,82,255,0.25); }
        .btn-primary svg { transition: transform 0.15s; }
        .btn-primary:hover svg { transform: translateX(3px); }
        .btn-ghost { color: var(--preto); padding: 16px 8px; font-size: 15px; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
        .btn-ghost:hover { color: var(--azul); }
        .prova-social { display: flex; align-items: center; gap: 24px; font-size: 13px; color: var(--cinza-texto); }
        .avatares { display: flex; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--azul), var(--azul-escuro)); border: 2px solid var(--branco); margin-left: -8px; display: flex; align-items: center; justify-content: center; color: var(--branco); font-size: 11px; font-weight: 600; }
        .avatar:first-child { margin-left: 0; }
        .estrelas { color: #F59E0B; font-size: 14px; }
        .metricas-section { background: var(--azul-profundo); color: var(--branco); padding: 80px 0; position: relative; overflow: hidden; }
        .metricas-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 30%, rgba(0,82,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,82,255,0.1) 0%, transparent 50%); pointer-events: none; }
        .metricas-header { text-align: center; margin-bottom: 60px; position: relative; }
        .metricas-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--azul); margin-bottom: 16px; }
        .metricas-title { font-family: var(--serif); font-size: clamp(32px, 4vw, 48px); line-height: 1.1; font-weight: 400; max-width: 700px; margin: 0 auto; }
        .metricas-title em { font-style: italic; color: #6B9AFF; }
        .metricas-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; position: relative; }
        .metrica { background: var(--azul-profundo); padding: 40px 28px; text-align: left; }
        .metrica-numero { font-family: var(--mono); font-size: 44px; font-weight: 600; color: var(--branco); line-height: 1; margin-bottom: 12px; letter-spacing: -0.02em; }
        .metrica-numero span { font-size: 24px; color: #6B9AFF; }
        .metrica-label { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
        .metrica-desc { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.4; }
        section { padding: 100px 0; }
        .section-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--azul); margin-bottom: 20px; }
        .section-title { font-family: var(--serif); font-size: clamp(36px, 4.5vw, 56px); line-height: 1.05; letter-spacing: -0.02em; font-weight: 400; max-width: 700px; margin-bottom: 24px; }
        .section-title em { font-style: italic; color: var(--azul); }
        .section-sub { font-size: 18px; color: var(--cinza-texto); max-width: 620px; margin-bottom: 60px; }
        .como-funciona { background: var(--off-white); }
        .passos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .passo { background: var(--branco); border: 1px solid var(--cinza-linha); border-radius: 20px; padding: 40px 32px; transition: all 0.2s; }
        .passo:hover { border-color: var(--azul); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,82,255,0.08); }
        .passo-num { font-family: var(--mono); font-size: 14px; font-weight: 600; color: var(--azul); margin-bottom: 32px; display: flex; align-items: center; gap: 8px; }
        .passo-num::before { content: ''; width: 24px; height: 1px; background: var(--azul); }
        .passo-titulo { font-family: var(--serif); font-size: 28px; font-weight: 400; line-height: 1.15; margin-bottom: 16px; }
        .passo-desc { font-size: 15px; color: var(--cinza-texto); line-height: 1.6; }
        .para-quem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .quadro { border: 1px solid var(--cinza-linha); border-radius: 20px; padding: 40px; }
        .quadro.positivo { background: linear-gradient(180deg, rgba(0,82,255,0.03) 0%, transparent 100%); border-color: rgba(0,82,255,0.2); }
        .quadro-titulo { font-family: var(--serif); font-size: 24px; font-weight: 400; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        .quadro.positivo .quadro-titulo { color: var(--azul); }
        .quadro-lista { list-style: none; }
        .quadro-lista li { padding: 12px 0; border-bottom: 1px solid var(--cinza-linha); display: flex; align-items: flex-start; gap: 12px; font-size: 15px; color: var(--cinza-texto); }
        .quadro-lista li:last-child { border: none; }
        .quadro-lista li strong { color: var(--preto); font-weight: 600; }
        .marcador { margin-top: 2px; flex-shrink: 0; }
        .cases { background: var(--off-white); }
        .cases-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .case { background: var(--branco); border-radius: 20px; padding: 32px; border: 1px solid var(--cinza-linha); }
        .case-metrica { font-family: var(--mono); font-size: 40px; font-weight: 600; color: var(--azul); line-height: 1; margin-bottom: 8px; letter-spacing: -0.02em; }
        .case-desc { font-size: 13px; color: var(--cinza-texto); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500; margin-bottom: 24px; }
        .case-quote { font-family: var(--serif); font-size: 20px; line-height: 1.4; font-style: italic; color: var(--preto); margin-bottom: 20px; }
        .case-autor { display: flex; align-items: center; gap: 12px; padding-top: 20px; border-top: 1px solid var(--cinza-linha); }
        .case-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--azul), var(--azul-escuro)); display: flex; align-items: center; justify-content: center; color: var(--branco); font-weight: 600; font-size: 14px; }
        .case-info { flex: 1; }
        .case-nome { font-size: 14px; font-weight: 600; }
        .case-empresa { font-size: 12px; color: var(--cinza-texto); }
        .faq-lista { max-width: 800px; margin: 0 auto; }
        .faq-item { border-bottom: 1px solid var(--cinza-linha); }
        .faq-pergunta { width: 100%; background: none; border: none; padding: 24px 0; text-align: left; font-family: var(--sans); font-size: 18px; font-weight: 600; color: var(--preto); cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 24px; }
        .faq-pergunta:hover { color: var(--azul); }
        .faq-icon { flex-shrink: 0; transition: transform 0.2s; color: var(--azul); }
        .faq-item.aberto .faq-icon { transform: rotate(45deg); }
        .faq-resposta { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; font-size: 15px; color: var(--cinza-texto); line-height: 1.6; }
        .faq-item.aberto .faq-resposta { max-height: 300px; padding-bottom: 24px; }
        .cta-final { background: var(--azul); color: var(--branco); border-radius: 32px; padding: 80px 40px; text-align: center; margin: 40px auto 80px; max-width: 1152px; position: relative; overflow: hidden; }
        .cta-final::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 40%); }
        .cta-final > * { position: relative; z-index: 1; }
        .cta-final h2 { font-family: var(--serif); font-size: clamp(36px, 5vw, 60px); font-weight: 400; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 24px; max-width: 700px; margin-left: auto; margin-right: auto; }
        .cta-final h2 em { font-style: italic; }
        .cta-final p { font-size: 18px; opacity: 0.85; margin-bottom: 40px; max-width: 500px; margin-left: auto; margin-right: auto; }
        .cta-final .btn-primary { background: var(--branco); color: var(--azul); font-size: 16px; padding: 18px 36px; }
        .cta-final .btn-primary:hover { background: var(--off-white); box-shadow: 0 8px 30px rgba(0,0,0,0.2); }
        footer { padding: 40px 0; border-top: 1px solid var(--cinza-linha); font-size: 13px; color: var(--cinza-texto); }
        .footer-inner { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        @media (max-width: 768px) {
          .hero { padding: 48px 0 60px; }
          section { padding: 60px 0; }
          .metricas-section { padding: 60px 0; }
          .metricas-grid { grid-template-columns: repeat(2, 1fr); }
          .passos { grid-template-columns: 1fr; }
          .para-quem-grid { grid-template-columns: 1fr; }
          .cases-grid { grid-template-columns: 1fr; }
          .cta-final { padding: 60px 24px; margin: 20px 16px 60px; }
          .hero-actions { width: 100%; }
          .btn-primary { flex: 1; justify-content: center; }
        }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>
      <nav className="nav"><div className="container nav-inner"><a href="#" className="logo"><span className="logo-dot"></span>GA <b>ATIVOS</b></a><a href="#contato" className="nav-cta">Falar com especialista</a></div></nav>
      <section className="hero"><div className="container"><div className="eyebrow">Vagas abertas para maio · resposta em ate 24h</div><h1 className="h1">Trafego que <em>vende</em>. <br />Nao so clique <b>que enche relatorio.</b></h1><p className="hero-sub">Gestao de Google Ads focada em resultado real: leads qualificados, vendas rastreadas e ROI que aparece no extrato bancario — nao so no dashboard.</p><div className="hero-actions"><a href="#contato" className="btn-primary">Quero uma analise gratuita<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></a><a href="#como-funciona" className="btn-ghost">Como funciona →</a></div><div className="prova-social"><div className="avatares"><div className="avatar">JM</div><div className="avatar">RS</div><div className="avatar">LP</div><div className="avatar">FC</div></div><div><div className="estrelas">★★★★★</div><div>+120 empresas escalaram com a GA Ativos</div></div></div></div></section>
      <Metricas />
      <ComoFunciona />
      <ParaQuem />
      <Cases />
      <Faq />
      <CtaFinal />
      <footer><div className="container footer-inner"><div>© 2026 GA Ativos · Gestao de trafego pago</div><div>contato@gaativos.com.br</div></div></footer>
    </>
  );
}

function useContador(alvo, duracaoMs = 1800) {
  const [valor, setValor] = useState(0);
  const ref = useRef(null);
  const iniciado = useRef(false);
  useEffect(() => {
    if (iniciado.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !iniciado.current) {
        iniciado.current = true;
        const inicio = Date.now();
        const animar = () => {
          const passou = Date.now() - inicio;
          const progresso = Math.min(passou / duracaoMs, 1);
          const easeOut = 1 - Math.pow(1 - progresso, 3);
          setValor(Math.floor(alvo * easeOut));
          if (progresso < 1) requestAnimationFrame(animar);
        };
        animar();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [alvo, duracaoMs]);
  return { valor, ref };
}

function Metrica({ valor, sufixo, prefixo, label, desc }) {
  const { valor: contador, ref } = useContador(valor);
  return (
    <div className="metrica" ref={ref}>
      <div className="metrica-numero">{prefixo && <span>{prefixo}</span>}{contador.toLocaleString('pt-BR')}{sufixo && <span>{sufixo}</span>}</div>
      <div className="metrica-label">{label}</div>
      <div className="metrica-desc">{desc}</div>
    </div>
  );
}

function Metricas() {
  return (
    <section className="metricas-section"><div className="container"><div className="metricas-header"><div className="metricas-eyebrow">Numeros que operamos</div><h2 className="metricas-title">Do primeiro clique ao <em>caixa da empresa</em></h2></div><div className="metricas-grid">
      <Metrica valor={47} sufixo="M" prefixo="R$" label="Investidos" desc="Volume gerenciado nos ultimos 12 meses" />
      <Metrica valor={4} sufixo=".2x" label="ROAS medio" desc="Retorno medio dos clientes ativos" />
      <Metrica valor={120} sufixo="+" label="Empresas" desc="Clientes ativos escalando anuncios" />
      <Metrica valor={12} sufixo="d" label="Ramp-up" desc="Tempo medio pro primeiro resultado" />
    </div></div></section>
  );
}

function ComoFunciona() {
  const passos = [
    { num: "PASSO 01", titulo: "Auditoria da conta atual", desc: "Analisamos o que ta rodando hoje: onde esta queimando verba, campanhas mal estruturadas, palavras-chave sem intencao de compra. Entregamos um relatorio com plano de acao em ate 48h — sem cobrar nada." },
    { num: "PASSO 02", titulo: "Estrutura e implementacao", desc: "Montamos as campanhas do zero seguindo a estrategia validada. Tracking preciso via GTM, conversoes offline, integracao com CRM. Cada real gasto e rastreado ate virar cliente pagante." },
    { num: "PASSO 03", titulo: "Otimizacao continua", desc: "Semanalmente refinamos: cortamos o que nao performa, escalamos o que vende, testamos novos criativos. Voce recebe report semanal com numeros crus — sem enrolacao, sem metricas de vaidade." }
  ];
  return (
    <section className="como-funciona" id="como-funciona"><div className="container"><div className="section-eyebrow">Processo</div><h2 className="section-title">Como <em>trabalhamos</em></h2><p className="section-sub">Tres etapas, sem enrolacao. Do primeiro contato a primeira venda gerada em menos de 30 dias.</p><div className="passos">{passos.map((p, i) => (<div className="passo" key={i}><div className="passo-num">{p.num}</div><div className="passo-titulo">{p.titulo}</div><div className="passo-desc">{p.desc}</div></div>))}</div></div></section>
  );
}

function ParaQuem() {
  return (
    <section><div className="container"><div className="section-eyebrow">Fit de cliente</div><h2 className="section-title">Somos pra <em>quem?</em></h2><p className="section-sub">Trabalhamos com transparencia — inclusive sobre quando somos ou nao a escolha certa. Antes de investir em anuncios, veja se seu momento bate.</p><div className="para-quem-grid">
      <div className="quadro positivo"><div className="quadro-titulo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/><path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Vamos fazer barulho juntos se voce...</div><ul className="quadro-lista">
        <li><svg className="marcador" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" fill="#0052FF"/></svg><span><strong>Ja tem produto ou servico validado</strong>, com clientes pagantes recorrentes</span></li>
        <li><svg className="marcador" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" fill="#0052FF"/></svg><span><strong>Investe pelo menos R$ 5.000/mes</strong> em midia paga (nao e o nosso ticket, e o piso tecnico pro Google entregar dados)</span></li>
        <li><svg className="marcador" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" fill="#0052FF"/></svg><span><strong>Quer escalar com dados</strong>, nao com achismo — aceita testar e cortar rapido o que nao funciona</span></li>
        <li><svg className="marcador" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" fill="#0052FF"/></svg><span><strong>Estrutura de vendas responde bem</strong> — comercial atende leads, WhatsApp funciona, tem CRM basico</span></li>
      </ul></div>
      <div className="quadro"><div className="quadro-titulo" style={{ color: "#5A6379" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#E4E7EF"/><path d="M15 9L9 15M9 9L15 15" stroke="#5A6379" strokeWidth="2" strokeLinecap="round"/></svg>Nao somos a escolha certa se...</div><ul className="quadro-lista">
        <li><svg className="marcador" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" fill="#5A6379"/></svg><span>Espera <strong>resultado em 3-7 dias</strong> — Google Ads precisa de tempo pra otimizar (media 30-60 dias)</span></li>
        <li><svg className="marcador" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" fill="#5A6379"/></svg><span>Ainda esta <strong>validando produto</strong> ou nao fez vendas organicas — o anuncio amplifica o que funciona, nao cria demanda do zero</span></li>
        <li><svg className="marcador" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" fill="#5A6379"/></svg><span>Quer <strong>alguem que "so aperta botoes"</strong> — trabalhamos como socio da operacao, precisamos conversar sobre negocio</span></li>
        <li><svg className="marcador" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" fill="#5A6379"/></svg><span>Vende produto/servico <strong>ilegal ou de nicho proibido</strong> pelas politicas do Google (cassinos, apostas offshore, etc)</span></li>
      </ul></div>
    </div></div></section>
  );
}

function Cases() {
  const cases = [
    { metrica: "R$ 2.1M", desc: "Faturamento em 6 meses", quote: "Trocamos 3 agencias antes de encontrar a GA. Diferenca de mundo — primeira que trata anuncio como investimento, nao como despesa fixa.", nome: "Juliano Marques", empresa: "E-commerce · Moda" },
    { metrica: "487%", desc: "Crescimento em leads qualificados", quote: "Saimos de 40 leads/mes pra mais de 200, com custo por aquisicao menor. A auditoria inicial ja mostrou onde tava vazando dinheiro.", nome: "Renata Souza", empresa: "Odontologia · SP" },
    { metrica: "3.2 meses", desc: "Payback da operacao inteira", quote: "O que gastamos com anuncio + honorario voltou em 3 meses. Depois disso, virou maquina de aquisicao. Ja duplicamos o investimento duas vezes.", nome: "Lucas Pereira", empresa: "SaaS B2B" }
  ];
  return (
    <section className="cases"><div className="container"><div className="section-eyebrow">Cases reais</div><h2 className="section-title">Empresas que <em>escalaram</em> com a gente</h2><p className="section-sub">Nada de numeros inflados ou depoimentos genericos. Cada case abaixo e rastreavel — se quiser conferir, mostramos o dashboard.</p><div className="cases-grid">{cases.map((c, i) => (
      <div className="case" key={i}><div className="case-metrica">{c.metrica}</div><div className="case-desc">{c.desc}</div><div className="case-quote">"{c.quote}"</div><div className="case-autor"><div className="case-avatar">{c.nome.split(' ').map(n => n[0]).join('')}</div><div className="case-info"><div className="case-nome">{c.nome}</div><div className="case-empresa">{c.empresa}</div></div></div></div>
    ))}</div></div></section>
  );
}

function Faq() {
  const [aberto, setAberto] = useState(0);
  const perguntas = [
    { q: "Quanto tempo ate ver resultado?", a: "Em geral 15 a 30 dias pros primeiros resultados consistentes. Google Ads precisa de dados pra otimizar — nas primeiras 2 semanas o algoritmo esta aprendendo. A partir do segundo mes, os numeros comecam a estabilizar e escalar." },
    { q: "Qual o investimento minimo em anuncios?", a: "R$ 5.000/mes e o piso tecnico pra dar volume de dados suficiente pro Google otimizar. Abaixo disso os anuncios ficam ineficientes independente da agencia. O ideal e comecar com R$ 10-15k pra ter margem de teste." },
    { q: "Voces cobram taxa fixa ou porcentagem sobre investimento?", a: "Taxa mensal fixa, independente do quanto voce investe em midia. Assim nosso incentivo esta alinhado: ganhamos mais quando voce escala, mas nao recebemos comissao por queimar orcamento. O valor depende da complexidade da operacao." },
    { q: "Preciso ter site proprio ou voces fazem?", a: "Precisa ter uma pagina de conversao (site, landing page, ou loja). Se nao tiver, encaminhamos parceiros de confianca que fazem — mas nao fazemos internamente. Foco e 100% em trafego e midia paga." },
    { q: "Trabalham com que segmentos?", a: "Todos os que geram vendas online: e-commerce, servicos locais, SaaS, educacao, saude (nicho legal), infoprodutos com historico. Nao trabalhamos com apostas, cripto de risco, ou produtos que violem politicas do Google." },
    { q: "Existe contrato de fidelidade?", a: "Minimo de 90 dias — tempo necessario pro Google entregar performance. Depois disso, mensal. Se em qualquer momento voce quiser sair, sai. Sem multa, sem rescisao complicada." }
  ];
  return (
    <section><div className="container"><div className="section-eyebrow">FAQ</div><h2 className="section-title">Duvidas <em>frequentes</em></h2><p className="section-sub">Perguntas que aparecem toda semana na nossa DM. Se a sua nao estiver aqui, e so chamar.</p><div className="faq-lista">{perguntas.map((p, i) => (
      <div className={`faq-item ${aberto === i ? 'aberto' : ''}`} key={i}><button className="faq-pergunta" onClick={() => setAberto(aberto === i ? null : i)}><span>{p.q}</span><svg className="faq-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button><div className="faq-resposta">{p.a}</div></div>
    ))}</div></div></section>
  );
}

function CtaFinal() {
  return (
    <div id="contato"><div className="cta-final"><h2>Pronto pra parar de <em>queimar verba?</em></h2><p>Analise gratuita da sua conta atual em ate 48h. Sem compromisso, sem venda forcada — se nao fizer sentido trabalharmos juntos, a gente fala.</p><a href="https://wa.me/5511999999999?text=Ola%2C%20quero%20uma%20analise%20gratuita" className="btn-primary" target="_blank" rel="noopener">Chamar no WhatsApp<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></a></div></div>
  );
}
