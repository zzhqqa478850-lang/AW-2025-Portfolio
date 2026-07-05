/* ═══════════════════════════════════════
   Works 3D Scene — Scroll-Driven Engine
   ═══════════════════════════════════════ */

const LETTERS = ["W", "O", "R", "K"];

const WORKS = [
  { title: "Tiny AI Toybox",       image: "assets/work-1.jpg", key: "#01/12" },
  { title: "Personal Site Generator", image: "assets/work-2.jpg", key: "#02/12" },
  { title: "Prompt Rituals",       image: "assets/work-3.jpg", key: "#03/12" },
  { title: "Data Sculptor",        image: "assets/work-1.jpg", key: "#04/12" },
  { title: "Mood Palette",         image: "assets/work-2.jpg", key: "#05/12" },
  { title: "Code Whisper",         image: "assets/work-3.jpg", key: "#06/12" },
  { title: "Grid Garden",          image: "assets/work-1.jpg", key: "#07/12" },
  { title: "Sound Shapes",         image: "assets/work-2.jpg", key: "#08/12" },
  { title: "Type Playground",       image: "assets/work-3.jpg", key: "#09/12" },
  { title: "Pixel Forge",          image: "assets/work-1.jpg", key: "#10/12" },
  { title: "Flow States",          image: "assets/work-2.jpg", key: "#11/12" },
  { title: "Neon Notebook",        image: "assets/work-3.jpg", key: "#12/12" },
];

/* ═══════════════════════════════════════
   Build Title Letters
   ═══════════════════════════════════════ */

const buildTitle = () => {
  const inner = document.getElementById("sTitleInner");
  if (!inner) return;
  inner.innerHTML = LETTERS.map(l => `<span class="s-title-letter">${l}</span>`).join("");
};

/* ═══════════════════════════════════════
   Build 3D Scene Letters
   Each letter gets 7 copies spread in 3D space
   ═══════════════════════════════════════ */

const buildSceneLetters = () => {
  const scene = document.getElementById("sScene");
  if (!scene) return;

  const copiesPerLetter = 7;
  LETTERS.forEach((letter, li) => {
    for (let i = 0; i < copiesPerLetter; i++) {
      const el = document.createElement("div");
      el.classList.add("s-scene-letter");
      el.dataset.letter = letter;
      el.dataset.index = li;
      el.dataset.copy = i;
      scene.appendChild(el);
    }
  });
};

/* ═══════════════════════════════════════
   Build Work Items
   ═══════════════════════════════════════ */

const buildWorkItems = () => {
  const scene = document.getElementById("sScene");
  if (!scene) return;

  WORKS.forEach((work, i) => {
    const progress = WORKS.length === 1 ? 0 : i / (WORKS.length - 1);
    const el = document.createElement("div");
    el.classList.add("s-work-item");
    el.dataset.progress = progress.toFixed(3);
    el.dataset.index = i;

    el.innerHTML = `
      <a href="index.html" target="_blank">
        <div class="s-work-thumb">
          <img src="${work.image}" alt="${work.title}" draggable="false" />
        </div>
        <div class="s-work-caption">
          <span class="s-work-caption-text">${work.title}</span>
          <span class="s-work-caption-key">${work.key}</span>
        </div>
      </a>
    `;

    scene.appendChild(el);
  });
};

/* ═══════════════════════════════════════
   Scroll-Driven Animation Engine
   ═══════════════════════════════════════ */

