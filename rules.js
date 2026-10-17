'use strict';
/* Conjunto inicial CONSERVADOR: não infere indicações clínicas não documentadas.
   Versões: PNI adulto 2026 (atualização jul/2026); SBIm adulto 2026/2027. */
window.CarteiraRules={
  version:'2026-10-17-v1',
  sources:{
    PNI:{label:'Ministério da Saúde · PNI 2026',url:'https://www.gov.br/saude/pt-br/vacinacao/calendario'},
    SBIm:{label:'SBIm · Adultos 2026/2027',url:'https://sbim.org.br/calendario-de-vacinacao/adultos-21-a-59-anos'}
  },
  evaluate(rows){
    const confirmed=rows.filter(r=>r.status==='confirmed');
    const count=(re)=>confirmed.filter(r=>re.test(r.vaccine)).length;
    const has=(re)=>count(re)>0;
    const result=[];
    const add=(source,title,status,detail)=>result.push({source,title,status,detail});
    add('PNI','Hepatite B',count(/^Hepatite B$/i)>=3?'documentado':'verificar',
      'PNI 2026: esquema de 3 doses conforme histórico. Confirmar equivalência e intervalos em serviço de saúde.');
    add('PNI','Tríplice viral (SCR)',count(/Tríplice viral/i)>=1?'documentado':'verificar',
      'PNI 2026: de 30 a 59 anos, 1 dose; profissionais de saúde, 2 doses. Considerar histórico e ocupação.');
    add('PNI','Febre amarela',has(/^Febre amarela$/i)?'documentado':'verificar',
      'PNI 2026: 1 dose conforme histórico para adultos. Situações especiais podem mudar a conduta.');
    const tet=confirmed.filter(r=>/^(dT|dTpa|DPT|Toxoide tetânico)$/i.test(r.vaccine)).filter(r=>r.date).sort((a,b)=>b.date.localeCompare(a.date));
    const last=tet[0]?.date;
    add('PNI','Tétano e difteria (dT/dTpa)',last?'futuro':'verificar',
      last?`Última dose registrada: ${last.split('-').reverse().join('/')}. Reforço usual a cada 10 anos (referência: ${Number(last.slice(0,4))+10}); ferimentos de risco podem antecipar.`:'Verificar esquema básico e reforços.');
    add('PNI','Influenza', 'verificar',
      'A indicação de rotina no PNI depende do grupo elegível e de campanhas. Verificar a oferta 2026 na UBS; não presumir elegibilidade universal aos 43 anos.');
    add('PNI','COVID-19','avaliar',
      'Regras de vacinação de 2026 dependem de idade, grupos prioritários e condições de risco. Confirmar indicação atual na UBS.');
    add('SBIm','Influenza anual',confirmed.some(r=>/influenza/i.test(r.vaccine)&&r.date?.startsWith('2026'))?'documentado':'verificar',
      'SBIm: vacinação anual. Verificar se recebeu dose da temporada 2026.');
    add('SBIm','HPV9','avaliar','Aos 43 anos, decisão individual até 45 anos; avaliar benefícios, esquema e contraindicações.');
    add('SBIm','Pneumocócicas','avaliar','Avaliar indicação individual com o pneumologista; pneumonia recente isolada não comprova doença pulmonar crônica.');
    add('SBIm','Dengue','avaliar','Histórico de vacinação desconhecido. Avaliar produto, faixa etária, disponibilidade e contraindicações.');
    add('SBIm','Meningocócicas ACWY/B','avaliar','Histórico desconhecido. Considerar fatores de risco, exposição e preferência individual.');
    add('SBIm','Herpes-zóster','futuro','Reavaliar aos 50 anos, salvo indicação especial anterior.');
    return result;
  }
};