<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

// Para testes locais no XAMPP
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

include_once(__DIR__ . '/../conexao.php');

$senha = $_POST["senha"] ?? "";

if (empty($senha)) {
    echo json_encode(["success" => false, "error" => "Senha não fornecida"]);
    exit;
}

// Verifica o admin no banco
$sql = "SELECT id_loja FROM admins WHERE senha_admin = $1 LIMIT 1";
$result = pg_query_params($conn, $sql, [$senha]);

if ($result === false) {
    echo json_encode(["success" => false, "error" => "Erro na consulta: " . pg_last_error($conn)]);
    exit;
}

if (pg_num_rows($result) > 0) {
    $row = pg_fetch_assoc($result);
    $_SESSION["id_loja"] = $row["id_loja"];
    echo json_encode([
        "success" => true,
        "id_loja" => $row["id_loja"]
    ]);
} else {
    echo json_encode(["success" => false, "error" => "Senha incorreta"]);
}

pg_close($conn);
?>
