/* ============================================================
   EAH DIVING PRO
   PHOTOS FINAL
   Remplit automatiquement tous les espaces photos publics
============================================================ */

(() => {

  "use strict";


  /* ============================================================
     PHOTOS DU SITE
  ============================================================ */

  const PHOTO = {

    accueil:
      "hero-divers-group.png",

    olympique:
      "olympique-desktop.jpg",

    freestyle:
      "hero-divers-group.png",

    highDiving:
      "high-diving-desktop.png",

    sautAnge:
      "portrait-water-diver.jpg",

    blazons:
      "hero-blazons.png",

    actualites:
      "actualites-hero.jpg",

    spots:
      "spots-hero.jpg",

    fallback:
      "site-water-premium-bg.jpg"

  };


  /* ============================================================
     NORMALISATION
  ============================================================ */

  function norm(value) {

    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ø/g, "o")
      .trim();

  }


  /* ============================================================
     PRECHARGEMENT
  ============================================================ */

  function preloadPhotos() {

    Object.values(PHOTO).forEach(src => {

      const img =
        new Image();

      img.src =
        src;

    });

  }


  /* ============================================================
     NE PAS TOUCHER AUX PHOTOS PROFILS / LOGOS
  ============================================================ */

  function protectedImage(img) {

    const source =
      norm(
        img.src ||
        img.getAttribute("src")
      );


    const classes =
      norm(
        img.className
      );


    return (

      source.includes("logo")

      ||

      classes.includes("profile")

      ||

      classes.includes("avatar")

      ||

      classes.includes("coach-photo")

      ||

      classes.includes("diver-photo")

    );

  }


  /* ============================================================
     REPARATION DES IMG
  ============================================================ */

  function repairImg(img) {

    if (
      !img ||
      protectedImage(img)
    ) {
      return;
    }


    img.classList.add(
      "eah-auto-photo"
    );


    img.loading =
      "eager";


    img.decoding =
      "async";


    try {

      img.fetchPriority =
        "high";

    } catch(e) {}


    const src =
      String(
        img.getAttribute("src") || ""
      ).trim();


    /*
      Une image vide obtient au minimum
      le fond premium.
    */

    if (
      !src ||
      src === "#" ||
      src.includes("undefined") ||
      src.includes("null")
    ) {

      const alternative =
        img.dataset.src ||
        img.dataset.image ||
        img.dataset.photo ||
        PHOTO.fallback;


      img.src =
        alternative;

    }


    /*
      Si l'image échoue :
      on affiche toujours quelque chose.
    */

    img.onerror =
      function() {

        if (
          this.dataset.eahFallbackDone ===
          "1"
        ) {
          return;
        }


        this.dataset.eahFallbackDone =
          "1";


        this.src =
          PHOTO.fallback;

      };

  }



  /* ============================================================
     TROUVER PHOTO SELON LE CONTENU
  ============================================================ */

  function photoForElement(element) {

    const text =
      norm(
        element.textContent
      );


    if (
      text.includes(
        "plongeon olympique"
      )
    ) {

      return PHOTO.olympique;

    }


    if (
      text.includes(
        "freestyle"
      )
      ||
      text.includes(
        "dods"
      )
    ) {

      return PHOTO.freestyle;

    }


    if (
      text.includes(
        "high diving"
      )
    ) {

      return PHOTO.highDiving;

    }


    if (
      text.includes(
        "saut de l'ange"
      )
      ||
      text.includes(
        "saut de lange"
      )
    ) {

      return PHOTO.sautAnge;

    }


    if (
      text.includes(
        "les blazons"
      )
    ) {

      return PHOTO.blazons;

    }


    if (
      text.includes(
        "actualites"
      )
      ||
      text.includes(
        "actualités"
      )
    ) {

      return PHOTO.actualites;

    }


    if (
      text.includes(
        "ou plonger"
      )
      ||
      text.includes(
        "où plonger"
      )
      ||
      text.includes(
        "spots eah"
      )
    ) {

      return PHOTO.spots;

    }


    return "";

  }



  /* ============================================================
     AJOUT PHOTO SUR UNE ZONE
  ============================================================ */

  function fillPhotoZone(element) {

    if (!element) {
      return;
    }


    const photo =
      photoForElement(
        element
      );


    if (!photo) {
      return;
    }


    /*
      Si la zone possède déjà une IMG :
      on utilise l'IMG.
    */

    const img =
      element.querySelector(
        "img"
      );


    if (
      img &&
      !protectedImage(img)
    ) {

      const src =
        String(
          img.getAttribute("src") || ""
        );


      /*
        On remplace uniquement les images
        vides / invalides / ancien fallback.
      */

      if (
        !src
        ||
        src.includes("undefined")
        ||
        src.includes("null")
        ||
        src.includes(
          "site-water-premium-bg"
        )
      ) {

        img.src =
          photo;

      }


      repairImg(
        img
      );


      return;

    }


    /*
      Sinon photo en background.
    */

    element.style.setProperty(
      "background-image",
      `url("${photo}")`,
      "important"
    );


    element.style.setProperty(
      "background-size",
      "cover",
      "important"
    );


    element.style.setProperty(
      "background-position",
      "center center",
      "important"
    );


    element.style.setProperty(
      "background-repeat",
      "no-repeat",
      "important"
    );

  }



  /* ============================================================
     ACCUEIL
  ============================================================ */

  function fixHome() {

    if (
      window.location.hash &&
      window.location.hash !==
      "#accueil"
    ) {
      return;
    }


    const title =
      [...document.querySelectorAll("h1,h2")]
      .find(
        el =>
          norm(el.textContent)
          .includes(
            "le plongeon"
          )
      );


    if (!title) {
      return;
    }


    let zone =
      title.closest("section")
      ||
      title.parentElement;


    if (!zone) {
      return;
    }


    zone.style.setProperty(
      "background-image",
      `url("${PHOTO.accueil}")`,
      "important"
    );


    zone.style.setProperty(
      "background-size",
      "cover",
      "important"
    );


    zone.style.setProperty(
      "background-position",
      "center center",
      "important"
    );

  }



  /* ============================================================
     CARTES DISCIPLINES
  ============================================================ */

  function fixDisciplineCards() {

    const candidates = [

      ...document.querySelectorAll(
        "article"
      ),

      ...document.querySelectorAll(
        ".discipline-card"
      ),

      ...document.querySelectorAll(
        ".disciplines-card"
      )

    ];


    candidates.forEach(
      element => {

        const text =
          norm(
            element.textContent
          );


        if (
          text.includes(
            "plongeon olympique"
          )
          ||
          text.includes(
            "freestyle"
          )
          ||
          text.includes(
            "high diving"
          )
          ||
          text.includes(
            "saut de l'ange"
          )
          ||
          text.includes(
            "saut de lange"
          )
        ) {

          fillPhotoZone(
            element
          );

        }

      }
    );

  }



  /* ============================================================
     HERO DES PAGES
  ============================================================ */

  function fixPageHero() {

    const hash =
      norm(
        window.location.hash
      );


    let titleText =
      "";


    if (
      hash.includes(
        "olympique"
      )
    ) {

      titleText =
        "plongeon olympique";

    }

    else if (
      hash.includes(
        "freestyle"
      )
    ) {

      titleText =
        "freestyle";

    }

    else if (
      hash.includes(
        "high"
      )
    ) {

      titleText =
        "high diving";

    }

    else if (
      hash.includes(
        "ange"
      )
    ) {

      titleText =
        "saut de l'ange";

    }

    else if (
      hash.includes(
        "blazon"
      )
    ) {

      titleText =
        "les blazons";

    }

    else if (
      hash.includes(
        "actualit"
      )
    ) {

      titleText =
        "actualites";

    }

    else if (
      hash.includes(
        "spots"
      )
    ) {

      titleText =
        "ou plonger";

    }


    if (!titleText) {
      return;
    }


    const heading =
      [...document.querySelectorAll(
        "h1,h2"
      )]
      .find(
        el =>

          norm(
            el.textContent
          )
          .includes(
            titleText
          )

      );


    if (!heading) {
      return;
    }


    const zone =
      heading.closest("section")
      ||
      heading.parentElement?.parentElement
      ||
      heading.parentElement;


    fillPhotoZone(
      zone
    );

  }



  /* ============================================================
     BLAZONS INDIVIDUELS
  ============================================================ */

  const blazons = {

    blanc:
      "blazon-blanc.png",

    orange:
      "blazon-orange.png",

    vert:
      "blazon-vert.png",

    bleu:
      "blazon-bleu.png",

    rouge:
      "blazon-rouge.png",

    bronze:
      "blazon-bronze.png",

    argent:
      "blazon-argent.png",

    silver:
      "blazon-argent.png",

    or:
      "blazon-or.png",

    noir:
      "blazon-noir.png",

    legend:
      "blazon-legend.png",

    titan:
      "blazon-titan.png"

  };


  function fixBlazons() {

    document
      .querySelectorAll(
        "article, .blazon-card"
      )
      .forEach(
        card => {

          const text =
            norm(
              card.textContent
            );


          for (
            const [
              key,
              src
            ]
            of Object.entries(
              blazons
            )
          ) {

            if (
              !text.includes(
                key
              )
            ) {
              continue;
            }


            const img =
              card.querySelector(
                "img"
              );


            if (!img) {
              continue;
            }


            img.src =
              src;


            img.style.setProperty(
              "display",
              "block",
              "important"
            );


            img.style.setProperty(
              "opacity",
              "1",
              "important"
            );


            img.style.setProperty(
              "visibility",
              "visible",
              "important"
            );


            img.style.setProperty(
              "object-fit",
              "contain",
              "important"
            );


            break;

          }

        }
      );

  }



  /* ============================================================
     ACTUALITES / SPOTS
     NE PAS REMPLACER LES URL SUPABASE VALIDES
  ============================================================ */

  function fixCmsPhotos() {

    document
      .querySelectorAll(
        ".eah-public-card img, .news-card img, .spot-card img"
      )
      .forEach(
        img => {

          img.style.setProperty(
            "display",
            "block",
            "important"
          );


          img.style.setProperty(
            "opacity",
            "1",
            "important"
          );


          img.style.setProperty(
            "visibility",
            "visible",
            "important"
          );


          img.style.setProperty(
            "object-fit",
            "cover",
            "important"
          );


          repairImg(
            img
          );

        }
      );

  }



  /* ============================================================
     TOUTES LES IMAGES RESTANTES
  ============================================================ */

  function fixAllImgs() {

    document
      .querySelectorAll(
        "main img, section img"
      )
      .forEach(
        repairImg
      );

  }



  /* ============================================================
     EXECUTION
  ============================================================ */

  function applyPhotos() {

    fixHome();

    fixDisciplineCards();

    fixPageHero();

    fixBlazons();

    fixCmsPhotos();

    fixAllImgs();

  }



  preloadPhotos();


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      applyPhotos
    );

  } else {

    applyPhotos();

  }


  window.addEventListener(
    "load",
    applyPhotos
  );


  window.addEventListener(
    "hashchange",
    () => {

      /*
        Ton routeur reconstruit les pages :
        plusieurs passes très rapides.
      */

      requestAnimationFrame(
        applyPhotos
      );


      setTimeout(
        applyPhotos,
        40
      );


      setTimeout(
        applyPhotos,
        150
      );


      setTimeout(
        applyPhotos,
        400
      );

    }
  );


  let timer;


  const observer =
    new MutationObserver(
      () => {

        clearTimeout(
          timer
        );


        timer =
          setTimeout(
            applyPhotos,
            50
          );

      }
    );


  observer.observe(
    document.documentElement,
    {
      childList:
        true,

      subtree:
        true
    }
  );

})();
