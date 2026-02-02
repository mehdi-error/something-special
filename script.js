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

// Confetti
const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas ? confettiCanvas.getContext("2d") : null;

// ====== SCREEN STATE (IMPORTANT FOR FADE) ======
let currentScreen = screenLock;
let z = 10;

// ====== HELPERS ======
function setTitle(t) {
  document.title = t;
}

/**
 * BULLETPROOF CROSS-FADE
 * Forces reflow + two animation frames so browser MUST animate
 */
function showScreen(next) {
  if (!next || !currentScreen) return;

  // Bring next screen above
  z += 1;
  next.style.zIndex = z;

  // Ensure next starts hidden
  next.classList.remove("screen--active");

  // FORCE browser to apply hidden state
  void next.offsetHeight;

  // Frame 1: fade next in
  requestAnimationFrame(() => {
    next.classList.add("screen--active");

    // Frame 2: fade current out
    requestAnimationFrame(() => {
      if (currentScreen !== next) {
        currentScreen.classList.remove("screen--active");
        currentScreen = next;
      }
    });
  });
}

// ====== PASSCODE LOGIC ======
function tryUnlock() {
  if (!passInput || !unlockBtn || !errorText) return;

  const val = passInput.value.trim();

  if (val === CORRECT_PASSCODE) {
    errorText.textContent = "";
    setTitle("For Sara ❤️");

    // 🔊 Start music (safe)
    if (bgMusic) {
      bgMusic.volume = 0.55;
      bgMusic.muted = false;
      bgMusic.play().catch(() => {});
    }

    unlockBtn.disabled = true;

    // Delay makes fade feel intentional
    setTimeout(() => {
      showScreen(screenVal);
      unlockBtn.disabled = false;
    }, 350);

  } else {
    errorText.textContent = "Access Restricted. Incorrect Passcode";
    setTitle("Access Restricted");
    passInput.focus();
    passInput.select();
  }
}

// ====== EVENTS ======
if (unlockBtn) unlockBtn.addEventListener("click", tryUnlock);
if (passInput) {
  passInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryUnlock();
  });
}

// ====== NO BUTTON BEHAVIOR ======
let swapped = false;

if (noBtn && yesBtn && btnRow) {
  noBtn.addEventListener("click", () => {
    swapped = !swapped;
    if (swapped) {
      btnRow.insertBefore(noBtn, yesBtn);
    } else {
      btnRow.insertBefore(yesBtn, noBtn);
    }

    noBtn.style.transform = "scale(1.05)";
    setTimeout(() => (noBtn.style.transform = ""), 120);
  });

  noBtn.addEventListener("mouseenter", () => {
    noBtn.style.transform = "translateX(8px)";
    setTimeout(() => (noBtn.style.transform = ""), 120);
  });
}

// ====== YES BUTTON ======
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

  confettiPieces = Array.from({ length: n }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -Math.random() * confettiCanvas.height,
    vx: -1 + Math.random() * 2,
    vy: 2 + Math.random() * 5,
    rot: Math.random() * Math.PI,
    vr: -0.15 + Math.random() * 0.3,
    size: 6 + Math.random() * 8,
    color: `hsl(${Math.random() * 360},95%,65%)`,
    shape: Math.random() < 0.2 ? "heart" : "rect"
  }));
}

function drawHeart(x, y, s, c, r) {
  if (!ctx) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);
  ctx.scale(s / 20, s / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(0, -6, -12, -6, -12, 4);
  ctx.bezierCurveTo(-12, 14, 0, 18, 0, 26);
  ctx.bezierCurveTo(0, 18, 12, 14, 12, 4);
  ctx.bezierCurveTo(12, -6, 0, -6, 0, 6);
  ctx.closePath();
  ctx.fillStyle = c;
  ctx.fill();
  ctx.restore();
}

function frame() {
  if (!running || !ctx) return;

  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (const p of confettiPieces) {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;

    if (p.y > confettiCanvas.height + 40) p.y = -20;

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
  if (!ctx) return;
  resizeCanvas();
  makeConfetti();
  running = true;
  cancelAnimationFrame(animId);
  frame();
}

// Autofocus
if (passInput) passInput.focus();
