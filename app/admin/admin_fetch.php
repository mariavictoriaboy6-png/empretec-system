<?php
require_once __DIR__ . '/../conexao.php';
session_start();

$id_admin = $_SESSION['id_admin'] ?? 1;

// Buscar loja associada ao admin
$query_loja = "
  SELECT l.id AS id_loja, l.nome_loja, COALESCE(l.caixa_inicial, 0) AS caixa_inicial, COALESCE(l.caixa_total, 0) AS caixa_total
  FROM admins a
  JOIN lojas l ON CAST(a.id_loja AS INTEGER) = l.id
  WHERE a.id = $1
";
$result_loja = pg_query_params($conn, $query_loja, [$id_admin]);
$loja = pg_fetch_assoc($result_loja);

if (!$loja) {
  echo json_encode(["error" => "Loja não encontrada"]);
  exit;
}

$id_loja = $loja['id_loja'];

// ===============================
// PRODUTOS MAIS VENDIDOS
// ===============================
// Vamos contar quantas vezes cada produto foi vendido, com base nos pedidos confirmados
$query_produtos = "
  SELECT pr.nome_produto, COUNT(*) AS total_vendas
  FROM pedidos p
  JOIN produtos pr ON CAST(pr.id_loja AS INTEGER) = p.id_loja
  WHERE p.pagamento_confirmado = TRUE
  AND p.id_loja = $1
  GROUP BY pr.nome_produto
  ORDER BY total_vendas DESC
  LIMIT 10
";
$result_produtos = pg_query_params($conn, $query_produtos, [$id_loja]);
$produtos = [];
while ($row = pg_fetch_assoc($result_produtos)) {
  $produtos[] = $row['nome_produto'] . ' (' . $row['total_vendas'] . ')';
}

// ===============================
// LOJAS QUE MAIS VENDERAM
// ===============================
$query_vendeu = "
  SELECT l.nome_loja, SUM(p.valor) AS total_vendas
  FROM pedidos p
  JOIN lojas l ON p.id_loja = l.id
  WHERE p.pagamento_confirmado = TRUE
  GROUP BY l.id
  ORDER BY total_vendas DESC
  LIMIT 5
";
$result_vendeu = pg_query($conn, $query_vendeu);
$vendeu = [];
while ($row = pg_fetch_assoc($result_vendeu)) {
  $vendeu[] = $row['nome_loja'];
}

// ===============================
// LOJAS QUE MAIS LUCRARAM
// ===============================
$query_lucrou = "
  SELECT l.nome_loja, SUM(p.valor) AS total_lucro
  FROM pedidos p
  JOIN lojas l ON p.id_loja = l.id
  WHERE p.pagamento_confirmado = TRUE
  GROUP BY l.id
  ORDER BY total_lucro DESC
  LIMIT 5
";
$result_lucrou = pg_query($conn, $query_lucrou);
$lucrou = [];
while ($row = pg_fetch_assoc($result_lucrou)) {
  $lucrou[] = $row['nome_loja'];
}

// ===============================
// TOTAL DA EMPRESA (todas as lojas)
// ===============================
$query_total = "SELECT COALESCE(SUM(valor), 0) AS total FROM pedidos WHERE pagamento_confirmado = TRUE";
$result_total = pg_query($conn, $query_total);
$row_total = pg_fetch_assoc($result_total);
$total_empresa = floatval($row_total['total'] ?? 0);

// ===============================
// RESPOSTA FINAL
// ===============================
echo json_encode([
  "id_loja" => $loja['id_loja'],
  "nome_loja" => $loja['nome_loja'],
  "produtos" => $produtos,
  "vendeu" => $vendeu,
  "lucrou" => $lucrou,
  "total_empresa" => $total_empresa,
  "caixa_inicial" => floatval($loja['caixa_inicial']),
  "caixa_total" => floatval($loja['caixa_total'])
], JSON_UNESCAPED_UNICODE);
?>
