<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

include_once(__DIR__ . '/../conexao.php');

if (!isset($_SESSION['id_loja'])) {
    echo json_encode([]);
    exit;
}

$id_loja = $_SESSION['id_loja'];

// Busca os produtos da loja logada
$sql = "SELECT nome_produto, preco 
        FROM produtos 
        WHERE id_loja = $1 
        ORDER BY nome_produto ASC";

$result = pg_query_params($conn, $sql, [$id_loja]);

if (!$result) {
    echo json_encode([]);
    pg_close($conn);
    exit;
}

$produtos = [];
while ($row = pg_fetch_assoc($result)) {
    $nome = $row['nome_produto'];
    $preco = number_format((float)$row['preco'], 2, '.', '');
    $produtos[] = "$nome $preco";
}

echo json_encode($produtos);
pg_close($conn);
?>
