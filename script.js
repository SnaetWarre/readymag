const CONFIG = {
  title: "De downfall van datingapps:\nHeeft online daten nog een toekomst?",
  desktopWidth: 1920,
  desktopHeight: 1080,
  leftHandRotation: 154,
  storyHeightVh: 620,
  assetScale: 1.25,
};

const params = new URLSearchParams(window.location.search);
const urlTitle = params.get("title");
if (urlTitle) {
  CONFIG.title = urlTitle;
}
const shouldAutoplay = params.get("autoplay") === "1";
const shouldLoop = params.get("loop") === "1";

if (shouldAutoplay) {
  document.documentElement.classList.add("rm-autoplay-mode");
}

const ASSETS = {
  heart: "assets/layers/heart.png",
  phones: "assets/layers/phones.png",
  leftHand: "assets/layers/hand-left.png",
};

const CRACK_POINTS = [
  [46, 31],
  [43, 45],
  [46.5, 60],
  [42, 75],
  [44.5, 100],
];

const CRACK_X_OFFSET = 0;
const CRACK_SEGMENTS = 90;

const deck = document.querySelector("#rm-canva-deck");

if (shouldAutoplay) {
  deck.classList.add("rm-autoplay-mode");
}

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const lerp = (from, to, progress) => from + (to - from) * progress;
const smoothstep = (start, end, value) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};

function createImage(className, src, alt = "") {
  const img = document.createElement("img");
  img.className = className;
  img.src = src;
  img.alt = alt;
  return img;
}

function getPolylinePoint(points, targetLength) {
  let walked = 0;

  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const segmentLength = Math.hypot(x2 - x1, y2 - y1);

    if (walked + segmentLength >= targetLength) {
      const localProgress = (targetLength - walked) / segmentLength;
      return [
        lerp(x1, x2, localProgress) + CRACK_X_OFFSET,
        lerp(y1, y2, localProgress),
      ];
    }

    walked += segmentLength;
  }

  const [x, y] = points[points.length - 1];
  return [x + CRACK_X_OFFSET, y];
}

function createCrackSegments(svg) {
  const totalLength = CRACK_POINTS.reduce((sum, point, index) => {
    if (index === CRACK_POINTS.length - 1) return sum;
    const next = CRACK_POINTS[index + 1];
    return sum + Math.hypot(next[0] - point[0], next[1] - point[1]);
  }, 0);

  const segments = [];

  for (let i = 0; i < CRACK_SEGMENTS; i += 1) {
    const start = getPolylinePoint(CRACK_POINTS, (i / CRACK_SEGMENTS) * totalLength);
    const end = getPolylinePoint(CRACK_POINTS, ((i + 1) / CRACK_SEGMENTS) * totalLength);
    const segment = document.createElementNS("http://www.w3.org/2000/svg", "path");

    segment.classList.add("rm-crack-segment");
    segment.setAttribute("d", `M${start[0]} ${start[1]} L${end[0]} ${end[1]}`);
    segment.style.opacity = 0;
    svg.append(segment);
    segments.push(segment);
  }

  return segments;
}

function createScene() {
  const story = document.createElement("section");
  story.className = "rm-story";
  story.style.setProperty("--story-height", shouldAutoplay ? "100vh" : `${CONFIG.storyHeightVh}vh`);

  const stage = document.createElement("div");
  stage.className = "rm-stage";
  stage.style.setProperty("--phones-url", `url("${ASSETS.phones}")`);
  stage.style.setProperty("--heart-url", `url("${ASSETS.heart}")`);

  const scene = document.createElement("div");
  scene.className = "rm-scene";

  const title = document.createElement("h1");
  title.className = "rm-title";
  title.textContent = CONFIG.title;

  const illustration = document.createElement("div");
  illustration.className = "rm-illustration";

  const heartWrap = document.createElement("div");
  heartWrap.className = "rm-heart-wrap";

  const heartBase = createImage("rm-heart-half rm-heart-base", ASSETS.heart);
  const heartLeft = createImage("rm-heart-half rm-heart-left", ASSETS.heart);
  const heartRight = createImage("rm-heart-half rm-heart-right", ASSETS.heart);

  const crack = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  crack.classList.add("rm-crack");
  crack.setAttribute("viewBox", "0 0 100 100");
  crack.setAttribute("preserveAspectRatio", "none");
  crack.setAttribute("aria-hidden", "true");

  const crackSegments = createCrackSegments(crack);

  heartWrap.append(heartBase, heartLeft, heartRight, crack);

  const phoneLeft = document.createElement("div");
  phoneLeft.className = "rm-phone rm-phone-left";
  const phoneRight = document.createElement("div");
  phoneRight.className = "rm-phone rm-phone-right";

  const handLeft = createImage("rm-hand rm-hand-left", ASSETS.leftHand);
  const handRight = createImage("rm-hand rm-hand-right", ASSETS.leftHand);

  illustration.append(heartWrap, phoneLeft, phoneRight, handLeft, handRight);
  scene.append(illustration, title);
  stage.append(scene);
  story.append(stage);
  deck.append(story);

  return {
    story,
    stage,
    scene,
    illustration,
    title,
    heartBase,
    heartLeft,
    heartRight,
    crack,
    crackSegments,
    phoneLeft,
    phoneRight,
    handLeft,
    handRight,
  };
}

