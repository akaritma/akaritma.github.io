/* ============================================================
   Akaritma — main.js
   Zero-dependency interactive modules:
     A. Centralized WhatsApp Routing (Program + Format context)
     B. 60-Second Narrative Deconstruction tab switcher
     C. Program & Format Recommender + FAQ Accordions
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Centralized configuration ---------- */
  var AKARITMA_CONFIG = {
    /* Nomor WhatsApp utama (calon orang tua / siswa). Dipertahankan dari repo lama. */
    whatsappNumber: '6285882227053',
    /* Nomor kemitraan sekolah (B2B) — tidak dipakai di landing page, disimpan agar tidak hilang. */
    whatsappPartnership: '6281284810608',
    instagramUrl: 'https://instagram.com/akaritma',
    programs: {
      utbk: {
        name: 'UTBK Quantitative & Reasoning Sprint',
        groupCap: 'Kelas Kelompok (Maks. 8 Siswa)',
        privateCap: 'Kelas Privat (1-on-1 VIP)',
        defaultMessage: 'Halo Tim Akaritma, saya ingin tanya jadwal & sesi diagnostik untuk program *UTBK Quantitative & Reasoning Sprint*.'
      },
      tka: {
        name: 'Persiapan Tes Masuk SMA Unggulan / TKA',
        groupCap: 'Kelas Kelompok (Maks. 8 Siswa)',
        privateCap: 'Kelas Privat (1-on-1 VIP)',
        defaultMessage: 'Halo Tim Akaritma, saya ingin konsultasi program *Persiapan Tes Masuk SMA Unggulan (TKA)* untuk jenjang SMP.'
      },
      fastTrack: {
        name: 'Fast-Track Pure Mathematics',
        groupCap: 'Kelas Kelompok (Maks. 4 Siswa)',
        privateCap: 'Kelas Privat (1-on-1 VIP)',
        defaultMessage: 'Halo Tim Akaritma, saya tertarik konsultasi program *Fast-Track Pure Mathematics* untuk penguasaan konsep SMP/SMA.'
      },
      diagnostic: {
        name: 'Sesi Tes Diagnostik & Konsultasi Umum',
        groupCap: 'Kelas Kelompok',
        privateCap: 'Kelas Privat (1-on-1 VIP)',
        defaultMessage: 'Halo Tim Akaritma, saya ingin mendaftarkan diri/anak saya untuk *Sesi Diagnostik Penalaran Matematika & Konsultasi Program*.'
      },
      partnership: {
        name: 'Kemitraan Sekolah & Audiensi Kurikulum',
        groupCap: 'Kelas Kelompok (Maks. 4 Siswa)',
        privateCap: 'Kelas Privat (1-on-1 VIP)',
        defaultMessage: 'Halo Tim Akaritma, kami dari sekolah/yayasan ingin menjadwalkan sesi audiensi kurikulum & membahas skema kemitraan.\n\nNama Sekolah: \nNama & Jabatan: \nJumlah Siswa: \nSkema yang diminati: '
      }
    }
  };

  window.AKARITMA_CONFIG = AKARITMA_CONFIG;

  /* ---------- Module A: WhatsApp routing ---------- */
  function openWhatsApp(programKey, classFormat, customDetail) {
    classFormat = classFormat || 'Kelompok';
    var prog = AKARITMA_CONFIG.programs[programKey] || AKARITMA_CONFIG.programs.diagnostic;
    var formatLabel = classFormat === 'Privat' ? prog.privateCap : prog.groupCap;

    var text = prog.defaultMessage + '\n\u2022 Pilihan Format: *' + formatLabel + '*';
    if (customDetail) {
      text += '\n\nDetail Tambahan:\n' + customDetail;
    }

    /* Program kemitraan sekolah dialihkan ke nomor B2B. */
    var number = programKey === 'partnership'
      ? AKARITMA_CONFIG.whatsappPartnership
      : AKARITMA_CONFIG.whatsappNumber;

    var url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  window.openWhatsApp = openWhatsApp;

  /* Global delegation: every element with [data-wa-program] opens WhatsApp */
  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-wa-program]');
    if (!trigger) return;
    event.preventDefault();
    var program = trigger.getAttribute('data-wa-program');
    var format = trigger.getAttribute('data-wa-format') || 'Kelompok';
    openWhatsApp(program, format);
  });

  /* ---------- Module B: Narrative deconstruction tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.classList.toggle('is-active', active);
      });
    });
  });

  /* ---------- Module C: Program & format recommender ---------- */
  var builder = document.getElementById('builder');
  if (builder) {
    var state = { jenjang: null, program: null, format: null };

    var jenjangLabels = {
      utbk: 'Kelas 12 / Gap Year',
      tka: 'Kelas 8\u20139 SMP',
      fastTrack: 'Kelas 7, 10, atau 11'
    };

    var jenjangButtons = builder.querySelectorAll('[data-jenjang]');
    var programButtons = builder.querySelectorAll('[data-program]');
    var formatButtons = builder.querySelectorAll('[data-format]');
    var sendButton = document.getElementById('builder-send');
    var hint = document.getElementById('builder-hint');
    var nameInput = document.getElementById('student-name');
    var targetInput = document.getElementById('student-target');

    function recommendProgram() {
      var recommended = state.jenjang; // jenjang key maps 1:1 to program key
      programButtons.forEach(function (btn) {
        var isRecommended = btn.getAttribute('data-program') === recommended;
        btn.classList.toggle('is-recommended', !!isRecommended);
        if (isRecommended && state.program !== recommended) {
          // auto-select the recommended program
          setProgram(recommended, false);
        }
      });
    }

    function setJenjang(key) {
      state.jenjang = key;
      jenjangButtons.forEach(function (btn) {
        btn.classList.toggle('is-selected', btn.getAttribute('data-jenjang') === key);
      });
      recommendProgram();
      updateHint();
    }

    function setProgram(key, fromUser) {
      state.program = key;
      programButtons.forEach(function (btn) {
        btn.classList.toggle('is-selected', btn.getAttribute('data-program') === key);
      });
      updateHint();
    }

    function setFormat(key) {
      state.format = key;
      formatButtons.forEach(function (btn) {
        btn.classList.toggle('is-selected', btn.getAttribute('data-format') === key);
      });
      updateHint();
    }

    function updateHint() {
      if (!hint) return;
      if (!state.jenjang || !state.program || !state.format) {
        hint.textContent = 'Lengkapi pilihan jenjang, program, dan format untuk mengirim konsultasi.';
        hint.classList.remove('is-ok');
      } else {
        var prog = AKARITMA_CONFIG.programs[state.program];
        hint.textContent = 'Siap dikirim: ' + prog.name + ' \u2014 ' +
          (state.format === 'Privat' ? prog.privateCap : prog.groupCap) + '.';
        hint.classList.add('is-ok');
      }
    }

    jenjangButtons.forEach(function (btn) {
      btn.addEventListener('click', function () { setJenjang(btn.getAttribute('data-jenjang')); });
    });
    programButtons.forEach(function (btn) {
      btn.addEventListener('click', function () { setProgram(btn.getAttribute('data-program'), true); });
    });
    formatButtons.forEach(function (btn) {
      btn.addEventListener('click', function () { setFormat(btn.getAttribute('data-format')); });
    });

    sendButton.addEventListener('click', function () {
      if (!state.jenjang || !state.program || !state.format) {
        if (hint) {
          hint.textContent = 'Mohon lengkapi: jenjang, program, dan format kelas terlebih dahulu.';
          hint.classList.remove('is-ok');
        }
        return;
      }
      var name = nameInput ? nameInput.value.trim() : '';
      var target = targetInput ? targetInput.value.trim() : '';
      var details = 'Jenjang Siswa: ' + (jenjangLabels[state.jenjang] || state.jenjang);
      if (name) details += '\nNama Siswa: ' + name;
      if (target) details += '\nTarget Kampus/Sekolah: ' + target;
      openWhatsApp(state.program, state.format, details);
    });

    updateHint();
  }

  /* ---------- FAQ accordion (single-open enhancement) ---------- */
  var accordionItems = Array.prototype.slice.call(document.querySelectorAll('.acc-item'));
  if (accordionItems.length) {
    accordionItems.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        accordionItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  /* ---------- Mobile navigation ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Buka menu');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 980) closeNav();
    });
  }

  /* ---------- Scrollspy for nav active state ---------- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__list a[href^="#"]'));
  var spyTargets = spyLinks.map(function (a) {
    return document.getElementById(a.getAttribute('href').slice(1));
  });

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var header = document.querySelector('.site-header');
    if (header) header.classList.toggle('is-scrolled', y > 8);

    var active = null;
    spyTargets.forEach(function (target) {
      if (target && target.getBoundingClientRect().top <= 140) active = target.id;
    });
    spyLinks.forEach(function (a) {
      if (active && a.getAttribute('href') === '#' + active) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }, { passive: true });

  /* ---------- Reveal-on-scroll animation ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealTargets = document.querySelectorAll('.card, .mentor, .compare-card, .compare-strip__item, .metric, .timeline__item, .deconstruct, .builder, .pillar, .scheme');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    revealTargets.forEach(function (el, index) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('reveal');
        el.style.transitionDelay = (Math.min(index % 3, 2) * 60) + 'ms';
        observer.observe(el);
      }
    });

    /* Safety net: always reveal content even if observer fails */
    window.setTimeout(function () {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-in');
      });
    }, 2500);
  }

  /* ---------- Init ---------- */
  onScroll();
})();
