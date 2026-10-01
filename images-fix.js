/* ============================================================
   EAH DIVING PRO
   GESTION DES IMAGES DU SITE

   Connecte automatiquement les fichiers déjà présents :
   - Plongeon olympique
   - Freestyle / Døds
   - High Diving
   - Saut de l'ange
   - desktop / mobile
============================================================ */

(() => {

  const FILES = {

    olympique: {
      desktop: "olympique-desktop.jpg",
      mobile: "olympique-mobile.jpg",
      hero: "hero-diver-vertical.jpg"
    },

    freestyle: {
      desktop: "freestyle-desktop.jpg",
      mobile: "freestyle-mobile.jpg",
      hero: "hero-freestyle.jpg"
    },

    highdiving: {
      desktop: "high-diving-desktop.png",
      mobile: "high-diving-mobile.jpg",
      hero: "hero-high-diving.png"
    },

    ange: {
      desktop: "saut-ange-desktop.jpg",
      mobile: "saut-ange-mobile.jpg",
      hero: "hero-saut-ange.jpg"
    }

  };


  /* ========================================================
     MOBILE / DESKTOP
  ======================================================== */

  function isMobile() {

    return window.innerWidth <= 700;

  }


  function disciplineImage(key) {

    return isMobile()
      ? FILES[key].mobile
      : FILES[key].desktop;

  }


  /* ========================================================
     NORMALISATION TEXTE
  ======================================================== */

  function normalize(value) {

    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ø/g, "o");

  }


  function detectDiscipline(text) {

    const value = normalize(text);


    if (
      value.includes("plongeon olympique")
      ||
      value.includes("olympique")
    ) {
      return "olympique";
    }


    if (
      value.includes("freestyle")
      ||
      value.includes("dods")
    ) {
      return "freestyle";
    }


    if (
      value.includes("high diving")
      ||
      value.includes("high-diving")
      ||
      value.includes("highdiving")
    ) {
      return "highdiving";
    }


    if (
      value.includes("saut de l'ange")
      ||
      value.includes("saut de lange")
      ||
      value.includes("ange")
    ) {
      return "ange";
    }


    return null;

  }


  /* ========================================================
     CORRIGER LES <IMG>
  ======================================================== */

  function fixImages() {

    document
      .querySelectorAll("img")
      .forEach(img => {

        /*
          Ne jamais modifier :
          logo / blazons / photos de profils / grading
        */

        const current =
          normalize(
            img.getAttribute("src")
          );


        if (
          current.includes("logo")
          ||
          current.includes("blazon")
          ||
          current.includes("grading-")
          ||
          current.includes("notation-")
          ||
          current.includes("grade-report")
        ) {
          return;
        }


        const context = [

          img.alt,

          img.title,

          img.getAttribute(
            "aria-label"
          ),

          img.parentElement
            ?.textContent,

          img.closest(
            "article,section,a,div"
          )
            ?.textContent

        ]
        .filter(Boolean)
        .join(" ");


        const discipline =
          detectDiscipline(
            context
          );


        if (!discipline) {
          return;
        }


        /*
          Remplace uniquement les images
          de disciplines.
        */

        const correctSrc =
          disciplineImage(
            discipline
          );


        if (
          img.getAttribute("src")
          !== correctSrc
        ) {

          img.src =
            correctSrc;

        }


        img.style.objectFit =
          "cover";


        img.style.width =
          "100%";


        img.style.height =
          "100%";

      });

  }


  /* ========================================================
     CARTES DISCIPLINES DE L'ACCUEIL

     Corrige notamment :
     - Freestyle actuellement vide
     - High Diving actuellement cassé
  ======================================================== */

  function fixDisciplineCards() {

    const headings =
      document.querySelectorAll(
        "h1,h2,h3,h4,h5"
      );


    headings.forEach(title => {

      const discipline =
        detectDiscipline(
          title.textContent
        );


      if (!discipline) {
        return;
      }


      /*
        Trouver la carte autour du titre.
      */

      let card =
        title.closest(
          ".discipline-card"
        );


      if (!card) {

        card =
          title.closest(
            "[class*='discipline']"
          );

      }


      if (!card) {

        card =
          title.closest(
            "article"
          );

      }


      /*
        Si le HTML actuel n'utilise aucune
        de ces classes, remonter quelques niveaux.
      */

      if (!card) {

        let parent =
          title.parentElement;


        for (
          let i = 0;
          i < 4 && parent;
          i++
        ) {

          const rect =
            parent.getBoundingClientRect();


          if (
            rect.width > 250
            &&
            rect.height > 150
          ) {

            card =
              parent;

            break;

          }


          parent =
            parent.parentElement;

        }

      }


      if (!card) {
        return;
      }


      const file =
        disciplineImage(
          discipline
        );


      /*
        Si la carte possède une image,
        utiliser directement cette image.
      */

      const img =
        card.querySelector("img");


      if (img) {

        img.src =
          file;


        img.style.width =
          "100%";


        img.style.height =
          "100%";


        img.style.objectFit =
          "cover";

        return;

      }


      /*
        Sinon on applique l'image comme fond.
      */

      card.style.backgroundImage = `

        linear-gradient(
          90deg,
          rgba(3,19,31,.60),
          rgba(3,19,31,.18)
        ),

        url("${file}")

      `;


      card.style.backgroundSize =
        "cover";


      card.style.backgroundPosition =
        "center";


      card.style.backgroundRepeat =
        "no-repeat";

    });

  }


  /* ========================================================
     GRANDES PHOTOS EN HAUT DES PAGES DISCIPLINES
  ======================================================== */

  function fixPageHero() {

    const hash =
      normalize(
        window.location.hash
      );


    let discipline =
      null;


    if (
      hash.includes("olympique")
    ) {

      discipline =
        "olympique";

    }


    if (
      hash.includes("freestyle")
      ||
      hash.includes("dods")
    ) {

      discipline =
        "freestyle";

    }


    if (
      hash.includes("high")
    ) {

      discipline =
        "highdiving";

    }


    if (
      hash.includes("ange")
    ) {

      discipline =
        "ange";

    }


    if (!discipline) {
      return;
    }


    /*
      Trouver le grand hero visible.
    */

    const candidates =
      document.querySelectorAll(

        ".discipline-hero,"
        +
        ".page-hero,"
        +
        ".hero-discipline,"
        +
        "[class*='discipline'][class*='hero']"

      );


    let hero =
      null;


    candidates.forEach(el => {

      const rect =
        el.getBoundingClientRect();


      if (
        rect.width > 500
        &&
        rect.height > 250
        &&
        rect.bottom > 0
      ) {

        hero =
          el;

      }

    });


    if (!hero) {
      return;
    }


    const file =
      FILES[discipline].hero;


    hero.style.backgroundImage = `

      linear-gradient(
        90deg,
        rgba(2,15,27,.40) 0%,
        rgba(2,15,27,.18) 48%,
        rgba(2,15,27,.06) 100%
      ),

      url("${file}")

    `;


    hero.style.backgroundSize =
      "cover";


    hero.style.backgroundPosition =
      "center";


    hero.style.backgroundRepeat =
      "no-repeat";

  }


  /* ========================================================
     LANCEMENT
  ======================================================== */

  function fixAllImages() {

    fixImages();

    fixDisciplineCards();

    fixPageHero();

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(

      "DOMContentLoaded",

      fixAllImages,

      {
        once: true
      }

    );

  } else {

    fixAllImages();

  }


  /*
    Ton site fonctionne avec des #routes.
    Relancer lorsque la page change.
  */

  window.addEventListener(
    "hashchange",
    () => {

      setTimeout(
        fixAllImages,
        100
      );

    }
  );


  /*
    Responsive tablette / téléphone.
  */

  let resizeTimer;


  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        setTimeout(
          fixAllImages,
          200
        );

    }
  );


  /*
    Le site construit certaines parties
    dynamiquement avec JavaScript.
  */

  const observer =
    new MutationObserver(
      () => {

        clearTimeout(
          window.__eahImageTimer
        );


        window.__eahImageTimer =
          setTimeout(
            fixAllImages,
            100
          );

      }
    );


  observer.observe(

    document.body,

    {
      childList: true,
      subtree: true
    }

  );


  setTimeout(
    fixAllImages,
    500
  );


  setTimeout(
    fixAllImages,
    1500
  );

})();
