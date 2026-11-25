(() => {
  "use strict";

  const BRAND_LABELS = {
    all: "All",
    nbe: "National Bank of Egypt",
    cib: "CIB Business Banking",
    global: "Global Technologies",
    etmanna: "etmanna",
    roza: "ROZA Store",
    go: "GO",
    elsayed: "elsayed ashta",
    cherry: "Cherry Grills",
    yalla: "Yalla Grow",
    magnesia: "MAGNESIA",
  };

  const BRAND_TARGET_IDS = {
    nbe: "nbe",
    cib: "cib",
    global: "global",
    etmanna: "etmanna",
    roza: "roza",
    go: "go",
    elsayed: "elsayed-ashta",
    cherry: "cherry-grills",
    yalla: "yalla-grow",
    magnesia: "magnesia",
  };

  function scrollToBrandSection(slug) {
    const target = document.getElementById(BRAND_TARGET_IDS[slug] || slug);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function initStickyNav() {
    const nav = document.getElementById("sticky-nav");
    const hero = document.getElementById("hero");
    if (!nav || !hero) return;

    const setVisible = (visible) => nav.classList.toggle("is-visible", visible);

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => setVisible(!entries[0].isIntersecting),
        { threshold: 0.08 }
      );
      observer.observe(hero);
      return;
    }

    window.addEventListener(
      "scroll",
      () => setVisible(window.scrollY > hero.offsetHeight * 0.75),
      { passive: true }
    );
  }

  function updateFilterUI(activeFilter, elements) {
    elements.filterButtons.forEach((btn) => {
      const isMatch = btn.dataset.filterBtn === activeFilter;
      btn.classList.toggle("is-active", isMatch);
      btn.setAttribute("aria-pressed", String(isMatch));
    });

    elements.sections.forEach((section) => {
      section.hidden = activeFilter !== "all" && section.dataset.brandSection !== activeFilter;
    });

    if (elements.brandsStrip) {
      elements.brandsStrip.hidden = activeFilter !== "all";
    }
    if (elements.statusBar && elements.statusName) {
      elements.statusBar.hidden = activeFilter === "all";
      elements.statusName.textContent = BRAND_LABELS[activeFilter] || "All";
    }
  }

  function initBrandNavigation() {
    const elements = {
      sections: Array.from(document.querySelectorAll("[data-brand-section]")),
      filterButtons: Array.from(document.querySelectorAll("[data-filter-btn]")),
      brandsStrip: document.getElementById("brands"),
      statusBar: document.getElementById("filter-status"),
      statusName: document.getElementById("filter-status-name"),
    };
    let activeFilter = "all";

    const applyFilter = (slug) => {
      activeFilter = BRAND_LABELS[slug] ? slug : "all";
      updateFilterUI(activeFilter, elements);
    };

    elements.filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const slug = btn.dataset.filterBtn || "all";
        applyFilter(slug);
        if (slug !== "all") scrollToBrandSection(slug);
      });
    });

    document.querySelectorAll("[data-jump-brand]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slug = btn.dataset.jumpBrand;
        if (!slug) return;
        if (activeFilter !== "all" && activeFilter !== slug) applyFilter("all");
        scrollToBrandSection(slug);
      });
    });
  }

  function preloadImage(src) {
    if (!src) return;
    const pre = new Image();
    pre.src = src;
  }

  function renderLightboxItem(state, ui) {
    const trigger = state.activeList[state.currentIndex];
    if (!trigger || !ui.img) return;

    const imgChild = trigger.querySelector("img");
    ui.img.src = trigger.dataset.src || "";
    ui.img.alt = imgChild ? imgChild.alt : (trigger.dataset.title || "");
    if (ui.brand) ui.brand.textContent = trigger.dataset.brand || "";
    if (ui.title) ui.title.textContent = trigger.dataset.title || "";
    if (ui.counter) ui.counter.textContent = `${state.currentIndex + 1} / ${state.activeList.length}`;

    const total = state.activeList.length;
    preloadImage(state.activeList[(state.currentIndex + 1) % total]?.dataset.src);
    preloadImage(state.activeList[(state.currentIndex - 1 + total) % total]?.dataset.src);
  }

  function trapModalTab(event, focusables) {
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function initLightbox() {
    const modal = document.getElementById("lightbox");
    if (!modal) return;

    const ui = {
      img: modal.querySelector("[data-lb-img]"),
      brand: modal.querySelector("[data-lb-brand]"),
      title: modal.querySelector("[data-lb-title]"),
      counter: modal.querySelector("[data-lb-counter]"),
      prevBtn: modal.querySelector("[data-lb-prev]"),
      nextBtn: modal.querySelector("[data-lb-next]"),
      closeBtn: modal.querySelector("button[data-lb-close]"),
    };
    const allTriggers = Array.from(document.querySelectorAll("[data-lightbox-item]"));
    const state = { activeList: [], currentIndex: 0, lastFocusedEl: null };

    const openAt = (trigger) => {
      state.activeList = allTriggers.filter((el) => !el.closest("[data-brand-section]")?.hidden);
      state.currentIndex = Math.max(0, state.activeList.indexOf(trigger));
      state.lastFocusedEl = document.activeElement;
      renderLightboxItem(state, ui);
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      if (ui.closeBtn) ui.closeBtn.focus();
    };

    const closeModal = () => {
      if (modal.hidden) return;
      modal.hidden = true;
      document.body.style.overflow = "";
      if (ui.img) ui.img.removeAttribute("src");
      state.lastFocusedEl?.focus?.();
    };

    const step = (delta) => {
      if (!state.activeList.length) return;
      state.currentIndex = (state.currentIndex + delta + state.activeList.length) % state.activeList.length;
      renderLightboxItem(state, ui);
    };

    allTriggers.forEach((t) => t.addEventListener("click", () => openAt(t)));
    modal.querySelectorAll("[data-lb-close]").forEach((el) => el.addEventListener("click", closeModal));
    ui.prevBtn?.addEventListener("click", () => step(-1));
    ui.nextBtn?.addEventListener("click", () => step(1));

    document.addEventListener("keydown", (event) => {
      if (modal.hidden) return;
      if (event.key === "Escape") { event.preventDefault(); closeModal(); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
      else if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
      else if (event.key === "Tab") {
        trapModalTab(event, [ui.closeBtn, ui.prevBtn, ui.nextBtn].filter(Boolean));
      }
    });
  }

  function copyTextWithFallback(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      try {
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) resolve();
        else reject(new Error("execCommand copy failed"));
      } catch (err) {
        document.body.removeChild(ta);
        reject(err);
      }
    });
  }

  function initCopyEmail() {
    const buttons = document.querySelectorAll("[data-copy-email]");
    const toast = document.getElementById("copy-toast");
    if (!buttons.length || !toast) return;

    let timerId = null;
    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const email = btn.dataset.copyEmail || "info@movemena.com";
        try {
          await copyTextWithFallback(email);
          toast.hidden = false;
          if (timerId) window.clearTimeout(timerId);
          timerId = window.setTimeout(() => { toast.hidden = true; }, 2400);
        } catch {
          window.location.href = `mailto:${email}`;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initStickyNav();
    initBrandNavigation();
    initLightbox();
    initCopyEmail();
  });
})();
