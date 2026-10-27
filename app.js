const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  mainNav.classList.toggle("open", isOpen);
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const previewSteps = [...document.querySelectorAll("[data-preview-step]")];
const phonePanels = [...document.querySelectorAll("[data-phone-screen]")];
const previewSection = document.querySelector(".app-showcase");
const mapLoading = document.querySelector("#map-loading");
let pakhojMap;
let profileMap;

function initializePakistanMap() {
  if (pakhojMap) {
    window.requestAnimationFrame(() => pakhojMap.invalidateSize());
    return;
  }

  if (!window.L) {
    mapLoading.textContent = "Map preview couldn't load.";
    console.error("Pakhoj map preview could not load Leaflet.");
    return;
  }

  pakhojMap = window.L.map("pakhoj-map", {
    attributionControl: true,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: false,
    keyboard: false,
    scrollWheelZoom: false,
    tap: false,
    touchZoom: false,
    zoomControl: false,
    zoomSnap: 0.1,
  }).setView([30.2, 68.8], 4.1);

  const placeTiles = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(pakhojMap);

  placeTiles.once("load", () => {
    mapLoading.textContent = "";
  });
  placeTiles.on("tileerror", () => {
    mapLoading.textContent = "Map tiles couldn't load.";
  });

  const destinations = [
    { coordinates: [36.3167, 74.65], featured: true },
    { coordinates: [36.367, 74.856], featured: false },
    { coordinates: [35.297, 75.633], featured: false },
    { coordinates: [35.324, 75.551], featured: true },
    { coordinates: [35.46, 74.897], featured: false },
    { coordinates: [34.887, 73.652], featured: false },
    { coordinates: [34.816, 74.365], featured: false },
    { coordinates: [34.628, 73.498], featured: false },
    { coordinates: [33.857, 73.797], featured: false },
    { coordinates: [33.729, 73.037], featured: false },
    { coordinates: [31.52, 74.358], featured: false },
    { coordinates: [29.395, 71.683], featured: false },
    { coordinates: [25.126, 62.322], featured: true },
    { coordinates: [24.861, 67.009], featured: false },
  ];

  destinations.forEach(({ coordinates, featured }) => {
    window.L.circleMarker(coordinates, {
      className: `pakhoj-map-marker${featured ? " is-featured" : ""}`,
      color: featured ? "#bd7400" : "#067c61",
      fillColor: featured ? "#f9a718" : "#19be8d",
      fillOpacity: 1,
      radius: 5.5,
      weight: 1.5,
    }).addTo(pakhojMap);
  });

  window.requestAnimationFrame(() => pakhojMap.invalidateSize());
}

function initializeProfileMap() {
  if (profileMap) {
    window.requestAnimationFrame(() => profileMap.invalidateSize());
    return;
  }

  const profileMapLoading = document.querySelector("#profile-map-loading");
  if (!window.L) {
    profileMapLoading.textContent = "Profile map couldn't load.";
    console.error("Pakhoj profile preview could not load Leaflet.");
    return;
  }

  profileMap = window.L.map("profile-mini-map", {
    attributionControl: true,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: false,
    keyboard: false,
    scrollWheelZoom: false,
    tap: false,
    touchZoom: false,
    zoomControl: false,
    zoomSnap: 0.1,
  }).setView([30.2, 68.8], 4);

  const profileTiles = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(profileMap);

  profileTiles.once("load", () => {
    profileMapLoading.textContent = "";
  });
  profileTiles.on("tileerror", () => {
    profileMapLoading.textContent = "Profile map tiles couldn't load.";
  });

  window.requestAnimationFrame(() => profileMap.invalidateSize());
}

function showPhonePreview(name) {
  phonePanels.forEach((panel) => {
    const isActive = panel.dataset.phoneScreen === name;
    panel.classList.toggle("is-active", isActive);
    panel.setAttribute("aria-hidden", String(!isActive));
  });

  previewSteps.forEach((step) => {
    step.classList.toggle("is-active", step.dataset.previewStep === name);
  });

  if (name === "map") {
    initializePakistanMap();
  }
  if (name === "profile") {
    initializeProfileMap();
  }
}

function updatePhonePreview() {
  const sectionBounds = previewSection.getBoundingClientRect();
  if (sectionBounds.bottom <= 0 || sectionBounds.top >= window.innerHeight) {
    return;
  }

  const viewportCenter = window.innerHeight / 2;
  const currentStep = previewSteps.reduce((closest, step) => {
    const bounds = step.getBoundingClientRect();
    const distance = Math.abs(bounds.top + bounds.height / 2 - viewportCenter);
    return distance < closest.distance ? { step, distance } : closest;
  }, { step: previewSteps[0], distance: Infinity }).step;

  showPhonePreview(currentStep.dataset.previewStep);
}

if ("IntersectionObserver" in window) {
  const previewObserver = new IntersectionObserver(
    updatePhonePreview,
    { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
  );

  previewSteps.forEach((step) => previewObserver.observe(step));
}

window.addEventListener("scroll", updatePhonePreview, { passive: true });
window.addEventListener("resize", updatePhonePreview);
