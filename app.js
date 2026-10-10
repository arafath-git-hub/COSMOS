
/* =========================================================
   COSMOS — Main JavaScript
   File: app.js
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   1. PLANET INFORMATION
   --------------------------------------------------------- */

const PLANETS = {
  Mercury: {
    type: "Terrestrial planet",
    description:
      "Mercury is the smallest planet in our Solar System. It orbits closest to the Sun and has a heavily cratered surface.",
    distance: "57.9 million km",
    year: "88 Earth days"
  },

  Venus: {
    type: "Terrestrial planet",
    description:
      "Venus is the hottest planet in our Solar System. Its thick atmosphere traps heat through an intense greenhouse effect.",
    distance: "108.2 million km",
    year: "225 Earth days"
  },

  Earth: {
    type: "Terrestrial planet",
    description:
      "Earth is our home planet. It has liquid water on its surface and is the only world currently known to support life.",
    distance: "149.6 million km",
    year: "365.25 Earth days"
  },

  Mars: {
    type: "Terrestrial planet",
    description:
      "Mars is known as the Red Planet because of iron-rich minerals in its soil. Scientists study it to understand its past and potential habitability.",
    distance: "227.9 million km",
    year: "687 Earth days"
  },

  Jupiter: {
    type: "Gas giant",
    description:
      "Jupiter is the largest planet in our Solar System. It has powerful storms, many moons, and a famous storm called the Great Red Spot.",
    distance: "778.6 million km",
    year: "11.86 Earth years"
  },

  Saturn: {
    type: "Gas giant",
    description:
      "Saturn is famous for its spectacular rings, which consist mainly of pieces of ice, rocky material, and dust.",
    distance: "1.43 billion km",
    year: "29.45 Earth years"
  },

  Uranus: {
    type: "Ice giant",
    description:
      "Uranus is an ice giant that rotates on its side compared with most planets. Its atmosphere contains hydrogen, helium, and methane.",
    distance: "2.87 billion km",
    year: "84 Earth years"
  },

  Neptune: {
    type: "Ice giant",
    description:
      "Neptune is the most distant of the eight planets from the Sun. It is a cold, blue world with extremely fast winds.",
    distance: "4.50 billion km",
    year: "164.8 Earth years"
  }
};


/* ---------------------------------------------------------
   2. SELECT HTML ELEMENTS
   --------------------------------------------------------- */

const menuToggle = document.querySelector("#menu-toggle");
const navigation = document.querySelector("#main-navigation");

const loadingScreen = document.querySelector("#loading-screen");
const exploreButton = document.querySelector("#explore-button");

const soundToggle = document.querySelector("#sound-toggle");
const backToTopButton = document.querySelector("#back-to-top");

const searchInput = document.querySelector("#cosmos-search");
const searchButton = document.querySelector("#search-button");
const searchStatus = document.querySelector("#search-status");

const currentYear = document.querySelector("#current-year");
const scrollProgress = document.querySelector("#scroll-progress");

const planetCards = document.querySelectorAll("[data-planet]");

const planetDetails = document.querySelector("#planet-details");
const planetName = document.querySelector("#planet-name");
const planetType = document.querySelector("#planet-type");
const planetDescription = document.querySelector("#planet-description");
const planetDistance = document.querySelector("#planet-distance");
const planetYear = document.querySelector("#planet-year");
const closePlanetDetails = document.querySelector(
  "#close-planet-details"
);

const cosmosAnnouncer = document.querySelector("#cosmos-announcer");


/* ---------------------------------------------------------
   3. MOBILE NAVIGATION
   --------------------------------------------------------- */

function closeNavigation() {
  if (!menuToggle || !navigation) return;

  menuToggle.classList.remove("is-active");
  navigation.classList.remove("is-open");

  menuToggle.setAttribute("aria-expanded", "false");
}

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");

    menuToggle.classList.toggle("is-active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNavigation =
      navigation.contains(event.target) ||
      menuToggle.contains(event.target);

    if (!clickedInsideNavigation) {
      closeNavigation();
    }
  });
}


