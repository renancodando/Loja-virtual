const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]

const header = $('[data-header]')
const statusEl = $('[data-status]')
const statusCard = $('[data-status-card]')
const statusDot = $('[data-status-dot]')

const agenda = {
  0: [],
  1: [[5, 11], [15, 22]],
  2: [[5, 11], [15, 22]],
  3: [[5, 11], [15, 22]],
  4: [[5, 11], [15, 22]],
  5: [[5, 11], [15, 22]],
  6: [[7, 12]]
}

function agoraLocal() {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date())
  const pega = tipo => partes.find(p => p.type === tipo)?.value || ''
  const nomes = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sáb: 6, sab: 6 }
  return {
    dia: nomes[pega('weekday').replace('.', '').toLowerCase()],
    hora: Number(pega('hour')) + Number(pega('minute')) / 60
  }
}

function proximaAbertura(dia, hora) {
  const nomes = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
  for (let salto = 0; salto < 8; salto++) {
    const alvo = (dia + salto) % 7
    for (const [inicio] of agenda[alvo]) {
      if (salto > 0 || inicio > hora) {
        return salto === 0 ? `abre às ${String(inicio).padStart(2, '0')}:00` : `abre ${nomes[alvo]} às ${String(inicio).padStart(2, '0')}:00`
      }
    }
  }
  return 'confirme pelo WhatsApp'
}

function atualizarStatus() {
  const { dia, hora } = agoraLocal()
  if (dia === undefined || Number.isNaN(hora)) return
  const aberto = agenda[dia].some(([inicio, fim]) => hora >= inicio && hora < fim)
  const texto = aberto ? 'aberto agora' : proximaAbertura(dia, hora)
  statusEl.textContent = texto
  statusCard.textContent = texto
  statusDot.classList.toggle('open', aberto)
  statusDot.classList.toggle('closed', !aberto)
  $$('[data-day]').forEach(row => row.classList.toggle('today', Number(row.dataset.day) === dia))
}

function revelar() {
  const els = $$('[data-reveal]')
  if (!('IntersectionObserver' in window)) return els.forEach(el => el.classList.add('in'))
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in')
        io.unobserve(entry.target)
      }
    })
  }, { threshold: .1, rootMargin: '0px 0px -7% 0px' })
  els.forEach(el => io.observe(el))
}

function headerScroll() {
  const sync = () => header.classList.toggle('ativo', scrollY > 24)
  sync()
  addEventListener('scroll', sync, { passive: true })
}

function parallax() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || innerWidth < 701) return
  const itens = $$('[data-parallax]')
  let ticking = false
  const render = () => {
    const mid = innerHeight / 2
    itens.forEach(el => {
      const r = el.getBoundingClientRect()
      const v = Number(el.dataset.parallax)
      el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - mid) * v}px, 0)`
    })
    ticking = false
  }
  addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(render)
      ticking = true
    }
  }, { passive: true })
  render()
}

function campo() {
  const canvas = $('#campo')
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const ctx = canvas.getContext('2d', { alpha: true })
  let w = 0, h = 0, dpr = Math.min(devicePixelRatio || 1, 1.6)
  let mx = .5, my = .35
  const resize = () => {
    w = innerWidth; h = innerHeight
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
    ctx.setTransform(dpr,0,0,dpr,0,0)
  }
  addEventListener('resize', resize, { passive: true })
  addEventListener('pointermove', e => { mx = e.clientX / w; my = e.clientY / h }, { passive: true })
  resize()
  let t = 0
  const loop = () => {
    t += .003
    ctx.clearRect(0,0,w,h)
    const x = w * (.25 + mx * .22 + Math.sin(t) * .04)
    const y = h * (.35 + my * .16 + Math.cos(t * .8) * .03)
    const r = Math.max(w,h) * .42
    const g = ctx.createRadialGradient(x,y,0,x,y,r)
    g.addColorStop(0,'rgba(240,95,47,.08)')
    g.addColorStop(.46,'rgba(215,239,91,.025)')
    g.addColorStop(1,'rgba(11,11,10,0)')
    ctx.fillStyle = g
    ctx.fillRect(0,0,w,h)
    requestAnimationFrame(loop)
  }
  loop()
}

atualizarStatus()
revelar()
headerScroll()
parallax()
campo()
