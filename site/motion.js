(() => {
  const root = document.documentElement;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const intro = document.querySelector(".intro");
  const introStage = document.querySelector(".intro-sticky");
  const portrait = document.querySelector(".portrait");
  const depth = document.querySelector(".portrait-depth");
  const normal = document.querySelector(".portrait-normal");
  const arrakis = document.querySelector(".portrait-arrakis");
  const revealButton = document.querySelector(".portrait-toggle");
  const revealCanvas = document.querySelector(".sand-trail");
  const gallery = document.querySelector(".gallery");
  const galleryStage = document.querySelector(".gallery-sticky");
  const track = document.querySelector(".gallery-track");
  const waveCanvas = document.querySelector(".waves");
  const stord = document.querySelector(".stord");
  const stordStage = document.querySelector(".stord-sticky");
  const arcor = document.querySelector(".arcor");
  const paint = revealCanvas.getContext("2d");
  const scratch = document.createElement("canvas");
  const mask = scratch.getContext("2d");
  const wave = waveCanvas.getContext("2d");
  const dustColors = ["#ffe8cc", "#ffd0a2", "#e6a871", "#fff5e8"];
  const revealLifetime = 485;

  const clamp = value => Math.min(1, Math.max(0, value));
  const ease = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };

  function pageTone(scroll) {
    const stops = metrics.palette;
    const nextIndex = stops.findIndex(stop => scroll < stop.position);
    if (nextIndex < 0) return stops[stops.length - 1].color;
    const previous = stops[Math.max(0, nextIndex - 1)];
    const next = stops[nextIndex];
    const blend = ease((scroll - previous.position) / Math.max(1, next.position - previous.position));
    return previous.color.map((channel, index) => Math.round(channel + (next.color[index] - channel) * blend));
  }

  const snowCanvas = arcor.querySelector(".arcor-snow");
  const snowPaint = snowCanvas.getContext("2d");
  let snowWidth = 0;
  let snowHeight = 0;
  let snowVisible = false;
  let snowflakes = [];

  function resizeSnow() {
    if (!snowPaint || preference.matches) return;
    snowWidth = arcor.clientWidth;
    snowHeight = arcor.clientHeight;
    const scale = Math.min(1.25, window.devicePixelRatio || 1);
    snowCanvas.width = Math.round(snowWidth * scale);
    snowCanvas.height = Math.round(snowHeight * scale);
    snowPaint.setTransform(scale, 0, 0, scale, 0, 0);
    const count = Math.min(112, Math.max(42, Math.round(snowWidth / 12)));
    snowflakes = Array.from({ length: count }, () => ({
      x: Math.random() * snowWidth,
      y: Math.random() * snowHeight,
      speed: 16 + Math.random() * 45,
      sway: 4 + Math.random() * 16,
      phase: Math.random() * Math.PI * 2,
      radius: .6 + Math.random() ** 2 * 2.35,
      alpha: .24 + Math.random() * .6,
    }));
  }

  function drawSnow(seconds) {
    if (!snowVisible || !snowPaint || !snowWidth || !snowHeight) return;
    snowPaint.clearRect(0, 0, snowWidth, snowHeight);
    snowPaint.fillStyle = "#edf6ff";
    for (const flake of snowflakes) {
      const x = flake.x + Math.sin(seconds * .75 + flake.phase) * flake.sway;
      const y = (flake.y + seconds * flake.speed) % (snowHeight + 12) - 6;
      snowPaint.globalAlpha = flake.alpha;
      snowPaint.beginPath();
      snowPaint.arc(x, y, flake.radius, 0, Math.PI * 2);
      snowPaint.fill();
    }
    snowPaint.globalAlpha = 1;
  }

  const atmosphere = document.querySelector(".site-atmosphere");
  const air = atmosphere.getContext("2d");
  const airColors = ["#ecb48a", "#e8d2f5", "#b4a1ef"];
  let airFrame = 0;
  let airWidth = 0;
  let airHeight = 0;
  let haze = [];

  function resizeAtmosphere() {
    if (!air || preference.matches) return;
    airWidth = atmosphere.clientWidth;
    airHeight = atmosphere.clientHeight;
    const pixelRatio = Math.min(1.25, window.devicePixelRatio || 1);
    atmosphere.width = Math.round(airWidth * pixelRatio);
    atmosphere.height = Math.round(airHeight * pixelRatio);
    air.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const count = Math.min(142, Math.max(54, Math.round(airWidth * airHeight / 10400)));
    haze = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * (airWidth + 48),
      y: Math.random() * airHeight,
      phase: Math.random() * Math.PI * 2,
      speed: 8 + Math.random() * 20,
      r: .5 + Math.random() * 1.35,
      color: airColors[index % airColors.length],
    }));
  }

  function drift(now) {
    airFrame = 0;
    if (!air || document.hidden || preference.matches || !airWidth || !airHeight) return;
    const seconds = now / 1000;
    air.clearRect(0, 0, airWidth, airHeight);
    for (const grain of haze) {
      const x = (grain.x + seconds * grain.speed) % (airWidth + 48) - 24;
      const y = grain.y + Math.sin(grain.phase + seconds * .66) * (5 + grain.r * 5);
      const glow = .28 + .21 * Math.sin(grain.phase + seconds * 1.35);
      air.fillStyle = grain.color;
      air.globalAlpha = glow;
      air.fillRect(x, y, grain.r * 1.9, grain.r);
      if (grain.r > 1.45) {
        air.globalAlpha = glow * .18;
        air.fillRect(x - 8, y + .2, 8, grain.r * .8);
      }
    }
    air.globalAlpha = 1;
    drawSnow(seconds);
    airFrame = requestAnimationFrame(drift);
  }

  function syncAtmosphere() {
    if (airFrame) cancelAnimationFrame(airFrame);
    airFrame = 0;
    if (!document.hidden && !preference.matches && air) airFrame = requestAnimationFrame(drift);
  }

  if ("IntersectionObserver" in window) {
    const lettering = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.querySelector("[data-reveal]").classList.add("text-visible");
        lettering.unobserve(entry.target);
      }
    }, { threshold: .12 });
    for (const element of document.querySelectorAll("[data-reveal]")) lettering.observe(element.parentElement);
  } else {
    for (const element of document.querySelectorAll("[data-reveal]")) element.classList.add("text-visible");
  }

  root.classList.add("js");
  let scrollFrame = 0;
  let trailFrame = 0;
  let metrics;
  let paintedWave = -1;
  let contact = null;
  let latestPoint;
  let trail = [];
  let stroke = 0;
  let dust = [];
  let w = 0;
  let h = 0;
  let waveWidth = 0;
  let waveHeight = 0;

  revealButton.addEventListener("click", () => {
    const shown = portrait.classList.toggle("revealed");
    normal.setAttribute("aria-hidden", shown);
    arrakis.setAttribute("aria-hidden", !shown);
    revealButton.setAttribute("aria-pressed", shown);
    revealButton.textContent = shown ? "Voltar ao retrato" : "Revelar Arrakis";
    wrapMarkerText(revealButton);
  });

  function resizeCanvases() {
    const resolution = Math.min(1.5, window.devicePixelRatio || 1);
    w = portrait.clientWidth;
    h = portrait.clientHeight;
    revealCanvas.width = scratch.width = Math.round(w * resolution);
    revealCanvas.height = scratch.height = Math.round(h * resolution);
    paint?.setTransform(resolution, 0, 0, resolution, 0, 0);
    mask?.setTransform(resolution, 0, 0, resolution, 0, 0);

    paintedWave = -1;
    waveWidth = galleryStage.clientWidth;
    waveHeight = galleryStage.clientHeight;
    waveCanvas.width = Math.round(waveWidth * resolution);
    waveCanvas.height = Math.round(waveHeight * resolution);
    wave?.setTransform(resolution, 0, 0, resolution, 0, 0);
    trail = [];
    dust = [];
    latestPoint = null;
  }

  function resetDepth() {
    depth.removeAttribute("style");
  }

  function strokeSide(points) {
    for (let index = 1; index < points.length - 1; index += 1) {
      const point = points[index];
      const next = points[index + 1];
      mask.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
    }
    const end = points[points.length - 1];
    mask.lineTo(end.x, end.y);
  }

  function paintRibbon(start, end, now) {
    const left = [];
    const right = [];
    let head = null;
    let tail = null;
    for (let index = start; index < end; index += 1) {
      const point = trail[index];
      const previous = trail[Math.max(start, index - 2)];
      const next = trail[Math.min(end - 1, index + 2)];
      const angle = next === previous ? point.angle : Math.atan2(next.y - previous.y, next.x - previous.x);
      const age = clamp((now - point.start) / revealLifetime);
      const radius = point.radius * (1 - ease((age - .19) / .81));
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const swell = Math.sin(point.distance * .023) * .15;
      left.push({ x: point.x - dy * radius * (1 + swell), y: point.y + dx * radius * (1 + swell) });
      right.push({ x: point.x + dy * radius * (1 - swell), y: point.y - dx * radius * (1 - swell) });
      head = { x: point.x + dx * radius * 1.5, y: point.y + dy * radius * 1.5 };
      tail ??= { x: point.x - dx * radius, y: point.y - dy * radius };
    }

    mask.beginPath();
    mask.moveTo(left[0].x, left[0].y);
    strokeSide(left);
    const edge = right[right.length - 1];
    mask.quadraticCurveTo(head.x, head.y, edge.x, edge.y);
    strokeSide(right.reverse());
    mask.quadraticCurveTo(tail.x, tail.y, left[0].x, left[0].y);
    mask.closePath();
    mask.fill();
  }

  function renderTrail(now) {
    trailFrame = 0;
    if (!paint || !mask || preference.matches || !arrakis.naturalWidth || !w || !h) return;

    trail = trail.filter(point => now - point.start < revealLifetime);
    dust = dust.filter(grain => now - grain.start < grain.life);
    paint.clearRect(0, 0, w, h);
    if (!trail.length && !dust.length) return;
    mask.clearRect(0, 0, w, h);

    mask.fillStyle = "#fff";
    for (let start = 0, end = 1; end <= trail.length; end += 1) {
      if (end < trail.length && trail[start].stroke === trail[end].stroke) continue;
      paintRibbon(start, end, now);
      start = end;
    }

    for (const grain of dust) {
      const age = Math.max(0, now - grain.start);
      const life = 1 - age / grain.life;
      grain.drawX = grain.x + grain.vx * age;
      grain.drawY = grain.y + grain.vy * age + age * age * .00012;
      grain.alpha = life ** 1.7;
      if (!grain.reveal) continue;
      mask.globalAlpha = grain.alpha * .74;
      mask.fillStyle = "#fff";
      mask.fillRect(grain.drawX, grain.drawY, grain.size * 3.6, grain.size * 2.45);
    }
    mask.globalAlpha = 1;

    const ratio = Math.max(w / arrakis.naturalWidth, h / arrakis.naturalHeight);
    const photoWidth = arrakis.naturalWidth * ratio;
    const photoHeight = arrakis.naturalHeight * ratio;
    const offsetY = window.innerWidth <= 620 ? .44 : .43;
    paint.drawImage(arrakis, (w - photoWidth) / 2, (h - photoHeight) * offsetY, photoWidth, photoHeight);
    paint.globalCompositeOperation = "destination-in";
    paint.drawImage(scratch, 0, 0, w, h);
    paint.globalCompositeOperation = "source-over";

    for (const grain of dust) {
      if (grain.reveal) continue;
      paint.globalAlpha = grain.alpha;
      paint.fillStyle = grain.color;
      paint.fillRect(grain.drawX, grain.drawY, grain.size * grain.stretch, grain.size);
      if (grain.size > 1.8) {
        paint.globalAlpha *= .22;
        paint.fillRect(grain.drawX - 2, grain.drawY - 1, grain.size * 3.4, grain.size * 2.5);
      }
    }
    paint.globalAlpha = 1;
    trailFrame = requestAnimationFrame(renderTrail);
  }

  function revealAt(event) {
    if (preference.matches || !w || !h ||
        (event.pointerType === "touch" && contact !== event.pointerId)) return;

    const frame = portrait.getBoundingClientRect();
    if (!frame.width || !frame.height) return;
    if (event.pointerType !== "touch") {
      const u = clamp((event.clientX - frame.left) / frame.width) * 2 - 1;
      const v = clamp((event.clientY - frame.top) / frame.height) * 2 - 1;
      depth.style.setProperty("--depth-x", u * 7 + "px");
      depth.style.setProperty("--depth-y", v * 5 + "px");
      depth.style.setProperty("--tilt-x", v * -1.1 + "deg");
      depth.style.setProperty("--tilt-y", u * 1.4 + "deg");
    }
    if (!paint || !mask || !arrakis.naturalWidth || portrait.classList.contains("revealed")) return;

    const box = depth.getBoundingClientRect();
    const x = (event.clientX - box.left) * w / box.width;
    const y = (event.clientY - box.top) * h / box.height;
    const now = performance.now();
    const previous = latestPoint && now - latestPoint.start < 110 ? latestPoint : null;
    if (!previous) stroke += 1;
    const dx = x - (previous?.x ?? x);
    const dy = y - (previous?.y ?? y);
    const gap = Math.hypot(dx, dy);
    if (previous && gap < 2.5) return;
    const angle = previous ? Math.atan2(dy, dx) : -.24;
    const normalX = -Math.sin(angle);
    const normalY = Math.cos(angle);
    const count = Math.min(13, Math.max(1, Math.ceil(gap / 16)));
    const maxRadius = Math.min(121, Math.max(49, w * .078));
    const speed = previous ? gap / Math.max(10, now - previous.start) : .25;
    const target = maxRadius * (.73 + .27 * clamp(speed / 1.45));
    const base = previous?.radius ?? target;

    for (let step = 1; step <= count; step += 1) {
      const fraction = step / count;
      const point = {
        x: x - dx * (1 - fraction),
        y: y - dy * (1 - fraction),
        radius: base + (target - base) * fraction * .52,
        distance: (previous?.distance ?? 0) + gap * fraction,
        angle,
        stroke,
        start: now,
      };
      trail.push(point);

      for (let index = 0; index < 8; index += 1) {
        const side = index % 2 ? -1 : 1;
        const spread = side * point.radius * (.59 + Math.random() * .43);
        const velocity = .045 + Math.random() * .17;
        const back = .03 + Math.random() * .105;
        dust.push({
          x: point.x + normalX * spread,
          y: point.y + normalY * spread,
          vx: normalX * velocity * side - Math.cos(angle) * back,
          vy: normalY * velocity * side - Math.sin(angle) * back,
          size: .55 + Math.random() ** 1.65 * 2.5,
          stretch: 1 + Math.random() * 1.8,
          reveal: index % 3 === 0,
          start: now,
          life: 120 + Math.random() * 240,
          color: dustColors[index % dustColors.length],
        });
      }
    }

    if (trail.length > 112) trail.splice(0, trail.length - 112);
    if (dust.length > 480) dust.splice(0, dust.length - 480);
    latestPoint = trail[trail.length - 1];
    if (!trailFrame) trailFrame = requestAnimationFrame(renderTrail);
  }

  portrait.addEventListener("pointermove", revealAt, { passive: true });
  portrait.addEventListener("pointerleave", () => {
    latestPoint = null;
    resetDepth();
  }, { passive: true });
  portrait.addEventListener("pointerdown", event => {
    if (event.pointerType !== "touch") return;
    contact = event.pointerId;
    revealAt(event);
  }, { passive: true });
  for (const event of ["pointerup", "pointercancel"]) {
    window.addEventListener(event, () => {
      contact = null;
      latestPoint = null;
    }, { passive: true });
  }

  const codeRain = document.querySelector(".code-rain");
  const codePaint = codeRain.getContext("2d");
  const codeAlphabet = "01010101010123456789ABCDEF";
  let codeFrame = 0;
  let codeWidth = 0;
  let codeHeight = 0;
  let codeStep = 20;
  let codeColumns = [];
  let codeOpacity = 0;
  let codeLastPaint = -Infinity;

  function resizeCode() {
    if (!codePaint || preference.matches) return;

    codeWidth = introStage.clientWidth;
    codeHeight = introStage.clientHeight;
    codeStep = codeWidth < 620 ? 15 : 20;
    const resolution = Math.min(1.25, window.devicePixelRatio || 1);
    codeRain.width = Math.round(codeWidth * resolution);
    codeRain.height = Math.round(codeHeight * resolution);
    codePaint.setTransform(resolution, 0, 0, resolution, 0, 0);
    codePaint.font = (codeWidth < 620 ? 11 : 13) + "px ui-monospace, Consolas, monospace";
    codePaint.textAlign = "center";
    codePaint.textBaseline = "middle";

    codeColumns = Array.from({ length: Math.ceil(codeWidth / codeStep) }, (_, index) => ({
      x: index * codeStep + codeStep / 2,
      tail: 14 + Math.floor(Math.random() * 20),
      speed: 38 + Math.random() * 124,
      offset: Math.random(),
      glow: .45 + Math.random() * .5,
      shift: Math.floor(Math.random() * codeAlphabet.length),
    }));
    codeLastPaint = -Infinity;
  }

  function drawCode(now) {
    codeFrame = 0;
    if (document.hidden || preference.matches || codeOpacity <= 0) return;
    if (now - codeLastPaint >= 31) {
      codeLastPaint = now;
      codePaint.clearRect(0, 0, codeWidth, codeHeight);

      for (const column of codeColumns) {
        const length = codeHeight + column.tail * codeStep;
        const head = (now * .001 * column.speed + column.offset * length) % length;
        const tick = Math.floor(head / codeStep);
        for (let row = 0; row < column.tail; row += 1) {
          const y = head - row * codeStep;
          if (y < -codeStep || y > codeHeight + codeStep) continue;
          const mix = (tick * 7 + row * 13 + column.shift) % codeAlphabet.length;
          const strength = 1 - row / column.tail;
          codePaint.globalAlpha = column.glow * strength ** 1.22;
          codePaint.fillStyle = row === 0 ? "#dbffd0" : row < 4 ? "#8df279" : "#54bb71";
          codePaint.fillText(codeAlphabet[mix], column.x, y);
        }
      }

      codePaint.globalAlpha = 1;
    }
    codeFrame = requestAnimationFrame(drawCode);
  }

  function syncCode() {
    if (codeOpacity > 0 && codePaint && !document.hidden && !preference.matches) {
      if (!codeFrame) codeFrame = requestAnimationFrame(drawCode);
    } else if (codeFrame) {
      cancelAnimationFrame(codeFrame);
      codeFrame = 0;
    }
  }

  function wrapMarkerText(element) {
    for (const node of [...element.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue;

      const label = document.createElement("span");
      label.className = "sr-only marker-label";
      label.textContent = node.textContent;

      const visible = document.createElement("span");
      visible.className = "marker-text";
      visible.setAttribute("aria-hidden", "true");
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part.trim()) {
          visible.append(part);
          continue;
        }
        const word = document.createElement("span");
        word.className = "marker-word";
        for (const character of part) {
          const letter = document.createElement("span");
          letter.className = "marker-letter";
          letter.dataset.glyph = character;
          const glyph = document.createElement("span");
          glyph.className = "marker-glyph";
          glyph.textContent = character;
          letter.append(glyph);
          word.append(letter);
        }
        visible.append(word);
      }
      node.replaceWith(label, visible);
    }
  }

  const markerTargets = "h1:not(.sr-only), h2:not(.sr-only), h3, p, a, button, summary, .shot-caption, .shot-word, .project-name, .project-name small, .contact-name";
  document.querySelectorAll(markerTargets).forEach(wrapMarkerText);

  function rollLetter(letter, delay = 0) {
    if (letter.classList.contains("marker-rolling")) return;
    letter.style.setProperty("--marker-delay", delay + "ms");
    letter.classList.add("marker-rolling");
  }

  document.addEventListener("pointerover", event => {
    if (preference.matches || event.pointerType === "touch") return;
    const control = event.target.closest("a, button");
    if (control && !control.contains(event.relatedTarget)) {
      control.querySelectorAll(".marker-letter").forEach((letter, index) => {
        rollLetter(letter, Math.min(index * 17, 240));
      });
      return;
    }

    const letter = event.target.closest(".marker-letter");
    if (letter) rollLetter(letter);
  });
  document.addEventListener("animationend", event => {
    if (event.animationName === "marker-out") event.target.parentElement.classList.remove("marker-rolling");
  });

  stord.addEventListener("focusin", event => {
    if (preference.matches || !metrics) return;
    const box = event.target.getBoundingClientRect();
    if (box.left >= 0 && box.right <= innerWidth) return;
    const panelProgress = event.target.closest(".stord-publish") ? .98 : .35;
    window.scrollTo({ top: metrics.stord.top + metrics.stord.travel * panelProgress, behavior: "instant" });
  });

  function setGeometry() {
    const scroll = window.scrollY;
    const range = (section, stage) => ({
      top: section.getBoundingClientRect().top + scroll,
      travel: Math.max(1, section.offsetHeight - stage.offsetHeight),
    });

    const horizontal = Math.max(0, track.scrollWidth - galleryStage.clientWidth);
    gallery.style.setProperty("--gallery-travel", Math.max(innerHeight, horizontal * .88) + "px");
    const introRange = range(intro, introStage);
    const galleryRange = range(gallery, galleryStage);
    const stordRange = range(stord, stordStage);
    const arcorTop = arcor.getBoundingClientRect().top + scroll;
    const projectsTop = document.querySelector(".projects").getBoundingClientRect().top + scroll;
    const contactTop = document.querySelector(".contact").getBoundingClientRect().top + scroll;
    metrics = {
      intro: introRange,
      gallery: galleryRange,
      stord: stordRange,
      arcorTop,
      arcorBottom: arcorTop + arcor.offsetHeight,
      horizontal,
      palette: [
        { position: 0, color: [15, 16, 25] },
        { position: introRange.travel * .56, color: [11, 22, 41] },
        { position: galleryRange.top + galleryRange.travel * .36, color: [29, 22, 49] },
        { position: stordRange.top + stordRange.travel * .12, color: [36, 54, 167] },
        { position: stordRange.top + stordRange.travel * .36, color: [112, 39, 173] },
        { position: stordRange.top + stordRange.travel * .61, color: [218, 210, 243] },
        { position: stordRange.top + stordRange.travel * .67, color: [218, 210, 243] },
        { position: stordRange.top + stordRange.travel * .95, color: [63, 43, 156] },
        { position: arcorTop + innerHeight * .17, color: [24, 85, 147] },
        { position: projectsTop - innerHeight * .59, color: [24, 85, 147] },
        { position: projectsTop + innerHeight * .08, color: [31, 8, 15] },
        { position: contactTop - innerHeight * .61, color: [24, 6, 12] },
        { position: contactTop - innerHeight * .16, color: [6, 7, 10] },
      ],
    };
  }

  function drawWaves(progress) {
    if (!wave || !waveWidth || !waveHeight) return;
    wave.clearRect(0, 0, waveWidth, waveHeight);
    const lines = 24;

    for (let band = 0; band < lines; band += 1) {
      const depth = band / (lines - 1);
      wave.strokeStyle = band % 6 === 0 ? "#d8c6ff48" : "#c7b6ff29";
      wave.lineWidth = band % 6 === 0 ? 1.25 : .75;
      wave.beginPath();

      for (let x = -14; x <= waveWidth + 15; x += 14) {
        const fraction = x / waveWidth;
        const floor = waveHeight * (.3 + depth * .44);
        const arc = Math.sin(5.6 * fraction + depth * 2.7 - progress * 4.8);
        const ripple = Math.cos(11 * fraction - depth * 2.2 + progress * 2.4);
        const y = floor + (arc * .103 + ripple * .024) * waveHeight;
        if (x === -14) wave.moveTo(x, y);
        else wave.lineTo(x, y);
      }

      wave.stroke();
    }
  }

  function renderScroll() {
    scrollFrame = 0;
    if (preference.matches) return;
    if (!metrics) setGeometry();

    const scroll = window.scrollY;
    const progress = zone => clamp((scroll - zone.top) / zone.travel);
    const entry = progress(metrics.intro);
    const fold = ease((entry - .035) / .70);
    const writing = ease((entry - .29) / .47);
    codeOpacity = ease((entry - .085) / .20) * (1 - ease((entry - .84) / .14));
    introStage.style.setProperty("--code-opacity", codeOpacity);
    introStage.style.setProperty("--fold", fold);
    introStage.style.setProperty("--signature-alpha", ease((entry - .285) / .13));
    introStage.style.setProperty("--signature-rise", ease((entry - .255) / .51));
    introStage.style.setProperty("--scene-lift", ease((entry - .79) / .21));
    introStage.style.setProperty("--signature-draw", 100 * (1 - writing));
    introStage.style.setProperty("--signature-final", 100 * (1 - ease((entry - .65) / .17)));
    syncCode();

    const horizontal = progress(metrics.gallery);
    galleryStage.style.setProperty("--track", -horizontal * metrics.horizontal + "px");
    if (horizontal !== paintedWave) {
      drawWaves(horizontal);
      paintedWave = horizontal;
    }

    const stordProgress = progress(metrics.stord);
    const brand = clamp(stordProgress / .66);
    stordStage.style.setProperty("--stord-slide", ease((stordProgress - .67) / .27));
    const dawn = ease((brand - .57) / .3);
    const tone = pageTone(scroll);
    root.style.setProperty("--page-tone", "rgb(" + tone.join(",") + ")");
    const [red, green, blue] = tone.map(value => {
      const channel = value / 255;
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    });
    const light = red * .2126 + green * .7152 + blue * .0722 > .19;
    stordStage.style.setProperty("--stord-ink", light ? "#171125" : "#fff");
    stordStage.style.setProperty("--logo-ink", light ? "#100b1c" : "#fff");
    stordStage.style.setProperty("--stord-turn", -19 + brand * 25 + "deg");
    stordStage.style.setProperty("--stord-scale", .82 + .22 * Math.sin(Math.PI * brand));
    stordStage.style.setProperty("--orbit", .87 - dawn * .5);

    snowVisible = scroll + innerHeight > metrics.arcorTop && scroll < metrics.arcorBottom;
    const arcorEntry = (scroll + innerHeight - metrics.arcorTop) / innerHeight;
    arcor.style.setProperty("--arcor-enter", ease(arcorEntry / .88));
    arcor.style.setProperty("--arcor-brand-in", ease((arcorEntry - .24) / .52));
  }

  function schedule() {
    if (!scrollFrame && !preference.matches) scrollFrame = requestAnimationFrame(renderScroll);
  }

  function refresh() {
    metrics = null;
    resizeCanvases();
    resizeAtmosphere();
    resizeSnow();
    resizeCode();
    syncAtmosphere();
    schedule();
  }

  function syncMotion() {
    root.classList.toggle("motion-ready", !preference.matches);
    resetDepth();
    if (preference.matches) {
      gallery.style.removeProperty("--gallery-travel");
      root.style.removeProperty("--page-tone");
      snowVisible = false;
      codeOpacity = 0;
      syncCode();
    }
    for (const section of [introStage, galleryStage, stordStage, arcor]) {
      if (preference.matches) section.removeAttribute("style");
    }
    refresh();
  }

  const projectShelf = document.querySelector(".projects-shelf");
  const projectCards = [...projectShelf.querySelectorAll(".project-card")];
  const projectInfo = document.querySelector(".project-info");
  const projectTitle = projectInfo.querySelector("h3");
  const projectSummary = projectInfo.querySelector("p");
  const mobileDeck = matchMedia("(max-width: 850px)");
  let selectedProject;
  let projectFrame = 0;

  function showProject(card) {
    if (!card || card === selectedProject) return;
    selectedProject?.classList.remove("project-selected");
    selectedProject = card;
    card.classList.add("project-selected");
    projectTitle.textContent = card.dataset.projectTitle;
    projectSummary.textContent = card.dataset.projectSummary;
    wrapMarkerText(projectTitle);
    wrapMarkerText(projectSummary);
  }

  const featuredProject = projectShelf.querySelector(".project-arcor");
  showProject(featuredProject);
  projectInfo.hidden = false;
  if (mobileDeck.matches) {
    const featured = featuredProject.getBoundingClientRect();
    const shelf = projectShelf.getBoundingClientRect();
    projectShelf.scrollLeft = featured.left - shelf.left + (featured.width - shelf.width) / 2;
  }

  projectShelf.addEventListener("pointerover", event => {
    if (event.pointerType !== "touch") showProject(event.target.closest(".project-card"));
  });
  projectShelf.addEventListener("focusin", event => showProject(event.target.closest(".project-card")));
  projectShelf.addEventListener("scroll", () => {
    if (!mobileDeck.matches || projectFrame) return;

    projectFrame = requestAnimationFrame(() => {
      projectFrame = 0;
      const shelf = projectShelf.getBoundingClientRect();
      const center = shelf.left + shelf.width / 2;
      let closest;
      let distance = Infinity;
      for (const card of projectCards) {
        const box = card.getBoundingClientRect();
        const offset = Math.abs(box.left + box.width / 2 - center);
        if (offset < distance) {
          closest = card;
          distance = offset;
        }
      }
      showProject(closest);
    });
  }, { passive: true });

  const arcorInfo = arcor.querySelector("details");
  const arcorTrigger = arcorInfo.querySelector("summary");
  let arcorOpenedByHover = false;
  arcorTrigger.addEventListener("pointerenter", event => {
    if (event.pointerType !== "mouse" || arcorInfo.open) return;
    arcorInfo.open = true;
    arcorOpenedByHover = true;
  });
  arcorTrigger.addEventListener("click", () => {
    arcorOpenedByHover = false;
  });
  function closeArcorHover() {
    if (!arcorOpenedByHover || arcorInfo.matches(":hover") ||
        arcorInfo.querySelector(".arcor-panel").contains(document.activeElement)) return;
    arcorInfo.open = false;
    arcorOpenedByHover = false;
  }
  arcorInfo.addEventListener("pointerleave", closeArcorHover);
  arcorInfo.addEventListener("focusout", () => requestAnimationFrame(closeArcorHover));

  preference.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", () => {
    syncAtmosphere();
    syncCode();
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", refresh, { passive: true });
  window.addEventListener("pageshow", refresh);
  window.addEventListener("load", refresh, { once: true });
  syncMotion();
})();
