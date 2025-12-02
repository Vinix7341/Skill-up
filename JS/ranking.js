// ------------------------------------------
//        CONFIG SUPABASE
// ------------------------------------------
const SUPABASE_URL = "https://qjmtfmobsgwzpsohtwac.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbXRmbW9ic2d3enBzb2h0d2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzcwODcsImV4cCI6MjA3OTg1MzA4N30.Vj8JCgNalEhzOXZ5-0sEahpqzm0um6mIUW6GXgxb3cw";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// -------------------------------------------------
//  BUSCAR AS 6 MAIORES PONTUAÇÕES DO SUPABASE
// -------------------------------------------------
async function buscarTop6() {
  try {
    const { data, error } = await supabaseClient
      .from("usuarios")
      .select("nome, sobrenome, email, pontuacao");

    if (error) {
      console.error("Erro Supabase:", error);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn("Nenhum usuário encontrado.");
      return [];
    }

    // ordenar por pontuação desc
    data.sort((a, b) => Number(b.pontuacao) - Number(a.pontuacao));

    // pegar só os 6
    return data.slice(0, 6);

  } catch (e) {
    console.error("Erro inesperado:", e);
    return [];
  }
}

// -------------------------------------------------
//  PREENCHER UMA LINHA ESPECÍFICA DA TABELA
// -------------------------------------------------
function preencherLinha(posicao, userData) {
  if (!userData) return;

  const nomeCompleto = `${userData.nome ?? ""} ${userData.sobrenome ?? ""}`.trim();

  // selecionar a linha N (1 = primeira linha, etc.)
  const linha = document.querySelector(`#tabela tbody tr:nth-child(${posicao})`);
  if (!linha) return;

  const nomeEl = linha.querySelector(".colNome .nome");
  const emailEl = linha.querySelector(".colEmail");
  const pontosEl = linha.querySelector(".colPontos");

  if (nomeEl) nomeEl.textContent = nomeCompleto || "—";
  if (emailEl) emailEl.textContent = userData.email || "—";
  if (pontosEl) pontosEl.textContent = userData.pontuacao ?? 0;

  console.log(`Posição ${posicao} preenchida:`, nomeCompleto, userData.email, userData.pontuacao);
}

// -------------------------------------------------
//        CARREGAR AO ABRIR A PÁGINA
// -------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {

  // navegação (igual ao seu código original)
  const analiseBtn = document.getElementById("itemConquistas");
  const rankingBtn = document.getElementById("itemRanking");
  const usuarioBtn = document.getElementById("itemUsuario");

  if (analiseBtn) {
    analiseBtn.style.cursor = "pointer";

    analiseBtn.addEventListener("click", async () => {

      // pegar ID salvo no login
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        alert("Erro: usuário não identificado.");
        return;
      }

      // consultar função do usuário no supabase
      const { data: usuario, error } = await supabaseClient
        .from("usuarios")
        .select("funcao")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Erro ao consultar função:", error);
        alert("Erro ao verificar autorização.");
        return;
      }

      if (!usuario) {
        alert("Usuário não encontrado.");
        return;
      }

      // verificar função
      const funcao = (usuario.funcao || "").toLowerCase();

      if (funcao === "adm" || funcao === "rh") {
        // autorizado
        window.location.href = "analise.html";
      } else {
        // não autorizado
        alert("Só permitido pessoal autorizado");
      }
    });
  }

  if (rankingBtn) {
    rankingBtn.style.cursor = "pointer";
    rankingBtn.addEventListener("click", () => window.location.href = "ranking.html");
  }
  if (usuarioBtn) {
    usuarioBtn.style.cursor = "pointer";
    usuarioBtn.addEventListener("click", () => window.location.href = "usuario.html");
  }

  // preencher topo com dados do usuário
  const nome = localStorage.getItem("user_nome");
  const sobrenome = localStorage.getItem("user_sobrenome");
  const email = localStorage.getItem("user_email");

  const userImgTopo = document.getElementById("userimg");
  const userMiniTopo = document.getElementById("userMini");
  const userOla = document.getElementById("ola");
  const avatarTopo = localStorage.getItem("user_avatar");

  if (userImgTopo && avatarTopo) userImgTopo.src = avatarTopo;
  if (userMiniTopo && nome && sobrenome) userMiniTopo.textContent = `${nome} ${sobrenome}`;
  if (userOla && nome && sobrenome) userOla.textContent = `Olá, ${nome} ${sobrenome}`;

  // ---------------------------
  // BUSCAR TOP 6 E PREENCHER
  // ---------------------------
  const top6 = await buscarTop6();

  if (top6.length === 0) {
    console.warn("Nenhum dado para preencher ranking.");
    return;
  }

  // preencher linhas #1 a #6
  top6.forEach((user, index) => {
    preencherLinha(index + 1, user);
  });

});
