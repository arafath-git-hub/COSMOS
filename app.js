
/* =========================================
   COSMOS — Main JavaScript
   Version: 1.0
   Purpose: Navigation, interactions,
   animations, planet explorer and UI controls
========================================= */

"use strict";

/* =========================================
   1. DOM ELEMENTS
========================================= */

const DOM = {
  menuToggle: document.querySelector(
    "#menu-toggle"
  ),

  navigation: document.querySelector(
    "#main-navigation"
  ),

  loadingScreen: document.querySelector(
    "#loading-screen"
  ),

  exploreButton: document.querySelector(
    "#explore-button"
  ),

  soundButton: document.querySelector(
    "#sound-toggle"
  ),

  backToTop: document.querySelector(
    "#back-to-top"
  ),

  searchInput: document.querySelector(
    "#cosmos-search"
  ),

  searchButton: document.querySelector(
    "#search-button"
  ),

  currentYear: document.querySelector(
    "#current-year"
  ),

  scrollProgress: document.querySelector(
    "#scroll-progress"
  ),

  revealElements: document.querySelectorAll(
    "[data-reveal]"
  ),

  planetCards: document.querySelectorAll(
    "[data-planet]"
  )
};


/* =========================================
   2. APPLICATION STATE
========================================= */

const CosmosState = {
  menuOpen: false,
  soundEnabled: false,
  activePlanet: null,
  initialized: false
};


/* =========================================
   3. PLANET INFORMATION
========================================= */

const PLANETS = [
  {
    name: "Mercury",
    type: "Terrestrial Planet",
    description:
      "The smallest planet in our Solar System and the closest planet to the Sun.",
    distance: "57.9 million km",
    yearLength: "88 Earth days"
  },

  {
    name: "Venus",
    type: "Terrestrial Planet",
    description:
      "A world with a dense atmosphere and an extreme greenhouse effect.",
    distance: "108.2 million km",
    yearLength: "225 Earth days"
  },

  {
    name: "Earth",
    type: "Terrestrial Planet",
    description:
      "Our home world, known for liquid surface water and a remarkable diversity of life.",
    distance: "149.6 million km",
    yearLength: "365.25 days"
  },

  {
    name: "Mars",
    type: "Terrestrial Planet",
    description:
      "The Red Planet, a major target in the search for evidence of ancient habitable environments.",
    distance: "227.9 million km",
    yearLength: "687 Earth days"
  },

  {
    name: "Jupiter",
    type: "Gas Giant",
    description:
      "The largest planet in our Solar System, with powerful storms and many moons.",
    distance: "778.6 million km",
    yearLength: "11.86 Earth years"
  },

  {
    name: "Saturn",
    type: "Gas Giant",
    description:
      "A giant planet famous for its spectacular ring system.",
    distance: "1.43 billion km",
    yearLength: "29.45 Earth years"
  },

  {
    name: "Uranus",
    type: "Ice Giant",
    description:
      "An ice giant that rotates on its side relative to its orbit.",
    distance: "2.87 billion km",
    yearLength: "84 Earth years"
  },

  {
    name: "Neptune",
    type: "Ice Giant",
    description:
      "A distant ice giant with extremely fast winds and a deep blue appearance.",
    distance: "4.50 billion km",
    yearLength: "164.8 Earth years"
  }
];


/* =========================================
   4. GENERAL UTILITIES
========================================= */

function selectElement(selector, parent = document) {
  return parent.querySelector(selector);
}

function selectAll(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

function reduceMotionPreferred() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}

function announce(message) {
  let liveRegion = selectElement("#cosmos-announcer");

  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "cosmos-announcer";
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", "polite");

    Object.assign(liveRegion.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      border: "0"
    });

    document.body.appendChild(liveRegion);
  }

  liveRegion.textContent = message;
}


/* =========================================
   5. MOBILE NAVIGATION
========================================= */

function setMenuState(isOpen) {
  CosmosState.menuOpen = isOpen;

  if (DOM.navigation) {
    DOM.navigation.classList.toggle(
      "is-open",
      isOpen
    );

    DOM.navigation.setAttribute(
      "aria-hidden",
      String(!isOpen)
    );
  }

  if (DOM.menuToggle) {
    DOM.menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    DOM.menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  }

  document.body.classList.toggle(
    "menu-is-open",
    isOpen
  );
}

function initializeNavigation() {
  if (DOM.menuToggle) {
    DOM.menuToggle.addEventListener("click", () => {
      setMenuState(!CosmosState.menuOpen);
    });
  }

  if (DOM.navigation) {
    DOM.navigation.addEventListener("click", (event) => {
      const link = event.target.closest("a");

      if (link) {
        setMenuState(false);
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (
      CosmosState.menuOpen &&
      DOM.navigation &&
      DOM.menuToggle &&
      !DOM.navigation.contains(event.target) &&
      !DOM.menuToggle.contains(event.target)
    ) {
      setMenuState(false);
    }
  });
}


/* =========================================
   6. SMOOTH SECTION NAVIGATION
========================================= */

function initializeSmoothNavigation() {
  const links = selectAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = selectElement(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: reduceMotionPreferred()
          ? "auto"
          : "smooth",
        block: "start"
      });

      if (history.replaceState) {
        history.replaceState(null, "", targetId);
      }
    });
  });
}


