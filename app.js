(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attr = esc;

  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    try{
      const response = await fetch('dados.json', {cache:'no-store'});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      validate(data);
      render(data);
      scheduleHeightUpdates();
    }catch(error){
      console.error('Falha ao carregar dados.json:', error);
      $('load-error').hidden = false;
      sendHeight();
    }
  }

  function validate(data){
    if(!data || !data.pagina || !Array.isArray(data.dadosCurso) || !Array.isArray(data.acessos)){
      throw new Error('Estrutura inválida em dados.json');
    }
  }

  function render(data){
    document.title = `${data.pagina.titulo} | UFPR`;
    $('hero-label').textContent = data.pagina.rotulo || 'Biomedicina · UFPR';
    $('page-title').textContent = data.pagina.titulo;
    $('page-subtitle').textContent = data.pagina.subtitulo || '';

    $('intro-title').textContent = data.apresentacao?.titulo || '';
    $('intro-text').textContent = data.apresentacao?.texto || '';
    $('course-facts').innerHTML = data.dadosCurso.map(item => `<article class="fact-card"><strong>${esc(item.valor)}</strong><span>${esc(item.rotulo)}</span></article>`).join('');

    $('formation-title').textContent = data.formacao?.titulo || '';
    $('formation-intro').textContent = data.formacao?.introducao || '';
    $('formation-cards').innerHTML = (data.formacao?.cards || []).map(card => `<article class="formation-card"><span class="icon" aria-hidden="true">${esc(card.icone || '•')}</span><h3>${esc(card.titulo)}</h3><p>${esc(card.texto)}</p></article>`).join('');

    $('history-title').textContent = data.historico?.titulo || '';
    $('history-text').textContent = data.historico?.texto || '';
    $('history-docs').innerHTML = (data.historico?.documentos || []).map(doc => `<div class="document-item"><strong>${esc(doc.titulo)}</strong><span>${esc(doc.texto)}</span>${doc.url ? `<a href="${attr(doc.url)}" target="_blank" rel="noopener noreferrer">Consultar documento ↗</a>` : ''}</div>`).join('');

    $('activity-title').textContent = data.atuacao?.titulo || '';
    $('activity-text').textContent = data.atuacao?.texto || '';
    $('activity-tags').innerHTML = (data.atuacao?.destaques || []).map(tag => `<span class="tag">${esc(tag)}</span>`).join('');
    $('activity-note').textContent = data.atuacao?.observacao || '';

    $('links-title').textContent = data.acessosTitulo || 'Informações acadêmicas';
    $('links-text').textContent = data.acessosTexto || '';
    $('academic-links').innerHTML = data.acessos.map(link => `<a class="academic-link" href="${attr(link.url)}" target="_top"><strong>${esc(link.titulo)}</strong><span>${esc(link.texto || '')}</span><em>Acessar →</em></a>`).join('');

    const loc = data.localizacao || {};
    $('location-title').textContent = loc.titulo || 'Onde o curso está';
    $('location-place').textContent = loc.local || '';
    $('location-address').textContent = loc.endereco || '';
    const phone = $('phone-link'); phone.textContent = loc.telefone || ''; phone.href = `tel:${String(loc.telefone || '').replace(/[^+\d]/g,'')}`;
    const email = $('email-link'); email.textContent = loc.email || ''; email.href = `mailto:${loc.email || ''}`;
  }

  function sendHeight(){
    if(window.parent === window) return;
    requestAnimationFrame(() => {
      const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight);
      window.parent.postMessage({type:'o-curso-height',height,source:'O-Curso-Biomedicina-UFPR-V1'}, 'https://bio.ufpr.br');
    });
  }

  function scheduleHeightUpdates(){
    sendHeight();
    [250,700,1500,3000].forEach(ms => setTimeout(sendHeight, ms));
    window.addEventListener('resize', sendHeight);
    if('ResizeObserver' in window) new ResizeObserver(sendHeight).observe(document.body);
  }
})();
