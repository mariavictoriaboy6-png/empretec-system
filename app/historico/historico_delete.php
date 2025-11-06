<?php
include_once(__DIR__ . '/../conexao.php');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {
  echo json_encode(['success' => false, 'error' => 'ID não informado']);
  exit;
}

$id = $data['id'];

try {
  $sql = "DELETE FROM pedidos WHERE id = $1";
  $res = pg_query_params($conn, $sql, [$id]);

  if (!$res) {
    throw new Exception(pg_last_error($conn));
  }

  echo json_encode(['success' => true]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
