function atualizarPendentes() {
  fetch("pendentes_fetch.php")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector(".tabela tbody");
      const thead = document.querySelector(".tabela thead");
      const pedidosAtuais = new Map();

      if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">Nenhum pedido pendente</td></tr>`;
        return;
      }

      const tipoCaixa = data[0]?.tipo_caixa || "normal";

      // Cabeçalho dinâmico
      if (tipoCaixa === "producao") {
        thead.innerHTML = `
          <tr id="cabecalho">
            <th>ID</th>
            <th>Nome</th>
            <th>Pedido</th>
            <th>Pagamento</th>
            <th>Valor</th>
            <th>Nota adicional</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>`;
      } else {
        thead.innerHTML = `
          <tr id="cabecalho">
            <th>ID</th>
            <th>Nome</th>
            <th>Pedido</th>
            <th>Pagamento</th>
            <th>Valor</th>
            <th>Nota adicional</th>
            <th>Ações</th>
          </tr>`;
      }

      // Salva posição atual das linhas
      Array.from(tbody.children).forEach((tr) => {
        const id = tr.getAttribute("data-id");
        if (id) pedidosAtuais.set(id, tr);
      });

      const novosIds = new Set(data.map((p) => String(p.id)));
      Array.from(tbody.children).forEach((tr) => {
        const id = tr.getAttribute("data-id");
        if (id && !novosIds.has(id)) tr.remove();
      });

      data.forEach((pedido) => {
        const pago =
          pedido.pagamento_confirmado === true ||
          pedido.pagamento_confirmado === "t" ||
          pedido.pagamento_confirmado === 1;

        let tr = pedidosAtuais.get(String(pedido.id));
        const isNovo = !tr;
        if (!tr) {
          tr = document.createElement("tr");
          tr.setAttribute("data-id", pedido.id);
          tbody.appendChild(tr);
        }

        // Define cor e texto do status
        let statusLabel = pedido.status || "-";
        let statusColor = "#000";
        if (statusLabel === "nao_fez") {
          statusLabel = "Não fez";
          statusColor = "red";
        } else if (statusLabel === "fazendo") {
          statusLabel = "Fazendo";
          statusColor = "orange";
        } else if (statusLabel === "pronto") {
          statusLabel = "Pronto";
          statusColor = "green";
        } else if (statusLabel === "confirmado") {
          statusLabel = "Confirmado";
          statusColor = "gray";
        }

        let botoesHTML = "";

        // Caixa normal
        if (tipoCaixa === "normal") {
          if (!pago) {
            botoesHTML = `
              <button class="btn-acao btn-pagamento" onclick="mudarPagamento(${pedido.id})">
                Confirmar pagamento
              </button>`;
          } else {
            botoesHTML = `<span class="pago">Pagamento confirmado</span>`;
          }

          tr.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.nome_cliente || "-"}</td>
            <td>${pedido.pedido}</td>
            <td>${pedido.pagamento || "-"}</td>
            <td>R$ ${parseFloat(pedido.valor || 0).toFixed(2)}</td>
            <td>${pedido.nota_adicional || "-"}</td>
            <td>${botoesHTML}</td>
          `;
        } else {
          // Caixa produção
          botoesHTML = `
            <button class="btn-acao btn-status" onclick="mudarStatus(${pedido.id}, '${pedido.status}')">
              ${statusLabel === "Pronto" ? "Finalizar" : "Mudar status"}
            </button>`;

          if (!pago) {
            botoesHTML += `
              <button class="btn-acao btn-pagamento" onclick="mudarPagamento(${pedido.id})">
                Confirmar pagamento
              </button>`;
          } else {
            botoesHTML += `<span class="pago">Pagamento confirmado</span>`;
          }

          tr.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.nome_cliente || "-"}</td>
            <td>${pedido.pedido}</td>
            <td>${pedido.pagamento || "-"}</td>
            <td>R$ ${parseFloat(pedido.valor || 0).toFixed(2)}</td>
            <td>${pedido.nota_adicional || "-"}</td>
            <td style="color:${statusColor}; font-weight:600">${statusLabel}</td>
            <td>${botoesHTML}</td>
          `;
        }

        if (isNovo) tbody.appendChild(tr);
      });
    })
    .catch((err) => console.error("Erro ao buscar pendentes:", err));
}

// Funções de ação
function mudarPagamento(id) {
  fetch("confirmar_pagamento.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}`,
  })
    .then((r) => r.json())
    .then((res) => {
      if (res.success) atualizarPendentes();
      else alert(res.error || "Erro ao confirmar pagamento!");
    })
    .catch((err) => console.error(err));
}

function mudarStatus(id, statusAtual) {
  let proximoStatus;
  if (statusAtual === "nao_fez") proximoStatus = "fazendo";
  else if (statusAtual === "fazendo") proximoStatus = "pronto";
  else if (statusAtual === "pronto") proximoStatus = "confirmado";
  else proximoStatus = "confirmado";

  fetch("mudar_status.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}&status=${proximoStatus}`,
  })
    .then((r) => r.json())
    .then((res) => {
      if (res.success) atualizarPendentes();
      else alert(res.error || "Erro ao mudar status!");
    })
    .catch((err) => console.error(err));
}

// Atualização automática
setInterval(atualizarPendentes, 3000);
atualizarPendentes();
