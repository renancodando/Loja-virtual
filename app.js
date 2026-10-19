const $=(s,c=document)=>c.querySelector(s)
const $$=(s,c=document)=>[...c.querySelectorAll(s)]

const agenda={0:[],1:[[5,11],[15,22]],2:[[5,11],[15,22]],3:[[5,11],[15,22]],4:[[5,11],[15,22]],5:[[5,11],[15,22]],6:[[7,12]]}

function agoraLocal(){
  const partes=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(new Date())
  const pega=t=>partes.find(p=>p.type===t)?.value||''
  const dias={dom:0,seg:1,ter:2,qua:3,qui:4,sex:5,sáb:6,sab:6}
  return{dia:dias[pega('weekday').replace('.','').toLowerCase()],h:Number(pega('hour')),m:Number(pega('minute')),s:Number(pega('second'))}
}

function proximaAbertura(dia,hora){
  const nomes=['domingo','segunda','terça','quarta','quinta','sexta','sábado']
  for(let salto=0;salto<8;salto++){
    const alvo=(dia+salto)%7
    for(const[inicio]of agenda[alvo]){
      if(salto>0||inicio>hora)return salto===0?`abre às ${String(inicio).padStart(2,'0')}:00`:`abre ${nomes[alvo]} às ${String(inicio).padStart(2,'0')}:00`
    }
  }
  return'confirme pelo WhatsApp'
}

function sincronizarTempo(){
  const t=agoraLocal()
  if(t.dia===undefined)return
  const decimal=t.h+t.m/60+t.s/3600
  const aberto=agenda[t.dia].some(([a,b])=>decimal>=a&&decimal<b)
  const status=$('[data-status]')
  const dot=$('[data-status-dot]')
  if(status)status.textContent=aberto?'aberto agora':proximaAbertura(t.dia,decimal)
  if(dot){dot.classList.toggle('open',aberto);dot.classList.toggle('closed',!aberto)}
  const clock=$('[data-clock]')
  if(clock)clock.textContent=`${String(t.h).padStart(2,'0')}:${String(t.m).padStart(2,'0')}`
  const copy=$('[data-clock-copy]')
  if(copy)copy.textContent=t.h<11?'A manhã ainda está abrindo.':t.h<15?'O corpo pode pausar também.':t.h<20?'O dia ainda cabe em você.':'Fechar o dia também pode ser movimento.'
  const angle=(decimal/24)*360
  document.documentElement.style.setProperty('--time-angle',`${angle}deg`)
  $$('[data-day]').forEach(row=>row.classList.toggle('today',Number(row.dataset.day)===t.dia))
}

function revelar(){
  const itens=$$('.reveal')
  if(!('IntersectionObserver'in window)){itens.forEach(el=>el.classList.add('in'));return}
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');io.unobserve(entry.target)}}),{threshold:.1,rootMargin:'0px 0px -7% 0px'})
  itens.forEach(el=>io.observe(el))
}

function cabecalho(){
  const header=$('[data-header]')
  const progresso=$('[data-progress]')
  const secoes=$$('[data-section]')
  const links=$$('[data-anchor]')
  let ticking=false
  const render=()=>{
    const y=scrollY
    header?.classList.toggle('ativo',y>24)
    const max=document.documentElement.scrollHeight-innerHeight
    if(progresso)progresso.style.height=`${max>0?(y/max)*100:0}%`
    let atual=secoes[0]?.dataset.section
    secoes.forEach(sec=>{if(sec.getBoundingClientRect().top<innerHeight*.46)atual=sec.dataset.section})
    links.forEach(a=>a.classList.toggle('ativo',a.dataset.anchor===atual))
    ticking=false
  }
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(render);ticking=true}},{passive:true})
  render()
}

function cursor(){
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return
  const c=$('.cursor');const texto=$('.cursor span')
  let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y
  addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;c.classList.add('ativo')},{passive:true})
  addEventListener('pointerleave',()=>c.classList.remove('ativo'))
  $$('[data-cursor]').forEach(el=>{
    el.addEventListener('pointerenter',()=>{texto.textContent=el.dataset.cursor||'';c.classList.add('rotulo')})
    el.addEventListener('pointerleave',()=>{texto.textContent='';c.classList.remove('rotulo')})
  })
  const loop=()=>{cx+=(x-cx)*.16;cy+=(y-cy)*.16;c.style.left=`${cx}px`;c.style.top=`${cy}px`;requestAnimationFrame(loop)}
  loop()
}

function magneticos(){
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return
  $$('.magnetico').forEach(el=>{
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const dx=e.clientX-(r.left+r.width/2);const dy=e.clientY-(r.top+r.height/2);el.style.transform=`translate(${dx*.12}px,${dy*.18}px)`})
    el.addEventListener('pointerleave',()=>el.style.transform='')
  })
}

function tilt(){
  const el=$('[data-tilt]')
  if(!el||!matchMedia('(hover:hover) and (pointer:fine)').matches)return
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;el.style.transform=`rotateY(${x*2.4}deg) rotateX(${-y*2.2}deg)`})
  el.addEventListener('pointerleave',()=>el.style.transform='')
}

function parallax(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return
  const itens=$$('[data-parallax]')
  let ticking=false
  const render=()=>{const mid=innerHeight/2;itens.forEach(el=>{const r=el.getBoundingClientRect();const v=Number(el.dataset.parallax||0);el.style.translate=`0 ${(r.top+r.height/2-mid)*v}px`});ticking=false}
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(render);ticking=true}},{passive:true});render()
}

function janelas(){
  $$('.janela').forEach(btn=>btn.addEventListener('click',()=>{$$('.janela').forEach(x=>x.classList.remove('ativa'));btn.classList.add('ativa');const copy=$('[data-clock-copy]');if(copy)copy.textContent=btn.dataset.window==='manha'?'Começar cedo muda o peso do resto do dia.':'Terminar o dia em movimento muda a forma de chegar em casa.'}))
}

function campoRespiracao(){
  const canvas=$('#respira')
  if(!canvas||matchMedia('(prefers-reduced-motion:reduce)').matches)return
  const ctx=canvas.getContext('2d',{alpha:true})
  let w=0,h=0,dpr=Math.min(devicePixelRatio||1,1.5),mx=.5,my=.5
  const pontos=Array.from({length:42},(_,i)=>({a:(i/42)*Math.PI*2,r:.1+((i*37)%100)/180,s:.0006+((i%7)*.00008)}))
  const resize=()=>{w=innerWidth;h=innerHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;ctx.setTransform(dpr,0,0,dpr,0,0)}
  addEventListener('resize',resize,{passive:true});addEventListener('pointermove',e=>{mx=e.clientX/w;my=e.clientY/h},{passive:true});resize()
  let t=0
  const loop=()=>{t+=1;ctx.clearRect(0,0,w,h);const cx=w*(.6+(mx-.5)*.04),cy=h*(.42+(my-.5)*.035);pontos.forEach((p,i)=>{const rr=Math.min(w,h)*(p.r+.02*Math.sin(t*p.s+i));const x=cx+Math.cos(p.a+t*p.s)*rr;const y=cy+Math.sin(p.a+t*p.s)*rr*.72;ctx.beginPath();ctx.arc(x,y,i%9===0?1.7:.8,0,Math.PI*2);ctx.fillStyle=i%8===0?'rgba(200,117,89,.22)':'rgba(213,232,107,.09)';ctx.fill()});requestAnimationFrame(loop)}
  loop()
}

sincronizarTempo();setInterval(sincronizarTempo,30000)
revelar();cabecalho();cursor();magneticos();tilt();parallax();janelas();campoRespiracao()
