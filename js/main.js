/* National Custom Millwork — shared behavior */
(function () {
  "use strict";

  /* ----- Sticky header state ----- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----- Mobile menu ----- */
  const toggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (toggle && mobileMenu) {
    const setOpen = (open) => {
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      if (open) mobileMenu.querySelector("a").focus();
      else toggle.focus();
    };
    toggle.addEventListener("click", () =>
      setOpen(!document.body.classList.contains("menu-open"))
    );
    mobileMenu.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) setOpen(false);
    });
  }

  /* ----- Scroll reveals ----- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ----- Footer year ----- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ----- Project filters ----- */
  const filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    const chips = filterBar.querySelectorAll(".filter-chip");
    const cards = document.querySelectorAll(".project-card");
    filterBar.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      const filter = chip.dataset.filter;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  }

  /* ----- Lightbox (projects gallery) ----- */
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    const imgEl = lightbox.querySelector("img");
    const nameEl = lightbox.querySelector(".lb-name");
    const idxEl = lightbox.querySelector(".lb-idx");
    let items = []; // { src, alt, name }
    let index = 0;

    const render = () => {
      const item = items[index];
      imgEl.src = item.src;
      imgEl.alt = item.alt;
      nameEl.textContent = item.name;
      idxEl.textContent = index + 1 + " / " + items.length;
    };

    const openFrom = (card) => {
      const visible = Array.from(
        document.querySelectorAll(".project-card:not(.is-hidden)")
      );
      items = [];
      let start = 0;
      visible.forEach((c) => {
        const name = c.querySelector(".name").textContent;
        if (c === card) start = items.length;
        c.querySelectorAll("img").forEach((im) => {
          items.push({ src: im.dataset.full || im.src, alt: im.alt, name });
        });
      });
      index = start;
      render();
      lightbox.showModal();
    };

    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("click", () => openFrom(card));
    });

    const step = (dir) => {
      index = (index + dir + items.length) % items.length;
      render();
    };

    lightbox.querySelector(".prev").addEventListener("click", (e) => {
      e.stopPropagation();
      step(-1);
    });
    lightbox.querySelector(".next").addEventListener("click", (e) => {
      e.stopPropagation();
      step(1);
    });
    lightbox.querySelector(".close-btn").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
    /* click on the dark backdrop area closes */
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.classList.contains("lightbox-inner")) {
        lightbox.close();
      }
    });
  }

  /* ----- Contact form ----- */
  const form = document.getElementById("contact-form");
  if (form) {
    // Connect the form: create a free form at https://formspree.io,
    // then replace the empty string below with your endpoint, e.g.
    // "https://formspree.io/f/abcdwxyz"
    const FORM_ENDPOINT = "https://formspree.io/f/mkodoado";
    const status = form.querySelector(".form-status");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "form-status";

      if (!FORM_ENDPOINT) {
        status.className = "form-status err";
        status.innerHTML =
          "The online form isn’t connected yet — please call us at " +
          '<a href="tel:+13015954448"><strong>(301) 595-4448</strong></a> ' +
          "and we’ll be glad to help.";
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Sending…";
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Request failed");
        form.reset();
        status.className = "form-status ok";
        status.textContent =
          "Thank you — your message has been sent. We’ll get back to you within one business day.";
      } catch (err) {
        status.className = "form-status err";
        status.innerHTML =
          "Something went wrong sending your message. Please try again, or call us at " +
          '<a href="tel:+13015954448"><strong>(301) 595-4448</strong></a>.';
      } finally {
        btn.disabled = false;
        btn.textContent = "Send message";
      }
    });
  }
})();
