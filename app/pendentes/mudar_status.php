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
$novo_status = $_POST['status'] ?? null;

if (!$pedido_id || !$novo_status) {
    echo json_encode(["success" => false, "error" => "Parâmetros inválidos"]);
    exit;
}

$sql = "UPDATE pedidos SET status = $1 WHERE id = $2 AND id_loja = $3";
$result = pg_query_params($conn, $sql, [$novo_status, $pedido_id, $id_loja]);

if ($result === false) {
    echo json_encode(["success" => false, "error" => pg_last_error($conn)]);
} else {
    echo json_encode(["success" => true]);
}

pg_close($conn);
?>
