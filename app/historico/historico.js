document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('.tabela tbody');

  async function carregarHistorico() {
    try {
      const res = await fetch('historico_fetch.php');
      if (!res.ok) throw new Error('Erro ao buscar histórico');
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      tbody.innerHTML = '';

      if (!data || data.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="7" style="text-align:center;">Nenhum pedido finalizado ainda.</td>';
        tbody.appendChild(tr);
        return;
      }

      data.forEach(p => {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = p.id;

        const tdNome = document.createElement('td');
        tdNome.textContent = p.nome_cliente || '-';

        const tdPedido = document.createElement('td');
        tdPedido.textContent = p.pedido || '-';

        const tdPagamento = document.createElement('td');
        tdPagamento.textContent = p.pagamento || '-';

        const tdValor = document.createElement('td');
        tdValor.textContent = 'R$ ' + (parseFloat(p.valor) || 0).toFixed(2);

        const tdNota = document.createElement('td');
        tdNota.textContent = p.nota_adicional && p.nota_adicional.trim() !== '' ? p.nota_adicional : '-';
        tdNota.classList.add('nota-adicional');

        const tdAcoes = document.createElement('td');
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.classList.add('botao-excluir');
        btnExcluir.dataset.id = p.id;
        tdAcoes.appendChild(btnExcluir);

        tr.appendChild(tdId);
        tr.appendChild(tdNome);
        tr.appendChild(tdPedido);
        tr.appendChild(tdPagamento);
        tr.appendChild(tdValor);
        tr.appendChild(tdNota);
        tr.appendChild(tdAcoes);

        tbody.appendChild(tr);
      });

    } catch (err) {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Erro ao carregar histórico</td></tr>';
    }
  }

  // ✅ Evento de exclusão utilizando delegação (não duplica a cada reload)
  tbody.addEventListener('click', async e => {
    if (!e.target.classList.contains('botao-excluir')) return;

    const id = e.target.dataset.id;
    if (!confirm(`Deseja realmente excluir o pedido #${id}?`)) return;

    try {
      const res = await fetch('historico_delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const result = await res.json();
      if (result.success) e.target.closest('tr').remove();
      else alert('Erro ao excluir o pedido.');
    } catch {
      alert('Erro ao excluir o pedido.');
    }
  });

  carregarHistorico();
  setInterval(carregarHistorico, 5000);
});
