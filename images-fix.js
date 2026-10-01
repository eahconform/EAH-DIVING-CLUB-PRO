/* ============================================================
   EAH DIVING PRO
   IMAGES FIX V2
   - protège les blazons
   - corrige les 4 disciplines
   - desktop/mobile
   - corrige Orange ≠ Saut de l'ange
   - secours Actualités / Spots
============================================================ */

(() => {

  const DISCIPLINES = {

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


  const BLAZONS = {

    blanc: "blazon-blanc.png",
    orange: "blazon-orange.png",
    vert: "blazon-vert.png",
    bleu: "blazon-bleu.png",
    rouge: "blazon-rouge.png",
    bronze: "blazon-bronze.png",
    argent: "blazon-argent.png",
    or: "blazon-or.png",
    noir: "blazon-noir.png",
    legend: "blazon-legend.png",
    titan: "blazon-titan.png"

  };


  function normalize(value) {

    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ø/g, "o")
      .trim();

  }


  function isMobile() {

    return window.innerWidth <= 700;

  }


  function disciplineImage(key) {

    const data = DISCIPLINES[key];

    if (!data) return "";

    return isMobile()
      ? data.mobile
      : data.desktop;

  }


  /* ============================================================
     DETECTION DISCIPLINE
     IMPORTANT :
     PAS DE value.includes("ange")
     car ORANGE contient ANGE.
  ============================================================ */

  function detectDiscipline(value) {

    const text = normalize(value);


    if (
      text.includes("plongeon olympique") ||
      text === "olympique"
    ) {
      return "olympique";
    }


    if (
      text.includes("freestyle") ||
      text.includes("dods")
    ) {
      return "freestyle";
    }


    if (
      text.includes("high diving") ||
      text.includes("high-diving") ||
      text.includes("highdiving")
    ) {
      return "highdiving";
    }


    if (
      text.includes("saut de l'ange") ||
      text.includes("saut de lange") ||
      text.includes("saut-ange")
    ) {
      return "ange";
    }


    return null;

  }



  /* ============================================================
     PROTECTION BLAZONS
  ============================================================ */

  function fixBlazons() {

    document
      .querySelectorAll("h1,h2,h3,h4,h5")
      .forEach(title => {

        const text =
          normalize(title.textContent);


        if (!text.startsWith("blazon ")) {
          return;
        }


        let key =
          text
            .replace(/^blazon\s+/, "")
            .trim();


        if (key === "silver") {
          key = "argent";
        }

        if (key === "gold") {
          key = "or";
        }

        if (key === "legende") {
          key = "legend";
        }


        const file =
          BLAZONS[key];


        if (!file) {
          return;
        }


        const card =
          title.closest(
            ".blazon-card, article, [class*='blazon']"
          );


        if (!card) {
          return;
        }


        const img =
          card.querySelector("img");


        if (!img) {
          return;
        }


        if (
          img.getAttribute("src") !== file
        ) {

          img.src = file;

        }

      });

  }



  /* ============================================================
     CARTES DISCIPLINES ACCUEIL
  ============================================================ */

  function fixDisciplineCards() {

    document
      .querySelectorAll("h1,h2,h3,h4")
      .forEach(title => {

        const titleText =
          normalize(title.textContent);


        /*
          Ne jamais toucher aux blazons.
        */

        if (
          titleText.startsWith("blazon ")
        ) {
          return;
        }


        const discipline =
          detectDiscipline(
            title.textContent
          );


        if (!discipline) {
          return;
        }


        let card =
          title.closest(
            ".discipline-card"
          );


        if (!card) {

          card =
            title.closest(
              "[class*='discipline-card']"
            );

        }


        if (!card) {

          card =
            title.closest(
              "article"
            );

        }


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
              rect.width > 250 &&
              rect.height > 150
            ) {

              card = parent;

              break;

            }


            parent =
              parent.parentElement;

          }

        }


        if (!card) {
          return;
        }


        /*
          Protection supplémentaire.
        */

        if (
          normalize(
            card.textContent
          ).includes("blazon ")
        ) {
          return;
        }


        const file =
          disciplineImage(
            discipline
          );


        const img =
          card.querySelector("img");


        if (img) {

          img.src = file;

          img.style.width =
            "100%";

          img.style.height =
            "100%";

          img.style.objectFit =
            "cover";

          return;

        }


        card.style.backgroundImage = `

          linear-gradient(
            90deg,
            rgba(3,19,31,.30),
            rgba(3,19,31,.05)
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



  /* ============================================================
     HERO DES PAGES DISCIPLINES
  ============================================================ */

  function fixDisciplineHero() {

    const hash =
      normalize(
        window.location.hash
      );


    let discipline = null;


    if (
      hash.includes("olympique")
    ) {
      discipline = "olympique";
    }


    if (
      hash.includes("freestyle") ||
      hash.includes("dods")
    ) {
      discipline = "freestyle";
    }


    if (
      hash.includes("high")
    ) {
      discipline = "highdiving";
    }


    if (
      hash.includes("saut-ange") ||
      hash.includes("sautdelange") ||
      hash.includes("ange")
    ) {
      discipline = "ange";
    }


    if (!discipline) {
      return;
    }


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


    candidates.forEach(hero => {

      const rect =
        hero.getBoundingClientRect();


      if (
        rect.width < 300 ||
        rect.height < 180
      ) {
        return;
      }


      hero.style.backgroundImage = `

        linear-gradient(
          90deg,
          rgba(2,15,27,.20),
          rgba(2,15,27,.02)
        ),

        url("${DISCIPLINES[discipline].hero}")

      `;


      hero.style.backgroundSize =
        "cover";


      hero.style.backgroundPosition =
        "center";


      hero.style.backgroundRepeat =
        "no-repeat";

    });

  }



  /* ============================================================
     ACTUALITES / SPOTS
     IMAGE PAR DEFAUT SI URL CASSEE
  ============================================================ */

  function fixCmsImages() {

    document
      .querySelectorAll("img")
      .forEach(img => {

        if (
          img.dataset.eahFallbackInstalled ===
          "true"
        ) {
          return;
        }


        img.dataset.eahFallbackInstalled =
          "true";


        img.addEventListener(

          "error",

          function () {

            const context =
              normalize(

                this.closest(
                  "article,section,div"
                )?.textContent || ""

              );


            if (
              context.includes("spot")
            ) {

              if (
                !this.src.includes(
                  "spot-default.jpg"
                )
              ) {

                this.src =
                  "spot-default.jpg";

              }

              return;

            }


            if (
              context.includes("actualite") ||
              context.includes("actualité") ||
              context.includes("news")
            ) {

              if (
                !this.src.includes(
                  "news-default.jpg"
                )
              ) {

                this.src =
                  "news-default.jpg";

              }

            }

          }

        );

      });

  }



  /* ============================================================
     LANCEMENT
  ============================================================ */

  function fixAll() {

    /*
      Toujours réparer les blazons EN PREMIER.
    */

    fixBlazons();

    fixDisciplineCards();

    fixDisciplineHero();

    fixCmsImages();

    /*
      Et une deuxième fois après les disciplines
      pour garantir qu'aucun blazon n'a changé.
    */

    fixBlazons();

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(

      "DOMContentLoaded",

      fixAll,

      {
        once: true
      }

    );

  } else {

    fixAll();

  }


  window.addEventListener(
    "hashchange",
    () =>
      setTimeout(
        fixAll,
        100
      )
  );


  let resizeTimer;


  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        setTimeout(
          fixAll,
          200
        );

    }
  );


  const observer =
    new MutationObserver(
      () => {

        clearTimeout(
          window.__eahImagesV2
        );


        window.__eahImagesV2 =
          setTimeout(
            fixAll,
            120
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
    fixAll,
    500
  );


  setTimeout(
    fixAll,
    1500
  );

})();
