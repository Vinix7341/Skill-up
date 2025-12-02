// ------------------------------------------
//        CONFIG SUPABASE
// ------------------------------------------
const SUPABASE_URL = "https://qjmtfmobsgwzpsohtwac.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbXRmbW9ic2d3enBzb2h0d2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzcwODcsImV4cCI6MjA3OTg1MzA4N30.Vj8JCgNalEhzOXZ5-0sEahpqzm0um6mIUW6GXgxb3cw";

// sempre usar window.supabase (igual no cadastro)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ------------------------------------------
//       CARREGAR DADOS DO USUÁRIO
// ------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // botão baixar
  const btnBaixar = document.getElementById("jogar");
  const btnConvidar = document.getElementById("convidar");

  if (btnBaixar) {
    btnBaixar.addEventListener("click", () => {
      window.location.href = "https://leofjb.itch.io/quizup-interactive";
    });
  }

  if (btnConvidar) {
    btnConvidar.addEventListener("click", () => {
      window.location.href = "https://vinix7341.github.io/Skill-up/";
    });
  }
  // pegar itens
  const analiseBtn = document.getElementById("itemConquistas");
  const rankingBtn = document.getElementById("itemRanking");
  const usuarioBtn = document.getElementById("itemUsuario");

  // clique analise
  if (analiseBtn) {
    analiseBtn.style.cursor = "pointer";
    analiseBtn.addEventListener("click", () => {
      window.location.href = "analise.html";
    });
  }

  // clique ranking
  if (rankingBtn) {
    rankingBtn.style.cursor = "pointer";
    rankingBtn.addEventListener("click", () => {
      window.location.href = "ranking.html";
    });
  }

  // clique usuario
  if (usuarioBtn) {
    usuarioBtn.style.cursor = "pointer";
    usuarioBtn.addEventListener("click", () => {
      window.location.href = "usuario.html";
    });
  }

  const nome = localStorage.getItem("user_nome");
  const sobrenome = localStorage.getItem("user_sobrenome");
  const email = localStorage.getItem("user_email");

  const nomeEl = document.getElementById("nomeCompleto");

  const emailEl =
    document.getElementById("emailUsuario") ||
    document.getElementById("emailDisplay") ||
    document.getElementById("email");

  // nome
  if (nomeEl) nomeEl.textContent = nome && sobrenome ? `${nome} ${sobrenome}` : "Usuário";

  // email
  if (emailEl) emailEl.textContent = email || "";


  // ------------------------------------------
  //                AVATAR
  // ------------------------------------------
  const avatarImg = document.getElementById("avatarImg");
  const avatarInput = document.getElementById("avatarInput");
  const trocarBtn = document.getElementById("trocarAvatarBtn");

  const avatarSalvo = localStorage.getItem("user_avatar");
  if (avatarSalvo && avatarImg) avatarImg.src = avatarSalvo;

  if (trocarBtn && avatarInput && avatarImg) {
    trocarBtn.addEventListener("click", () => avatarInput.click());

    avatarInput.addEventListener("change", () => {
      const file = avatarInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        avatarImg.src = base64;
        localStorage.setItem("user_avatar", base64);
      };
      reader.readAsDataURL(file);
    });
  }

  // --------------------------------------------------------
    //   ATUALIZAR TOPO (userimg + userMini)
    // --------------------------------------------------------
    const userImgTopo = document.getElementById("userimg");
    const userMiniTopo = document.getElementById("userMini");
    const userOla = document.getElementById("ola")
    const avatarTopo = localStorage.getItem("user_avatar");

    if (userImgTopo && avatarTopo) {
    userImgTopo.src = avatarTopo; // coloca avatar redondo no topo
    }

    if (userMiniTopo && nome && sobrenome) {
    userMiniTopo.textContent = `${nome} ${sobrenome}`; // coloca nome e sobrenome
    }

    if (userOla && nome && sobrenome) {
    userOla.textContent = `Olá, ${nome} ${sobrenome}`; // coloca nome e sobrenome
    }


  // -----------------------------------------------
  //        PONTUAÇÃO DIÁRIA  → SALVAR NO BANCO
  // -----------------------------------------------
  const btnPontuacao = document.getElementById("btnPontuacaoDiaria");

  if (btnPontuacao) {
    btnPontuacao.addEventListener("click", async () => {
      const valor = prompt("Digite sua pontuação diária (4 números):");

      if (!valor) return;

      const numero = Number(valor);

        if (isNaN(numero) || numero < 0 || numero > 1000) {
        alert("A pontuação deve ser um número entre 0 e 1000.");
        return;
        }


      // salvar local
      localStorage.setItem("user_pontuacao_diaria", valor);

      // salvar no supabase (coluna pontuacao)
      const { data, error } = await supabaseClient
        .from("usuarios")
        .update({ pontuacao: valor })
        .eq("email", email);

      if (error) {
        console.error(error);
        alert("Erro ao salvar pontuação no banco!");
        return;
      }

      alert("Pontuação salva com sucesso!");
    });
  }

  // ------------------------------------------
//     ATUALIZAR BARRA DE PROGRESSO
// ------------------------------------------
async function atualizarBarraProgresso() {
  const barra = document.getElementById("barraProgresso");
  const porcentoLabel = document.querySelector(".porcento");

  if (!barra || !porcentoLabel) return;

  const email = localStorage.getItem("user_email");

  // pegar do banco a pontuação atual
  const { data, error } = await supabaseClient
    .from("usuarios")
    .select("pontuacao")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Erro ao buscar pontuação:", error);
    return;
  }

  let pontuacao = parseInt(data?.pontuacao || 0);

  // calcular porcentagem
  let porcentagem = pontuacao / 10;
  if (porcentagem > 100) porcentagem = 100;

  // atualizar visual
  barra.style.width = `${porcentagem}%`;
  porcentoLabel.textContent = `${porcentagem}%`;
}

// chamar quando abrir a página
atualizarBarraProgresso();


});
