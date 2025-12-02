const SUPABASE_URL = "https://qjmtfmobsgwzpsohtwac.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbXRmbW9ic2d3enBzb2h0d2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzcwODcsImV4cCI6MjA3OTg1MzA4N30.Vj8JCgNalEhzOXZ5-0sEahpqzm0um6mIUW6GXgxb3cw";

  // criar cliente supabase

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// pegar elementos
const form = document.getElementById("formulario");
const inputEmail = document.getElementById("email");
const inputSenha = document.getElementById("senha");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = inputEmail.value.trim();
  const senha = inputSenha.value;

  if (!email || !senha) {
    alert("Preencha email e senha.");
    return;
  }

  try {
    const { data: usuario, error } = await supabaseClient
      .from("usuarios")
      .select("id, nome, sobrenome, email, senha")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar usuário:", error);
      alert("Erro ao consultar usuário: " + (error.message || "tente novamente"));
      return;
    }

    if (!usuario) {
      alert("Email não encontrado.");
      return;
    }

    if (usuario.senha !== senha) {
      alert("Senha incorreta.");
      return;
    }

    localStorage.setItem("user_id", String(usuario.id));
    localStorage.setItem("user_email", usuario.email);
    localStorage.setItem("user_nome", usuario.nome || "");
    localStorage.setItem("user_sobrenome", usuario.sobrenome || "");

    window.location.href = "usuario.html";

  } catch (err) {
    console.error("Erro inesperado no login:", err);
    alert("Erro inesperado. Veja console.");
  }
});

const senhaInput = document.getElementById("senha");
const toggleSenha = document.getElementById("toggleSenha");

toggleSenha.addEventListener("click", () => {
  const isPassword = senhaInput.type === "password";
  senhaInput.type = isPassword ? "text" : "password";
  toggleSenha.textContent = isPassword ? "🙈" : "👁️";
});