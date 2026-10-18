const corpo = document.body;
const topo = document.querySelector('[data-header]');
const progresso = document.querySelector('[data-progress]');
const menu = document.querySelector('[data-menu]');
const botaoMenu = document.querySelector('[data-menu-button]');
const sacola = document.querySelector('[data-cart]');
const fundoSacola = document.querySelector('[data-cart-backdrop]');
const itensSacola = document.querySelector('[data-cart-items]');
const totalSacola = document.querySelector('[data-cart-total]');
const provador = document.querySelector('[data-fit]');
const fundoProvador = document.querySelector('[data-fit-backdrop]');
const vistaRapida = document.querySelector('[data-quick-view]');
const toast = document.querySelector('[data-toast]');
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const catalogo = {
  'CASACO TALUDE 01': { preco: 1180, codigo: 'TVD–001', classe: 'talude', descricao: 'Volume amplo, construção pesada e acabamento pensado para registrar o uso.' },
  'CALÇA VÁRZEA 02': { preco: 740, codigo: 'TVD–002', classe: 'varzea', descricao: 'Perna curva, cintura limpa e regulagem interna para ajustar sem interromper a silhueta.' },
  'MALHA COTA 03': { preco: 390, codigo: 'TVD–003', classe: 'cota', descricao: 'Malha compacta de queda reta, gola firme e proporção curta para funcionar sozinha ou em camada.' },
  'CAMISA ESCARPA 04': { preco: 560, codigo: 'TVD–004', classe: 'escarpa', descricao: 'Tricoline encorpada, fechamento quase invisível e desenho seco sem excesso de detalhe.' }
};

const tecidos = {
  sarja: { codigo: 'M–01 / SARJA 520' },
  malha: { codigo: 'M–02 / MALHA 290' },
  tricoline: { codigo: 'M–03 / TRICOLINE 210' },
  forro: { codigo: 'M–04 / FORRO 110' }
};

let carrinho = lerCarrinho();
let rolagemAnterior = window.scrollY;
let modoCaimento = 'preciso';
let produtoRapido = null;
let timerToast;

