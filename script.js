// Número do WhatsApp (DDI + DDD + número, só dígitos) — troque pelo número real
const WHATSAPP = "5519999288853";

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

// ---------- Planos: mensal / trimestral ----------
document.querySelectorAll(".billing__btn").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".billing__btn").forEach((b) => b.classList.toggle("active", b === btn));
    const period = btn.dataset.period;
    document.querySelectorAll(".plan__price span").forEach((span) => {
      span.style.opacity = 0;
      setTimeout(() => {
        span.textContent = span.dataset[period];
        span.style.opacity = 1;
      }, 200);
    });
  })
);

// Clicar em "Escolher plano" já preenche o formulário
document.querySelectorAll("[data-plan]").forEach((btn) =>
  btn.addEventListener("click", () => (document.getElementById("cPlano").value = btn.dataset.plan))
);

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
  const plano = document.getElementById("cPlano").value;
  const msg =
    `Olá, Saimon! Gostaria de agendar minha avaliação.\n\n` +
    `*Nome:* ${nome}\n*WhatsApp:* ${tel}\n*Objetivo:* ${objetivo}\n*Plano:* ${plano}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  document.getElementById("formMsg").textContent = "Abrindo o WhatsApp... 💪";
});

// Botão flutuante abre o WhatsApp direto
document.querySelector(".whats-float").addEventListener("click", (e) => {
  e.preventDefault();
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá, Saimon! Quero saber mais sobre os treinos.")}`, "_blank");
});

document.getElementById("year").textContent = new Date().getFullYear();
