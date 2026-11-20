/* ==========================================================
   LUMINA - Funcionalidades do site
   ========================================================== */

// ---------- 1. DADOS: lista de produtos do cardápio ----------
const produtos = [
  { id: 1,  nome: "Brigadeiro Gourmet",  cat: "doces",    preco: 3.50,  emoji: "🍫", cor: "#fde0d0", desc: "Chocolate belga com granulado crocante." },
  { id: 2,  nome: "Bolo de Cenoura",     cat: "doces",    preco: 7.00,  emoji: "🥕", cor: "#ffe9c7", desc: "Fatia com generosa cobertura de chocolate." },
  { id: 3,  nome: "Cupcake de Morango",  cat: "doces",    preco: 8.50,  emoji: "🧁", cor: "#fde8ef", desc: "Massa fofinha com chantilly de morango." },
  { id: 4,  nome: "Torta de Limão",      cat: "doces",    preco: 9.00,  emoji: "🍋", cor: "#f4f9d2", desc: "Base crocante, creme de limão e merengue." },
  { id: 5,  nome: "Coxinha de Frango",   cat: "salgados", preco: 6.00,  emoji: "🍗", cor: "#ffe9c7", desc: "Massa leve com recheio de frango temperado." },
  { id: 6,  nome: "Pastel de Queijo",    cat: "salgados", preco: 6.50,  emoji: "🧀", cor: "#fff3c4", desc: "Sequinho, crocante e recheado de queijo." },
  { id: 7,  nome: "Esfiha de Carne",     cat: "salgados", preco: 5.50,  emoji: "🥟", cor: "#fde0d0", desc: "Assada na hora, com carne bem temperada." },
  { id: 8,  nome: "Pão de Queijo",       cat: "salgados", preco: 4.00,  emoji: "🥯", cor: "#fff3c4", desc: "Porção quentinha, macio por dentro." },
  { id: 9,  nome: "Suco Natural",        cat: "bebidas",  preco: 7.00,  emoji: "🍊", cor: "#ffe9c7", desc: "Copo de 400 ml, sabor do dia." },
  { id: 10, nome: "Refrigerante Lata",   cat: "bebidas",  preco: 5.00,  emoji: "🥤", cor: "#e3f1fd", desc: "Lata de 350 ml, gelada." },
  { id: 11, nome: "Café Coado",          cat: "bebidas",  preco: 4.50,  emoji: "☕", cor: "#f0e1d6", desc: "Café fresquinho, perfeito com um doce." },
  { id: 12, nome: "Chocolate Quente",    cat: "bebidas",  preco: 8.00,  emoji: "🍵", cor: "#f0e1d6", desc: "Cremoso, com chantilly por cima." }
];

const TAXA_ENTREGA = 8.00;
let carrinho = [];          // lista de {id, qtd}
let categoriaAtual = "todos";

// ---------- Atalhos para elementos da página ----------
const $ = (id) => document.getElementById(id);

// ---------- Funções auxiliares ----------
// Formata número como moeda brasileira
function moeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Mostra uma mensagem rápida na parte de baixo da tela
let toastTimer;
function mostrarToast(texto) {
  const toast = $("toast");
  toast.textContent = texto;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---------- 2. CARDÁPIO + FILTRO POR CATEGORIA ----------
function renderizarCardapio() {
  const lista = categoriaAtual === "todos"
    ? produtos
    : produtos.filter((p) => p.cat === categoriaAtual);

  $("menuGrid").innerHTML = lista.map((p) => `
    <article class="card">
      <div class="card-img" style="background:${p.cor}">${p.emoji}</div>
      <div class="card-body">
        <h3>${p.nome}</h3>
        <p>${p.desc}</p>
        <div class="card-footer">
          <span class="price">${moeda(p.preco)}</span>
          <button class="btn-add" data-add="${p.id}">+ Adicionar</button>
        </div>
      </div>
    </article>
  `).join("");
}

// Clique nos botões de filtro
$("filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  categoriaAtual = btn.dataset.category;
  renderizarCardapio();
});

