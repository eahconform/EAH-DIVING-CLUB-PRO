/* ============================================================
   EAH DIVING PRO
   CHARGEMENT PHOTOS FINAL
   - préchargement immédiat
   - aucune image "lazy"
   - correction images injectées après Supabase
   - correction changement de club sans refresh
============================================================ */

(() => {

  const HTML = document.documentElement;

  /* ============================================================
     IMAGES PRINCIPALES À PRÉCHARGER
  ============================================================ */

  const PRELOAD_IMAGES = [

  /* FOND */
  "site-water-premium-bg.jpg",

  /* ACCUEIL */
  "hero-divers-group.png",

  /* BLAZONS / AUTRES HERO */
  "hero-blazons.png",
  "actualites-hero.jpg",
  "spots-hero.jpg",

  /* PLONGEON OLYMPIQUE */
  "olympique-desktop.jpg",
  "olympique-mobile.jpg",
  "portrait-water-diver.jpg",

  /* FREESTYLE / DØDS */
  "freestyle-desktop.jpg",
  "freestyle-mobile.jpg",

  /* HIGH DIVING */
  "high-diving-desktop.png",
  "high-diving-mobile.jpg",

  /* SAUT DE L'ANGE */
  "saut-ange-desktop.jpg",
  "saut-ange-mobile.jpg"

];


  /* ============================================================
     URL ABSOLUE
  ============================================================ */

  function absoluteUrl(url) {

    if (!url) return "";

    try {
      return new URL(url, document.baseURI).href;
    } catch (e) {
      return url;
    }

  }


  /* ============================================================
     CHARGER UNE IMAGE
  ============================================================ */

  function preloadUrl(url) {

    return new Promise(resolve => {

      if (!url) {
        resolve();
        return;
      }

      const image = new Image();

      image.decoding = "async";

      try {
        image.fetchPriority = "high";
      } catch (e) {}

      image.onload = resolve;
      image.onerror = resolve;

      image.src = absoluteUrl(url);

      if (image.complete) {
        resolve();
      }

    });

  }


  /* ============================================================
     FORCE LE CHARGEMENT IMMÉDIAT
  ============================================================ */

  function forceEager(root = document) {

    root
      .querySelectorAll("img")
      .forEach(img => {

        img.loading = "eager";
        img.decoding = "async";

        try {
          img.fetchPriority = "high";
        } catch (e) {}

      });

  }


  /* ============================================================
     RÉCUPÉRER LES URL DES IMAGES
  ============================================================ */

  function collectImages(root = document) {

    const urls = new Set();

    PRELOAD_IMAGES.forEach(url => {
      urls.add(absoluteUrl(url));
    });


    root.querySelectorAll("img").forEach(img => {

      const url =
        img.currentSrc ||
        img.getAttribute("src");

      if (url) {
        urls.add(absoluteUrl(url));
      }

    });


    root.querySelectorAll("source[srcset]").forEach(source => {

      const srcset = source.getAttribute("srcset");

      if (!srcset) return;

      srcset.split(",").forEach(item => {

        const url = item
          .trim()
          .split(/\s+/)[0];

        if (url) {
          urls.add(absoluteUrl(url));
        }

      });

    });


    return Array.from(urls);

  }


  /* ============================================================
     ATTENDRE LES IMAGES AVANT AFFICHAGE
  ============================================================ */

  async function prepare(root = document) {

    forceEager(root);

    const images = root.querySelectorAll("img");

    images.forEach(img => {
      img.classList.add("eah-image-wait");
    });

    const urls = collectImages(root);

    await Promise.race([

      Promise.allSettled(
        urls.map(preloadUrl)
      ),

      new Promise(resolve =>
        setTimeout(resolve, 7000)
      )

    ]);


    images.forEach(img => {

      img.classList.remove("eah-image-wait");
      img.classList.add("eah-image-ready");

    });

  }


  /* ============================================================
     IMAGE AJOUTÉE APRÈS CHARGEMENT
     CLUB / ACTUALITÉS / SPOTS / SUPABASE
  ============================================================ */

  function prepareNewImage(img) {

    if (!img || img.tagName !== "IMG") return;

    img.loading = "eager";
    img.decoding = "async";

    try {
      img.fetchPriority = "high";
    } catch (e) {}

    img.classList.add("eah-image-wait");

    const src =
      img.currentSrc ||
      img.getAttribute("src");

    if (!src) {
      img.classList.remove("eah-image-wait");
      return;
    }

    preloadUrl(src).then(() => {

      img.classList.remove("eah-image-wait");
      img.classList.add("eah-image-ready");

    });

  }


  /* ============================================================
     SURVEILLANCE DOM
  ============================================================ */

  const observer = new MutationObserver(mutations => {

    mutations.forEach(mutation => {

      /* Nouvelle image */
      mutation.addedNodes.forEach(node => {

        if (!(node instanceof HTMLElement)) return;


        if (node.tagName === "IMG") {
          prepareNewImage(node);
        }


        node
          .querySelectorAll?.("img")
          .forEach(prepareNewImage);

      });


      /* SRC MODIFIÉ */
      if (
        mutation.type === "attributes" &&
        mutation.target instanceof HTMLImageElement
      ) {

        prepareNewImage(mutation.target);

      }

    });

  });


  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "src",
        "srcset"
      ]
    }
  );


  /* ============================================================
     PREMIER CHARGEMENT
  ============================================================ */

  async function bootPhotos() {

    await prepare(document);

    HTML.classList.remove(
      "eah-images-loading"
    );

    HTML.classList.add(
      "eah-images-ready"
    );

  }


  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      bootPhotos,
      { once: true }
    );

  } else {

    bootPhotos();

  }


  /* ============================================================
     RETOUR NAVIGATEUR / MOBILE
  ============================================================ */

  window.addEventListener("pageshow", () => {
    forceEager(document);
  });


  window.addEventListener("hashchange", () => {
    forceEager(document);
  });


  /* ============================================================
     API ACCESSIBLE DEPUIS EAH-WORKSPACE
  ============================================================ */

  window.EAHPhotos = {

    refresh(root = document) {
      return prepare(root);
    },

    preload(url) {
      return preloadUrl(url);
    }

  };

})();
