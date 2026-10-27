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
