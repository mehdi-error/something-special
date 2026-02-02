// ====== CONFIG ======
const CORRECT_PASSCODE = "12282006";

// ====== ELEMENTS ======
const screenLock = document.getElementById("screenLock");
const screenVal  = document.getElementById("screenVal");
const screenYes  = document.getElementById("screenYes");

const passInput  = document.getElementById("passcode");
const unlockBtn  = document.getElementById("unlockBtn");
const errorText  = document.getElementById("errorText");

const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");
const btnRow = document.getElementById("btnRow");

const bgMusic = document.getElementById("bgMusic");

// Confetti canvas (safe)
const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas ? confettiCanvas.getContext("2d") : null;

// ====== HELPERS ======
function setTitle(t) {
  document.title = t;
}

function showScreen(which) {
  // guard
  if (!screenLock || !screenVal || !screenYes || !which) return;

  for (const el of [screenLock, screenVal, screenYes]) {
    el.classList.remove("screen--active");
  }

  // Next frame so CSS transition reliably triggers
  requestAnimationFrame(() => {
    which.classList.add("screen--active");
  });
}

// ====== PASSCODE LOGIC ======
function tryUnlock() {
  if (!passInput || !unlockBtn || !errorText) return;

  const val = (passInput.value || "").trim();

  if (val === CORRECT_PASSCODE) {
    errorText.textContent = "";
    setTitle("For Sara ❤️");

    // 🔊 Start music safely (won't crash if missing)
    if (bgMusic) {
      bgMusic.volume = 0.55;
      bgMusic.muted = false;
      bgMusic.play().catch((e) => console.log("Music blocked:", e));
    }

    // smooth transition
    unlockBtn.disabled = true;
    setTimeout(() => {
      showScreen(screenVal);
      unlockBtn.disabled = false;
    }, 180);

  } else {
    errorText.textContent = "Access Restricted. Incorrect Passcode";
    setTitle("Access Restricted");
    passInput.focus();
    passInput.select();
  }
}

// Bind events (safe)
if (unlockBtn) unlockBtn.addEventListener("click", tryUnlock);
if (passInput) {
  passInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryUnlock();
  });
}

// ====== NO BUTTON: swap positions ======
let swapped = false;

if (noBtn && yesBtn && btnRow) {
  noBtn.addEventListener("click", () => {
    swapped = !swapped;

    if (swapped) {
      btnRow.insertBefore(noBtn, yesBtn);
    } else {
      btnRow.insertBefore(yesBtn, noBtn);
    }

    // quick "teleport" feel
    noBtn.style.transform = "translateY(-2px) scale(1.02)";
    setTimeout(() => (noBtn.style.transform = ""), 140);
  });

  // Optional extra: tiny dodge
  noBtn.addEventListener("mouseenter", () => {
    noBtn.style.transform = "translateX(8px)";
    setTimeout(() => (noBtn.style.transform = ""), 120);
  });
}

// ====== YES BUTTON: celebration + confetti ======
if (yesBtn) {
  yesBtn.addEventListener("click", () => {
    setTitle("SHE SAID YES 💖");
    showScreen(screenYes);
    startConfetti();
  });
}

// ====== CONFETTI ======
let confettiPieces = [];
let animId = null;
let running = false;

function resizeCanvas() {
  if (!confettiCanvas || !ctx) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);

function makeConfetti(n = 220) {
  if (!confettiCanvas) return;

  const w = confettiCanvas.width;
  const h = confettiCanvas.height;

  confettiPieces = Array.from({ length: n }, () => {
    const size = 6 + Math.random() * 8;
    return {
      x: Math.random() * w,
      y: -Math.random() * h,
      vx: -1 + Math.random() * 2,
      vy: 2 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: -0.15 + Math.random() * 0.3,
      size,
      color: `hsl(${Math.floor(Math.random() * 360)}, 95%, 65%)`,
      shape: Math.random() < 0.18 ? "heart" : "rect"
    };
  });
}

function drawHeart(x, y, s, color, rot) {
  if (!ctx) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s / 20, s / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(0, -6, -12, -6, -12, 4);
  ctx.bezierCurveTo(-12, 14, 0, 18, 0, 26);
  ctx.bezierCurveTo(0, 18, 12, 14, 12, 4);
  ctx.bezierCurveTo(12, -6, 0, -6, 0, 6);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function frame() {
  if (!running || !confettiCanvas || !ctx) return;

  const w = confettiCanvas.width;
  const h = confettiCanvas.height;

  ctx.clearRect(0, 0, w, h);

  // subtle glow layer
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(0, 0, w, h);

  for (const p of confettiPieces) {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;

    // wrap
    if (p.y > h + 40) {
      p.y = -20;
      p.x = Math.random() * w;
    }
    if (p.x < -40) p.x = w + 40;
    if (p.x > w + 40) p.x = -40;

    if (p.shape === "heart") {
      drawHeart(p.x, p.y, p.size * 1.8, p.color, p.rot);
    } else {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
      ctx.restore();
    }
  }

  animId = requestAnimationFrame(frame);
}

function startConfetti() {
  if (!confettiCanvas || !ctx) return;

  resizeCanvas();
  makeConfetti();
  running = true;

  if (animId) cancelAnimationFrame(animId);
  frame();
}

function stopConfetti() {
  running = false;
  if (animId) cancelAnimationFrame(animId);
  animId = null;

  if (!confettiCanvas || !ctx) return;
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

// Focus input if available
if (passInput) passInput.focus();
