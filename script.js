const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const closeButton = lightbox.querySelector(".lightbox-close");

document.querySelectorAll(".comic-image-button").forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.showModal();
  });
});

closeButton.addEventListener("click", () => lightbox.close());

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

// Public site-wide total; GoatCounter caches this independently of tracking.
async function loadVisitCount() {
  const counter = document.querySelector("#visit-count");
  if (!counter) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch("https://muczek.goatcounter.com/counter/TOTAL.json", {
      signal: controller.signal,
      credentials: "omit",
    });
    if (!response.ok) throw new Error("Visit count unavailable");

    const data = await response.json();
    if (typeof data.count !== "string" || !/^\d[\d\s,.]*$/.test(data.count)) {
      throw new Error("Invalid visit count");
    }
    counter.textContent = data.count;
  } catch {
    counter.textContent = "Niedostępne";
    counter.title = "Nie udało się pobrać statystyk GoatCounter. Publiczny licznik musi być włączony w ustawieniach usługi; połączenie może też blokować przeglądarka.";
  } finally {
    clearTimeout(timeout);
  }
}

loadVisitCount();

document.querySelectorAll(".comic-card[id]").forEach((card) => {
  const title = card.querySelector("h3").textContent;
  const url = `https://muczek.pl/#${card.id}`;
  const storageKey = `muczek:liked:${card.id}`;
  const actions = document.createElement("div");
  actions.className = "comic-actions";
  actions.innerHTML = `
    <button class="like-button" type="button" aria-pressed="false">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>
      <span>Lubię to</span>
    </button>
    <details class="comic-share">
      <summary>Udostępnij ↗</summary>
      <div class="share-options"></div>
    </details>
    <span class="share-status visually-hidden" role="status"></span>`;
  card.append(actions);

  const like = actions.querySelector(".like-button");
  like.setAttribute("aria-label", `Polub komiks: ${title}`);
  function markLiked() {
    like.setAttribute("aria-pressed", "true");
    like.setAttribute("aria-label", `Polubiono komiks: ${title}`);
    like.querySelector("span").textContent = "Polubiono";
    like.disabled = true;
  }
  try {
    if (localStorage.getItem(storageKey) === "1") markLiked();
  } catch { /* Storage can be unavailable in private browsing. */ }
  like.addEventListener("click", () => {
    markLiked();
    try { localStorage.setItem(storageKey, "1"); } catch { /* Keep the session's like. */ }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey && event.newValue === "1") markLiked();
  });

  const options = actions.querySelector(".share-options");
  const text = `${title} — Muczek i Przyjaciele`;
  const destinations = [
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`],
    ["X", `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`],
    ["WhatsApp", `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`],
  ];
  destinations.forEach(([name, href]) => {
    const link = document.createElement("a");
    link.textContent = name;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Udostępnij komiks „${title}”: ${name} (nowa karta)`);
    options.append(link);
  });
  const copy = document.createElement("button");
  copy.type = "button";
  copy.textContent = "Kopiuj link";
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
      copy.textContent = "Skopiowano!";
      actions.querySelector(".share-status").textContent = "Link skopiowany.";
    } catch {
      actions.querySelector(".share-status").textContent = "Nie udało się skopiować linku. Link do komiksu jest widoczny poniżej.";
      let fallback = options.querySelector(".share-link");
      if (!fallback) {
        fallback = document.createElement("input");
        fallback.className = "share-link";
        fallback.readOnly = true;
        fallback.setAttribute("aria-label", "Link do komiksu — skopiuj ręcznie");
        fallback.value = url;
        options.append(fallback);
      }
      fallback.focus();
      fallback.select();
    }
  });
  options.append(copy);
});
