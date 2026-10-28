/* =========================================================
   main.js — Akaritma
   ---------------------------------------------------------
   Semua nomor dan akun diatur di objek CONFIG.
   Teks Indonesia ada di HTML; versi Inggris ada di i18n.js.
   ========================================================= */

(function () {
  'use strict';

  var CONFIG = {
    /* Nomor WhatsApp format internasional, tanpa "+" dan tanpa spasi. */
    whatsapp: '6285882227053',
    /* Nomor khusus audiensi kemitraan sekolah (B2B). */
    whatsappPartnership: '6281284810608',

    instagram: 'akaritma',
    /* Kosongkan ('') untuk menyembunyikan tautannya. */
    linkedin: '',
    site: 'https://akaritma.com'
  };

  var LANG_KEY = 'akaritma-lang';

  /* Pesan WhatsApp per konteks. Versi Inggris ada di i18n.js (kunci wa.<kind>). */
  var WA_ID = {
    diagnostic: 'Halo Akaritma, saya ingin menjadwalkan Diagnostic Mapping untuk anak saya.\n\nNama anak: \nKelas / jenjang: \nSekolah: \nKeluhan utama: ',
    program: 'Halo Akaritma, saya ingin bertanya soal program belajar untuk anak saya.\n\nNama anak: \nKelas / jenjang: \nProgram yang diminati: ',
    'math-explorer': 'Halo Akaritma, saya tertarik dengan Akaritma Math Explorer (SD kelas 1–6).\n\nNama anak: \nKelas: \nSekolah: ',
    'fast-track': 'Halo Akaritma, saya tertarik dengan 1-Year Math Fast-Track Masterclass (SMP–SMA).\n\nNama anak: \nKelas: \nKurikulum sekolah: Nasional Plus / Cambridge / IB',
    'junior-innovator': 'Halo Akaritma, saya tertarik dengan Junior Innovator (Coding, usia 7–12 tahun).\n\nNama anak: \nUsia: \nPengalaman coding sebelumnya: ',
    'teen-visionary': 'Halo Akaritma, saya tertarik dengan Teen Visionary (Coding & AI, usia 13–18 tahun).\n\nNama anak: \nUsia: \nMinat: Python / Web / AI',
    deck: 'Halo Akaritma, boleh saya minta program deck (PDF) untuk saya pelajari lebih dulu?',
    partnership: 'Halo Akaritma, kami dari sekolah/yayasan ingin mendiskusikan kemitraan program.\n\nNama sekolah: \nJabatan: \nJumlah siswa: \nSkema yang diminati: ',
    audience: 'Halo Akaritma, kami ingin menjadwalkan sesi audiensi kurikulum untuk sekolah kami.\n\nNama sekolah: \nNama & jabatan: \nPreferensi jadwal: ',
    general: 'Halo Akaritma, saya ingin bertanya tentang program belajar.'
  };

  var PARTNERSHIP_KINDS = { partnership: 1, audience: 1 };

  var dict = (window.AKARITMA_I18N && window.AKARITMA_I18N.en) || {};

  /* Halaman kemitraan memakai kunci meta sendiri agar judul tab tidak tertukar. */
  var metaPrefix = document.documentElement.getAttribute('data-page') === 'kemitraan' ? 'kp.' : '';

  /* ---------- simpan teks asli (Indonesia) ---------- */
  var originals = [];
  var originalTitle = document.title;
  var metaDesc = document.querySelector('meta[name="description"]');
  var originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';

  function remember(el) {
    if (el.hasAttribute('data-i18n')) {
      originals.push({ el: el, kind: 'text', key: el.getAttribute('data-i18n'), value: el.textContent });
    } else if (el.hasAttribute('data-i18n-html')) {
      originals.push({ el: el, kind: 'html', key: el.getAttribute('data-i18n-html'), value: el.innerHTML });
    }
    var attrSpec = el.getAttribute('data-i18n-attr');
    if (attrSpec) {
      attrSpec.split(',').forEach(function (pair) {
        var bits = pair.split(':');
        if (bits.length !== 2) return;
        var attr = bits[0].trim();
        var key = bits[1].trim();
        originals.push({ el: el, kind: 'attr', attr: attr, key: key, value: el.getAttribute(attr) || '' });
      });
    }
  }

  document.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-attr]').forEach(remember);

  /* ---------- WhatsApp ---------- */
  function currentLang() {
    return document.documentElement.lang === 'en' ? 'en' : 'id';
  }

  function waNumber(kind) {
    return PARTNERSHIP_KINDS[kind] ? CONFIG.whatsappPartnership : CONFIG.whatsapp;
  }

  function waHref(kind, lang) {
    var text = lang === 'en' ? dict['wa.' + kind] : undefined;
    if (text === undefined) text = WA_ID[kind] || '';
    return 'https://wa.me/' + waNumber(kind) + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  function refreshLinks() {
    var lang = currentLang();

    document.querySelectorAll('[data-wa]').forEach(function (a) {
      a.setAttribute('href', waHref(a.getAttribute('data-wa'), lang));
    });

    document.querySelectorAll('[data-ig]').forEach(function (a) {
      if (CONFIG.instagram) {
        a.setAttribute('href', 'https://www.instagram.com/' + CONFIG.instagram);
        a.hidden = false;
      } else {
        a.hidden = true;
      }
    });

    document.querySelectorAll('[data-linkedin]').forEach(function (a) {
      if (CONFIG.linkedin) {
        a.setAttribute('href', CONFIG.linkedin);
        a.hidden = false;
      } else {
        a.hidden = true;
      }
    });
  }

  /* ---------- bahasa ---------- */
  var missingKeys = [];

  function applyLang(lang, persist) {
    lang = lang === 'en' ? 'en' : 'id';
    document.documentElement.lang = lang;

    originals.forEach(function (item) {
      var translated = lang === 'en' ? dict[item.key] : undefined;

      if (item.kind === 'attr') {
        item.el.setAttribute(item.attr, translated !== undefined ? translated : item.value);
        return;
      }
      if (lang === 'en' && translated === undefined) missingKeys.push(item.key);
      var value = translated !== undefined ? translated : item.value;
      if (item.kind === 'html') {
        item.el.innerHTML = value;
      } else {
        item.el.textContent = value;
      }
    });

    document.title = (lang === 'en' && dict[metaPrefix + 'meta.title']) ? dict[metaPrefix + 'meta.title'] : originalTitle;
    if (metaDesc) {
      metaDesc.setAttribute('content', (lang === 'en' && dict[metaPrefix + 'meta.description']) ? dict[metaPrefix + 'meta.description'] : originalDesc);
    }

    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });

    refreshLinks();

    if (persist) {
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* mode privat */ }
    }
  }

  function initialLang() {
    var param = new URLSearchParams(window.location.search).get('lang');
    if (param === 'en' || param === 'id') return param;
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'id') return saved;
    } catch (e) { /* abaikan */ }
    return 'id';
  }

  document.querySelectorAll('[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'), true);
    });
  });

  /* ---------- navigasi mobile ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', currentLang() === 'en' ? 'Open menu' : 'Buka menu');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open
        ? (currentLang() === 'en' ? 'Close menu' : 'Tutup menu')
        : (currentLang() === 'en' ? 'Open menu' : 'Buka menu'));
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

  /* ---------- header, scrollspy, sticky CTA ---------- */
  var header = document.querySelector('.site-header');
  var sticky = document.querySelector('.sticky-cta');
  var hero = document.getElementById('hero');
  var contact = document.getElementById('kontak');
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__list a[href^="#"]'));
  var spyTargets = spyLinks.map(function (a) {
    return document.getElementById(a.getAttribute('href').slice(1));
  });

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle('is-scrolled', y > 8);

    if (sticky) {
      var pastHero = hero ? y > hero.offsetHeight * 0.6 : y > 400;
      var atContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.9 : false;
      sticky.classList.toggle('is-visible', pastHero && !atContact);
    }

    var active = null;
    spyTargets.forEach(function (target) {
      if (!target) return;
      if (target.getBoundingClientRect().top <= 120) active = target.id;
    });
    spyLinks.forEach(function (a) {
      var isActive = active !== null && a.getAttribute('href') === '#' + active;
      if (isActive) {
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

  /* ---------- animasi muncul saat digulir ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll('.card, .product, .plan, .pillar, .scheme, .track, .steps > li, .roadmap__item, .facts > li');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (el, index) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('reveal');
        el.style.transitionDelay = (Math.min(index % 4, 3) * 60) + 'ms';
        observer.observe(el);
      }
    });

    /* jaring pengaman: apa pun yang terjadi, semua konten tetap tampil */
    window.setTimeout(function () {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-in');
      });
    }, 2500);
  }

  /* ---------- inisialisasi ---------- */
  applyLang(initialLang(), false);
  onScroll();

  if (missingKeys.length) {
    console.warn('[i18n] Kunci belum diterjemahkan:', missingKeys.join(', '));
  }
})();