// Clique em "+ Adicionar" (delegação de eventos)
$("menuGrid").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (btn) adicionarAoCarrinho(Number(btn.dataset.add));
});

// ---------- 3. CARRINHO DE PEDIDOS ----------
function adicionarAoCarrinho(id) {
  const item = carrinho.find((i) => i.id === id);
  if (item) item.qtd++;
  else carrinho.push({ id, qtd: 1 });
  atualizarCarrinho();
  mostrarToast("✅ " + produtos.find((p) => p.id === id).nome + " adicionado!");
}

function alterarQuantidade(id, delta) {
  const item = carrinho.find((i) => i.id === id);
  if (!item) return;
  item.qtd += delta;
  if (item.qtd <= 0) carrinho = carrinho.filter((i) => i.id !== id);
  atualizarCarrinho();
}

function removerItem(id) {
  carrinho = carrinho.filter((i) => i.id !== id);
  atualizarCarrinho();
}

// Calcula o total (com taxa de entrega, se houver itens e entrega escolhida)
function calcularTotal() {
  let total = carrinho.reduce((soma, i) => {
    return soma + produtos.find((p) => p.id === i.id).preco * i.qtd;
  }, 0);
  if (carrinho.length > 0 && $("delivery").value === "entrega") total += TAXA_ENTREGA;
  return total;
}

function atualizarCarrinho() {
  const lista = $("cartList");

  if (carrinho.length === 0) {
    lista.innerHTML = '<li class="empty">Seu pedido está vazio. Escolha algo gostoso no cardápio! 😋</li>';
  } else {
    lista.innerHTML = carrinho.map((i) => {
      const p = produtos.find((x) => x.id === i.id);
      return `
        <li class="cart-item">
          <div class="cart-item-info">${p.emoji} ${p.nome}<br><small>${moeda(p.preco)} cada</small></div>
          <div class="qty">
            <button data-minus="${p.id}" aria-label="Diminuir">−</button>
            <span>${i.qtd}</span>
            <button data-plus="${p.id}" aria-label="Aumentar">+</button>
          </div>
          <button class="remove-btn" data-remove="${p.id}" aria-label="Remover">🗑️</button>
        </li>`;
    }).join("");
  }

  $("cartTotal").textContent = moeda(calcularTotal());
  $("navCount").textContent = carrinho.reduce((s, i) => s + i.qtd, 0);

  // Guarda o carrinho no navegador (não se perde ao recarregar a página)
  try { localStorage.setItem("lumina_carrinho", JSON.stringify(carrinho)); } catch (e) {}
}

// Botões + / − / lixeira dentro do carrinho
$("cartList").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.plus)   alterarQuantidade(Number(b.dataset.plus), 1);
  if (b.dataset.minus)  alterarQuantidade(Number(b.dataset.minus), -1);
  if (b.dataset.remove) removerItem(Number(b.dataset.remove));
});

// Botão "Esvaziar pedido"
$("btnClear").addEventListener("click", () => {
  if (carrinho.length === 0) return mostrarToast("Seu pedido já está vazio.");
  carrinho = [];
  atualizarCarrinho();
  mostrarToast("🗑️ Pedido esvaziado.");
});

// ---------- 4. FORMULÁRIO COM VALIDAÇÃO ----------
// Mostra/esconde o campo de endereço e atualiza o total
$("delivery").addEventListener("change", () => {
  $("addressBox").classList.toggle("hidden", $("delivery").value !== "entrega");
  atualizarCarrinho();
});

// Define ou limpa a mensagem de erro de um campo
function marcarErro(campo, erroId, mensagem) {
  $(erroId).textContent = mensagem;
  $(campo).classList.toggle("invalid", mensagem !== "");
  return mensagem === "";
}

