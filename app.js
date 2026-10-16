const corpo = document.body;
const topo = document.querySelector('[data-header]');
const progresso = document.querySelector('[data-progress]');
const botaoMenu = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');
const sacola = document.querySelector('[data-cart]');
const fundoSacola = document.querySelector('[data-cart-backdrop]');
const itensSacola = document.querySelector('[data-cart-items]');
const totalSacola = document.querySelector('[data-cart-total]');
const contadorSacola = document.querySelector('[data-cart-count]');
const toast = document.querySelector('[data-toast]');

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0
});

let selecao = carregarSacola();
let rolagemAnterior = window.scrollY;
let timerToast;

function carregarSacola() {
  try {
    const salvo = localStorage.getItem('lastro:sacola');
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

function salvarSacola() {
  try {
    localStorage.setItem('lastro:sacola', JSON.stringify(selecao));
  } catch {}
}

function mostrarToast(texto) {
  window.clearTimeout(timerToast);
  toast.textContent = texto;
  toast.classList.add('visivel');
  timerToast = window.setTimeout(() => toast.classList.remove('visivel'), 2800);
}

function abrirMenu() {
  fecharSacola();
  corpo.classList.add('menu-aberto');
  menu.classList.add('aberto');
  menu.setAttribute('aria-hidden', 'false');
  botaoMenu.setAttribute('aria-expanded', 'true');
  botaoMenu.setAttribute('aria-label', 'Fechar menu');
}

function fecharMenu() {
  corpo.classList.remove('menu-aberto');
  menu.classList.remove('aberto');
  menu.setAttribute('aria-hidden', 'true');
  botaoMenu.setAttribute('aria-expanded', 'false');
  botaoMenu.setAttribute('aria-label', 'Abrir menu');
}

function alternarMenu() {
  const aberto = botaoMenu.getAttribute('aria-expanded') === 'true';
  aberto ? fecharMenu() : abrirMenu();
}

function abrirSacola() {
  fecharMenu();
  corpo.classList.add('sacola-aberta');
  sacola.classList.add('aberta');
  fundoSacola.classList.add('ativo');
  sacola.setAttribute('aria-hidden', 'false');
}

function fecharSacola() {
  corpo.classList.remove('sacola-aberta');
  sacola.classList.remove('aberta');
  fundoSacola.classList.remove('ativo');
  sacola.setAttribute('aria-hidden', 'true');
}

function desenharSacola() {
  contadorSacola.textContent = selecao.length;

  if (!selecao.length) {
    itensSacola.innerHTML = '<p class="sacola-vazia">A sacola está vazia.</p>';
    totalSacola.textContent = moeda.format(0);
    salvarSacola();
    return;
  }

  itensSacola.innerHTML = selecao.map((item, indice) => `
    <div class="sacola-item">
      <div class="sacola-item-visual">${item.nome.slice(0, 1)}</div>
      <div class="sacola-item-info">
        <strong>${item.nome}</strong>
        <span>${moeda.format(item.preco)}</span>
      </div>
      <button type="button" data-remove-item="${indice}">remover</button>
    </div>
  `).join('');

  const total = selecao.reduce((soma, item) => soma + item.preco, 0);
  totalSacola.textContent = moeda.format(total);
  salvarSacola();
}

function adicionarProduto(botao) {
  const produto = botao.closest('[data-product]');
  if (!produto) return;

  selecao.push({
    nome: produto.dataset.product,
    preco: Number(produto.dataset.price)
  });

  botao.classList.add('adicionado');
  botao.firstChild.textContent = 'Adicionado ';
  botao.querySelector('span').textContent = '✓';

  window.setTimeout(() => {
    botao.classList.remove('adicionado');
    botao.firstChild.textContent = 'Adicionar à sacola ';
    botao.querySelector('span').textContent = '+';
  }, 1500);

  desenharSacola();
  mostrarToast(`${produto.dataset.product} entrou na sacola.`);
}

function removerProduto(indice) {
  const removido = selecao[indice];
  selecao.splice(indice, 1);
  desenharSacola();
  if (removido) mostrarToast(`${removido.nome} foi removido.`);
}

function atualizarRolagem() {
  const atual = window.scrollY;
  const limite = document.documentElement.scrollHeight - window.innerHeight;
  const percentual = limite > 0 ? atual / limite : 0;

  progresso.style.transform = `scaleX(${percentual})`;
  topo.classList.toggle('rolado', atual > 20);

  if (!corpo.classList.contains('menu-aberto') && !corpo.classList.contains('sacola-aberta')) {
    topo.classList.toggle('oculto', atual > rolagemAnterior && atual > 180);
  }

  rolagemAnterior = atual;
}

function prepararRevelacao() {
  const elementos = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window)) {
    elementos.forEach(elemento => elemento.classList.add('visivel'));
    return;
  }

  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('visivel');
      observador.unobserve(entrada.target);
    });
  }, {
    rootMargin: '0px 0px -10% 0px',
    threshold: .08
  });

  elementos.forEach(elemento => observador.observe(elemento));
}

function prepararInclinacao() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('[data-tilt]').forEach(area => {
    const objeto = area.matches('[data-tilt]') && (area.classList.contains('brasa') || area.classList.contains('folego') || area.classList.contains('pulso'))
      ? area
      : area.querySelector('.brasa, .folego, .pulso');

    if (!objeto) return;

    area.addEventListener('pointermove', evento => {
      const caixa = area.getBoundingClientRect();
      const x = (evento.clientX - caixa.left) / caixa.width - .5;
      const y = (evento.clientY - caixa.top) / caixa.height - .5;
      objeto.style.transform = `perspective(900px) rotateX(${y * -7}deg) rotateY(${x * 9}deg) translate3d(${x * 5}px, ${y * 4}px, 0)`;
    });

    area.addEventListener('pointerleave', () => {
      objeto.style.transform = '';
    });
  });
}

function prepararCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  window.addEventListener('pointermove', evento => {
    cursor.style.left = `${evento.clientX}px`;
    cursor.style.top = `${evento.clientY}px`;
    cursor.classList.add('ativo');
  }, { passive: true });

  document.addEventListener('pointerover', evento => {
    cursor.classList.toggle('sobre-link', Boolean(evento.target.closest('a, button, input')));
  });

  document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('ativo'));
}

const materiais = {
  basalto: {
    codigo: 'M-01 / BASALTO',
    texto: 'Cada peça conserva pequenas diferenças de grão, porosidade e densidade. Elas não são defeito nem decoração: são consequência do processo.'
  },
  aluminio: {
    codigo: 'M-02 / ALUMÍNIO',
    texto: 'O acabamento anodizado protege sem esconder o metal. Marcas leves de uso passam a fazer parte da superfície em vez de parecerem desgaste descartável.'
  },
  ceramica: {
    codigo: 'M-03 / CERÂMICA',
    texto: 'A superfície fosca difunde reflexos e mantém o toque seco. Cada queima muda discretamente a tonalidade e impede que duas peças sejam idênticas.'
  },
  malha: {
    codigo: 'M-04 / MALHA',
    texto: 'Uma trama aberta o suficiente para o som atravessar e fechada o bastante para esconder o componente acústico. Tecnologia presente, visualmente ausente.'
  }
};

function selecionarMaterial(botao) {
  const nome = botao.dataset.material;
  const dados = materiais[nome];
  const palco = document.querySelector('[data-material-stage]');
  if (!dados || !palco) return;

  document.querySelectorAll('[data-material]').forEach(item => item.classList.toggle('ativo', item === botao));
  palco.dataset.materialStage = nome;
  document.querySelector('[data-material-code]').textContent = dados.codigo;
  document.querySelector('[data-material-copy]').textContent = dados.texto;
}

function prepararAmbiente() {
  const controle = document.querySelector('[data-ambient-range]');
  const ambiente = document.querySelector('[data-ambient]');
  const valor = document.querySelector('[data-ambient-value]');
  if (!controle || !ambiente || !valor) return;

  const atualizar = () => {
    const intensidade = Number(controle.value);
    valor.textContent = intensidade;
    ambiente.style.setProperty('--luz', (intensidade / 100).toFixed(2));
  };

  controle.addEventListener('input', atualizar);
  atualizar();
}

async function tocarPulso() {
  const Audio = window.AudioContext || window.webkitAudioContext;

  if (!Audio) {
    mostrarToast('Seu navegador não liberou a demonstração de áudio.');
    return;
  }

  const contexto = new Audio();
  await contexto.resume();
  const ganho = contexto.createGain();
  ganho.connect(contexto.destination);

  const agora = contexto.currentTime;
  ganho.gain.setValueAtTime(.0001, agora);
  ganho.gain.exponentialRampToValueAtTime(.23, agora + .035);
  ganho.gain.exponentialRampToValueAtTime(.0001, agora + 1.9);

  [54, 72, 108].forEach((frequencia, indice) => {
    const oscilador = contexto.createOscillator();
    oscilador.type = indice === 0 ? 'sine' : 'triangle';
    oscilador.frequency.setValueAtTime(frequencia, agora);
    oscilador.detune.setValueAtTime(indice * -7, agora);
    oscilador.connect(ganho);
    oscilador.start(agora + indice * .08);
    oscilador.stop(agora + 1.95);
  });

  if ('vibrate' in navigator) navigator.vibrate([55, 70, 45]);
  mostrarToast('PULSO 03 · resposta tátil de baixa frequência');
  window.setTimeout(() => contexto.close(), 2200);
}

botaoMenu.addEventListener('click', alternarMenu);

document.querySelectorAll('[data-open-cart]').forEach(botao => botao.addEventListener('click', abrirSacola));
document.querySelector('[data-close-cart]').addEventListener('click', fecharSacola);
fundoSacola.addEventListener('click', fecharSacola);

document.querySelectorAll('[data-add-cart]').forEach(botao => {
  botao.addEventListener('click', () => adicionarProduto(botao));
});

itensSacola.addEventListener('click', evento => {
  const botao = evento.target.closest('[data-remove-item]');
  if (!botao) return;
  removerProduto(Number(botao.dataset.removeItem));
});

document.querySelector('[data-checkout]').addEventListener('click', () => {
  if (!selecao.length) {
    mostrarToast('Escolha pelo menos um objeto antes de continuar.');
    return;
  }
  mostrarToast('Demonstração: aqui entra o checkout ou o meio de pagamento do cliente.');
});

document.querySelectorAll('[data-material]').forEach(botao => {
  botao.addEventListener('click', () => selecionarMaterial(botao));
});

document.querySelectorAll('.menu-mobile a').forEach(link => link.addEventListener('click', fecharMenu));
document.querySelector('[data-demo-sound]').addEventListener('click', tocarPulso);

document.addEventListener('keydown', evento => {
  if (evento.key !== 'Escape') return;
  fecharMenu();
  fecharSacola();
});

window.addEventListener('scroll', atualizarRolagem, { passive: true });
window.addEventListener('resize', () => {
  if (window.innerWidth > 980) fecharMenu();
}, { passive: true });

prepararRevelacao();
prepararInclinacao();
prepararCursor();
prepararAmbiente();
desenharSacola();
atualizarRolagem();
