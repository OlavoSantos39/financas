
const CHAVE = "meuFinanceiro_movimentacoes";

function carregarMovimentacoes() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

let movimentacoes = carregarMovimentacoes();

const form = document.getElementById("formMovimentacao");
const lista = document.getElementById("listaMovimentacoes");

const formatarMoeda = (centavos) => {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
};

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(movimentacoes));
    return true;
  } catch {
    alert("Não foi possível salvar. Verifique o armazenamento.");
    return false;
  }
}

function atualizarTela() {
  let ganhos = 0;
  let gastos = 0;

  lista.innerHTML = "";

  movimentacoes.forEach((item) => {
    if (item.tipo === "ganho") {
      ganhos += item.valor;
    } else {
      gastos += item.valor;
    }

    const li = document.createElement("li");
    li.className = "movimentacao";

    const info = document.createElement("div");
    info.className = "info";

    const descricao = document.createElement("strong");
    descricao.textContent = item.descricao;

    const data = document.createElement("small");
    data.textContent = new Date(item.data).toLocaleString("pt-BR");

    info.append(descricao, data);

    const acoes = document.createElement("div");
    acoes.className = "acoes";

    const valor = document.createElement("span");
    valor.className =
      item.tipo === "ganho" ? "valor-ganho" : "valor-gasto";

    valor.textContent =
      (item.tipo === "ganho" ? "+ " : "- ") +
      formatarMoeda(item.valor);

    const botao = document.createElement("button");
    botao.className = "excluir";
    botao.textContent = "🗑";
    botao.setAttribute("aria-label", "Excluir movimentação");

    botao.addEventListener("click", () => {
      excluirMovimentacao(item.id);
    });

    acoes.append(valor, botao);
    li.append(info, acoes);
    lista.appendChild(li);
  });

  document.getElementById("totalGanhos").textContent =
    formatarMoeda(ganhos);

  document.getElementById("totalGastos").textContent =
    formatarMoeda(gastos);

  document.getElementById("saldo").textContent =
    formatarMoeda(ganhos - gastos);

  document.getElementById("mensagemVazia").style.display =
    movimentacoes.length === 0 ? "block" : "none";
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const descricao = document.getElementById("descricao")
    .value.trim();

  const valorDigitado = Number(
    document.getElementById("valor").value
  );

  const tipo = document.getElementById("tipo").value;

  const valor = Math.round(valorDigitado * 100);

  if (
    !descricao ||
    !Number.isSafeInteger(valor) ||
    valor <= 0
  ) {
    alert("Informe uma descrição e um valor válido.");
    return;
  }

  const movimentacao = {
    id: crypto.randomUUID(),
    descricao,
    valor,
    tipo,
    data: new Date().toISOString()
  };

  movimentacoes.unshift(movimentacao);

  if (!salvar()) {
    movimentacoes.shift();
    return;
  }

  atualizarTela();
  form.reset();
});

function excluirMovimentacao(id) {
  if (!confirm("Deseja excluir esta movimentação?")) {
    return;
  }

  const anteriores = movimentacoes;

  movimentacoes = movimentacoes.filter(
    (item) => item.id !== id
  );

  if (!salvar()) {
    movimentacoes = anteriores;
    return;
  }

  atualizarTela();
}

// Carrega os dados salvos ao abrir a aplicação
atualizarTela();