/* =========================================
   7. SCROLL PROGRESS
========================================= */

function updateScrollProgress() {
  const scrollableHeight =
    document.documentElement.scrollHeight -
    window.innerHeight;

  const progress = scrollableHeight > 0
    ? (window.scrollY / scrollableHeight) * 100
    : 0;

  if (DOM.scrollProgress) {
    DOM.scrollProgress.style.width =
      `${Math.min(100, Math.max(0, progress))}%`;

    DOM.scrollProgress.setAttribute(
      "aria-valuenow",
      String(Math.round(progress))
    );
  }

  if (DOM.backToTop) {
    DOM.backToTop.classList.toggle(
      "is-visible",
      window.scrollY > 500
    );
  }
}

function initializeScrollProgress() {
  let scheduled = false;

  window.addEventListener(
    "scroll",
    () => {
      if (scheduled) return;

      scheduled = true;

      window.requestAnimationFrame(() => {
        updateScrollProgress();
        scheduled = false;
      });
    },
    { passive: true }
  );

  updateScrollProgress();

  if (DOM.backToTop) {
    DOM.backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotionPreferred()
          ? "auto"
          : "smooth"
      });
    });
  }
}


/* =========================================
   8. SCROLL REVEAL ANIMATIONS
========================================= */

function initializeRevealAnimations() {
  if (!DOM.revealElements.length) {
    return;
  }

  if (
    reduceMotionPreferred() ||
    !("IntersectionObserver" in window)
  ) {
    DOM.revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");

          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  DOM.revealElements.forEach((element) => {
    observer.observe(element);
  });
}


/* =========================================
   9. PLANET EXPLORER
========================================= */

function getPlanet(name) {
  return PLANETS.find(
    (planet) =>
      planet.name.toLowerCase() === name.toLowerCase()
  );
}

function showPlanetDetails(planetName) {
  const planet = getPlanet(planetName);

  if (!planet) {
    announce(`Planet not found: ${planetName}`);
    return;
  }

  CosmosState.activePlanet = planet.name;

  const nameElement = selectElement("#planet-name");
  const typeElement = selectElement("#planet-type");
  const descriptionElement = selectElement(
    "#planet-description"
  );
  const distanceElement = selectElement(
    "#planet-distance"
  );
  const yearElement = selectElement(
    "#planet-year"
  );
  const detailsPanel = selectElement(
    "#planet-details"
  );

  if (nameElement) {
    nameElement.textContent = planet.name;
  }

  if (typeElement) {
    typeElement.textContent = planet.type;
  }

  if (descriptionElement) {
    descriptionElement.textContent =
      planet.description;
  }

  if (distanceElement) {
    distanceElement.textContent = planet.distance;
  }

  if (yearElement) {
    yearElement.textContent = planet.yearLength;
  }

  if (detailsPanel) {
    detailsPanel.hidden = false;

    detailsPanel.scrollIntoView({
      behavior: reduceMotionPreferred()
        ? "auto"
        : "smooth",
      block: "nearest"
    });
  }

  DOM.planetCards.forEach((card) => {
    const isActive =
      card.dataset.planet.toLowerCase() ===
      planet.name.toLowerCase();

    card.classList.toggle("is-active", isActive);

    if (isActive) {
      card.setAttribute("aria-pressed", "true");
    } else {
      card.setAttribute("aria-pressed", "false");
    }
  });

  announce(`${planet.name} selected.`);
}

function initializePlanetExplorer() {
  DOM.planetCards.forEach((card) => {
    card.addEventListener("click", () => {
      const planetName = card.dataset.planet;

      if (planetName) {
        showPlanetDetails(planetName);
      }
    });

    card.setAttribute("aria-pressed", "false");
  });

  const closeButton = selectElement(
    "#close-planet-details"
  );

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      const panel = selectElement("#planet-details");

      if (panel) {
        panel.hidden = true;
      }

      CosmosState.activePlanet = null;

      DOM.planetCards.forEach((card) => {
        card.classList.remove("is-active");
        card.setAttribute("aria-pressed", "false");
      });
    });
  }
}


/* =========================================
   10. UNIVERSAL SEARCH
========================================= */

function performSearch(query) {
  const cleanedQuery = query.trim().toLowerCase();

  if (!cleanedQuery) {
    announce("Enter a planet name to search.");
    DOM.searchInput?.focus();
    return;
  }

  const match = PLANETS.find((planet) =>
    planet.name.toLowerCase().includes(cleanedQuery)
  );

  if (match) {
    showPlanetDetails(match.name);

    const details = selectElement("#planet-details");

    if (details) {
      details.scrollIntoView({
        behavior: reduceMotionPreferred()
          ? "auto"
          : "smooth",
        block: "center"
      });
    }

    return;
  }

  const matchingCard = selectElement(
    `[data-planet]`
  );

  announce(
    `No planet found for "${query}". Try Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus or Neptune.`
  );
}

