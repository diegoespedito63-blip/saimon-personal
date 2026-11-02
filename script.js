// Número do WhatsApp (DDI + DDD + número, só dígitos) — troque pelo número real
const WHATSAPP = "5519999288853";

// URL do Google Apps Script que guarda as avaliações (veja avaliacoes.gs).
// Enquanto estiver vazia, as avaliações ficam salvas só no navegador de quem enviou.
const API_AVALIACOES = "https://script.google.com/macros/s/AKfycbx0Z5lZrar5ac3uSKAYJ5kqaI2C7D6hAGk0yYPuZgF-akblhaG2wSkZ63v09fSNfNDT5g/exec";

// ---------- Header ao rolar ----------
const header = document.getElementById("header");
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 40));

// ---------- Menu mobile ----------
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("open");
  nav.classList.toggle("open");
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    menuToggle.classList.remove("open");
    nav.classList.remove("open");
  })
);

// ---------- Link ativo conforme a seção ----------
const navLinks = [...document.querySelectorAll(".nav__link")];
const sections = navLinks.map((l) => document.querySelector(l.getAttribute("href")));
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => s && spy.observe(s));

// ---------- Contadores ----------
function animateCount(el) {
  const target = +el.dataset.count;
  const start = performance.now();
  const dur = 1600;
  const step = (now) => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------- Reveal ao rolar ----------
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      e.target.querySelectorAll("[data-count]").forEach(animateCount);
      revealObs.unobserve(e.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 0.1}s`;
  revealObs.observe(el);
});


// ---------- Calculadora IMC / gasto calórico ----------
document.getElementById("calcForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const sexo = document.getElementById("sexo").value;
  const idade = +document.getElementById("idade").value;
  const peso = +document.getElementById("peso").value;
  const altura = +document.getElementById("altura").value;
  const fator = +document.getElementById("atividade").value;

  const imc = peso / Math.pow(altura / 100, 2);
  const classes = [
    [18.5, "Abaixo do peso"],
    [25, "Peso normal"],
    [30, "Sobrepeso"],
    [35, "Obesidade grau I"],
    [40, "Obesidade grau II"],
    [Infinity, "Obesidade grau III"],
  ];
  const classe = classes.find(([lim]) => imc < lim)[1];

  // Mifflin-St Jeor
  const tmb = 10 * peso + 6.25 * altura - 5 * idade + (sexo === "m" ? 5 : -161);
  const tdee = Math.round(tmb * fator);

  document.getElementById("resImc").textContent = imc.toFixed(1).replace(".", ",");
  document.getElementById("resClass").textContent = classe;
  document.getElementById("resTdee").textContent = tdee.toLocaleString("pt-BR");
  const result = document.getElementById("calcResult");
  result.hidden = false;
  result.style.animation = "none";
  void result.offsetWidth;
  result.style.animation = "";
});

// ---------- Slider de depoimentos ----------
const track = document.getElementById("sliderTrack");
const slides = track.children;
const dotsBox = document.getElementById("sliderDots");
let index = 0;
const perView = () => (window.innerWidth <= 960 ? 1 : 2);
const maxIndex = () => slides.length - perView();

function renderDots() {
  dotsBox.innerHTML = "";
  for (let i = 0; i <= maxIndex(); i++) {
    const d = document.createElement("button");
    d.setAttribute("aria-label", `Depoimento ${i + 1}`);
    d.addEventListener("click", () => goTo(i));
    dotsBox.appendChild(d);
  }
}
function goTo(i) {
  index = (i + maxIndex() + 1) % (maxIndex() + 1);
  const w = slides[0].getBoundingClientRect().width + 24;
  track.style.transform = `translateX(${-index * w}px)`;
  [...dotsBox.children].forEach((d, k) => d.classList.toggle("active", k === index));
}
document.getElementById("prevSlide").addEventListener("click", () => goTo(index - 1));
document.getElementById("nextSlide").addEventListener("click", () => goTo(index + 1));
window.addEventListener("resize", () => { renderDots(); goTo(Math.min(index, maxIndex())); });
renderDots();
goTo(0);
let auto = setInterval(() => goTo(index + 1), 6000);
track.parentElement.addEventListener("mouseenter", () => clearInterval(auto));
track.parentElement.addEventListener("mouseleave", () => (auto = setInterval(() => goTo(index + 1), 6000)));

// ---------- FAQ: só um aberto por vez ----------
document.querySelectorAll(".faq__list details").forEach((d) =>
  d.addEventListener("toggle", () => {
    if (d.open) document.querySelectorAll(".faq__list details").forEach((o) => o !== d && (o.open = false));
  })
);

// ---------- Formulário → WhatsApp ----------
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("cNome").value.trim();
  const tel = document.getElementById("cTel").value.trim();
  const objetivo = document.getElementById("cObjetivo").value;
  const msg =
    `Olá, Saimon! Gostaria de agendar minha avaliação.\n\n` +
    `*Nome:* ${nome}\n*WhatsApp:* ${tel}\n*Objetivo:* ${objetivo}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  document.getElementById("formMsg").textContent = "Abrindo o WhatsApp... 💪";
});

