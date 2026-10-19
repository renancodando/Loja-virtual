const topo = document.querySelector('[data-topo]')
const statusTexto = document.querySelector('[data-status]')
const statusPonto = document.querySelector('[data-status-ponto]')

const horarios = {
  0: [],
  1: [[5, 11], [15, 22]],
  2: [[5, 11], [15, 22]],
  3: [[5, 11], [15, 22]],
  4: [[5, 11], [15, 22]],
  5: [[5, 11], [15, 22]],
  6: [[7, 12]]
}

function agoraSaoPaulo() {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date())

  const valor = tipo => partes.find(p => p.type === tipo)?.value
  const dias = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sáb: 6, sab: 6 }
  const dia = dias[(valor('weekday') || '').replace('.', '').toLowerCase()]
  const hora = Number(valor('hour'))
  const minuto = Number(valor('minute'))
  return { dia, decimal: hora + minuto / 60 }
}

function proximaAbertura(dia, atual) {
  for (let deslocamento = 0; deslocamento < 8; deslocamento++) {
    const alvo = (dia + deslocamento) % 7
    const faixas = horarios[alvo]
    for (const faixa of faixas) {
      if (deslocamento > 0 || faixa[0] > atual) {
        const nomes = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
        return deslocamento === 0 ? `Abre às ${String(faixa[0]).padStart(2, '0')}:00` : `Abre ${nomes[alvo]} às ${String(faixa[0]).padStart(2, '0')}:00`
      }
    }
  }
  return 'Consulte o horário'
}

function atualizarStatus() {
  const { dia, decimal } = agoraSaoPaulo()
  if (dia === undefined || Number.isNaN(decimal)) return

  const aberto = horarios[dia].some(([inicio, fim]) => decimal >= inicio && decimal < fim)
  statusPonto.classList.toggle('aberto', aberto)
  statusPonto.classList.toggle('fechado', !aberto)
  statusTexto.textContent = aberto ? 'Aberto agora' : proximaAbertura(dia, decimal)

  document.querySelectorAll('[data-dia]').forEach(linha => {
    linha.classList.toggle('hoje', Number(linha.dataset.dia) === dia)
  })
}

function observarEntrada() {
  const elementos = document.querySelectorAll('[data-reveal]')
  if (!('IntersectionObserver' in window)) {
    elementos.forEach(el => el.classList.add('visivel'))
    return
  }

  const observer = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visivel')
        observer.unobserve(entrada.target)
      }
    })
  }, { threshold: .12, rootMargin: '0px 0px -4% 0px' })

  elementos.forEach(el => observer.observe(el))
}

function acompanharTopo() {
  const ajustar = () => topo.classList.toggle('rolado', window.scrollY > 24)
  ajustar()
  window.addEventListener('scroll', ajustar, { passive: true })
}

atualizarStatus()
observarEntrada()
acompanharTopo()