function initializeSearch() {
  if (DOM.searchButton && DOM.searchInput) {
    DOM.searchButton.addEventListener("click", () => {
      performSearch(DOM.searchInput.value);
    });

    DOM.searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        performSearch(DOM.searchInput.value);
      }
    });
  }
}


/* =========================================
   11. SOUND CONTROL
========================================= */

let audioContext = null;
let ambientGain = null;
let ambientOscillator = null;

function startAmbientSound() {
  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContextClass) {
    announce("Audio is not supported by this browser.");
    return false;
  }

  try {
    if (!audioContext) {
      audioContext = new AudioContextClass();

      ambientOscillator = audioContext.createOscillator();
      ambientGain = audioContext.createGain();

      ambientOscillator.type = "sine";
      ambientOscillator.frequency.value = 55;

      ambientGain.gain.value = 0;

      ambientOscillator.connect(ambientGain);
      ambientGain.connect(audioContext.destination);

      ambientOscillator.start();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    ambientGain.gain.setTargetAtTime(
      0.012,
      audioContext.currentTime,
      0.5
    );

    CosmosState.soundEnabled = true;

    return true;
  } catch (error) {
    console.error("Unable to start audio:", error);
    announce("Unable to start sound.");
    return false;
  }
}

function stopAmbientSound() {
  if (audioContext && ambientGain) {
    ambientGain.gain.setTargetAtTime(
      0,
      audioContext.currentTime,
      0.2
    );
  }

  CosmosState.soundEnabled = false;
}

function initializeSoundControl() {
  if (!DOM.soundButton) return;

  DOM.soundButton.setAttribute(
    "aria-pressed",
    "false"
  );

  DOM.soundButton.addEventListener("click", () => {
    if (CosmosState.soundEnabled) {
      stopAmbientSound();

      DOM.soundButton.setAttribute(
        "aria-pressed",
        "false"
      );

      DOM.soundButton.textContent = "Enable Sound";

      return;
    }

    const started = startAmbientSound();

    if (started) {
      DOM.soundButton.setAttribute(
        "aria-pressed",
        "true"
      );

      DOM.soundButton.textContent = "Disable Sound";
    }
  });
}


/* =========================================
   12. HERO EXPLORE BUTTON
========================================= */

function initializeExploreButton() {
  if (!DOM.exploreButton) return;

  DOM.exploreButton.addEventListener("click", () => {
    const target =
      selectElement("#solar-system") ||
      selectElement("#planets") ||
      selectElement("#explore");

    if (target) {
      target.scrollIntoView({
        behavior: reduceMotionPreferred()
          ? "auto"
          : "smooth",
        block: "start"
      });
    } else {
      announce(
        "The exploration section has not been added yet."
      );
    }
  });
}


/* =========================================
   13. CURRENT YEAR
========================================= */

function initializeFooter() {
  if (DOM.currentYear) {
    DOM.currentYear.textContent =
      String(new Date().getFullYear());
  }
}


/* =========================================
   14. LOADING SCREEN
========================================= */

function initializeLoadingScreen() {
  if (!DOM.loadingScreen) return;

  const hideLoader = () => {
    DOM.loadingScreen.classList.add("is-hidden");
    DOM.loadingScreen.setAttribute("aria-hidden", "true");
  };

  if (document.readyState === "complete") {
    window.setTimeout(hideLoader, 300);
  } else {
    window.addEventListener("load", () => {
      window.setTimeout(hideLoader, 300);
    }, { once: true });
  }
}


/* =========================================
   15. KEYBOARD ACCESSIBILITY
========================================= */

function initializeKeyboardSupport() {
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "/" &&
      !["INPUT", "TEXTAREA"].includes(
        document.activeElement?.tagName
      )
    ) {
      if (DOM.searchInput) {
        event.preventDefault();
        DOM.searchInput.focus();
      }
    }
  });
}


/* =========================================
   16. APPLICATION INITIALIZATION
========================================= */

function initializeCosmos() {
  if (CosmosState.initialized) return;

  CosmosState.initialized = true;

  initializeNavigation();
  initializeSmoothNavigation();
  initializeScrollProgress();
  initializeRevealAnimations();
  initializePlanetExplorer();
  initializeSearch();
  initializeSoundControl();
  initializeExploreButton();
  initializeFooter();
  initializeLoadingScreen();
  initializeKeyboardSupport();

  console.log(
    "%c COSMOS ",
    "background:#071326;color:#7de7ff;font-size:20px;font-weight:bold;padding:8px;"
  );

  console.log(
    "COSMOS initialized. Ready to explore the Solar System."
  );
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeCosmos,
    { once: true }
  );
} else {
  initializeCosmos();
}
