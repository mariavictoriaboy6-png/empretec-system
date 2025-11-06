<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include 'conexao.php';

$senha = $_POST['senha'] ?? '';

if (!$senha) {
    echo json_encode(['sucesso' => false, 'error' => 'Senha vazia']);
    exit;
}

// Busca admin no BD
$sql = "SELECT id_loja, senha_admin FROM admins WHERE senha_admin = $1 LIMIT 1";
$result = pg_query_params($conn, $sql, [$senha]);

if ($row = pg_fetch_assoc($result)) {
    // Comparação direta (texto puro)
    if ($senha === $row['senha_admin']) {
        $_SESSION['loja_id'] = $row['id_loja'];
        echo json_encode(['sucesso' => true]);
    } else {
        echo json_encode(['sucesso' => false]);
    }
} else {
    echo json_encode(['sucesso' => false]);
}

pg_close($conn);
?>