const initScrollEngine = () => {
  const sWork = document.getElementById("sWork");
  const sInner = document.getElementById("sInner");
  const sScene = document.getElementById("sScene");
  const scrollbarThumb = document.getElementById("scrollbarThumb");
  const title = document.getElementById("sTitle");
  const sceneLetters = document.querySelectorAll(".s-scene-letter");
  const workItems = document.querySelectorAll(".s-work-item");

  if (!sWork || !sInner || !sScene) return;

  const totalScrollHeight = sWork.offsetHeight - window.innerHeight;
  let ticking = false;
  let progress = 0;

  // Pre-assign random Y offsets to work items
  const yOffsets = [];
  workItems.forEach(el => {
    const yOff = (Math.random() - 0.5) * window.innerHeight * 0.6;
    yOffsets.push(yOff);
  });

  // Pre-assign base positions to scene letter copies
  const letterPositions = [];
  sceneLetters.forEach(el => {
    const copy = parseFloat(el.dataset.copy);
    const normalizedCopy = (copy - 3) / 3; // -1 to 1
    const ySign = copy % 2 === 0 ? -1 : 1;
    letterPositions.push({ normalizedCopy, ySign });
  });

  const onScroll = () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const scrollY = window.scrollY || window.pageYOffset;
      progress = Math.max(0, Math.min(1, scrollY / totalScrollHeight));

      /* ── 1. Inner container subtle Y shift ── */
      const innerY = progress * -8;
      sInner.style.transform = `translate3d(0, ${innerY}vh, 0)`;

      /* ── 2. Title — visible throughout, fades at edges ── */
      if (title) {
        // Bell curve: 1 at center (progress=0.5), fades at 0 and 1
        // But START visible: use a curve that begins at ~0.7
        const t = progress;
        const titleOpacity = t < 0.5
          ? 0.7 - t * 0.4       // 0.7 → 0.5 at midpoint
          : 0.7 - (1 - t) * 0.4; // 0.7 → 0.5 at end, symmetric
        title.style.opacity = Math.max(0, titleOpacity);
      }

      /* ── 3. Scene letters — 3D carousel effect ── */
      sceneLetters.forEach((el, idx) => {
        const { normalizedCopy, ySign } = letterPositions[idx];

        // Head: 0 at center of scroll, +1/-1 at edges
        const head = (progress - 0.5) * 2; // -1 to 1
        const ahead = head * head; // 0 to 1, parabolic

        // 3D transforms
        const rotateY = head * -12;
        const translateX = head * 60 * normalizedCopy;
        const translateY = ySign * ahead * 8;

        el.style.transform =
          `translate(-50%, -50%) translate3d(${translateX}vw, ${translateY}vh, 0) rotateY(${rotateY}deg)`;

        // Opacity: always visible, slightly dimmer at extremes
        const letterOpacity = 0.08 + (1 - ahead) * 0.12;
        el.style.opacity = letterOpacity;
      });

      /* ── 4. Work items — fly through 3D space ── */
      workItems.forEach((el, idx) => {
        const itemProgress = parseFloat(el.dataset.progress);
        const yOffset = yOffsets[idx];

        // Distance from current scroll position (0 to 1 range)
        const delta = itemProgress - progress;
        const dist = Math.abs(delta);

        // Visibility window: items within ±0.15 of progress are visible
        const visibility = Math.max(0, 1 - dist / 0.15);

        // 3D positioning
        // Items ahead of scroll position: come from right
        // Items behind scroll position: go to left
        const direction = delta > 0 ? -1 : 1;
        const xMove = delta * 80; // vw — spread items across viewport

        // Depth: items far from progress go "deeper" into screen
        const z = Math.min(0, -dist * 20);

        // Rotation based on travel direction
        const rotY = delta * -25;

        // Scale: closer = bigger
        const scale = 0.5 + visibility * 0.5;

        el.style.transform =
          `translate(-50%, -50%) translate3d(${xMove}vw, ${yOffset}px, ${z}rem) rotateY(${rotY}deg) scale(${scale})`;

        el.style.opacity = visibility > 0.01 ? visibility : 0;

        if (visibility > 0.05) {
          el.classList.add("is-visible");
        } else {
          el.classList.remove("is-visible");
        }
      });

      /* ── 5. Custom scrollbar ── */
      if (scrollbarThumb) {
        const maxTravel = 100 - (scrollbarThumb.offsetHeight / window.innerHeight * 100);
        scrollbarThumb.style.top = `${progress * maxTravel}%`;
      }

      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  // Initial render — fire immediately so content is visible on load
  onScroll();

  // Entry overlay fade out
  const entry = document.getElementById("sEntry");
  if (entry) {
    setTimeout(() => {
      entry.style.opacity = "0";
      setTimeout(() => {
        entry.style.visibility = "hidden";
        entry.style.display = "none";
      }, 1200);
    }, 800);
  }
};

/* ═══════════════════════════════════════
   Close Button — circle clip exit
   ═══════════════════════════════════════ */

const initClose = () => {
  const closeBtn = document.getElementById("closeBtn");
  if (!closeBtn) return;

  const navigateBack = () => {
    const inner = document.getElementById("sInner");
    if (inner) {
      inner.style.opacity = "0";
      setTimeout(() => { window.location.href = "index.html"; }, 500);
    } else {
      window.location.href = "index.html";
    }
  };

  closeBtn.addEventListener("click", navigateBack);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") navigateBack();
  });
};

/* ═══════════════════════════════════════
   Initialize
   ═══════════════════════════════════════ */

buildTitle();
buildSceneLetters();
buildWorkItems();
initScrollEngine();
initClose();
