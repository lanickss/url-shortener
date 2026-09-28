// static/app.js
// Client AJAX (Single Page Application) pour l'API v2.
// Si cette page est servie par un serveur différent de l'API (par exemple
// avec `python -m http.server`), adapter la ligne suivante avec l'origine
// du serveur Node.js, par exemple : "http://127.0.0.1:8080"
const originURL = "";

const form = document.getElementById("submit-link");
const countEl = document.getElementById("count");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");
const originUrlEl = document.getElementById("origin-url");
const shortLinkEl = document.getElementById("short-link");
const copyBtn = document.getElementById("copy-btn");
const copiedMsg = document.getElementById("copied-msg");

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.add("visible");
  resultEl.classList.remove("visible");
}

function hideError() {
  errorEl.classList.remove("visible");
}

async function refreshCount() {
  try {
    const res = await fetch(`${originURL}/api-v2/`, {
      headers: { Accept: "application/json" },
    });
    const data = await res.json();
    countEl.textContent = `${data.count} lien${data.count === 1 ? "" : "s"} déjà créé${data.count === 1 ? "" : "s"}.`;
  } catch {
    countEl.textContent = "";
  }
}

function showResult(link) {
  const shortUrl = `${originURL}/api-v2/${link.short_url}`;
  originUrlEl.textContent = link.origin_url;
  shortLinkEl.textContent = shortUrl;
  shortLinkEl.href = shortUrl;
  resultEl.classList.add("visible");
  copiedMsg.style.display = "none";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const url = document.getElementById("url").value;

  try {
    const res = await fetch(`${originURL}/api-v2/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error ?? "Une erreur est survenue.");
      return;
    }

    showResult(data);
    await refreshCount();
  } catch (err) {
    showError("Impossible de contacter le serveur.");
  }
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shortLinkEl.href);
    copiedMsg.style.display = "inline";
  } catch {
    showError("Impossible de copier le lien dans le presse-papier.");
  }
});

refreshCount();
