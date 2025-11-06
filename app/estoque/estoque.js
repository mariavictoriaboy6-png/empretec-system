document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('estoque-body');

  async function carregarEstoque() {
    try {
      const res = await fetch('estoque_fetch.php');
      const data = await res.json();

      tbody.innerHTML = '';

      data.forEach(produto => {
        const tr = document.createElement('tr');

        const tdNome = document.createElement('td');
        tdNome.textContent = produto.nome_produto;

        const tdQtd = document.createElement('td');
        tdQtd.textContent = produto.quantidade;

        if (produto.quantidade <= 0) {
          tr.classList.add('zerado');
        }

        tr.appendChild(tdNome);
        tr.appendChild(tdQtd);
        tbody.appendChild(tr);
      });

    } catch (err) {
      console.error('Erro ao carregar estoque:', err);
    }
  }

  carregarEstoque();
  setInterval(carregarEstoque, 2000); // atualiza em tempo real
});
