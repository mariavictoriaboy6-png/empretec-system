<?php
session_start();
include_once(__DIR__ . '/../conexao.php');
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['id_loja'])) {
    echo json_encode(['success' => false, 'error' => 'Sessão inválida']);
    exit;
}

$id_loja = $_SESSION['id_loja'];
$input = json_decode(file_get_contents('php://input'), true);
$id_produto = isset($input['id']) ? intval($input['id']) : null;

if (!$id_produto) {
    echo json_encode(['success' => false, 'error' => 'ID do produto não informado']);
    exit;
}

$sql = "DELETE FROM produtos WHERE id = $1 AND id_loja = $2";
$res = pg_query_params($conn, $sql, [$id_produto, $id_loja]);

if ($res && pg_affected_rows($res) > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Produto não encontrado ou erro ao excluir']);
}
?>
