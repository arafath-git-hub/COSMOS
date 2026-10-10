
/* =========================================================
   COSMOS — 3D SOLAR SYSTEM EXPLORER
   File: js/solar-system.js
   Engine: Three.js
   ========================================================= */

import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { OrbitControls } from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const CONFIG = {
  backgroundColor: 0x040610,

  cameraPosition: {
    x: 0,
    y: 24,
    z: 43
  },

  rotationSpeed: 0.32,

  starCount: 2400,

  pixelRatioLimit: 2
};


/* =========================================================
   2. PLANET DATA
   ========================================================= */

const PLANETS = [
  {
    name: "Mercury",
    type: "Terrestrial planet",
    description:
      "Mercury is the smallest planet in the Solar System and the closest to the Sun. It has a heavily cratered surface and almost no substantial atmosphere.",
    distance: "57.9 million km",
    year: "88 Earth days",
    color: 0xaaa49d,
    radius: 0.34,
    orbit: 5.0,
    speed: 0.82
  },

  {
    name: "Venus",
    type: "Terrestrial planet",
    description:
      "Venus has a thick atmosphere dominated by carbon dioxide and clouds of sulfuric acid. Its powerful greenhouse effect makes it the hottest planet in the Solar System.",
    distance: "108.2 million km",
    year: "225 Earth days",
    color: 0xe8b56f,
    radius: 0.56,
    orbit: 7.2,
    speed: 0.59
  },

  {
    name: "Earth",
    type: "Terrestrial planet",
    description:
      "Earth is our home planet. It has abundant liquid water on its surface, a protective atmosphere, and the only confirmed life known to science.",
    distance: "149.6 million km",
    year: "365.25 Earth days",
    color: 0x3988e8,
    radius: 0.61,
    orbit: 9.6,
    speed: 0.46
  },

  {
    name: "Mars",
    type: "Terrestrial planet",
    description:
      "Mars is a cold, rocky world known as the Red Planet because of iron-rich dust on its surface. Scientists study it to understand its ancient environment and the possibility of past microbial life.",
    distance: "227.9 million km",
    year: "687 Earth days",
    color: 0xd85d42,
    radius: 0.46,
    orbit: 12.0,
    speed: 0.36
  },

  {
    name: "Jupiter",
    type: "Gas giant",
    description:
      "Jupiter is the largest planet in the Solar System. Its atmosphere contains colourful cloud bands and the Great Red Spot, a giant storm that has lasted for centuries.",
    distance: "778.6 million km",
    year: "11.86 Earth years",
    color: 0xd6a47e,
    radius: 1.55,
    orbit: 15.7,
    speed: 0.25
  },

  {
    name: "Saturn",
    type: "Gas giant",
    description:
      "Saturn is famous for its spectacular rings made mainly of ice particles, rocky debris, and dust. It is a giant planet with a very low average density.",
    distance: "1.43 billion km",
    year: "29.45 Earth years",
    color: 0xe6ce9c,
    radius: 1.27,
    orbit: 20.0,
    speed: 0.19
  },

  {
    name: "Uranus",
    type: "Ice giant",
    description:
      "Uranus is an ice giant with a blue-green appearance caused largely by methane in its atmosphere. Its extreme axial tilt makes it appear to rotate on its side.",
    distance: "2.87 billion km",
    year: "84 Earth years",
    color: 0x8cdbdf,
    radius: 0.91,
    orbit: 24.0,
    speed: 0.14
  },

  {
    name: "Neptune",
    type: "Ice giant",
    description:
      "Neptune is the most distant major planet from the Sun. It is a cold, deep-blue world with powerful winds and a dynamic atmosphere.",
    distance: "4.50 billion km",
    year: "164.8 Earth years",
    color: 0x416be6,
    radius: 0.89,
    orbit: 28.0,
    speed: 0.11
  }
];


/* =========================================================
   3. DOM ELEMENTS
   ========================================================= */

const container = document.getElementById(
  "solar-system-canvas"
);

