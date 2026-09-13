document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================================
     1. Mobile Menu Logic
     ========================================================================== */
  const burger = document.querySelector(".burger");
  const overlay = document.querySelector(".mobile-overlay");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-menu a");

  function openMenu() {
    if (!burger || !overlay || !mobileMenu) return;
    burger.setAttribute("aria-expanded", "true");
    burger.classList.add("is-open");
    overlay.hidden = false;
    mobileMenu.hidden = false;
    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    if (!burger || !overlay || !mobileMenu) return;
    burger.setAttribute("aria-expanded", "false");
    burger.classList.remove("is-open");
    overlay.hidden = true;
    mobileMenu.hidden = true;
    document.body.classList.remove("menu-open");
  }

  if (burger) {
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && burger && burger.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720 && burger && burger.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });

  /* ==========================================================================
     2. Stats Counting Animation
     ========================================================================== */
  const statElements = document.querySelectorAll(".stat-value");

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // If user prefers reduced motion, render targets immediately
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    statElements.forEach((el) => {
      const target = parseFloat(el.getAttribute("data-target"));
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      el.textContent = target.toFixed(decimals);
    });
    return;
  }

  let animated = false;

  function runCountUp() {
    if (animated) return;
    animated = true;

    statElements.forEach((el, i) => {
      const target = parseFloat(el.getAttribute("data-target"));
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const duration = 1500 + i * 80;
      const startOffset = 480 + i * 90;

      setTimeout(() => {
        const startTime = performance.now();

        function step(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const currentEased = easeOutCubic(progress);
          const currentValue = currentEased * target;

          el.textContent = currentValue.toFixed(decimals);

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = target.toFixed(decimals);
          }
        }

        requestAnimationFrame(step);
      }, startOffset);
    });
  }

  const statsSection = document.querySelector(".stats");
  if (statsSection && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCountUp();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(statsSection);
  } else {
    runCountUp();
  }
});
