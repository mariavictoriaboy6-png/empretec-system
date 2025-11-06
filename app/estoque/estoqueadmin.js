document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('tbody');

  // ======== FUNÇÃO PRINCIPAL DE CARREGAR PRODUTOS ========
  async function carregarEstoqueAdmin() {
    try {
      const res = await fetch('estoqueadmin_fetch.php');
      const data = await res.json();

      tbody.innerHTML = '';

      data.forEach(prod => {
        const tr = criarLinhaProduto(prod);
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Erro ao carregar estoque admin:', err);
    }
  }

  // ======== CRIA UMA LINHA DE PRODUTO NA TABELA ========
  function criarLinhaProduto(prod) {
    const tr = document.createElement('tr');

    // Nome
    const tdNome = document.createElement('td');
    tdNome.textContent = prod.nome_produto;

    // Quantidade (+ e -)
    const tdQtd = document.createElement('td');
    tdQtd.classList.add('quantidade-campo');

    const btnMenos = document.createElement('button');
    btnMenos.textContent = '-';
    const spanQtd = document.createElement('span');
    spanQtd.textContent = prod.quantidade;
    spanQtd.classList.add('quantidade');
    const btnMais = document.createElement('button');
    btnMais.textContent = '+';

    tdQtd.append(btnMenos, spanQtd, btnMais);

    // Botão de excluir
    const tdAcoes = document.createElement('td');
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️';
    btnExcluir.classList.add('btn-excluir');
    tdAcoes.appendChild(btnExcluir);

    // Atualiza estilo visual
    const atualizarClasse = () => {
      const qtd = parseInt(spanQtd.textContent);
      tr.classList.toggle('zerado', qtd <= 0);
    };
    atualizarClasse();

    // ======== ATUALIZA BD COM DEBOUNCE ========
    let ultimoUpdate = 0;
    const enviarUpdate = async (novaQtd) => {
      const agora = Date.now();
      if (agora - ultimoUpdate < 200) return; // evita flood de cliques
      ultimoUpdate = agora;

      try {
        const res = await fetch('estoqueadmin_update.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: prod.id, quantidade: novaQtd })
        });
        const data = await res.json();

        if (data.success) {
          spanQtd.textContent = data.quantidade;
          atualizarClasse();
        } else {
          console.error('Erro no update:', data);
          await carregarEstoqueAdmin();
        }
      } catch (err) {
        console.error('Erro ao atualizar estoque:', err);
        await carregarEstoqueAdmin();
      }
    };

    // ======== EVENTOS DOS BOTÕES ========
    btnMais.addEventListener('click', () => {
      const novaQtd = parseInt(spanQtd.textContent) + 1;
      spanQtd.textContent = novaQtd;
      atualizarClasse();
      enviarUpdate(novaQtd);
    });

    btnMenos.addEventListener('click', () => {
      const atual = parseInt(spanQtd.textContent);
      if (atual > 0) {
        const novaQtd = atual - 1;
        spanQtd.textContent = novaQtd;
        atualizarClasse();
        enviarUpdate(novaQtd);
      }
    });

    // Excluir produto
    btnExcluir.addEventListener('click', async () => {
      if (!confirm(`Excluir produto "${prod.nome_produto}"?`)) return;
      try {
        const res = await fetch('estoqueadmin_deletar.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: prod.id })
        });
        const data = await res.json();
        if (data.success) {
          await carregarEstoqueAdmin();
        } else {
          alert('Erro ao excluir produto!');
        }
      } catch (err) {
        console.error('Erro ao excluir produto:', err);
      }
    });

    tr.append(tdNome, tdQtd, tdAcoes);
    return tr;
  }

  // ======== INSERIR NOVO PRODUTO ========
  document.getElementById('btn-adicionar').addEventListener('click', async () => {
    const nomeInput = document.getElementById('nome-produto');
    const precoInput = document.getElementById('preco-produto');
    const qtdInput = document.getElementById('quantidade-produto');

    const nome = nomeInput.value.trim();
    const preco = parseFloat(precoInput.value);
    const qtd = parseInt(qtdInput.value);

    if (!nome || isNaN(preco) || isNaN(qtd)) {
      alert('Preencha todos os campos corretamente!');
      return;
    }

    // Limpa os campos para poder inserir outro
    nomeInput.value = '';
    precoInput.value = '';
    qtdInput.value = '';
    nomeInput.focus();

    try {
      const res = await fetch('estoqueadmin_insert.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_produto: nome, preco, quantidade: qtd })
      });
      const data = await res.json();

      if (data.success && data.produto) {
        const tr = criarLinhaProduto(data.produto);
        tbody.prepend(tr); // adiciona no topo da tabela
      } else {
        alert('Erro ao adicionar produto!');
      }
    } catch (err) {
      console.error('Erro ao inserir produto:', err);
      alert('Falha ao conectar ao servidor!');
    }
  });

  // ======== INICIAL ========
  carregarEstoqueAdmin();
});
