// config supabase
const SUPABASE_URL = "https://qjmtfmobsgwzpsohtwac.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbXRmbW9ic2d3enBzb2h0d2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzcwODcsImV4cCI6MjA3OTg1MzA4N30.Vj8JCgNalEhzOXZ5-0sEahpqzm0um6mIUW6GXgxb3cw";

// criar cliente
const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

document.addEventListener("DOMContentLoaded", () => {
  // svg elementos
  const graficos = Array.from(document.querySelectorAll(".grafico"));
  if (graficos.length < 2) {
    console.warn("SVGs .grafico insuficientes (esperado 2).");
  }

  // util: aplicar pct no svg
  function aplicarPorcentagemNoGrafico(graficoEl, porcentagem) {
    if (!graficoEl) return;
    const pct = Math.max(0, Math.min(100, Math.round(porcentagem)));
    const preench = graficoEl.querySelector(".preench");
    if (preench) preench.setAttribute("stroke-dasharray", `${pct},100`);
    const txt = graficoEl.querySelector(".txt");
    if (txt) txt.textContent = `${pct}%`;
  }

  // util: atualizar imagem verificacao
  function atualizarImagemVerificacao(porcentagemMedia) {
    try {
      const img = document.getElementById("verificacao");
      if (!img) return;
      // se 50% ou menos => ruim.jpeg, se >50% => ok.jpeg
      if (porcentagemMedia <= 50) {
        img.src = "imagens/ruim.jpeg";
      } else {
        img.src = "imagens/ok.jpeg";
      }
    } catch (e) {
      console.warn("Erro atualizar imagem", e);
    }
  }

  // carregar estatisticas
  async function carregarEstatisticas() {
    if (!supabaseClient) {
      console.error("Supabase client ausente");
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from("usuarios")
        .select("pontuacao");

      if (error) {
        console.error("Erro Supabase:", error);
        if (error.message && error.message.toLowerCase().includes("row-level security")) {
          alert("Permissões do banco bloqueadas. Habilite policies de leitura.");
        } else {
          alert("Erro ao buscar pontuações. Veja console.");
        }
        return;
      }

      const valores = (data || [])
        .map(r => {
          const v = r && (r.pontuacao === null || r.pontuacao === undefined) ? null : Number(r.pontuacao);
          return Number.isFinite(v) ? v : null;
        })
        .filter(v => v !== null);

      if (valores.length === 0) {
        aplicarPorcentagemNoGrafico(graficos[0], 0);
        aplicarPorcentagemNoGrafico(graficos[1], 0);
        atualizarImagemVerificacao(0);
        return;
      }

      const maior = valores.reduce((a,b) => Math.max(a,b), -Infinity);
      const soma = valores.reduce((a,b) => a + b, 0);
      const media = soma / valores.length;

      const pctMaior = Math.round(maior / 10);
      const pctMedia = Math.round(media / 10);

      const pctMaiorLim = Math.min(100, pctMaior);
      const pctMediaLim = Math.min(100, pctMedia);

      aplicarPorcentagemNoGrafico(graficos[0], pctMaiorLim);
      aplicarPorcentagemNoGrafico(graficos[1], pctMediaLim);

      const elMaiorText = document.querySelector("[data-maior-pontos]");
      if (elMaiorText) elMaiorText.textContent = `${maior} pts`;

      const elMediaText = document.querySelector("[data-media-pontos]");
      if (elMediaText) elMediaText.textContent = `${Math.round(media)} pts`;

      const cartoes = Array.from(document.querySelectorAll(".pequeno"));
      if (cartoes.length >= 1) {
        const barra1 = cartoes[0].querySelector(".barraPreenchida");
        if (barra1) barra1.style.width = `${pctMaiorLim}%`;
      }
      if (cartoes.length >= 2) {
        const barra2 = cartoes[1].querySelector(".barraPreenchida");
        if (barra2) barra2.style.width = `${pctMediaLim}%`;
      }

      // ---- aqui: atualizar imagem verificacao com a porcentagem da MEDIA ----
      atualizarImagemVerificacao(pctMediaLim);

    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Erro inesperado ao buscar estatísticas. Veja console.");
    }
  }

  // executar
  carregarEstatisticas();

  // -----------------------
  // navegação lateral
  // -----------------------
  const analiseBtn = document.getElementById("itemConquistas");
  const rankingBtn = document.getElementById("itemRanking");
  const usuarioBtn = document.getElementById("itemUsuario");

  if (analiseBtn) {
    analiseBtn.style.cursor = "pointer";
    analiseBtn.addEventListener("click", () => window.location.href = "analise.html");
  }
  if (rankingBtn) {
    rankingBtn.style.cursor = "pointer";
    rankingBtn.addEventListener("click", () => window.location.href = "ranking.html");
  }
  if (usuarioBtn) {
    usuarioBtn.style.cursor = "pointer";
    usuarioBtn.addEventListener("click", () => window.location.href = "usuario.html");
  }

  // -----------------------
  // preencher topo e avatar
  // -----------------------
  const nome = localStorage.getItem("user_nome");
  const sobrenome = localStorage.getItem("user_sobrenome");
  const email = localStorage.getItem("user_email");

  const nomeEl = document.getElementById("nomeCompleto");
  const emailEl =
    document.getElementById("emailUsuario") ||
    document.getElementById("emailDisplay") ||
    document.getElementById("email");

  if (nomeEl) nomeEl.textContent = nome && sobrenome ? `${nome} ${sobrenome}` : "Usuário";
  if (emailEl) emailEl.textContent = email || "";

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

  const userImgTopo = document.getElementById("userimg");
  const userMiniTopo = document.getElementById("userMini");
  const userOla = document.getElementById("ola");
  const avatarTopo = localStorage.getItem("user_avatar");

  if (userImgTopo && avatarTopo) userImgTopo.src = avatarTopo;
  if (userMiniTopo && nome && sobrenome) userMiniTopo.textContent = `${nome} ${sobrenome}`;
  if (userOla && nome && sobrenome) userOla.textContent = `Olá, ${nome} ${sobrenome}`;

  // -----------------------
  // pontuação diária (salvar)
  // -----------------------
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
      localStorage.setItem("user_pontuacao_diaria", valor);
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
      // recarregar estatisticas após salvar
      carregarEstatisticas();
    });
  }

  // -----------------------
  // atualizar barra pessoal
  // -----------------------
  async function atualizarBarraProgresso() {
    const barra = document.getElementById("barraProgresso");
    const porcentoLabel = document.querySelector(".porcento");
    if (!barra || !porcentoLabel) return;
    const emailLocal = localStorage.getItem("user_email");
    const { data, error } = await supabaseClient
      .from("usuarios")
      .select("pontuacao")
      .eq("email", emailLocal)
      .single();
    if (error) {
      console.error("Erro ao buscar pontuação:", error);
      return;
    }
    let pontuacao = parseInt(data?.pontuacao || 0);
    let porcentagem = pontuacao / 10;
    if (porcentagem > 100) porcentagem = 100;
    barra.style.width = `${porcentagem}%`;
    porcentoLabel.textContent = `${porcentagem}%`;
  }

  // chamar quando abrir
  atualizarBarraProgresso();

});