const statusElement = document.getElementById(
  "solar-system-status"
);

const resetButton = document.getElementById(
  "reset-camera"
);

const canvasLoading = container?.querySelector(
  ".canvas-loading"
);

const planetDetails = document.getElementById(
  "planet-details"
);

const planetNameElement = document.getElementById(
  "planet-name"
);

const planetTypeElement = document.getElementById(
  "planet-type"
);

const planetDescriptionElement = document.getElementById(
  "planet-description"
);

const planetDistanceElement = document.getElementById(
  "planet-distance"
);

const planetYearElement = document.getElementById(
  "planet-year"
);

const planetCards = document.querySelectorAll(
  "[data-planet]"
);


/* =========================================================
   4. STATE
   ========================================================= */

let scene;
let camera;
let renderer;
let controls;
let animationFrame = 0;

let sun;
let sunGlow;
let starField;

let selectedPlanet = null;
let selectedPlanetData = null;

let lastFrameTime = 0;

const planetObjects = [];
const clickableObjects = [];

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const clock = new THREE.Clock();

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const initialCameraPosition = new THREE.Vector3(
  CONFIG.cameraPosition.x,
  CONFIG.cameraPosition.y,
  CONFIG.cameraPosition.z
);


/* =========================================================
   5. HELPER FUNCTIONS
   ========================================================= */

function setStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

function hideCanvasLoading() {
  if (canvasLoading) {
    canvasLoading.classList.add("is-hidden");
  }
}

function showCanvasLoading() {
  if (canvasLoading) {
    canvasLoading.classList.remove("is-hidden");
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


/* =========================================================
   6. CREATE SCENE
   ========================================================= */

function createScene() {
  scene = new THREE.Scene();

  scene.background = new THREE.Color(
    CONFIG.backgroundColor
  );

  scene.fog = new THREE.FogExp2(
    CONFIG.backgroundColor,
    0.0018
  );

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth /
      Math.max(container.clientHeight, 1),
    0.1,
    500
  );

  camera.position.copy(initialCameraPosition);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      CONFIG.pixelRatioLimit
    )
  );

  renderer.setSize(
    container.clientWidth,
    container.clientHeight
  );

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  renderer.toneMappingExposure = 1.25;

  renderer.domElement.setAttribute(
    "aria-label",
    "Interactive three-dimensional Solar System. Drag to rotate and scroll to zoom."
  );

  renderer.domElement.setAttribute(
    "tabindex",
    "0"
  );

  renderer.domElement.style.display = "block";

  container.prepend(renderer.domElement);

  controls = new OrbitControls(
    camera,
    renderer.domElement
  );

  controls.enableDamping = true;
  controls.dampingFactor = 0.055;

  controls.enablePan = true;

  controls.minDistance = 7;
  controls.maxDistance = 90;

  controls.maxPolarAngle = Math.PI * 0.49;

  controls.target.set(0, 0, 0);

  scene.add(
    new THREE.AmbientLight(0xffffff, 0.7)
  );

  const sunLight = new THREE.PointLight(
    0xffffff,
    160,
    200,
    1.2
  );

  sunLight.position.set(0, 0, 0);

  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(
    0x879dff,
    0.7
  );

  fillLight.position.set(-15, 12, 20);

  scene.add(fillLight);
}


/* =========================================================
   7. CREATE STARFIELD
   ========================================================= */

function createStarField() {
  const positions = new Float32Array(
    CONFIG.starCount * 3
  );

  const colors = new Float32Array(
    CONFIG.starCount * 3
  );

  const colorOptions = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xaacbff),
    new THREE.Color(0xc8b7ff),
    new THREE.Color(0x8ceaff)
  ];

  for (let i = 0; i < CONFIG.starCount; i++) {
    const radius = 45 + Math.random() * 105;

    const theta = Math.random() * Math.PI * 2;

    const phi = Math.acos(
      2 * Math.random() - 1
    );

    positions[i * 3] =
      radius * Math.sin(phi) * Math.cos(theta);

    positions[i * 3 + 1] =
      radius * Math.cos(phi);

    positions[i * 3 + 2] =
      radius * Math.sin(phi) * Math.sin(theta);

    const color =
      colorOptions[
        Math.floor(Math.random() * colorOptions.length)
      ];

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3)
  );

  const material = new THREE.PointsMaterial({
    size: 0.14,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false
  });

  starField = new THREE.Points(
    geometry,
    material
  );

  scene.add(starField);
}


