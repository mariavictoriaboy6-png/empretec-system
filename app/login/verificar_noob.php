<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

// Permissões CORS
header("Access-Control-Allow-Origin: https://empretecsystem.onrender.com");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

// Caminho para conexão
include_once(__DIR__ . '/../conexao.php');

// Recebe senha
$senha = $_POST["senha"] ?? "";

if (empty($senha)) {
    echo json_encode(["success" => false, "error" => "Senha não fornecida"]);
    exit;
}

// Verifica funcionário noob no banco
$sql = "SELECT id, nome_loja FROM lojas WHERE senha_loja = $1 LIMIT 1";
$result = pg_query_params($conn, $sql, [$senha]);

if ($result === false) {
    echo json_encode(["success" => false, "error" => "Erro na consulta: " . pg_last_error($conn)]);
    exit;
}

if (pg_num_rows($result) > 0) {
    $row = pg_fetch_assoc($result);
    $_SESSION["id_loja"] = $row["id"];
    echo json_encode([
        "success" => true,
        "id_loja" => $row["id"],
        "nome_loja" => $row["nome_loja"]
    ]);
} else {
    echo json_encode(["success" => false, "error" => "Senha incorreta"]);
}

pg_close($conn);
?>