$("orderForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = $("name").value.trim();
  const telefone = $("phone").value.replace(/\D/g, ""); // só números
  const entrega = $("delivery").value;
  const endereco = $("address").value.trim();

  // Valida cada campo
  let ok = true;
  ok = marcarErro("name", "errName",
    nome.split(" ").length < 2 || nome.length < 5 ? "Digite seu nome completo." : "") && ok;
  ok = marcarErro("phone", "errPhone",
    telefone.length < 10 || telefone.length > 11 ? "Digite um telefone válido com DDD." : "") && ok;
  if (entrega === "entrega") {
    ok = marcarErro("address", "errAddress",
      endereco.length < 8 ? "Digite o endereço completo." : "") && ok;
  } else {
    marcarErro("address", "errAddress", "");
  }

  if (carrinho.length === 0) {
    mostrarToast("⚠️ Adicione itens ao pedido antes de finalizar.");
    return;
  }
  if (!ok) return;

  // Monta o resumo do pedido
  const itens = carrinho.map((i) => {
    const p = produtos.find((x) => x.id === i.id);
    return `<li>${i.qtd}x ${p.nome}</li>`;
  }).join("");

  $("modalText").innerHTML = `
    <p>Obrigado, <strong>${nome.split(" ")[0]}</strong>! Seu pedido foi recebido:</p>
    <ul style="margin:10px 0 10px 20px">${itens}</ul>
    <p>${entrega === "entrega" ? "🚚 Entrega em: " + endereco : "🏪 Retirada no balcão"}</p>
    <p><strong>Total: ${moeda(calcularTotal())}</strong></p>
    <p style="margin-top:8px">Entraremos em contato pelo telefone informado.</p>`;
  $("modal").classList.remove("hidden");

  // Limpa tudo após finalizar
  carrinho = [];
  $("orderForm").reset();
  $("addressBox").classList.add("hidden");
  atualizarCarrinho();
});

// Fechar a janela de confirmação
$("modalClose").addEventListener("click", () => $("modal").classList.add("hidden"));
$("modal").addEventListener("click", (e) => {
  if (e.target === $("modal")) $("modal").classList.add("hidden");
});

// ---------- 5. CALCULADORA DE FESTA ----------
$("btnCalc").addEventListener("click", () => {
  const convidados = parseInt($("guests").value, 10);
  const fator = parseFloat($("partyType").value);

  if (!convidados || convidados < 1) {
    $("calcResult").innerHTML = "<p>⚠️ Informe um número válido de convidados.</p>";
    return;
  }

  // Estimativa por pessoa, multiplicada pelo fator do tipo de evento
  const salgados = Math.ceil(convidados * 6 * fator);
  const doces    = Math.ceil(convidados * 4 * fator);
  const bebidas  = Math.ceil(convidados * 2 * fator);

  // Valor estimado usando preços médios do cardápio
  const estimativa = salgados * 6.00 + doces * 3.50 + bebidas * 5.00;

  $("calcResult").innerHTML = `
    <div>
      <h3>Para ${convidados} convidados:</h3>
      <ul>
        <li>🥟 <strong>${salgados}</strong> salgados</li>
        <li>🍫 <strong>${doces}</strong> doces</li>
        <li>🥤 <strong>${bebidas}</strong> bebidas</li>
      </ul>
      <p style="margin-top:10px">Valor estimado: <strong>${moeda(estimativa)}</strong></p>
    </div>`;
});

// ---------- 6. BOTÃO "SURPREENDA-ME" ----------
$("btnSurpresa").addEventListener("click", () => {
  const sorteado = produtos[Math.floor(Math.random() * produtos.length)];
  adicionarAoCarrinho(sorteado.id);
  mostrarToast(`🎁 Surpresa: ${sorteado.emoji} ${sorteado.nome} foi para o seu pedido!`);
});

// ---------- 7. MENU DO CELULAR ----------
$("menuToggle").addEventListener("click", () => $("nav").classList.toggle("open"));
// Fecha o menu ao clicar em um link
$("nav").addEventListener("click", (e) => {
  if (e.target.tagName === "A") $("nav").classList.remove("open");
});

// ---------- INICIALIZAÇÃO ----------
$("year").textContent = new Date().getFullYear();

// Recupera o carrinho salvo (se existir)
try {
  const salvo = JSON.parse(localStorage.getItem("lumina_carrinho"));
  if (Array.isArray(salvo)) carrinho = salvo.filter((i) => produtos.some((p) => p.id === i.id));
} catch (e) {}

renderizarCardapio();
atualizarCarrinho();