/* =========================================================
   8. CREATE SUN
   ========================================================= */

function createSun() {
  const sunGeometry = new THREE.SphereGeometry(
    2.1,
    64,
    64
  );

  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffbd55
  });

  sun = new THREE.Mesh(
    sunGeometry,
    sunMaterial
  );

  sun.name = "Sun";

  scene.add(sun);

  const glowGeometry = new THREE.SphereGeometry(
    2.55,
    48,
    48
  );

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff9b3d,
    transparent: true,
    opacity: 0.17,
    side: THREE.BackSide,
    depthWrite: false
  });

  sunGlow = new THREE.Mesh(
    glowGeometry,
    glowMaterial
  );

  sun.add(sunGlow);

  const innerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(2.35, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0xffd27a,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      depthWrite: false
    })
  );

  sun.add(innerGlow);

  createSunSprite();
}

function createSunSprite() {
  const canvas = document.createElement("canvas");

  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  const gradient = ctx.createRadialGradient(
    128, 128, 5,
    128, 128, 128
  );

  gradient.addColorStop(0, "rgba(255,205,100,0.45)");
  gradient.addColorStop(0.25, "rgba(255,156,62,0.19)");
  gradient.addColorStop(0.55, "rgba(255,116,38,0.07)");
  gradient.addColorStop(1, "rgba(255,100,30,0)");

  ctx.fillStyle = gradient;

  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const sprite = new THREE.Sprite(spriteMaterial);

  sprite.scale.set(13, 13, 1);

  sun.add(sprite);
}


/* =========================================================
   9. CREATE ORBIT PATHS
   ========================================================= */

function createOrbit(radius) {
  const points = [];

  const segments = 220;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;

    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      )
    );
  }

  const geometry = new THREE.BufferGeometry()
    .setFromPoints(points);

  const material = new THREE.LineBasicMaterial({
    color: 0x858cc8,
    transparent: true,
    opacity: 0.22,
    depthWrite: false
  });

  const orbitLine = new THREE.Line(
    geometry,
    material
  );

  orbitLine.name = "Orbit";

  scene.add(orbitLine);

  return orbitLine;
}


/* =========================================================
   10. CREATE PLANET MATERIALS
   ========================================================= */

function createPlanetMaterial(planet) {
  return new THREE.MeshStandardMaterial({
    color: planet.color,
    roughness: 0.82,
    metalness: 0.02
  });
}


/* =========================================================
   11. CREATE SATURN'S RINGS
   ========================================================= */

function createSaturnRings(planetMesh, planet) {
  const ringGeometry = new THREE.RingGeometry(
    planet.radius * 1.35,
    planet.radius * 2.05,
    96
  );

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8c49a,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
    roughness: 0.9,
    metalness: 0,
    depthWrite: false
  });

  const rings = new THREE.Mesh(
    ringGeometry,
    ringMaterial
  );

  rings.rotation.x = Math.PI / 2.25;

  planetMesh.add(rings);
}


/* =========================================================
   12. CREATE PLANET LABELS
   ========================================================= */

function createPlanetLabel(name) {
  const canvas = document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = "600 38px Arial";

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.shadowColor = "rgba(135, 155, 255, 0.7)";
  ctx.shadowBlur = 12;

  ctx.fillStyle = "#f0f1ff";

  ctx.fillText(
    name,
    canvas.width / 2,
    canvas.height / 2
  );

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false
  });

  const sprite = new THREE.Sprite(material);

  sprite.scale.set(2.4, 0.6, 1);

  sprite.position.set(
    0,
    0,
    0
  );

  sprite.renderOrder = 10;

  return sprite;
}


