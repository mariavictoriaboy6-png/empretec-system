// loginnoob.js
document.getElementById("seta").addEventListener("click", entrar);
document.getElementById("senha").addEventListener("keypress", (e) => {
  if (e.key === "Enter") entrar();
});

// Mapeia o ID da loja para a página correta
const paginasNoob = {
  1: "auraessencia/aura.html",
  2: "bookcoffemoon/book.html",
  3: "colibri/colibri.html",
  4: "flordelotus/lotus.html",
  5: "jardimencantado/jardim.html",
  6: "saboremagia/saboremagia.html",
  7: "sigma/sigma.html"
};

function entrar() {
  const senha = document.getElementById("senha").value.trim();

  fetch("https://empretecsystem.onrender.com/login/verificar_noob.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "senha=" + encodeURIComponent(senha),
  })
    .then((r) => r.json())
    .then((res) => {
      if (res.success) {
        const pagina = paginasNoob[res.id_loja];
        if (pagina) {
          window.location.href = `/app/${pagina}`;
        } else {
          alert("Página da loja não encontrada!");
        }
      } else {
        alert(res.error || "Senha incorreta!");
      }
    })
    .catch(() => alert("Erro ao verificar login."));
}
