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
  const title = card.querySelector("h1, h3").textContent;
  const url = `https://muczek.pl/komiksy/${card.id}/`;
  const actions = document.createElement("div");
  actions.className = "comic-actions";
  actions.innerHTML = `
    <details class="comic-share">
      <summary>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>
        </svg>
        <span>Udostępnij</span>
      </summary>
      <div class="share-options"></div>
    </details>
    <span class="share-status visually-hidden" role="status"></span>`;
  card.append(actions);

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
