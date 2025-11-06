<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include_once(__DIR__ . '/../conexao.php');

if (!isset($_SESSION['id_loja'])) {
    echo json_encode(["success" => false, "error" => "Sessão expirada"]);
    exit;
}

$id_loja = $_SESSION['id_loja'];
$pedido_id = $_POST['id'] ?? null;

if (!$pedido_id || !is_numeric($pedido_id)) {
    echo json_encode(["success" => false, "error" => "Parâmetros inválidos"]);
    exit;
}

// Busca o tipo de caixa
$sql = "
SELECT p.id, l.tipo_caixa
FROM pedidos p
JOIN lojas l ON p.id_loja = l.id
WHERE p.id = $1 AND p.id_loja = $2
LIMIT 1
";
$result = pg_query_params($conn, $sql, [$pedido_id, $id_loja]);

if (!$result || pg_num_rows($result) === 0) {
    echo json_encode(["success" => false, "error" => "Pedido não encontrado"]);
    exit;
}

$pedido = pg_fetch_assoc($result);
$tipo_caixa = $pedido['tipo_caixa'];

// Atualiza pagamento
if ($tipo_caixa === 'normal') {
    // no normal, o pagamento é confirmado e o status é direto 'confirmado'
    $update = "UPDATE pedidos SET pagamento_confirmado = true, status = 'confirmado' WHERE id = $1 AND id_loja = $2";
    pg_query_params($conn, $update, [$pedido_id, $id_loja]);
} else {
    // no produção, apenas confirma o pagamento
    $update = "UPDATE pedidos SET pagamento_confirmado = true WHERE id = $1 AND id_loja = $2";
    pg_query_params($conn, $update, [$pedido_id, $id_loja]);
}

echo json_encode(["success" => true]);
pg_close($conn);
?>