// Botão flutuante abre o WhatsApp direto
document.querySelector(".whats-float").addEventListener("click", (e) => {
  e.preventDefault();
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá, Saimon! Quero saber mais sobre os treinos.")}`, "_blank");
});

// ---------- Avaliações ----------
const STORAGE_KEY = "saimon_avaliacoes";
const POR_PAGINA = 5;
let avaliacoes = [];
let mostrando = POR_PAGINA;
let nota = 0;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const estrelas = (n) => "★".repeat(n) + `<span class="off">${"★".repeat(5 - n)}</span>`;
const iniciais = (nome) => nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
const CORES = ["#e5191f", "#457b9d", "#9d0208", "#6c757d", "#2a9d8f", "#e76f51"];

async function carregarAvaliacoes() {
  if (API_AVALIACOES) {
    try {
      const res = await fetch(API_AVALIACOES);
      avaliacoes = await res.json();
    } catch {
      avaliacoes = [];
    }
  } else {
    avaliacoes = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  }
  avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
  renderAvaliacoes();
}

function renderAvaliacoes() {
  const total = avaliacoes.length;
  const media = total ? avaliacoes.reduce((s, a) => s + Number(a.nota), 0) / total : 0;

  document.getElementById("revAvg").textContent = total ? media.toFixed(1).replace(".", ",") : "–";
  document.getElementById("revAvgStars").innerHTML = estrelas(Math.round(media));
  document.getElementById("revCount").textContent = total
    ? `${total} ${total === 1 ? "avaliação" : "avaliações"}`
    : "Nenhuma avaliação ainda";

  document.getElementById("revDist").innerHTML = [5, 4, 3, 2, 1]
    .map((n) => {
      const qtd = avaliacoes.filter((a) => Number(a.nota) === n).length;
      const pct = total ? (qtd / total) * 100 : 0;
      return `<div class="dist-row"><span>${n}★</span><div><i style="--w:${pct}%"></i></div><span>${qtd}</span></div>`;
    })
    .join("");

  const lista = document.getElementById("revList");
  if (!total) {
    lista.innerHTML = `<p class="reviews__empty">Seja o primeiro a avaliar! ⭐</p>`;
    return;
  }
  lista.innerHTML = avaliacoes
    .slice(0, mostrando)
    .map((a, i) => {
      const data = new Date(a.data).toLocaleDateString("pt-BR");
      return `<article class="review">
        <div class="review__head">
          <span class="avatar" style="--c:${CORES[i % CORES.length]}">${escapeHtml(iniciais(a.nome))}</span>
          <div><strong>${escapeHtml(a.nome)}</strong><small>${data}</small></div>
          <div class="stars-static">${estrelas(Number(a.nota))}</div>
        </div>
        <p>${escapeHtml(a.texto)}</p>
      </article>`;
    })
    .join("");
  if (total > mostrando) {
    const btn = document.createElement("button");
    btn.className = "btn btn--outline reviews__more";
    btn.textContent = "Ver mais avaliações";
    btn.addEventListener("click", () => {
      mostrando += POR_PAGINA;
      renderAvaliacoes();
    });
    lista.appendChild(btn);
  }
}

// Seleção de estrelas
const starBtns = [...document.querySelectorAll("#starInput button")];
const pintar = (n) => starBtns.forEach((b) => b.classList.toggle("on", +b.dataset.v <= n));
starBtns.forEach((b) => {
  b.addEventListener("click", () => { nota = +b.dataset.v; pintar(nota); });
  b.addEventListener("mouseenter", () => pintar(+b.dataset.v));
});
document.getElementById("starInput").addEventListener("mouseleave", () => pintar(nota));

document.getElementById("reviewForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("reviewMsg");
  if (!nota) {
    msg.textContent = "Escolha de 1 a 5 estrelas.";
    return;
  }
  const nova = {
    nome: document.getElementById("rNome").value.trim(),
    texto: document.getElementById("rTexto").value.trim(),
    nota,
    data: new Date().toISOString(),
  };

  if (API_AVALIACOES) {
    msg.textContent = "Enviando...";
    try {
      // text/plain evita o bloqueio de CORS do Apps Script
      await fetch(API_AVALIACOES, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(nova) });
      msg.textContent = "Obrigado! Sua avaliação será publicada após aprovação. 💪";
    } catch {
      msg.textContent = "Não foi possível enviar agora. Tente novamente.";
      return;
    }
  } else {
    const salvas = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    salvas.push(nova);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(salvas));
    msg.textContent = "Obrigado pela sua avaliação! 💪";
    carregarAvaliacoes();
  }
  e.target.reset();
  nota = 0;
  pintar(0);
});

carregarAvaliacoes();

document.getElementById("year").textContent = new Date().getFullYear();
