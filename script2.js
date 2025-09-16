document.addEventListener("DOMContentLoaded", () => {
  // ===== UTILITAIRES =====
  const qs = (s, o = document) => o.querySelector(s);
  const qsa = (s, o = document) => [...o.querySelectorAll(s)];

  const toggleClass = (el, cls) => el?.classList.toggle(cls);
  const addClass = (el, cls) => el?.classList.add(cls);
  const removeClass = (el, cls) => el?.classList.remove(cls);

  const isValidEmail = email =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const showNotification = (message, type = "info") => {
    qs(".notification")?.remove();

    const notif = document.createElement("div");
    notif.className = `notification notification--${type}`;
    notif.innerHTML = `
      <div class="notification__content">
        <span>${message}</span>
        <button class="notification__close">&times;</button>
      </div>
    `;
    document.body.appendChild(notif);

    setTimeout(() => notif.classList.add("show"), 50);

    notif.querySelector(".notification__close").addEventListener("click", () => {
      notif.classList.remove("show");
      setTimeout(() => notif.remove(), 300);
    });

    setTimeout(() => {
      notif.classList.remove("show");
      setTimeout(() => notif.remove(), 300);
    }, 5000);
  };

  // ===== VARIABLES =====
  const burger = qs("#burger");
  const navMenu = qs("#navMenu");
  const navOverlay = qs("#navOverlay");
  const navLinks = qsa(".nav-link");
  const header = qs(".header");

  // ===== MENU MOBILE =====
  const toggleMobileMenu = () => {
    toggleClass(burger, "active");
    toggleClass(navMenu, "show");
    toggleClass(navOverlay, "show");
    document.body.style.overflow = navMenu.classList.contains("show")
      ? "hidden"
      : "auto";
  };

  const closeMobileMenu = () => {
    [burger, navMenu, navOverlay].forEach(el => removeClass(el, "show"));
    removeClass(burger, "active");
    document.body.style.overflow = "auto";
  };

  burger?.addEventListener("click", toggleMobileMenu);
  navOverlay?.addEventListener("click", closeMobileMenu);
  navLinks.forEach(link => link.addEventListener("click", closeMobileMenu));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && navMenu.classList.contains("show")) {
      closeMobileMenu();
    }
  });

  // ===== ANIMATIONS SCROLL =====
  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        addClass(entry.target, "visible");

        qsa(
          ".service-item, .blog-list, .about-list, .faq-list",
          entry.target
        ).forEach((child, i) => {
          setTimeout(() => {
            child.style.opacity = "1";
            child.style.transform = "translateY(0)";
          }, i * 50);
        });
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  qsa(".section-animate").forEach(section => {
    sectionObserver.observe(section);
    qsa(".service-item, .blog-list, .about-list, .faq-list", section).forEach(
      child => {
        child.style.opacity = "0";
        child.style.transform = "translateY(30px)";
        child.style.transition = "all 0.5s ease";
      }
    );
  });

  // ===== FAQ =====
  qsa(".faq-question").forEach(btn =>
    btn.addEventListener("click", () => {
      const faq = btn.closest(".faq-list");
      const isActive = faq.classList.contains("active");

      qsa(".faq-list").forEach(item => {
        removeClass(item, "active");
        removeClass(qs(".faq-answer", item), "active");
      });

      if (!isActive) {
        addClass(faq, "active");
        addClass(qs(".faq-answer", faq), "active");
      }
    })
  );

  // ===== NAVIGATION ACTIVE =====
  const updateActiveNavLink = () => {
    const headerH = header?.offsetHeight || 100;
    let current = "home";

    qsa("section[id]").forEach(section => {
      const top = section.offsetTop - headerH - 100;
      const bottom = top + section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  };

  // ===== SMOOTH SCROLL =====
  qsa('a[href^="#"]').forEach(anchor =>
    anchor.addEventListener("click", e => {
      e.preventDefault();
      const id = anchor.getAttribute("href");
      if (id === "#") return;

      const target = qs(id);
      if (target) {
        const pos = target.offsetTop - (header?.offsetHeight || 100);
        window.scrollTo({ top: pos, behavior: "smooth" });
        closeMobileMenu();
      }
    })
  );

  // ===== SCROLL EVENTS =====
  const heroImg = qs(".hero img");
  window.addEventListener(
    "scroll",
    () => {
      updateActiveNavLink();
      if (heroImg) {
        heroImg.style.transform = `translateY(${window.scrollY * -0.5}px)`;
      }
    },
    { passive: true }
  );

  // ===== FORMULAIRES =====
  qs(".contact-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;
    const [name, email, msg] = [
      qs('input[type="text"]', form),
      qs('input[type="email"]', form),
      qs("textarea", form)
    ];
    if (![name, email, msg].every(f => f.value.trim())) {
      return showNotification("Veuillez remplir tous les champs", "error");
    }
    showNotification("Message envoyé avec succès !", "success");
    form.reset();
  });

  qs(".register-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;
    let valid = true;

    qsa("[required]", form).forEach(f => {
      if (!f.value.trim()) {
        f.style.borderColor = "#c44f4f";
        valid = false;
      } else f.style.borderColor = "";
    });

    if (!valid) return showNotification("Veuillez remplir tous les champs obligatoires", "error");

    const email = qs('input[type="email"]', form);
    if (email && !isValidEmail(email.value)) {
      return showNotification("Veuillez saisir une adresse email valide", "error");
    }

    showNotification("Inscription réussie ! Bienvenue chez ZERO FITNESS !", "success");
    form.reset();
  });

  // ===== COMPTEURS =====
  const animateCounter = (el, target, duration = 2000) => {
    let start = 0;
    const step = () => {
      start += target / (duration / 16);
      el.textContent = Math.min(Math.floor(start), target);
      if (start < target) requestAnimationFrame(step);
    };
    step();
  };

  const counters = qsa(".counter");
  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !e.target.classList.contains("counted")) {
            animateCounter(e.target, +e.target.dataset.count || 0);
            addClass(e.target, "counted");
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(c => counterObserver.observe(c));
  }

  // ===== LAZY LOAD =====
  const lazyImgs = qsa("img[data-src]");
  if (lazyImgs.length) {
    const imgObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.src = e.target.dataset.src;
          addClass(e.target, "loaded");
          imgObserver.unobserve(e.target);
        }
      });
    });
    lazyImgs.forEach(img => imgObserver.observe(img));
  }

  // ===== INIT =====
  console.log("🏋️ ZERO FITNESS - Site chargé avec succès!");
  updateActiveNavLink();
  setTimeout(() => {
    qsa(".hero-text, .about-title").forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, i * 200);
    });
  }, 500);
});

// ===== FONCTIONS GLOBALES =====
window.scrollToSection = id => {
  const el = document.querySelector(id);
  if (!el) return;
  const pos = el.offsetTop - (document.querySelector(".header")?.offsetHeight || 100);
  window.scrollTo({ top: pos, behavior: "smooth" });
};

window.toggleMenu = () => {
  ["#burger", "#navMenu", "#navOverlay"].forEach(sel =>
    qs(sel)?.classList.toggle("show")
  );
};















