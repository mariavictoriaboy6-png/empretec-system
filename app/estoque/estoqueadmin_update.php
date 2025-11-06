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
$id = isset($input['id']) ? intval($input['id']) : null;
$quantidade = isset($input['quantidade']) ? intval($input['quantidade']) : null;

if ($id === null || $quantidade === null) {
    echo json_encode(['success' => false, 'error' => 'Parâmetros inválidos']);
    exit;
}

// Atualiza quantidade para o valor absoluto enviado
$sql = "UPDATE produtos SET quantidade = $1 WHERE id = $2 AND id_loja = $3";
$res = pg_query_params($conn, $sql, [$quantidade, $id, $id_loja]);

if (!$res) {
    echo json_encode(['success' => false, 'error' => pg_last_error($conn)]);
    exit;
}

// Busca a quantidade atual para garantir consistência
$sql_sel = "SELECT quantidade FROM produtos WHERE id = $1 AND id_loja = $2";
$res_sel = pg_query_params($conn, $sql_sel, [$id, $id_loja]);

if ($res_sel && pg_num_rows($res_sel) > 0) {
    $row = pg_fetch_assoc($res_sel);
    echo json_encode(['success' => true, 'quantidade' => intval($row['quantidade'])]);
} else {
    echo json_encode(['success' => false, 'error' => 'Produto não encontrado após update']);
}
?>