function lerCarrinho() {
  try {
    const salvo = localStorage.getItem('talvegue:sacola');
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

function salvarCarrinho() {
  try {
    localStorage.setItem('talvegue:sacola', JSON.stringify(carrinho));
  } catch {}
}

function travarPagina(estado) {
  corpo.classList.toggle('travado', estado);
}

function fecharTudo() {
  menu.classList.remove('aberto');
  menu.setAttribute('aria-hidden', 'true');
  botaoMenu.setAttribute('aria-expanded', 'false');
  botaoMenu.setAttribute('aria-label', 'Abrir menu');
  sacola.classList.remove('aberta');
  sacola.setAttribute('aria-hidden', 'true');
  fundoSacola.classList.remove('ativo');
  provador.classList.remove('aberto');
  provador.setAttribute('aria-hidden', 'true');
  fundoProvador.classList.remove('ativo');
  vistaRapida.classList.remove('aberta');
  vistaRapida.setAttribute('aria-hidden', 'true');
  travarPagina(false);
}

function alternarMenu() {
  const abrir = botaoMenu.getAttribute('aria-expanded') !== 'true';
  fecharTudo();
  if (!abrir) return;
  menu.classList.add('aberto');
  menu.setAttribute('aria-hidden', 'false');
  botaoMenu.setAttribute('aria-expanded', 'true');
  botaoMenu.setAttribute('aria-label', 'Fechar menu');
  travarPagina(true);
}

function abrirSacola() {
  fecharTudo();
  sacola.classList.add('aberta');
  sacola.setAttribute('aria-hidden', 'false');
  fundoSacola.classList.add('ativo');
  travarPagina(true);
}

function abrirProvador() {
  fecharTudo();
  provador.classList.add('aberto');
  provador.setAttribute('aria-hidden', 'false');
  fundoProvador.classList.add('ativo');
  travarPagina(true);
  atualizarProvador();
}

function aviso(texto) {
  window.clearTimeout(timerToast);
  toast.textContent = texto;
  toast.classList.add('visivel');
  timerToast = window.setTimeout(() => toast.classList.remove('visivel'), 2600);
}

function desenharCarrinho() {
  document.querySelectorAll('[data-cart-count]').forEach(item => item.textContent = carrinho.length);
  if (!carrinho.length) {
    itensSacola.innerHTML = '<p class="sacola-vazia">Nada aqui ainda. A Série 01 continua logo atrás.</p>';
    totalSacola.textContent = moeda.format(0);
    salvarCarrinho();
    return;
  }

  itensSacola.innerHTML = carrinho.map((item, indice) => `
    <article class="sacola-item">
      <div class="sacola-miniatura">${item.nome.charAt(0)}</div>
      <div class="sacola-item-info"><strong>${item.nome}</strong><span>${moeda.format(item.preco)}</span></div>
      <button type="button" data-remove="${indice}">remover</button>
    </article>
  `).join('');

  totalSacola.textContent = moeda.format(carrinho.reduce((soma, item) => soma + item.preco, 0));
  salvarCarrinho();
}

function adicionar(nome, preco) {
  carrinho.push({ nome, preco });
  desenharCarrinho();
  aviso(`${nome} entrou na sacola.`);
}

function adicionarDoBotao(botao) {
  const produto = botao.closest('[data-product]');
  if (!produto) return;
  const nome = produto.dataset.product;
  const preco = Number(produto.dataset.price);
  adicionar(nome, preco);
  const textoOriginal = botao.innerHTML;
  botao.innerHTML = 'Adicionado <span>✓</span>';
  window.setTimeout(() => botao.innerHTML = textoOriginal, 1300);
}

function abrirVistaRapida(nome) {
  const dados = catalogo[nome];
  if (!dados) return;
  fecharTudo();
  produtoRapido = nome;
  vistaRapida.querySelector('[data-quick-code]').textContent = dados.codigo;
  vistaRapida.querySelector('[data-quick-name]').textContent = nome;
  vistaRapida.querySelector('[data-quick-copy]').textContent = dados.descricao;
  const silhueta = vistaRapida.querySelector('.vista-silhueta');
  silhueta.className = `vista-silhueta ${dados.classe}`;
  vistaRapida.classList.add('aberta');
  vistaRapida.setAttribute('aria-hidden', 'false');
  travarPagina(true);
}

function atualizarRolagem() {
  const atual = window.scrollY;
  const limite = document.documentElement.scrollHeight - window.innerHeight;
  progresso.style.transform = `scaleX(${limite > 0 ? atual / limite : 0})`;
  topo.classList.toggle('rolado', atual > 18);
  if (!corpo.classList.contains('travado')) topo.classList.toggle('oculto', atual > rolagemAnterior && atual > 160);
  rolagemAnterior = atual;
}

function prepararRevelacao() {
  const elementos = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    elementos.forEach(item => item.classList.add('visivel'));
    return;
  }
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('visivel');
      observador.unobserve(entrada.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -8% 0px' });
  elementos.forEach(item => observador.observe(item));
}

function prepararPonteiro() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const ponteiro = document.querySelector('.ponteiro');
  window.addEventListener('pointermove', evento => {
    ponteiro.style.left = `${evento.clientX}px`;
    ponteiro.style.top = `${evento.clientY}px`;
    ponteiro.classList.add('ativo');
  }, { passive: true });
  document.addEventListener('pointerover', evento => ponteiro.classList.toggle('link', Boolean(evento.target.closest('a, button, input'))));
  document.documentElement.addEventListener('mouseleave', () => ponteiro.classList.remove('ativo'));
}

function prepararInclinacao() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(area => {
    const molde = area.querySelector('.molde');
    if (!molde) return;
    area.addEventListener('pointermove', evento => {
      const caixa = area.getBoundingClientRect();
      const x = (evento.clientX - caixa.left) / caixa.width - .5;
      const y = (evento.clientY - caixa.top) / caixa.height - .5;
      molde.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 6}deg) translate3d(${x * 10}px, ${y * 8}px, 0)`;
    });
    area.addEventListener('pointerleave', () => molde.style.transform = '');
  });
}

function trocarTecido(botao) {
  const nome = botao.dataset.swatch;
  if (!tecidos[nome]) return;
  document.querySelectorAll('[data-swatch]').forEach(item => item.classList.toggle('ativo', item === botao));
  const palco = document.querySelector('[data-swatch-stage]');
  palco.dataset.swatchStage = nome;
  palco.querySelector('[data-swatch-code]').textContent = tecidos[nome].codigo;
}

function atualizarProvador() {
  const altura = Number(document.querySelector('[data-height]').value);
  const torax = Number(document.querySelector('[data-chest]').value);
  document.querySelector('[data-height-output]').textContent = `${altura} cm`;
  document.querySelector('[data-chest-output]').textContent = `${torax} cm`;

  let indice = torax < 88 ? 0 : torax < 98 ? 1 : torax < 108 ? 2 : torax < 120 ? 3 : 4;
  if (altura > 188 && indice < 4) indice += 1;
  if (modoCaimento === 'solto' && indice < 4) indice += 1;
  if (modoCaimento === 'amplo' && indice < 3) indice += 2;
  const tamanhos = ['PP', 'P', 'M', 'G', 'GG'];
  const copias = {
    preciso: 'Linha próxima ao corpo, mantendo mobilidade suficiente para o uso diário.',
    solto: 'Estrutura equilibrada, com espaço para uma camada leve por baixo.',
    amplo: 'Volume deliberado, ombro mais baixo e leitura mais arquitetônica da peça.'
  };
  document.querySelector('[data-size-result]').textContent = tamanhos[Math.min(indice, 4)];
  document.querySelector('[data-size-copy]').textContent = copias[modoCaimento];
}

botaoMenu.addEventListener('click', alternarMenu);
document.querySelectorAll('[data-open-cart]').forEach(botao => botao.addEventListener('click', abrirSacola));
document.querySelector('[data-close-cart]').addEventListener('click', fecharTudo);
fundoSacola.addEventListener('click', fecharTudo);
document.querySelectorAll('[data-open-fit]').forEach(botao => botao.addEventListener('click', abrirProvador));
document.querySelector('[data-close-fit]').addEventListener('click', fecharTudo);
fundoProvador.addEventListener('click', fecharTudo);
document.querySelector('[data-close-quick]').addEventListener('click', fecharTudo);

document.querySelectorAll('[data-add-cart]').forEach(botao => botao.addEventListener('click', () => adicionarDoBotao(botao)));
document.querySelectorAll('[data-quick]').forEach(botao => botao.addEventListener('click', () => abrirVistaRapida(botao.dataset.quick)));
document.querySelector('[data-quick-add]').addEventListener('click', () => {
  if (!produtoRapido) return;
  const dados = catalogo[produtoRapido];
  adicionar(produtoRapido, dados.preco);
  fecharTudo();
  abrirSacola();
});

itensSacola.addEventListener('click', evento => {
  const botao = evento.target.closest('[data-remove]');
  if (!botao) return;
  carrinho.splice(Number(botao.dataset.remove), 1);
  desenharCarrinho();
});

document.querySelector('[data-checkout]').addEventListener('click', () => {
  if (!carrinho.length) return aviso('Escolha uma peça antes de continuar.');
  aviso('Checkout demonstrativo pronto para receber o meio de pagamento real.');
});

document.querySelectorAll('[data-swatch]').forEach(botao => botao.addEventListener('click', () => trocarTecido(botao)));
document.querySelectorAll('[data-fit-mode]').forEach(botao => botao.addEventListener('click', () => {
  modoCaimento = botao.dataset.fitMode;
  document.querySelectorAll('[data-fit-mode]').forEach(item => item.classList.toggle('ativo', item === botao));
  atualizarProvador();
}));
document.querySelector('[data-height]').addEventListener('input', atualizarProvador);
document.querySelector('[data-chest]').addEventListener('input', atualizarProvador);
document.querySelectorAll('.menu a').forEach(link => link.addEventListener('click', fecharTudo));

document.addEventListener('keydown', evento => {
  if (evento.key === 'Escape') fecharTudo();
});
window.addEventListener('scroll', atualizarRolagem, { passive: true });
window.addEventListener('resize', () => {
  if (window.innerWidth > 1100 && menu.classList.contains('aberto')) fecharTudo();
}, { passive: true });

prepararRevelacao();
prepararPonteiro();
prepararInclinacao();
desenharCarrinho();
atualizarProvador();
atualizarRolagem();
