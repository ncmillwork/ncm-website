(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;
  var vh = window.innerHeight;

  /* ---------- project data (images live in assets/projects/<slug>/NN.jpg) ---------- */
  var PROJECTS = {
    disney:     { name: "Disney",             meta: "Corporate",                        count: 20 },
    joola:      { name: "Joola",              meta: "Retail & Showroom",                count: 8 },
    fishshop:   { name: "Fish Shop DC",       meta: "Restaurant",                       count: 12 },
    revival:    { name: "Hotel Revival",      meta: "Hospitality · Baltimore",          count: 6 },
    morning:    { name: "Morning Consult",    meta: "Workplace · Washington, D.C.",     count: 6 },
    airbus:     { name: "Airbus",             meta: "Workplace",                        count: 6 },
    kstreet:    { name: "1101 K Street",      meta: "Workplace · Washington, D.C.",     count: 6 },
    merrifield: { name: "Merrifield",         meta: "Mixed use",                        count: 6 },
    avalon:     { name: "Avalon Court House", meta: "Residential",                      count: 6 },
    dahlkemper: { name: "Dahlkemper Kitchen", meta: "Residential kitchen",              count: 6 },
    neustar:    { name: "Neustar",            meta: "Workplace",                        count: 6 }
  };
  var ORDER = ["disney", "joola", "fishshop", "revival", "morning", "airbus",
               "kstreet", "merrifield", "avalon", "dahlkemper", "neustar"];

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.09 });
    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(performance.now());
  }

  function scrollToTarget(hash) {
    var el = document.querySelector(hash);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }

  /* ---------- preloader ---------- */
  var preloader = document.querySelector(".preloader");
  var countEl = document.querySelector(".preloader__count");
  var hero = document.querySelector(".hero");

  function finishLoading() {
    preloader.classList.add("is-done");
    document.body.classList.remove("is-loading");
    if (hero) hero.classList.add("lines-in");
    setTimeout(function () { preloader.remove(); }, 1300);
  }

  if (reduceMotion) {
    finishLoading();
  } else {
    var count = 0;
    var tick = setInterval(function () {
      count = Math.min(count + Math.ceil(Math.random() * 12), 100);
      countEl.textContent = count < 10 ? "0" + count : String(count);
      if (count >= 100) {
        clearInterval(tick);
        setTimeout(finishLoading, 250);
      }
    }, 55);
  }

  /* ---------- theme morphing between chapters ---------- */
  var themeSections = document.querySelectorAll("[data-theme]");
  var themeObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.target !== document.body) {
          document.body.setAttribute("data-theme", entry.target.getAttribute("data-theme"));
        }
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );
  themeSections.forEach(function (el) {
    if (el !== document.body) themeObserver.observe(el);
  });

  /* ---------- fullscreen menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("menu");

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    toggle.querySelector("em").textContent = open ? "Close" : "Menu";
    if (lenis) open ? lenis.stop() : lenis.start();
  }

  toggle.addEventListener("click", function () {
    setMenu(!document.body.classList.contains("menu-open"));
  });

  /* ---------- anchor links ---------- */
  document.querySelectorAll("[data-scroll]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var hash = link.getAttribute("href");
      if (!hash || hash.charAt(0) !== "#") return;
      e.preventDefault();
      if (document.body.classList.contains("menu-open")) {
        setMenu(false);
        setTimeout(function () { scrollToTarget(hash); }, 500);
      } else {
        scrollToTarget(hash);
      }
    });
  });

  /* ---------- reveals ---------- */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          if (entry.target.querySelector(".line")) entry.target.classList.add("lines-in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document
    .querySelectorAll(".reveal, .media-frame, .quote__text, .contact__title")
    .forEach(function (el) { revealObserver.observe(el); });

  /* ---------- hero slideshow ---------- */
  var slides = document.querySelectorAll(".hero__slide");
  if (slides.length > 1 && !reduceMotion) {
    var slideIdx = 0;
    setInterval(function () {
      slides[slideIdx].classList.remove("is-active");
      slideIdx = (slideIdx + 1) % slides.length;
      slides[slideIdx].classList.add("is-active");
    }, 5000);
  }

  /* ---------- scrub words ---------- */
  var scrub = document.querySelector("[data-scrub]");
  var scrubWords = [];
  var scrubLastOn = -1;
  if (scrub) {
    var words = scrub.textContent.trim().split(/\s+/);
    scrub.innerHTML = words
      .map(function (w) { return '<span class="w">' + w + "</span>"; })
      .join(" ");
    scrubWords = Array.prototype.slice.call(scrub.querySelectorAll(".w"));
    if (!reduceMotion) scrub.classList.add("scrub-ready");
  }

  function updateScrub() {
    if (!scrub || reduceMotion) return;
    var rect = scrub.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) return;
    var p = (vh * 0.85 - rect.top) / (rect.height + vh * 0.35);
    p = Math.max(0, Math.min(1, p));
    var on = Math.round(p * scrubWords.length);
    if (on === scrubLastOn) return;
    for (var i = 0; i < scrubWords.length; i++) {
      scrubWords[i].classList.toggle("on", i < on);
    }
    scrubLastOn = on;
  }

  /* ---------- sticky card deck ---------- */
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var cardsEnabled = false;

  function updateCards() {
    if (!cardsEnabled) return;
    for (var i = 0; i < cards.length - 1; i++) {
      var next = cards[i + 1].getBoundingClientRect().top;
      var q = 1 - (next - 100) / (vh * 0.7);
      q = Math.max(0, Math.min(1, q));
      cards[i].style.transform = q > 0 ? "scale(" + (1 - q * 0.06) + ")" : "";
    }
  }

  /* ---------- horizontal work section ---------- */
  var hwrap = document.querySelector(".hwrap");
  var hpin = document.querySelector(".hpin");
  var htrack = document.querySelector(".htrack");
  var hDist = 0;
  var hPinned = false;

  function setupHorizontal() {
    var wide = window.matchMedia("(min-width: 861px)").matches;
    hPinned = wide && !reduceMotion;
    hwrap.classList.toggle("is-pinned", hPinned);
    if (hPinned) {
      hDist = Math.max(0, htrack.scrollWidth - window.innerWidth);
      hwrap.style.height = hDist + window.innerHeight + "px";
    } else {
      hwrap.style.height = "";
      htrack.style.transform = "";
    }
  }

  function updateHorizontal() {
    if (!hPinned || hDist === 0) return;
    var top = hwrap.getBoundingClientRect().top;
    var p = Math.max(0, Math.min(1, -top / hDist));
    htrack.style.transform = "translate3d(" + (-p * hDist).toFixed(1) + "px, 0, 0)";
  }

  /* ---------- parallax ---------- */
  var parallaxImgs = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));

  function updateParallax() {
    if (reduceMotion) return;
    parallaxImgs.forEach(function (img) {
      var rect = img.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      img.style.transform = "scale(1.12) translateY(" + (progress * -4).toFixed(2) + "%)";
    });
  }

  /* ---------- render loop (single, dirty-checked) ---------- */
  var lastY = -1;
  (function render() {
    var y = window.scrollY;
    if (y !== lastY) {
      lastY = y;
      updateScrub();
      updateCards();
      updateHorizontal();
      updateParallax();
    }
    requestAnimationFrame(render);
  })();

  function onResize() {
    vh = window.innerHeight;
    cardsEnabled = window.matchMedia("(min-width: 861px)").matches && !reduceMotion;
    if (!cardsEnabled) cards.forEach(function (c) { c.style.transform = ""; });
    setupHorizontal();
    lastY = -1; // force re-render
  }
  window.addEventListener("resize", onResize);
  window.addEventListener("load", onResize);
  onResize();

  /* ---------- count-up stats ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var useComma = el.hasAttribute("data-comma");
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      var val = Math.round(target * eased);
      el.textContent = useComma ? val.toLocaleString("en-US") : String(val);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var nums = document.querySelectorAll(".num[data-count]");
  if (nums.length && !reduceMotion) {
    var numObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            numObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    nums.forEach(function (el) { numObserver.observe(el); });
  }

  /* ---------- floating preview (archive rows) ---------- */
  var float = document.querySelector(".preview-float");
  var floatImg = float.querySelector("img");

  if (canHover && !reduceMotion) {
    var mouse = { x: 0, y: 0 };
    var pos = { x: 0, y: 0 };
    var floatVisible = false;
    var floatHiddenAt = 0;
    var floatRunning = false;

    document.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function floatLoop() {
      pos.x += (mouse.x - pos.x) * 0.12;
      pos.y += (mouse.y - pos.y) * 0.12;
      float.style.transform = "translate(" + (pos.x + 24) + "px, " + (pos.y - float.offsetHeight / 2) + "px)";
      if (!floatVisible && performance.now() - floatHiddenAt > 450) {
        floatRunning = false;
        return;
      }
      requestAnimationFrame(floatLoop);
    }

    function startFloatLoop() {
      if (!floatRunning) {
        floatRunning = true;
        pos.x = mouse.x;
        pos.y = mouse.y;
        requestAnimationFrame(floatLoop);
      }
    }

    document.querySelectorAll(".row[data-preview]").forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        floatImg.src = row.getAttribute("data-preview");
        float.classList.add("is-active");
        floatVisible = true;
        startFloatLoop();
      });
      row.addEventListener("mouseleave", function () {
        float.classList.remove("is-active");
        floatVisible = false;
        floatHiddenAt = performance.now();
      });
    });
  }

  /* ---------- custom cursor with labels ---------- */
  var cursor = document.querySelector(".cursor");
  var cursorLabel = cursor.querySelector(".cursor__label");
  if (cursor && canHover && !reduceMotion) {
    var cx = { x: -100, y: -100 };
    var cp = { x: -100, y: -100 };
    var seen = false;
    var cursorRunning = false;

    function cursorLoop() {
      cp.x += (cx.x - cp.x) * 0.22;
      cp.y += (cx.y - cp.y) * 0.22;
      cursor.style.left = cp.x + "px";
      cursor.style.top = cp.y + "px";
      if (Math.abs(cx.x - cp.x) + Math.abs(cx.y - cp.y) < 0.1) {
        cursorRunning = false;
        return;
      }
      requestAnimationFrame(cursorLoop);
    }

    document.addEventListener("mousemove", function (e) {
      cx.x = e.clientX;
      cx.y = e.clientY;
      if (!seen) {
        seen = true;
        cp.x = cx.x;
        cp.y = cx.y;
        cursor.classList.add("is-visible");
      }
      if (!cursorRunning) {
        cursorRunning = true;
        requestAnimationFrame(cursorLoop);
      }
    });

    document.addEventListener("mouseleave", function () {
      cursor.classList.remove("is-visible");
      seen = false;
    });

    document.addEventListener("mouseover", function (e) {
      var labelled = e.target.closest("[data-cursor]");
      if (labelled) {
        cursorLabel.textContent = labelled.getAttribute("data-cursor");
        cursor.classList.add("has-label");
      } else {
        cursor.classList.remove("has-label");
      }
      cursor.classList.toggle(
        "is-hover",
        !!e.target.closest("a, button, .row, .hpanel--project")
      );
    });
  }

  /* ---------- project modal ---------- */
  var modal = document.querySelector(".modal");
  var modalScroll = modal.querySelector(".modal__scroll");
  var modalTitle = modal.querySelector(".modal__title");
  var modalMeta = modal.querySelector(".modal__meta");
  var modalCount = modal.querySelector(".modal__count");
  var modalGallery = modal.querySelector(".modal__gallery");
  var modalClose = modal.querySelector(".modal__close");
  var navPrev = modal.querySelector(".modal__nav--prev");
  var navNext = modal.querySelector(".modal__nav--next");
  var currentSlug = null;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function fillModal(slug) {
    var data = PROJECTS[slug];
    currentSlug = slug;
    modalTitle.textContent = data.name;
    modalMeta.textContent = pad(ORDER.indexOf(slug) + 1) + " — " + data.meta;
    modalCount.textContent = data.count + " photographs";
    var html = "";
    for (var i = 1; i <= data.count; i++) {
      html +=
        '<img src="assets/projects/' + slug + "/" + pad(i) + '.jpg" alt="' +
        data.name + " millwork photograph " + i +
        '" loading="' + (i <= 4 ? "eager" : "lazy") + '" style="animation-delay:' + Math.min(i * 60, 600) + 'ms" />';
    }
    modalGallery.innerHTML = html;
    var prevSlug = ORDER[(ORDER.indexOf(slug) - 1 + ORDER.length) % ORDER.length];
    var nextSlug = ORDER[(ORDER.indexOf(slug) + 1) % ORDER.length];
    navPrev.querySelector("strong").textContent = PROJECTS[prevSlug].name;
    navNext.querySelector("strong").textContent = PROJECTS[nextSlug].name;
    navPrev.setAttribute("data-slug", prevSlug);
    navNext.setAttribute("data-slug", nextSlug);
    modalScroll.scrollTop = 0;
  }

  function openModal(slug) {
    fillModal(slug);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    if (lenis) lenis.stop();
    modalClose.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lenis) lenis.start();
    currentSlug = null;
  }

  document.querySelectorAll("[data-project]").forEach(function (el) {
    el.addEventListener("click", function () {
      openModal(el.getAttribute("data-project"));
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(el.getAttribute("data-project"));
      }
    });
  });

  modalClose.addEventListener("click", closeModal);
  [navPrev, navNext].forEach(function (btn) {
    btn.addEventListener("click", function () {
      fillModal(btn.getAttribute("data-slug"));
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (currentSlug) closeModal();
    else if (document.body.classList.contains("menu-open")) setMenu(false);
  });

  /* ---------- live clock (Beltsville, MD — Eastern) ---------- */
  var clockEl = document.getElementById("clock");
  if (clockEl) {
    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    function tickClock() { clockEl.textContent = fmt.format(new Date()); }
    tickClock();
    setInterval(tickClock, 1000);
  }
})();
