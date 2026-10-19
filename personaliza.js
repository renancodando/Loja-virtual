(() => {
  const root = document.querySelector('[data-builder]')
  if (!root) return

  const focos = [...root.querySelectorAll('[data-foco]')]
  const diasBtns = [...root.querySelectorAll('[data-dia-escolha]')]
  const periodosBtns = [...root.querySelectorAll('[data-periodo]')]
  const inicio = root.querySelector('[data-hora-inicio]')
  const fim = root.querySelector('[data-hora-fim]')
  const observacao = root.querySelector('[data-observacao]')
  const contador = root.querySelector('[data-contador]')
  const preview = root.querySelector('[data-preview]')
  const progresso = root.querySelector('[data-builder-progress]')
  const enviar = root.querySelector('[data-enviar]')

  const estado = {
    foco: '',
    dias: new Set(),
    periodos: new Set(),
    inicio: '',
    fim: '',
    observacao: ''
  }

  const capitaliza = texto => texto.charAt(0).toUpperCase() + texto.slice(1)

  function fraseDias() {
    const ordem = ['segunda','terça','quarta','quinta','sexta','sábado']
    const lista = ordem.filter(d => estado.dias.has(d))
    if (!lista.length) return ''
    if (lista.length === 1) return capitaliza(lista[0])
    if (lista.length === 2) return `${capitaliza(lista[0])} e ${lista[1]}`
    return `${lista.slice(0,-1).map(capitaliza).join(', ')} e ${lista.at(-1)}`
  }

  function fraseHorarios() {
    const blocos = [...estado.periodos]
    if (estado.inicio || estado.fim) {
      if (estado.inicio && estado.fim) blocos.push(`${estado.inicio}–${estado.fim}`)
      else if (estado.inicio) blocos.push(`a partir de ${estado.inicio}`)
      else blocos.push(`até ${estado.fim}`)
    }
    return blocos.join(', ')
  }

  function textoMensagem() {
    const linhas = [
      'Olá! Vi o site da Academia Saúde & Bem Estar e queria conversar sobre meu treino.'
    ]
    if (estado.foco) linhas.push(`Meu foco: ${estado.foco}.`)
    const dias = fraseDias()
    if (dias) linhas.push(`Consigo treinar: ${dias}.`)
    const horarios = fraseHorarios()
    if (horarios) linhas.push(`Horários que funcionam para mim: ${horarios}.`)
    if (estado.observacao.trim()) linhas.push(`Queria acrescentar: ${estado.observacao.trim()}`)
    linhas.push('Vocês conseguem me orientar sobre a melhor forma de começar?')
    return linhas.join('\n')
  }

  function atualizar() {
    estado.inicio = inicio.value
    estado.fim = fim.value
    estado.observacao = observacao.value
    contador.textContent = String(observacao.value.length)

    const partes = []
    if (estado.foco) partes.push(`Quero conversar sobre <strong>${estado.foco.toLowerCase()}</strong>.`)
    else partes.push('Escolha o que você quer treinar para começar.')

    const dias = fraseDias()
    if (dias) partes.push(`Posso ir ${dias.toLowerCase()}.`)
    const horarios = fraseHorarios()
    if (horarios) partes.push(`Meus horários possíveis são ${horarios}.`)
    if (estado.observacao.trim()) partes.push(`“${estado.observacao.trim()}”`)

    preview.innerHTML = partes.join('\n\n')

    let preenchidos = 0
    if (estado.foco) preenchidos++
    if (estado.dias.size) preenchidos++
    if (estado.periodos.size || estado.inicio || estado.fim) preenchidos++
    if (estado.observacao.trim()) preenchidos++
    progresso.style.width = `${preenchidos * 25}%`

    if (estado.foco) {
      enviar.href = `https://wa.me/5528999529191?text=${encodeURIComponent(textoMensagem())}`
      enviar.setAttribute('aria-disabled','false')
    } else {
      enviar.href = 'https://wa.me/5528999529191'
      enviar.setAttribute('aria-disabled','true')
    }
  }

  focos.forEach(botao => botao.addEventListener('click', () => {
    focos.forEach(outro => outro.setAttribute('aria-pressed', String(outro === botao)))
    estado.foco = botao.dataset.foco
    atualizar()
  }))

  diasBtns.forEach(botao => botao.addEventListener('click', () => {
    const dia = botao.dataset.diaEscolha
    const ativo = !estado.dias.has(dia)
    if (ativo) estado.dias.add(dia)
    else estado.dias.delete(dia)
    botao.setAttribute('aria-pressed', String(ativo))
    atualizar()
  }))

  periodosBtns.forEach(botao => botao.addEventListener('click', () => {
    const periodo = botao.dataset.periodo
    const ativo = !estado.periodos.has(periodo)
    if (ativo) estado.periodos.add(periodo)
    else estado.periodos.delete(periodo)
    botao.setAttribute('aria-pressed', String(ativo))
    atualizar()
  }))

  ;[inicio, fim, observacao].forEach(campo => campo.addEventListener('input', atualizar))

  enviar.addEventListener('click', evento => {
    if (!estado.foco) evento.preventDefault()
  })

  atualizar()
})()
