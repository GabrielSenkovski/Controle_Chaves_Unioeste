const form = document.getElementById('form');
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Usuário "cadastrado"
        const emailCorreto = "Audiovisual@unioeste.br";
        const senhaCorreta = "Chaves10";

        form.addEventListener("submit", function(event) {
            event.preventDefault(); // Evita envio antes de validar

            const email = document.getElementById("email").value.trim();
            const senha = document.getElementById("senha").value.trim();

            // Valida formato do email
            if (!regexEmail.test(email)) {
                alert("Por favor, insira um e-mail válido.");
                return;
            }


            // Verifica login
            if (email === emailCorreto && senha === senhaCorreta) {
                alert("Login realizado com sucesso!");
                window.location.href = "dashboard.html";
            } else {
                alert("E-mail ou senha incorretos.");
            }
        });