/* =========================================================
   13. BUILD ALL PLANETS
   ========================================================= */

function createPlanets() {
  for (const planet of PLANETS) {
    createOrbit(planet.orbit);

    const pivot = new THREE.Group();

    pivot.name = `${planet.name} Orbit Pivot`;

    scene.add(pivot);

    const geometry = new THREE.SphereGeometry(
      planet.radius,
      40,
      40
    );

    const material = createPlanetMaterial(planet);

    const mesh = new THREE.Mesh(
      geometry,
      material
    );

    mesh.position.set(
      planet.orbit,
      0,
      0
    );

    mesh.name = planet.name;

    mesh.userData.planetName = planet.name;

    mesh.userData.planetData = planet;

    pivot.add(mesh);

    if (planet.name === "Saturn") {
      createSaturnRings(mesh, planet);
    }

    const label = createPlanetLabel(planet.name);

    if (label) {
      label.position.set(
        planet.orbit,
        planet.radius + 0.55,
        0
      );

      // The label belongs to the orbit pivot so it
      // travels with the planet around the Sun.
      pivot.add(label);
    }

    planetObjects.push({
      data: planet,
      pivot,
      mesh,
      label,
      initialAngle: Math.random() * Math.PI * 2
    });

    clickableObjects.push(mesh);
  }
}


/* =========================================================
   14. SELECT A PLANET
   ========================================================= */

function selectPlanet(planet, mesh = null) {
  if (!planet) return;

  selectedPlanetData = planet;
  selectedPlanet = mesh;

  if (planetNameElement) {
    planetNameElement.textContent = planet.name;
  }

  if (planetTypeElement) {
    planetTypeElement.textContent = planet.type;
  }

  if (planetDescriptionElement) {
    planetDescriptionElement.textContent =
      planet.description;
  }

  if (planetDistanceElement) {
    planetDistanceElement.textContent = planet.distance;
  }

  if (planetYearElement) {
    planetYearElement.textContent = planet.year;
  }

  if (planetDetails) {
    planetDetails.hidden = false;
  }

  planetCards.forEach((card) => {
    const isSelected =
      card.dataset.planet === planet.name;

    card.classList.toggle(
      "is-active",
      isSelected
    );

    card.setAttribute(
      "aria-pressed",
      String(isSelected)
    );
  });

  setStatus(
    `${planet.name} selected — ${planet.type}.`
  );
}


/* =========================================================
   15. PLANET CARD INTERACTION
   ========================================================= */

function connectPlanetCards() {
  planetCards.forEach((card) => {
    card.addEventListener("click", () => {
      const name = card.dataset.planet;

      const planetObject = planetObjects.find(
        (item) => item.data.name === name
      );

      if (!planetObject) return;

      selectPlanet(
        planetObject.data,
        planetObject.mesh
      );

      focusPlanet(planetObject);
    });
  });
}


/* =========================================================
   16. FOCUS CAMERA ON A PLANET
   ========================================================= */

function focusPlanet(planetObject) {
  if (!planetObject || !controls || !camera) return;

  const targetPosition = new THREE.Vector3();

  planetObject.mesh.getWorldPosition(targetPosition);

  const direction = new THREE.Vector3(
    0.8,
    0.7,
    1.2
  ).normalize();

  const distance = Math.max(
    planetObject.data.radius * 5,
    4.5
  );

  const cameraDestination = targetPosition.clone()
    .add(direction.multiplyScalar(distance));

  camera.position.copy(cameraDestination);

  controls.target.copy(targetPosition);

  controls.update();
}


/* =========================================================
   17. 3D CANVAS POINTER INTERACTION
   ========================================================= */

