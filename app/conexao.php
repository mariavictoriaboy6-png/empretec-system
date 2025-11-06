<?php
// conexao.php — Conexão com o banco PostgreSQL do Render

$conn = pg_connect("postgresql://victoria:S0s5r7ifbijP61iwCW3XBRITO0ttDfj9@dpg-d3sh246r433s73cs0abg-a.oregon-postgres.render.com:5432/empretecsystem?sslmode=require");

if (!$conn) {
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(["success" => false, "error" => "Erro ao conectar ao banco: " . pg_last_error()]);
    exit;
}
?>
