document.addEventListener('DOMContentLoaded', () => {
  const senhaInput = document.getElementById('senha');
  const setaBtn = document.getElementById('seta');

  setaBtn.addEventListener('click', async () => {
    const senha = senhaInput.value.trim();
    if (!senha) return alert("Digite a senha!");

    const formData = new FormData();
    formData.append('senha', senha);

    try {
      const res = await fetch("https://empretecsystem.onrender.com/login/verificar_admin.php", {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        // Redireciona direto para o admin
        window.location.href = "https://empretecsystem.onrender.com/admin/admin.html";
      } else {
        alert(data.error || "Senha incorreta");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      alert("Erro ao conectar com o servidor");
    }
  });

  senhaInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') setaBtn.click();
  });
});