/* ---------------------------------------------------------
   4. SMOOTH SCROLLING
   --------------------------------------------------------- */

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
        ? "auto"
        : "smooth",
      block: "start"
    });
  });
});


/* ---------------------------------------------------------
   5. EXPLORE BUTTON
   --------------------------------------------------------- */

if (exploreButton) {
  exploreButton.addEventListener("click", () => {
    const destination =
      document.querySelector("#solar-system") ||
      document.querySelector("#planets") ||
      document.querySelector("#discover");

    if (destination) {
      destination.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
}


/* ---------------------------------------------------------
   6. SCROLL PROGRESS AND BACK TO TOP
   --------------------------------------------------------- */

function updateScrollUI() {
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress =
    scrollableHeight > 0
      ? (window.scrollY / scrollableHeight) * 100
      : 0;

  if (scrollProgress) {
    scrollProgress.style.width = `${progress}%`;
  }

  if (backToTopButton) {
    backToTopButton.classList.toggle(
      "is-visible",
      window.scrollY > 500
    );
  }
}

window.addEventListener("scroll", updateScrollUI, {
  passive: true
});

window.addEventListener("resize", updateScrollUI);

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

updateScrollUI();


/* ---------------------------------------------------------
   7. REVEAL ANIMATIONS
   --------------------------------------------------------- */

const revealElements = document.querySelectorAll("[data-reveal]");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}


/* ---------------------------------------------------------
   8. PLANET DETAILS
   --------------------------------------------------------- */

function selectPlanet(name, shouldScroll = false) {
  const planet = PLANETS[name];

  if (!planet) return;

  if (planetName) {
    planetName.textContent = name;
  }

  if (planetType) {
    planetType.textContent = planet.type;
  }

  if (planetDescription) {
    planetDescription.textContent = planet.description;
  }

  if (planetDistance) {
    planetDistance.textContent = planet.distance;
  }

  if (planetYear) {
    planetYear.textContent = planet.year;
  }

  if (planetDetails) {
    planetDetails.hidden = false;
    planetDetails.classList.add("is-visible");

    if (shouldScroll) {
      planetDetails.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }

  planetCards.forEach((card) => {
    const isSelected = card.dataset.planet === name;

    card.classList.toggle("is-active", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });

  if (cosmosAnnouncer) {
    cosmosAnnouncer.textContent = `${name} selected. ${planet.type}.`;
  }
}

planetCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectPlanet(card.dataset.planet);
  });
});

if (closePlanetDetails) {
  closePlanetDetails.addEventListener("click", () => {
    if (planetDetails) {
      planetDetails.hidden = true;
      planetDetails.classList.remove("is-visible");
    }

    planetCards.forEach((card) => {
      card.classList.remove("is-active");
      card.setAttribute("aria-pressed", "false");
    });
  });
}


/* ---------------------------------------------------------
   9. PLANET SEARCH
   --------------------------------------------------------- */

function searchPlanet() {
  if (!searchInput) return;

  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    if (searchStatus) {
      searchStatus.textContent =
        "Enter a planet name to begin your search.";
    }

    searchInput.focus();
    return;
  }

  const planetNames = Object.keys(PLANETS);

  const match = planetNames.find(
    (name) => name.toLowerCase() === query
  );

  if (match) {
    selectPlanet(match, true);

    if (searchStatus) {
      searchStatus.textContent = `${match} found. Planet information is displayed below.`;
    }

    return;
  }

  const partialMatches = planetNames.filter(
    (name) => name.toLowerCase().includes(query)
  );

  if (partialMatches.length === 1) {
    selectPlanet(partialMatches[0], true);

    if (searchStatus) {
      searchStatus.textContent =
        `${partialMatches[0]} found.`;
    }

    return;
  }

  if (partialMatches.length > 1) {
    if (searchStatus) {
      searchStatus.textContent =
        `Several planets match. Try: ${partialMatches.join(", ")}.`;
    }

    return;
  }

  if (searchStatus) {
    searchStatus.textContent =
      "No planet found. Try Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, or Neptune.";
  }
}

