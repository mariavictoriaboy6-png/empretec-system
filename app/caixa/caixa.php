<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include_once(__DIR__ . '/../conexao.php');

// ==============================
// Verifica se a loja está logada
// ==============================
if (!isset($_SESSION['id_loja']) || empty($_SESSION['id_loja'])) {
    echo json_encode(['success' => false, 'error' => 'Loja não logada']);
    exit;
}

$id_loja = $_SESSION['id_loja'];

// ==============================
// Busca tipo de caixa da loja
// ==============================
$sql_tipo = "SELECT tipo_caixa FROM lojas WHERE id = $1";
$result_tipo = pg_query_params($conn, $sql_tipo, [$id_loja]);

if (!$result_tipo || pg_num_rows($result_tipo) === 0) {
    echo json_encode(['success' => false, 'error' => 'Tipo de caixa não encontrado']);
    exit;
}

$row_tipo = pg_fetch_assoc($result_tipo);
$tipo_caixa = strtolower(trim($row_tipo['tipo_caixa']));

// ==============================
// Campos obrigatórios
// ==============================
$campos = ['nome_cliente', 'nota_adicional', 'pedido', 'pagamento', 'valor'];
foreach ($campos as $campo) {
    if (!isset($_POST[$campo])) {
        echo json_encode(['success' => false, 'error' => 'Campos incompletos: ' . $campo]);
        exit;
    }
}

// ==============================
// Recebe dados
// ==============================
$nome = trim($_POST['nome_cliente']) ?: 'Sem nome';
$nota = trim($_POST['nota_adicional']) ?: '';
$pedido = trim($_POST['pedido']) ?: '(sem itens)';
$pagamento = isset($_POST['pagamento']) ? trim($_POST['pagamento']) : '';
$valor = floatval($_POST['valor']);

// ==============================
// Define status inicial
// ==============================
$status_inicial = ($tipo_caixa === 'producao') ? 'nao_fez' : 'feito';
$pagamento_confirmado = 'false';

// ==============================
// Inicia transação
// ==============================
pg_query($conn, 'BEGIN');

try {
    // ==============================
    // Insere o pedido
    // ==============================
    $sql_insert = "INSERT INTO pedidos 
        (id_loja, nome_cliente, nota_adicional, pedido, pagamento, valor, status, pagamento_confirmado, criado_em)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())";

    $params = [$id_loja, $nome, $nota, $pedido, $pagamento, $valor, $status_inicial, $pagamento_confirmado];
    $result = pg_query_params($conn, $sql_insert, $params);

    if (!$result) {
        throw new Exception('Erro ao inserir pedido: ' . pg_last_error($conn));
    }

    // ==============================
    // Atualiza o caixa_total da loja
    // ==============================
    $sql_update_caixa = "UPDATE lojas SET caixa_total = COALESCE(caixa_total, 0) + $1 WHERE id = $2";
    $res_caixa = pg_query_params($conn, $sql_update_caixa, [$valor, $id_loja]);

    if (!$res_caixa) {
        throw new Exception('Erro ao atualizar caixa_total: ' . pg_last_error($conn));
    }

    // ==============================
    // Diminui a quantidade dos produtos
    // ==============================
    // Exemplo de campo pedido: "Farinha 5.00, Açúcar 3.00"
    $itens = explode(',', $pedido);

    foreach ($itens as $item) {
        $item = trim($item);
        if ($item === '') continue;

        // Extrai nome (tudo menos o último valor que é o preço)
        $partes = explode(' ', $item);
        array_pop($partes); // remove preço
        $nome_produto = trim(implode(' ', $partes));

        if ($nome_produto === '') continue;

        // Atualiza quantidade: diminui 1
        $sql_update_produto = "
            UPDATE produtos
            SET quantidade = GREATEST(quantidade - 1, 0)
            WHERE nome_produto = $1 AND id_loja = $2
        ";
        $res_update = pg_query_params($conn, $sql_update_produto, [$nome_produto, $id_loja]);

        if (!$res_update) {
            throw new Exception('Erro ao atualizar produto: ' . pg_last_error($conn));
        }
    }

    // ==============================
    // Commit final
    // ==============================
    pg_query($conn, 'COMMIT');
    echo json_encode(['success' => true, 'tipo_caixa' => $tipo_caixa]);

} catch (Exception $e) {
    pg_query($conn, 'ROLLBACK');
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

pg_close($conn);
?>
