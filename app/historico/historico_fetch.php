<?php
session_start();
header('Content-Type: application/json');
include_once(__DIR__ . '/../conexao.php');

// Verifica sessão
if (!isset($_SESSION['id_loja'])) {
    echo json_encode([]);
    exit;
}

$id_loja = $_SESSION['id_loja'];

// Busca histórico de pedidos confirmados/finalizados
try {
    $sql = "SELECT id, nome_cliente, nota_adicional, pedido, pagamento, valor, status, pagamento_confirmado, criado_em 
            FROM pedidos 
            WHERE id_loja = $1 AND status = 'confirmado' 
            ORDER BY criado_em DESC";
    $result = pg_query_params($conn, $sql, [$id_loja]);

    $pedidos = [];
    while ($row = pg_fetch_assoc($result)) {
        $pedidos[] = $row;
    }

    echo json_encode($pedidos);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