if (searchButton) {
  searchButton.addEventListener("click", searchPlanet);
}

if (searchInput) {
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchPlanet();
    }
  });

  searchInput.addEventListener("input", () => {
    if (searchStatus) {
      searchStatus.textContent = "";
    }
  });
}


/* ---------------------------------------------------------
   10. AMBIENT SOUND
   --------------------------------------------------------- */

let audioContext = null;
let soundOscillator = null;
let soundGain = null;
let soundEnabled = false;

function enableAmbientSound() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    if (soundToggle) {
      soundToggle.setAttribute("aria-pressed", "false");
      soundToggle.setAttribute("disabled", "");
    }

    return;
  }

  audioContext = new AudioContextClass();

  soundOscillator = audioContext.createOscillator();
  soundGain = audioContext.createGain();

  soundOscillator.type = "sine";
  soundOscillator.frequency.value = 55;

  soundGain.gain.value = 0.015;

  soundOscillator.connect(soundGain);
  soundGain.connect(audioContext.destination);

  soundOscillator.start();
}

async function toggleAmbientSound() {
  if (!soundEnabled) {
    try {
      if (!audioContext) {
        enableAmbientSound();
      }

      if (audioContext && audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (soundGain && audioContext) {
        soundGain.gain.setTargetAtTime(
          0.015,
          audioContext.currentTime,
          0.15
        );
      }

      soundEnabled = Boolean(audioContext);
    } catch (error) {
      console.error("Could not enable ambient sound:", error);
      soundEnabled = false;
    }
  } else {
    if (soundGain && audioContext) {
      soundGain.gain.setTargetAtTime(
        0,
        audioContext.currentTime,
        0.15
      );
    }

    soundEnabled = false;
  }

  if (soundToggle) {
    soundToggle.setAttribute(
      "aria-pressed",
      String(soundEnabled)
    );

    const label = soundToggle.querySelector("span:last-child");

    if (label) {
      label.textContent = soundEnabled
        ? "Disable Sound"
        : "Enable Sound";
    }
  }
}

if (soundToggle) {
  soundToggle.addEventListener("click", toggleAmbientSound);
}


/* ---------------------------------------------------------
   11. FOOTER YEAR
   --------------------------------------------------------- */

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}


/* ---------------------------------------------------------
   12. LOADING SCREEN
   --------------------------------------------------------- */

function hideLoadingScreen() {
  if (!loadingScreen) return;

  loadingScreen.classList.add("is-hidden");

  window.setTimeout(() => {
    loadingScreen.setAttribute("aria-hidden", "true");
  }, 800);
}

if (document.readyState === "complete") {
  window.setTimeout(hideLoadingScreen, 400);
} else {
  window.addEventListener("load", () => {
    window.setTimeout(hideLoadingScreen, 400);
  }, { once: true });
}


/* ---------------------------------------------------------
   13. KEYBOARD SHORTCUTS
   --------------------------------------------------------- */

document.addEventListener("keydown", (event) => {
  const target = event.target;

  const isTyping =
    target instanceof HTMLElement &&
    (
      target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
    );

  if (event.key === "Escape") {
    closeNavigation();

    if (planetDetails && !planetDetails.hidden) {
      planetDetails.hidden = true;
      planetDetails.classList.remove("is-visible");
    }
  }

  if (
    event.key === "/" &&
    !isTyping &&
    searchInput
  ) {
    event.preventDefault();
    searchInput.focus();
  }
});


/* ---------------------------------------------------------
   14. INITIALIZE COSMOS
   --------------------------------------------------------- */

function initializeCosmos() {
  updateScrollUI();

  console.log(
    "%cCOSMOS",
    "color: #9c8cff; font-size: 24px; font-weight: bold;"
  );

  console.log(
    "Welcome to COSMOS — Explore the Universe."
  );
}

initializeCosmos();
