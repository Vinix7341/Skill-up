// esperar DOM
document.addEventListener("DOMContentLoaded", () => {

  // pegar elementos
  const form = document.getElementById("formulario");
  const senhaInput = document.getElementById("senha");
  const criarBtn = document.getElementById("criar");

  // chave Supabase
  const SUPABASE_URL = "https://qjmtfmobsgwzpsohtwac.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbXRmbW9ic2d3enBzb2h0d2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzcwODcsImV4cCI6MjA3OTg1MzA4N30.Vj8JCgNalEhzOXZ5-0sEahpqzm0um6mIUW6GXgxb3cw";

  // criar cliente supabase
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // validar senha
  function senhaValida(s) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return re.test(s);
  }

  // validar email
  function emailValido(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // POPUP de sucesso
  function popupSucesso() {
    const fundo = document.createElement("div");
    fundo.style.position = "fixed";
    fundo.style.top = "0";
    fundo.style.left = "0";
    fundo.style.width = "100%";
    fundo.style.height = "100%";
    fundo.style.background = "rgba(0,0,0,0.6)";
    fundo.style.display = "flex";
    fundo.style.alignItems = "center";
    fundo.style.justifyContent = "center";
    fundo.style.zIndex = "9999";

    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "40px";
    box.style.borderRadius = "12px";
    box.style.textAlign = "center";
    box.style.width = "280px";
    box.style.fontFamily = "Arial";
    box.style.animation = "fadeIn .3s ease";

    box.innerHTML = `
      <h2 style="margin-top:0;">Conta criada!</h2>
      <p>Seu cadastro foi realizado com sucesso.</p>
      <button id="okPopup" style="
        margin-top:20px;
        padding:10px 20px;
        border:none;
        background:#6a5acd;
        color:white;
        border-radius:6px;
        cursor:pointer;
        font-size:16px;
      ">OK</button>
    `;

    fundo.appendChild(box);
    document.body.appendChild(fundo);

    document.getElementById("okPopup").onclick = () => {
      fundo.remove();
    };
  }

  // quando enviar
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = senhaInput.value;
    const termos = document.getElementById("termos").checked;

    // validações
    if (!nome || !sobrenome || !email || !senha) {
      alert("Preencha todos os campos.");
      return;
    }

    if (!emailValido(email)) {
      alert("Email inválido.");
      return;
    }

    if (!senhaValida(senha)) {
      alert("A senha deve ter 8 dígitos, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial.");
      return;
    }

    if (!termos) {
      alert("Você deve aceitar os Termos de Uso.");
      return;
    }

    criarBtn.disabled = true;
    criarBtn.textContent = "Cadastrando...";

    // enviar ao supabase
    const { data, error } = await supabase
      .from("usuarios")
      .insert([
        {
          nome: nome,
          sobrenome: sobrenome,
          email: email,
          senha: senha,
          funcao: "user",
          pontuacao: null
        }
      ]);

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
      criarBtn.disabled = false;
      criarBtn.textContent = "Criar conta";
      return;
    }

    // sucesso
    popupSucesso();
    form.reset();

    criarBtn.disabled = false;
    criarBtn.textContent = "Criar conta";
  });

  document.getElementById("okPopup").addEventListener("click", function () {
    window.location.href = "login.html";
  });

});
// Botão de mostrar/ocultar senha
const senhaInput = document.getElementById("senha");
const toggleSenha = document.getElementById("toggleSenha");

toggleSenha.addEventListener("click", () => {
  const isPassword = senhaInput.type === "password";
  senhaInput.type = isPassword ? "text" : "password";
  toggleSenha.textContent = isPassword ? "🙈" : "👁️";
});
