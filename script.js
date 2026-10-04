// Enable animation styles only when JavaScript is available.
document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const sections = [...document.querySelectorAll("main section[id]")];

// Compact the navigation once the page starts moving.
const updateHeader = () => {
  header?.classList.toggle("scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

// Accessible mobile menu.
const closeMenu = () => {
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  const label = menuToggle?.querySelector(".menu-label");
  if (label) label.textContent = "Menu";
};

menuToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  const label = menuToggle.querySelector(".menu-label");
  if (label) label.textContent = isOpen ? "Close" : "Menu";
});

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

// Reveal elements as they enter the viewport.
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8%" }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

// Indicate which section is currently in view.
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    });
  },
  { rootMargin: "-35% 0px -55%", threshold: 0 }
);

sections.forEach((section) => sectionObserver.observe(section));

// Gentle depth movement for the layered hero previews.
const heroVisual = document.querySelector("[data-hero-visual]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const hasPrecisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

if (heroVisual && !prefersReducedMotion.matches && hasPrecisePointer.matches) {
  const cards = [...heroVisual.querySelectorAll("[data-depth]")];
  let animationFrame;

  const moveCards = (event) => {
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => {
      const bounds = heroVisual.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

      cards.forEach((card) => {
        const depth = Number(card.dataset.depth) || 1;
        card.style.setProperty("--depth-x", `${x * depth * 9}px`);
        card.style.setProperty("--depth-y", `${y * depth * 7}px`);
      });
    });
  };

  const resetCards = () => {
    cards.forEach((card) => {
      card.style.setProperty("--depth-x", "0px");
      card.style.setProperty("--depth-y", "0px");
    });
  };

  heroVisual.addEventListener("pointermove", moveCards, { passive: true });
  heroVisual.addEventListener("pointerleave", resetCards);
}

// Remove broken image indicators while preserving intentional placeholder panels.
document.querySelectorAll(".placeholder-image").forEach((image) => {
  const removeBrokenImage = () => image.remove();
  if (image.complete && image.naturalWidth === 0) removeBrokenImage();
  else image.addEventListener("error", removeBrokenImage, { once: true });
});

// Each retouching card independently switches between its edited and original image.
document.querySelectorAll("[data-retouch-card]").forEach((card) => {
  const image = card.querySelector(".retouch-image img");
  const button = card.querySelector(".retouch-toggle");
  if (!image || !button) return;

  const originalImage = new Image();
  originalImage.src = image.dataset.before;
  let showingBefore = false;

  button.addEventListener("click", () => {
    button.disabled = true;
    image.classList.add("is-switching");

    window.setTimeout(() => {
      showingBefore = !showingBefore;
      image.src = showingBefore ? image.dataset.before : image.dataset.after;
      image.alt = showingBefore ? image.dataset.beforeAlt : image.dataset.afterAlt;
      button.textContent = showingBefore ? "View After" : "View Before";
      button.setAttribute("aria-pressed", String(showingBefore));
      image.classList.remove("is-switching");
      button.disabled = false;
    }, prefersReducedMotion.matches ? 0 : 180);
  });
});

// Keep the copyright year current.
const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