const elements = createScene();
let ticking = false;

function transformCentered(x, y, rotation, scale = 1, flipX = false) {
  const mirror = flipX ? " scaleX(-1)" : "";
  return `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})${mirror}`;
}

function updateCrack(crackProgress, openProgress) {
  const crackOpacity = crackProgress > 0.02 && openProgress <= 0.001 ? 1 : 0;
  elements.stage.style.setProperty("--crack-opacity", crackOpacity);

  elements.crackSegments.forEach((segment, index) => {
    const segmentStart = index / elements.crackSegments.length;
    const segmentFade = clamp((crackProgress - segmentStart) * 18);
    segment.style.opacity = segmentFade;
  });
}

function updateScene(progressOverride) {
  ticking = false;

  const rect = elements.story.getBoundingClientRect();
  const total = Math.max(elements.story.offsetHeight - window.innerHeight, 1);
  const stageScale = Math.min(
    window.innerWidth / CONFIG.desktopWidth,
    window.innerHeight / CONFIG.desktopHeight
  );
  const progress = progressOverride ?? clamp(-rect.top / total);

  const handTravel = clamp((progress - 0.12) / (0.72 - 0.12));
  const crack = smoothstep(0.12, 0.72, progress);
  const open = smoothstep(0.72, 1, progress);
  const titleIn = smoothstep(0.82, 1, progress);
  const outro = smoothstep(0.9, 1, progress);
  const outroFade = smoothstep(0.82, 1, outro);
  const handWave = Math.sin(handTravel * Math.PI * 5) * 42 * (1 - open);

  elements.stage.style.setProperty("--hand-x", `${handWave}px`);
  elements.stage.style.setProperty("--break-progress", crack);
  elements.stage.style.setProperty("--open-progress", open);
  elements.stage.style.setProperty("--stage-scale", stageScale);
  elements.scene.style.transform = `translate(-50%, -50%) scale(${stageScale})`;
  elements.illustration.style.opacity = 1 - outroFade;
  elements.illustration.style.transform = `scale(${CONFIG.assetScale})`;

  elements.heartLeft.style.transform = `translateX(${lerp(0, -240, open) - lerp(0, 1680, outro)}px) rotate(${lerp(0, -8, open) - lerp(0, 6, outro)}deg)`;
  elements.heartRight.style.transform = `translateX(${lerp(0, 240, open) + lerp(0, 1680, outro)}px) rotate(${lerp(0, 8, open) + lerp(0, 6, outro)}deg)`;
  elements.heartBase.style.opacity = 1 - smoothstep(0, 0.04, open);

  elements.phoneLeft.style.transform = transformCentered(
    lerp(-420, -620, open) - lerp(0, 1520, outro),
    40,
    lerp(-8, -13, open)
  );
  elements.phoneRight.style.transform = transformCentered(
    lerp(420, 620, open) + lerp(0, 1520, outro),
    35,
    lerp(8, 13, open)
  );

  elements.handLeft.style.transform = transformCentered(
    lerp(-660, -860, open) - lerp(0, 1620, outro) + handWave,
    295,
    CONFIG.leftHandRotation + lerp(0, -4, open)
  );
  elements.handRight.style.transform = transformCentered(
    lerp(578, 778, open) + lerp(0, 1620, outro) - handWave,
    419,
    lerp(214, 218, open),
    1,
    true
  );

  elements.title.style.opacity = titleIn;
  elements.title.style.transform = `translate(-50%, -50%) translateY(${lerp(28, 0, titleIn)}px) scale(${lerp(0.96, 1, titleIn)})`;

  updateCrack(crack, open);
}

function requestUpdate() {
  if (shouldAutoplay) return;

  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateScene);
  }
}

if (shouldAutoplay) {
  let start = 0;
  let autoplayProgress = 0;
  const startDelay = Number(params.get("startDelay") || 100);
  const duration = Number(params.get("duration") || 6000);
  const loopDelay = Number(params.get("loopDelay") || 15000);

  function autoplay(timestamp) {
    if (!start) start = timestamp;
    const progress = clamp((timestamp - start) / duration);
    autoplayProgress = progress;
    updateScene(progress);

    if (progress < 1) {
      requestAnimationFrame(autoplay);
    } else if (shouldLoop) {
      window.setTimeout(() => {
        start = 0;
        requestAnimationFrame(autoplay);
      }, loopDelay);
    }
  }

  window.addEventListener("resize", () => updateScene(autoplayProgress));
  updateScene(0);
  window.setTimeout(() => requestAnimationFrame(autoplay), startDelay);
} else {
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("load", requestUpdate);
  requestUpdate();
}
