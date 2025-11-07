// caixa.js

// ==============================
// ELEMENTOS PRINCIPAIS
// ==============================
const input = document.getElementById("buscar");
const lista = document.getElementById("produtos");
const totalElement = document.getElementById("total");
const sugestoesBox = document.getElementById("sugestoes");
const barra = document.querySelector(".barra-busca");

let total = 0;
let selectedIndex = -1;
let preenchidoAutomatico = false;
let produtosDisponiveis = [];

// ==============================
// BUSCA PRODUTOS DO PHP
// ==============================
async function carregarProdutos() {
  try {
    const response = await fetch("https://empretecsystem.onrender.com/caixa/buscar_produtos.php");
    const data = await response.json();
    produtosDisponiveis = data;
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

carregarProdutos();

// ==============================
// MOSTRAR SUGESTÕES
// ==============================
function mostrarSugestoes(listaFiltrada) {
  sugestoesBox.innerHTML = "";
  selectedIndex = -1;

  if (!listaFiltrada.length) {
    sugestoesBox.style.display = "none";
    return;
  }

  listaFiltrada.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.addEventListener("click", () => {
      input.value = item;
      sugestoesBox.innerHTML = "";
      sugestoesBox.style.display = "none";
      input.focus();
    });
    sugestoesBox.appendChild(li);
  });

  sugestoesBox.style.display = "block";
}

// ==============================
// FILTRAR PRODUTOS
// ==============================
input.addEventListener("input", () => {
  preenchidoAutomatico = false;
  const val = input.value.trim().toLowerCase();

  if (val === "") {
    sugestoesBox.innerHTML = "";
    sugestoesBox.style.display = "none";
    return;
  }

  const filtrados = produtosDisponiveis.filter(p => p.toLowerCase().includes(val));
  mostrarSugestoes(filtrados);
});

// ==============================
// NAVEGAÇÃO E ENTER
// ==============================
input.addEventListener("keydown", (e) => {
  const itens = Array.from(sugestoesBox.querySelectorAll("li"));

  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    if (!itens.length) return;
    e.preventDefault();

    selectedIndex = e.key === "ArrowDown"
      ? (selectedIndex + 1) % itens.length
      : (selectedIndex - 1 + itens.length) % itens.length;

    itens.forEach(i => i.classList.remove("selected"));
    itens[selectedIndex].classList.add("selected");
    itens[selectedIndex].scrollIntoView({ block: "nearest" });
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();

    if (!preenchidoAutomatico) {
      const encontrado = produtosDisponiveis.find(p => p.toLowerCase().startsWith(input.value.trim().toLowerCase()));
      if (encontrado) {
        input.value = encontrado;
        preenchidoAutomatico = true;
        sugestoesBox.innerHTML = "";
        sugestoesBox.style.display = "none";
        return;
      }
    }

    if (input.value.trim() === "") return;
    const produto = input.value.trim();
    const partes = produto.split(" ");
    let preco = parseFloat(partes[partes.length - 1].replace(",", ".")) || 0;

    const li = document.createElement("li");
    li.textContent = produto;
    lista.appendChild(li);

    total += preco;
    totalElement.textContent = "R$" + total.toFixed(2).replace(".", ",");

    input.value = "";
    sugestoesBox.innerHTML = "";
    sugestoesBox.style.display = "none";
    preenchidoAutomatico = false;
  }
});

// ==============================
// FECHAR SUGESTÕES AO CLICAR FORA
// ==============================
document.addEventListener("click", (e) => {
  if (!barra.contains(e.target)) {
    sugestoesBox.innerHTML = "";
    sugestoesBox.style.display = "none";
  }
});

// ==============================
// FINALIZAR COMPRA
// ==============================
const finalizarBtn = document.getElementById("finalizar");
const overlay = document.getElementById("overlay");
const proximoBtn = document.getElementById("proximo");
const concluirBtn = document.getElementById("concluir");

const etapa1 = document.getElementById("etapa1");
const etapa2 = document.getElementById("etapa2");
const conteudoPagamento = document.getElementById("conteudoPagamento");

const btnPix = document.getElementById("btnPix");
const btnDinheiro = document.getElementById("btnDinheiro");

finalizarBtn.addEventListener("click", () => {
  overlay.style.display = "flex";
  etapa1.style.display = "block";
  etapa2.style.display = "none";
});

proximoBtn.addEventListener("click", () => {
  etapa1.style.display = "none";
  etapa2.style.display = "block";
});

concluirBtn.addEventListener("click", async () => {
  const nomeCliente = document.getElementById("nomeCliente").value.trim() || "Sem nome";
  const notaAdicional = document.getElementById("notaAdicional").value.trim() || "";
  const pedidoItens = Array.from(lista.querySelectorAll("li")).map(li => li.textContent);
  const pedidoTexto = pedidoItens.join(", ");
  const valorTotal = parseFloat(totalElement.textContent.replace("R$", "").replace(",", ".")) || 0;

  if (pedidoItens.length === 0) {
    alert("Adicione produtos antes de finalizar.");
    return;
  }

  // ==============================
  // Detecta o tipo de pagamento
  // ==============================
  let pagamentoTipo = conteudoPagamento.querySelector("#tipoPagamento")?.value;

  if (!pagamentoTipo) {
    alert("Selecione uma forma de pagamento antes de concluir o pedido.");
    return;
  }

  try {
    const response = await fetch("caixa.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        nome_cliente: nomeCliente,
        nota_adicional: notaAdicional,
        pedido: pedidoTexto,
        pagamento: pagamentoTipo,
        valor: valorTotal
      })
    });

    const data = await response.json();

    if (data.success) {
      overlay.style.display = "none";
      conteudoPagamento.innerHTML = "";
      lista.innerHTML = "";
      total = 0;
      totalElement.textContent = "R$0,00";

      if (data.tipo_caixa === "normal") {
        window.location.href = "https://empretecsystem.onrender.com/pendentes/pendentes.html";
      }
    } else {
      alert((data.error || "Erro ao registrar pedido") + (data.debug ? "\n\nDEBUG: " + data.debug : ""));
    }
  } catch (err) {
    console.error(err);
    alert("Falha ao enviar pedido para o servidor.");
  }
});

// ==============================
// BOTÕES DE PAGAMENTO
// ==============================
btnPix.addEventListener("click", () => {
  conteudoPagamento.innerHTML = `
    <input type="hidden" id="tipoPagamento" value="pix">
    <img src="pixtattyeany.png" alt="QR Code PIX">
  `;
});

btnDinheiro.addEventListener("click", () => {
  const totalCompra = parseFloat(totalElement.textContent.replace("R$", "").replace(",", ".")) || 0;

  conteudoPagamento.innerHTML = `
    <input type="hidden" id="tipoPagamento" value="dinheiro">
    <label for="valorRecebido">Valor recebido (R$)</label>
    <input type="number" id="valorRecebido" placeholder="Digite o valor recebido">
    <label for="troco">Troco (R$)</label>
    <input type="number" id="troco" placeholder="Troco a devolver" readonly>
  `;

  const valorRecebidoInput = document.getElementById("valorRecebido");
  const trocoInput = document.getElementById("troco");

  valorRecebidoInput.addEventListener("input", () => {
    const recebido = parseFloat(valorRecebidoInput.value) || 0;
    trocoInput.value = recebido >= totalCompra ? (recebido - totalCompra).toFixed(2) : "0.00";
  });
});
