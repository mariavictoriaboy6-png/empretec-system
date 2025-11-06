const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Banco de dados
const db = new sqlite3.Database('./banco.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Exemplo de rota
app.get('/', (req, res) => {
  res.send('Servidor do Empretec System funcionando ✅');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
