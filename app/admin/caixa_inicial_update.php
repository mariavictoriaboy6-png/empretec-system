<?php
require_once __DIR__ . '/../conexao.php';
session_start();

header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);

$id_loja = intval($data['id_loja'] ?? 0);
$novoCaixa = floatval($data['caixa_inicial'] ?? 0);

if ($id_loja <= 0) {
  echo json_encode(["success" => false, "error" => "ID da loja inválido"]);
  exit;
}

$sql = "UPDATE lojas SET caixa_inicial = $1 WHERE id = $2";
$result = pg_query_params($conn, $sql, [$novoCaixa, $id_loja]);

if ($result) {
  echo json_encode(["success" => true, "novo_caixa" => $novoCaixa]);
} else {
  echo json_encode(["success" => false, "error" => pg_last_error($conn)]);
}

pg_close($conn);
?>
