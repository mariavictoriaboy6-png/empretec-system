<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include_once(__DIR__ . '/../conexao.php');

if (!isset($_SESSION['id_loja'])) {
    echo json_encode([]);
    exit;
}

$id_loja = $_SESSION['id_loja'];

$sql = "
SELECT p.id, p.nome_cliente, p.pedido, p.valor, p.pagamento, p.status,
       p.pagamento_confirmado, p.nota_adicional, l.tipo_caixa
FROM pedidos p
JOIN lojas l ON p.id_loja = l.id
WHERE p.id_loja = $1
  AND (
       (l.tipo_caixa = 'normal' AND COALESCE(p.pagamento_confirmado, false) = false)
       OR (l.tipo_caixa = 'producao' AND p.status != 'confirmado')
      )
ORDER BY p.id ASC
";

$result = pg_query_params($conn, $sql, [$id_loja]);

if ($result === false) {
    echo json_encode(["success" => false, "error" => pg_last_error($conn)]);
    exit;
}

$pedidos = pg_fetch_all($result);
echo json_encode($pedidos ?: []);
pg_close($conn);
?>
