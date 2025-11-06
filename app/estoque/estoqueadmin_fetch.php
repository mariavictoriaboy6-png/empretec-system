<?php
session_start();
include_once(__DIR__ . '/../conexao.php');

if (!isset($_SESSION['id_loja'])) {
    echo json_encode([]);
    exit;
}

$id_loja = $_SESSION['id_loja'];

$sql = "SELECT id, nome_produto, quantidade 
        FROM produtos 
        WHERE id_loja = $1 
        ORDER BY nome_produto ASC";
$result = pg_query_params($conn, $sql, [$id_loja]);

$produtos = [];
while ($row = pg_fetch_assoc($result)) {
    $produtos[] = $row;
}

echo json_encode($produtos);
?>
