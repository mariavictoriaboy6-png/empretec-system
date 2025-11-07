document.addEventListener("DOMContentLoaded", () => {
  const analiseBtn = document.getElementById("analise");
  const modal = document.getElementById("senhaModal");
  const senhaInput = document.getElementById("senhaInput");
  const entrarBtn = document.getElementById("entrarBtn");
  const cancelarBtn = document.getElementById("cancelarBtn");
  const erroMsg = document.getElementById("erroMsg");

  analiseBtn.addEventListener("click", e => {
    e.preventDefault();
    modal.style.display = "flex";
    senhaInput.value = "";
    erroMsg.style.display = "none";
    senhaInput.focus();
  });

  cancelarBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  entrarBtn.addEventListener("click", async () => {
    const senha = senhaInput.value.trim();
    if (!senha) return;

    try {
      const res = await fetch("https://empretecsystem.onrender.com/sigma/verificar_senha.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `senha=${encodeURIComponent(senha)}`
      });

      const data = await res.json();
      if (data.sucesso) {
        window.location.href = "/admin/admin.html";
      } else {
        erroMsg.style.display = "block";
      }
    } catch (err) {
      alert("Erro ao verificar senha");
      console.error(err);
    }
  });
});