function onCanvasClick(event) {
  if (!renderer || !camera) return;

  const rect = renderer.domElement.getBoundingClientRect();

  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;

  pointer.x = x * 2 - 1;
  pointer.y = -(y * 2 - 1);

  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(
    clickableObjects,
    false
  );

  if (hits.length === 0) return;

  const clickedMesh = hits[0].object;

  const planet = clickedMesh.userData.planetData;

  if (!planet) return;

  const planetObject = planetObjects.find(
    (item) => item.mesh === clickedMesh
  );

  selectPlanet(planet, clickedMesh);

  if (planetObject) {
    focusPlanet(planetObject);
  }
}


/* =========================================================
   18. RESET CAMERA
   ========================================================= */

function resetCamera() {
  if (!camera || !controls) return;

  camera.position.copy(initialCameraPosition);

  controls.target.set(0, 0, 0);

  controls.update();

  setStatus(
    "Solar System overview restored."
  );
}


/* =========================================================
   19. HANDLE WINDOW RESIZING
   ========================================================= */

function onResize() {
  if (!container || !camera || !renderer) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  if (width < 1 || height < 1) return;

  camera.aspect = width / height;

  camera.updateProjectionMatrix();

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      CONFIG.pixelRatioLimit
    )
  );

  renderer.setSize(width, height);
}


/* =========================================================
   20. ANIMATION LOOP
   ========================================================= */

function animate() {
  animationFrame = requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  const delta = Math.min(
    clock.getDelta(),
    0.05
  );

  const shouldAnimate = !prefersReducedMotion;

  if (sun && shouldAnimate) {
    sun.rotation.y += delta * 0.12;

    const pulse = 1 + Math.sin(elapsed * 0.8) * 0.015;

    sunGlow.scale.setScalar(pulse);
  }

  if (starField && shouldAnimate) {
    starField.rotation.y += delta * 0.002;
  }

  if (shouldAnimate) {
    planetObjects.forEach((item) => {
      item.pivot.rotation.y +=
        delta *
        CONFIG.rotationSpeed *
        item.data.speed;

      item.mesh.rotation.y += delta * 0.16;
    });
  }

  if (controls) {
    controls.update();
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }

  lastFrameTime = elapsed;
}


/* =========================================================
   21. CLEAN UP
   ========================================================= */

function disposeExplorer() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }

  window.removeEventListener("resize", onResize);

  if (controls) {
    controls.dispose();
  }

  if (renderer) {
    renderer.dispose();

    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(
        renderer.domElement
      );
    }
  }

  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material) => {
          if (material.map) {
            material.map.dispose();
          }

          material.dispose();
        });
      }
    });
  }
}


/* =========================================================
   22. INITIALIZE EXPLORER
   ========================================================= */

function initSolarSystem() {
  if (!container) {
    console.error(
      "COSMOS: #solar-system-canvas was not found."
    );

    return;
  }

  if (container.clientWidth === 0) {
    console.warn(
      "COSMOS: Solar System container has no width."
    );
  }

  showCanvasLoading();

  try {
    createScene();

    createStarField();

    createSun();

    createPlanets();

    connectPlanetCards();

    renderer.domElement.addEventListener(
      "click",
      onCanvasClick
    );

    if (resetButton) {
      resetButton.addEventListener(
        "click",
        resetCamera
      );
    }

    window.addEventListener(
      "resize",
      onResize
    );

    onResize();

    setStatus(
      "3D explorer ready — drag to rotate, scroll to zoom, or select a planet."
    );

    hideCanvasLoading();

    animate();

    console.info(
      "COSMOS: 3D Solar System initialized successfully."
    );

  } catch (error) {
    console.error(
      "COSMOS: Could not initialize the 3D explorer.",
      error
    );

    setStatus(
      "The 3D explorer could not start. Check your browser and internet connection."
    );

    hideCanvasLoading();
  }
}


/* =========================================================
   23. START
   ========================================================= */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initSolarSystem,
    { once: true }
  );
} else {
  initSolarSystem();
}


/* =========================================================
   END OF COSMOS SOLAR SYSTEM
   ========================================================= */
