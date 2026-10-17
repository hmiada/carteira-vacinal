'use strict';
const DB_NAME='carteira-vacinal';const STORE='applications';const DB_VERSION=1;let db;let rows=[];
const $=id=>document.getElementById(id);const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=msg=>{const t=$('toast');t.textContent=msg;t.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.style.display='none',3500)};
function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function transaction(mode,fn){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode);const store=tx.objectStore(STORE);let result;try{result=fn(store)}catch(e){reject(e);return}tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
function getAll(){return new Promise((resolve,reject)=>{const req=db.transaction(STORE,'readonly').objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
const fmt=r=>r.precision==='year'&&r.year?String(r.year):r.date?`${r.date.slice(8,10)}/${r.date.slice(5,7)}/${r.date.slice(0,4)}${r.precision==='estimated'?' (provável)':''}`:'Data desconhecida';
function ordered(){return [...rows].sort((a,b)=>(b.date||String(b.year||'')).localeCompare(a.date||String(a.year||'')))}
function rowHtml(r){return `<article class="record"><div><h3>${safe(r.vaccine)}</h3><p>${safe(fmt(r))}</p><small>${safe([r.manufacturer,r.clinic].filter(Boolean).join(' · '))}</small>${r.status==='review'?'<span class="pill">Em revisão</span>':''}</div><div class="record-actions"><button data-edit="${safe(r.id)}" aria-label="Editar">Editar</button><button data-delete="${safe(r.id)}" aria-label="Excluir">×</button></div></article>`}
function render(){const sorted=ordered();$('count').textContent=rows.filter(r=>r.status==='confirmed').length;$('reviewCount').textContent=rows.filter(r=>r.status==='review').length;$('lastDate').textContent=sorted.length?fmt(sorted[0]):'—';$('recent').innerHTML=sorted.length?sorted.slice(0,3).map(rowHtml).join(''):'Nenhuma vacina cadastrada ainda.';const q=$('search').value.trim().toLocaleLowerCase('pt-BR');const matches=sorted.filter(r=>[r.vaccine,r.manufacturer,r.clinic,r.lot].some(v=>String(v||'').toLocaleLowerCase('pt-BR').includes(q)));$('records').innerHTML=matches.length?matches.map(rowHtml).join(''):'<div class="empty">Nenhum registro encontrado.</div>';renderRecommendations();}
async function refresh(){rows=await getAll();render()}
function navigate(page){document.querySelectorAll('.page').forEach(e=>e.classList.toggle('active',e.id===page));document.querySelectorAll('[data-nav]').forEach(e=>e.classList.toggle('selected',e.dataset.nav===page));window.scrollTo(0,0)}
function editor(r){$('vaccineForm').reset();$('recordId').value=r?.id||'';$('editorTitle').textContent=r?'Editar vacina':'Registrar vacina';for(const k of ['vaccine','date','precision','year','status','manufacturer','lot','clinic','source','notes'])if(r&&r[k]!==undefined)$(k).value=r[k];$('editor').showModal()}
function payload(){const r={};for(const k of ['vaccine','date','precision','year','status','manufacturer','lot','clinic','source','notes'])r[k]=$(k).value.trim();r.year=r.year?Number(r.year):null;return r}
function valid(r){if(!r.vaccine)return'Informe a vacina.';if(r.precision==='year'&&(!Number.isInteger(r.year)||r.year<1900||r.year>2100))return'Informe um ano válido.';if(['exact','estimated'].includes(r.precision)&&!r.date)return'Informe a data da aplicação.';if(r.precision==='year')r.date='';if(r.precision==='unknown'){r.date='';r.year=null}if(r.date&&r.date>new Date().toISOString().slice(0,10))return'A data não pode estar no futuro.';return null}
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
const filename=s=>`carteira-vacinal-${new Date().toISOString().slice(0,10)}.${s}`;
function csvCell(x){return '"'+String(x??'').replace(/^[=+\-@\t\r]/,'\'$&').replace(/"/g,'""')+'"'}
function csvExport(){const keys=['vaccine','date','precision','year','status','manufacturer','lot','clinic','source','notes'];const lines=[keys.map(csvCell).join(';'),...ordered().map(r=>keys.map(k=>csvCell(r[k])).join(';'))];download(filename('csv'),'\ufeff'+lines.join('\r\n'),'text/csv;charset=utf-8')}
function validateBackup(x){if(!x||x.app!=='minha-carteira-vacinal'||x.schemaVersion!==1||!Array.isArray(x.applications)||x.applications.length>20000)throw Error('Formato ou versão de backup não suportados.');const ids=new Set();return x.applications.map(r=>{if(!r||typeof r!=='object'||typeof r.id!=='string'||r.id.length>100||ids.has(r.id)||typeof r.vaccine!=='string'||!r.vaccine.trim()||r.vaccine.length>120||!['exact','estimated','year','unknown'].includes(r.precision)||!['confirmed','review'].includes(r.status)||typeof r.date!=='string'||(r.date&&!/^\d{4}-\d{2}-\d{2}$/.test(r.date))||r.year!==null&&r.year!==undefined&&(!Number.isInteger(r.year)||r.year<1900||r.year>2100))throw Error('Backup contém registros inválidos.');ids.add(r.id);const clean={};for(const k of ['id','vaccine','date','precision','year','status','manufacturer','lot','clinic','source','notes','createdAt','updatedAt'])if(r[k]!==undefined){if(typeof r[k]==='string'&&r[k].length>10000)throw Error('Campo muito longo no backup.');clean[k]=r[k]}return clean})}
async function importBackup(file){if(!file)return;if(file.size>10*1024*1024)throw Error('Arquivo muito grande (máximo 10 MB).');const parsed=JSON.parse(await file.text());const restored=validateBackup(parsed);if(!confirm(`Restaurar ${restored.length} registros? Isso SUBSTITUIRÁ os ${rows.length} registros atuais neste dispositivo. Faça backup antes de continuar.`))return;await transaction('readwrite',store=>{store.clear();restored.forEach(r=>store.put(r))});await refresh();toast(`${restored.length} registros restaurados.`)}


function renderRecommendations(){
  if(!window.CarteiraRules)return;
  const data=CarteiraRules.evaluate(rows);
  const card=r=>`<article class="record"><div><h3>${safe(r.title)}</h3><small>${safe(CarteiraRules.sources[r.source].label)}</small><p>${safe(r.detail)}</p></div><span class="pill">${safe({documentado:'Documentado',verificar:'Verificar',avaliar:'Avaliar',futuro:'Futura'}[r.status])}</span></article>`;
  $('recommendations').innerHTML=data.map(card).join('')+
    `<p class="muted">Regras: ${safe(CarteiraRules.version)} · <a href="${CarteiraRules.sources.PNI.url}" target="_blank" rel="noopener">Fonte PNI</a> · <a href="${CarteiraRules.sources.SBIm.url}" target="_blank" rel="noopener">Fonte SBIm</a></p>`;
  $('homeRecommendations').innerHTML=data.filter(r=>r.status==='verificar').slice(0,2).map(card).join('');
}
function fingerprint(r){
  return [String(r.vaccine||'').trim().toLocaleLowerCase('pt-BR').replace(/\s+/g,' '),r.date||'',r.precision||'',r.year||''].join('|');
}
async function importPrivateHistory(file){
  if(!file)return;
  if(file.size>2*1024*1024)throw Error('Arquivo muito grande.');
  const parsed=JSON.parse(await file.text());
  const incoming=validateBackup(parsed);
  const existingIds=new Set(rows.map(r=>r.id));
  const existingFp=new Set(rows.map(fingerprint));
  const newRows=[];let skipped=0;
  for(const r of incoming){
    if(existingIds.has(r.id)||existingFp.has(fingerprint(r))){skipped++;continue}
    newRows.push(r);existingIds.add(r.id);existingFp.add(fingerprint(r));
  }
  if(!confirm(`Importar ${newRows.length} registros? ${skipped} registros com ID ou vacina/data equivalentes serão ignorados. Nenhum registro existente será excluído.`))return;
  await transaction('readwrite',s=>{newRows.forEach(r=>s.put(r))});
  await refresh();
  $('importResult').textContent=`Importados: ${newRows.length}. Ignorados: ${skipped}. Faça um backup JSON atualizado.`;
  toast(`${newRows.length} registros importados.`);
}

function registerEvents(){document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.nav)));$('homeAdd').onclick=()=>editor();$('historyAdd').onclick=()=>editor();$('closeEditor').onclick=$('cancelEditor').onclick=()=>$('editor').close();$('search').oninput=render;$('vaccineForm').onsubmit=async e=>{e.preventDefault();const r=payload();const err=valid(r);if(err){toast(err);return}const old=rows.find(x=>x.id===$('recordId').value);r.id=old?.id||crypto.randomUUID();r.createdAt=old?.createdAt||new Date().toISOString();r.updatedAt=new Date().toISOString();try{await transaction('readwrite',s=>s.put(r));$('editor').close();await refresh();navigate('history');toast('Vacina salva no aparelho.')}catch(err){toast('Erro ao salvar: '+err.message)}};document.addEventListener('click',async e=>{const edit=e.target.closest('[data-edit]');const del=e.target.closest('[data-delete]');if(edit){editor(rows.find(r=>r.id===edit.dataset.edit));return}if(del){const r=rows.find(x=>x.id===del.dataset.delete);if(r&&confirm(`Excluir o registro de ${r.vaccine}?`)){await transaction('readwrite',s=>s.delete(r.id));await refresh();toast('Registro excluído.')}}});$('privateImport').onchange=async e=>{try{await importPrivateHistory(e.target.files[0])}catch(err){toast('Falha na importação: '+err.message)}finally{e.target.value=''}};$('exportJson').onclick=()=>download(filename('json'),JSON.stringify({app:'minha-carteira-vacinal',schemaVersion:1,exportedAt:new Date().toISOString(),applications:rows},null,2),'application/json');$('exportCsv').onclick=csvExport;$('importFile').onchange=async e=>{try{await importBackup(e.target.files[0])}catch(err){toast('Falha ao restaurar: '+err.message)}finally{e.target.value=''}};$('printPdf').onclick=()=>{navigate('history');setTimeout(()=>window.print(),100)}}
(async()=>{try{window.CarteiraAuth.init();db=await openDb();registerEvents();await refresh();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{})}catch(e){document.querySelector('main').innerHTML='<div class="panel"><h2>Armazenamento indisponível</h2><p>Abra o aplicativo pelo Safari em uma página HTTPS e permita o armazenamento local. Nenhum dado foi salvo.</p></div>';console.error(e)}})();
