<?php
session_start();
include_once(__DIR__ . '/../conexao.php');
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['id_loja'])) {
    echo json_encode(['success' => false, 'error' => 'Loja não logada']);
    exit;
}

$id_loja = $_SESSION['id_loja'];
$data = json_decode(file_get_contents('php://input'), true);

$nome = trim($data['nome_produto'] ?? '');
$preco = isset($data['preco']) ? floatval($data['preco']) : null;
$qtd = isset($data['quantidade']) ? intval($data['quantidade']) : null;

if ($nome === '' || $preco === null || $qtd === null) {
    echo json_encode(['success' => false, 'error' => 'Dados inválidos']);
    exit;
}

// Insere e retorna o registro
$sql = "INSERT INTO produtos (nome_produto, preco, quantidade, id_loja)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nome_produto, quantidade, preco";
$res = pg_query_params($conn, $sql, [$nome, $preco, $qtd, $id_loja]);

if ($res && pg_num_rows($res) > 0) {
    $row = pg_fetch_assoc($res);
    // garante tipos corretos
    $row['id'] = intval($row['id']);
    $row['quantidade'] = intval($row['quantidade']);
    $row['preco'] = floatval($row['preco']);
    echo json_encode(['success' => true, 'produto' => $row]);
} else {
    echo json_encode(['success' => false, 'error' => pg_last_error($conn)]);
}
?>
