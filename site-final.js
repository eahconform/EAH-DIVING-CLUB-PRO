/* ============================================================
   EAH DIVING PRO
   SITE-FINAL.JS
   VERSION FINALE
   05/10/2026

   - Heroes plein écran / pleine largeur
   - Luminosité harmonisée
   - Accueil moins sombre
   - Uniquement le nom des catégories sur les heroes
   - Photos catégories principales
   - Disciplines desktop / mobile
   - Tarifs desktop / mobile
   - Tarifs mobile non coupé
   - Blazons protégés
   - Actualités cliquables avec page détail
   - Spots dépliables
   - Espace Club uniquement sur #club
   - Chargement immédiat des images
============================================================ */

(() => {

  "use strict";


  /* ============================================================
     FICHIERS HERO
  ============================================================ */

  const FILES = {

    accueil:
      "hero-divers-group.png",

    grading:
      "grading-hero.jpg",

    blazons:
      "hero-blazons.png",

    population:
      "population-hero.jpg",

    spots:
      "spots-hero.jpg",

    actualites:
      "actualites-hero.jpg",


    /* ========================================================
       TARIFS
       Desktop / tablette + mobile
    ======================================================== */

    tarifs: {

      desktop:
        "pricing-hero.jpg",

      mobile:
        "tarifs-mobile.png"

    },


    faireGrader:
      "grading-request-hero.jpg",

    club:
      "club-dashboard-hero.jpg",

    olympique: {

      desktop:
        "olympique-desktop.jpg",

      mobile:
        "olympique-mobile.jpg"

    },

    freestyle: {

      desktop:
        "freestyle-desktop.jpg",

      mobile:
        "freestyle-mobile.jpg"

    },

    highdiving: {

      desktop:
        "high-diving-desktop.png",

      mobile:
        "high-diving-mobile.jpg"

    },

    ange: {

      desktop:
        "saut-ange-desktop.jpg",

      mobile:
        "saut-ange-mobile.jpg"

    }

  };


  /* ============================================================
     TITRES HERO
  ============================================================ */

  const HERO_TITLES = {

    grading:
      "Le grading",

    blazons:
      "Blazons",

    population:
      "Population",

    spots:
      "Spots",

    actualites:
      "Actualités",

    tarifs:
      "Offres",

    "faire-grader":
      "Faire grader",

    club:
      "Espace Club",

    evaluation:
      "Nouveau Grade Report",

    olympique:
      "Plongeon olympique",

    freestyle:
      "Freestyle / Døds",

    highdiving:
      "High Diving",

    ange:
      "Saut de l'ange"

  };


  /* ============================================================
     BLAZONS
  ============================================================ */

  const BLAZONS = {

    "blazon blanc":
      "blazon-blanc.png",

    "blazon orange":
      "blazon-orange.png",

    "blazon vert":
      "blazon-vert.png",

    "blazon bleu":
      "blazon-bleu.png",

    "blazon rouge":
      "blazon-rouge.png",

    "blazon bronze":
      "blazon-bronze.png",

    "blazon argent":
      "blazon-argent.png",

    "blazon silver":
      "blazon-argent.png",

    "blazon or":
      "blazon-or.png",

    "blazon gold":
      "blazon-or.png",

    "blazon noir":
      "blazon-noir.png",

    "blazon legend":
      "blazon-legend.png",

    "blazon legende":
      "blazon-legend.png",

    "blazon titan":
      "blazon-titan.png"

  };


  /* ============================================================
     CSS FINAL
  ============================================================ */

  function installerCSS() {

    const old =
      document.getElementById(
        "eah-site-final-css"
      );


    if (old) {

      old.remove();

    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "eah-site-final-css";


    style.textContent = `

/* ============================================================
   HERO PAGES PRINCIPALES
============================================================ */

.page .page-hero {

  position:
    relative !important;

  width:
    100% !important;

  max-width:
    none !important;

  min-height:
    clamp(
      390px,
      36vw,
      540px
    ) !important;

  margin:
    0 !important;

  padding:
    0 !important;

  overflow:
    hidden !important;

  display:
    flex !important;

  align-items:
    flex-end !important;

  background:
    #03131f !important;

}


/* ============================================================
   IMAGE HERO PLEINE LARGEUR
============================================================ */

.page .page-hero > img.page-hero-image {

  position:
    absolute !important;

  inset:
    0 !important;

  left:
    0 !important;

  top:
    0 !important;

  width:
    100% !important;

  max-width:
    none !important;

  height:
    100% !important;

  min-height:
    100% !important;

  display:
    block !important;

  object-fit:
    cover !important;

  object-position:
    center center !important;

  opacity:
    1 !important;

  visibility:
    visible !important;

  filter:
    brightness(1.06)
    contrast(1.02)
    saturate(1.05)
    !important;

  transform:
    none !important;

}


/* ============================================================
   PICTURE HERO
============================================================ */

.page .page-hero > picture {

  position:
    absolute !important;

  inset:
    0 !important;

  width:
    100% !important;

  height:
    100% !important;

  display:
    block !important;

}


.page .page-hero > picture > img.page-hero-image,
.page .page-hero > picture > img {

  position:
    absolute !important;

  inset:
    0 !important;

  width:
    100% !important;

  max-width:
    none !important;

  height:
    100% !important;

  min-height:
    100% !important;

  display:
    block !important;

  object-fit:
    cover !important;

  object-position:
    center center !important;

  opacity:
    1 !important;

  visibility:
    visible !important;

  filter:
    brightness(1.06)
    contrast(1.02)
    saturate(1.05)
    !important;

}


/* ============================================================
   VOILE TRES LEGER
============================================================ */

.page .page-hero .page-hero-overlay {

  position:
    absolute !important;

  inset:
    0 !important;

  display:
    block !important;

  opacity:
    1 !important;

  z-index:
    1 !important;

  background:
    linear-gradient(
      180deg,
      rgba(2,12,23,.02) 0%,
      rgba(2,12,23,.02) 46%,
      rgba(2,12,23,.22) 72%,
      rgba(2,12,23,.42) 100%
    )
    !important;

}


/* ============================================================
   SUPPRESSION ANCIENS PSEUDO ELEMENTS
============================================================ */

.page .page-hero::before,
.page .page-hero::after {

  content:
    none !important;

  display:
    none !important;

  background:
    none !important;

  opacity:
    0 !important;

}


/* ============================================================
   CONTENU HERO
============================================================ */

.page .page-hero > .container {

  position:
    relative !important;

  z-index:
    4 !important;

  width:
    min(
      calc(100% - 48px),
      1240px
    ) !important;

  max-width:
    1240px !important;

  margin:
    0 auto !important;

  padding:
    0 0 46px 0 !important;

}


/* UNIQUEMENT LE NOM DE LA CATEGORIE */

.page .page-hero .overline {

  display:
    none !important;

}


.page .page-hero .container > p {

  display:
    none !important;

}


.page .page-hero h1 {

  position:
    relative !important;

  z-index:
    5 !important;

  max-width:
    1050px !important;

  margin:
    0 !important;

  color:
    #ffffff !important;

  font-size:
    clamp(
      3rem,
      6vw,
      6rem
    ) !important;

  font-weight:
    900 !important;

  line-height:
    .96 !important;

  letter-spacing:
    -.055em !important;

  text-shadow:
    0 5px 24px
    rgba(
      0,
      0,
      0,
      .42
    ) !important;

}


/* ============================================================
   HERO ACCUEIL
============================================================ */

#accueil .hero-background-image {

  filter:
    brightness(1.09)
    contrast(1.02)
    saturate(1.05)
    !important;

  opacity:
    1 !important;

  visibility:
    visible !important;

}


#accueil .hero-overlay {

  background:

    linear-gradient(
      90deg,
      rgba(2,12,23,.54) 0%,
      rgba(2,12,23,.32) 36%,
      rgba(2,12,23,.13) 64%,
      rgba(2,12,23,.08) 100%
    ),

    linear-gradient(
      180deg,
      rgba(2,12,23,.01) 45%,
      rgba(2,12,23,.24) 100%
    )

    !important;

}


/* ============================================================
   DISCIPLINES
============================================================ */

.eah-discipline-photo {

  display:
    block !important;

  width:
    100% !important;

  max-width:
    none !important;

  height:
    100% !important;

  object-fit:
    cover !important;

  object-position:
    center center !important;

  opacity:
    1 !important;

  visibility:
    visible !important;

  filter:
    brightness(1.06)
    contrast(1.02)
    saturate(1.05)
    !important;

}


/* ============================================================
   BLAZONS
============================================================ */

.eah-blazon-image {

  display:
    block !important;

  visibility:
    visible !important;

  opacity:
    1 !important;

  object-fit:
    contain !important;

  filter:
    none !important;

}


/* ============================================================
   ACTUALITES ET SPOTS
============================================================ */

.eah-cms-image {

  display:
    block !important;

  width:
    100% !important;

  opacity:
    1 !important;

  visibility:
    visible !important;

  object-fit:
    cover !important;

}


#newsGrid .news-card {

  cursor:
    pointer !important;

  transition:
    transform .22s ease,
    border-color .22s ease,
    box-shadow .22s ease;

}


#newsGrid .news-card:hover {

  transform:
    translateY(-5px);

  border-color:
    rgba(48,207,255,.40)
    !important;

  box-shadow:
    0 26px 65px
    rgba(0,0,0,.30);

}


/* ============================================================
   ACTUALITE DETAIL
============================================================ */

#actualite-detail {

  min-height:
    calc(
      100vh - 86px
    );

}


.actualite-detail-section {

  padding:
    55px 0 95px !important;

}


.actualite-detail-wrap {

  width:
    min(
      calc(100% - 40px),
      1050px
    );

  margin:
    0 auto;

}


.actualite-back {

  display:
    inline-flex;

  align-items:
    center;

  justify-content:
    center;

  min-height:
    46px;

  margin-bottom:
    26px;

  padding:
    0 18px;

  border:
    1px solid
    rgba(143,205,255,.22);

  border-radius:
    13px;

  background:
    rgba(5,23,42,.78);

  color:
    #ffffff;

  font-weight:
    800;

  cursor:
    pointer;

  backdrop-filter:
    blur(16px);

}


.actualite-back:hover {

  background:
    rgba(11,107,255,.18);

}


.actualite-detail-card {

  overflow:
    hidden;

  border:
    1px solid
    rgba(143,205,255,.20);

  border-radius:
    30px;

  background:
    linear-gradient(
      145deg,
      rgba(7,38,66,.94),
      rgba(4,18,31,.94)
    );

  box-shadow:
    0 30px 90px
    rgba(0,0,0,.30);

}


.actualite-detail-image {

  display:
    block;

  width:
    100%;

  max-height:
    600px;

  object-fit:
    cover;

  object-position:
    center;

}


.actualite-detail-body {

  padding:
    clamp(
      24px,
      5vw,
      54px
    );

}


.actualite-detail-category {

  display:
    inline-block;

  margin-bottom:
    13px;

  color:
    #30cfff;

  font-size:
    .78rem;

  font-weight:
    900;

  letter-spacing:
    .14em;

  text-transform:
    uppercase;

}


.actualite-detail-title {

  max-width:
    900px;

  margin:
    0 0 14px;

  color:
    #ffffff;

  font-size:
    clamp(
      2.3rem,
      6vw,
      5.2rem
    );

  line-height:
    1.02;

  letter-spacing:
    -.045em;

}


.actualite-detail-date {

  margin-bottom:
    28px;

  color:
    #8fa8bc;

  font-size:
    .9rem;

}


.actualite-detail-summary {

  max-width:
    880px;

  margin-bottom:
    30px;

  color:
    #dceafa;

  font-size:
    1.15rem;

  font-weight:
    600;

  line-height:
    1.65;

}


.actualite-detail-text {

  margin-top:
    25px;

  padding-top:
    25px;

  border-top:
    1px solid
    rgba(143,205,255,.14);

  color:
    #c3d8e8;

  font-size:
    1.03rem;

  line-height:
    1.85;

}


.actualite-video {

  width:
    100%;

  margin-top:
    35px;

  overflow:
    hidden;

  aspect-ratio:
    16 / 9;

  border-radius:
    22px;

  background:
    #000000;

}


.actualite-video iframe,
.actualite-video video {

  width:
    100%;

  height:
    100%;

  border:
    0;

  object-fit:
    contain;

}


.actualite-detail-link {

  display:
    inline-flex;

  align-items:
    center;

  justify-content:
    center;

  min-height:
    48px;

  margin-top:
    30px;

  padding:
    0 20px;

  border-radius:
    13px;

  background:
    linear-gradient(
      135deg,
      #0b6bff,
      #1687ff
    );

  color:
    #ffffff;

  font-weight:
    800;

}


/* ============================================================
   SPOTS
============================================================ */

#spots .spot,
#spots .spot-card,
#spots .eah-public-card {

  cursor:
    pointer;

}


#spots .spot-details[hidden] {

  display:
    none !important;

}


#spots .spot-details {

  margin-top:
    18px;

  padding-top:
    18px;

  border-top:
    1px solid
    rgba(255,255,255,.14);

}


#spots .spot-open-label {

  margin-top:
    15px;

  color:
    #30cfff;

  font-size:
    .92rem;

  font-weight:
    800;

}


/* ============================================================
   ESPACE CLUB
============================================================ */

html:not(.eah-page-club) #eah-club-pro,
html:not(.eah-page-club) #eah-club-divers,
html:not(.eah-page-club) #eah-club-groups,
html:not(.eah-page-club) #eah-coach-evaluation,
html:not(.eah-page-club) #eah-evaluations,
html:not(.eah-page-club) #eah-actualites,
html:not(.eah-page-club) #eah-spots,
html:not(.eah-page-club) #eah-blazons,
html:not(.eah-page-club) #eah-tarifs {

  display:
    none !important;

}


/* ============================================================
   MOBILE GENERAL
============================================================ */

@media (max-width:700px) {

  .page .page-hero {

    min-height:
      340px !important;

  }


  .page .page-hero > .container {

    width:
      calc(
        100% - 28px
      ) !important;

    padding-bottom:
      32px !important;

  }


  .page .page-hero h1 {

    font-size:
      clamp(
        2.5rem,
        12vw,
        4rem
      ) !important;

  }


  .actualite-detail-section {

    padding:
      28px 0 65px !important;

  }


  .actualite-detail-wrap {

    width:
      calc(
        100% - 24px
      );

  }


  .actualite-detail-card {

    border-radius:
      23px;

  }


  .actualite-detail-image {

    max-height:
      420px;

  }


  .actualite-detail-body {

    padding:
      22px;

  }

}


/* ============================================================
   TARIFS TELEPHONE UNIQUEMENT
   <= 600 PX

   La photo mobile est verticale.
   On lui donne donc un hero 9:16.
   L'image reste entière sans être coupée.
============================================================ */

@media (max-width:600px) {


  #tarifs .page-hero {

    width:
      100% !important;

    height:
      auto !important;

    min-height:
      0 !important;

    max-height:
      none !important;

    aspect-ratio:
      9 / 16 !important;

    align-items:
      stretch !important;

    background:
      #03131f !important;

  }


  #tarifs .page-hero > picture.tarifs-hero-picture {

    position:
      absolute !important;

    inset:
      0 !important;

    width:
      100% !important;

    height:
      100% !important;

    display:
      block !important;

  }


  #tarifs .page-hero > picture.tarifs-hero-picture > img.page-hero-image {

    position:
      absolute !important;

    inset:
      0 !important;

    width:
      100% !important;

    height:
      100% !important;

    min-height:
      0 !important;

    max-width:
      none !important;

    object-fit:
      contain !important;

    object-position:
      center center !important;

    filter:
      none !important;

    opacity:
      1 !important;

    visibility:
      visible !important;

    background:
      #03131f !important;

  }


  /*
     La nouvelle image mobile contient déjà :
     - le logo EAH
     - Amateur ou professionnel
     - rejoignez l'équipe EAH Diving

     On masque donc le titre "Les offres"
     qui pourrait recouvrir le visuel.
  */

  #tarifs .page-hero > .container {

    display:
      none !important;

  }


  /*
     Pas de voile sombre sur cette image,
     afin de garder le texte net et lisible.
  */

  #tarifs .page-hero .page-hero-overlay {

    display:
      none !important;

  }

}

    `;


    document.head
      .appendChild(
        style
      );

  }



  /* ============================================================
     OUTILS
  ============================================================ */

  function normaliser(
    value
  ) {

    return String(
      value || ""
    )
      .toLowerCase()
      .normalize(
        "NFD"
      )
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /ø/g,
        "o"
      )
      .trim();

  }



  /* ============================================================
     MOBILE DISCIPLINES
  ============================================================ */

  function mobile() {

    return (
      window.innerWidth <= 700
    );

  }



  /* ============================================================
     TARIFS MOBILE
     UNIQUEMENT TELEPHONE <= 600px
  ============================================================ */

  function fichierTarifs() {

    return (
      window.innerWidth <= 600
    )
      ?
      FILES.tarifs.mobile
      :
      FILES.tarifs.desktop;

  }



  /* ============================================================
     FICHIER DISCIPLINE
  ============================================================ */

  function fichierDiscipline(
    key
  ) {

    if (
      !FILES[
        key
      ]
    ) {

      return "";

    }


    return mobile()
      ?
      FILES[
        key
      ].mobile
      :
      FILES[
        key
      ].desktop;

  }



  function escapeHtml(
    value
  ) {

    return String(
      value ??
      ""
    )
    .replace(

      /[&<>"']/g,

      char => ({

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        '"':
          "&quot;",

        "'":
          "&#39;"

      }[
        char
      ])

    );

  }



  function formatDate(
    value
  ) {

    if (!value) {

      return "";

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(
        value
      );

    }


    return date
      .toLocaleDateString(

        "fr-FR",

        {

          day:
            "2-digit",

          month:
            "long",

          year:
            "numeric"

        }

      );

  }



  /* ============================================================
     IMAGE HERO PAGE
  ============================================================ */

  function corrigerHeroPage(
    pageId,
    fichier,
    titre
  ) {

    const page =
      document.getElementById(
        pageId
      );


    if (!page) {

      return;

    }


    const hero =
      page.querySelector(
        ".page-hero"
      );


    if (!hero) {

      return;

    }


    const h1 =
      hero.querySelector(
        "h1"
      );


    if (
      h1 &&
      titre
    ) {

      h1.textContent =
        titre;

    }


    if (!fichier) {

      return;

    }


    let img =
      hero.querySelector(
        ".page-hero-image"
      );


    if (!img) {

      img =
        hero.querySelector(
          "img"
        );

    }


    if (!img) {

      return;

    }


    const actuel =
      String(
        img.getAttribute(
          "src"
        )
        ||
        ""
      );


    if (
      !actuel.endsWith(
        fichier
      )
    ) {

      img.src =
        fichier;

    }


    img.loading =
      "eager";


    img.decoding =
      "async";


    try {

      img.fetchPriority =
        "high";

    } catch (_) {}


    img.classList.add(
      "page-hero-image"
    );


    img.style.removeProperty(
      "display"
    );


    img.style.removeProperty(
      "visibility"
    );


    img.style.removeProperty(
      "opacity"
    );

  }



  /* ============================================================
     HEROES PRINCIPAUX
  ============================================================ */

  function corrigerHeroesPrincipaux() {

    corrigerHeroPage(

      "grading",

      FILES.grading,

      HERO_TITLES.grading

    );


    corrigerHeroPage(

      "blazons",

      FILES.blazons,

      HERO_TITLES.blazons

    );


    corrigerHeroPage(

      "population",

      FILES.population,

      HERO_TITLES.population

    );


    corrigerHeroPage(

      "spots",

      FILES.spots,

      HERO_TITLES.spots

    );


    corrigerHeroPage(

      "actualites",

      FILES.actualites,

      HERO_TITLES.actualites

    );


    /* ========================================================
       TARIFS
       Desktop/tablette = pricing-hero.jpg
       Téléphone = tarifs-mobile.png
    ======================================================== */

    corrigerHeroPage(

      "tarifs",

      fichierTarifs(),

      HERO_TITLES.tarifs

    );


    corrigerHeroPage(

      "faire-grader",

      FILES.faireGrader,

      HERO_TITLES[
        "faire-grader"
      ]

    );


    corrigerHeroPage(

      "club",

      FILES.club,

      HERO_TITLES.club

    );

  }



  /* ============================================================
     DISCIPLINES
  ============================================================ */

  function corrigerDisciplines() {

    corrigerHeroPage(

      "olympique",

      fichierDiscipline(
        "olympique"
      ),

      HERO_TITLES.olympique

    );


    corrigerHeroPage(

      "freestyle",

      fichierDiscipline(
        "freestyle"
      ),

      HERO_TITLES.freestyle

    );


    corrigerHeroPage(

      "highdiving",

      fichierDiscipline(
        "highdiving"
      ),

      HERO_TITLES.highdiving

    );


    corrigerHeroPage(

      "ange",

      fichierDiscipline(
        "ange"
      ),

      HERO_TITLES.ange

    );


    document
      .querySelectorAll(
        "#olympique .page-hero-image, #freestyle .page-hero-image, #highdiving .page-hero-image, #ange .page-hero-image"
      )
      .forEach(
        img => {

          img.classList.add(
            "eah-discipline-photo"
          );

        }
      );

  }



  /* ============================================================
     ACCUEIL
  ============================================================ */

  function corrigerAccueil() {

    const img =
      document.querySelector(
        "#accueil .hero-background-image"
      );


    if (!img) {

      return;

    }


    if (
      !String(
        img.getAttribute(
          "src"
        )
        ||
        ""
      )
      .endsWith(
        FILES.accueil
      )
    ) {

      img.src =
        FILES.accueil;

    }


    img.loading =
      "eager";


    img.decoding =
      "async";


    try {

      img.fetchPriority =
        "high";

    } catch (_) {}

  }



  /* ============================================================
     BLAZONS INDIVIDUELS
  ============================================================ */

  function corrigerBlazons() {

    Object
      .entries(
        BLAZONS
      )
      .forEach(
        ([
          nom,
          fichier
        ]) => {

          const titre =
            Array
              .from(
                document.querySelectorAll(
                  "h2,h3,h4"
                )
              )
              .find(
                element => {

                  return (

                    normaliser(
                      element.textContent
                    )

                    ===

                    normaliser(
                      nom
                    )

                  );

                }
              );


          if (!titre) {

            return;

          }


          const card =

            titre.closest(
              "article"
            )

            ||

            titre.closest(
              "[class*='blazon']"
            )

            ||

            titre.parentElement
              ?.parentElement;


          if (!card) {

            return;

          }


          const img =
            card.querySelector(
              "img"
            );


          if (!img) {

            return;

          }


          if (
            !String(
              img.getAttribute(
                "src"
              )
              ||
              ""
            )
            .endsWith(
              fichier
            )
          ) {

            img.src =
              fichier;

          }


          img.loading =
            "eager";


          img.decoding =
            "async";


          img.classList.add(
            "eah-blazon-image"
          );

        }
      );

  }



  /* ============================================================
     PHOTOS ACTUALITES
  ============================================================ */

  function corrigerActualites() {

    document
      .querySelectorAll(
        "#actualites .news-card img, #actualites article img"
      )
      .forEach(
        img => {

          img.classList.add(
            "eah-cms-image"
          );


          img.loading =
            "eager";


          img.decoding =
            "async";


          try {

            img.fetchPriority =
              "high";

          } catch (_) {}

        }
      );


    document
      .querySelectorAll(
        "#newsGrid .news-card"
      )
      .forEach(
        card => {

          card.setAttribute(
            "role",
            "button"
          );


          card.setAttribute(
            "tabindex",
            "0"
          );

        }
      );

  }



  /* ============================================================
     PHOTOS SPOTS
  ============================================================ */

  function corrigerSpots() {

    document
      .querySelectorAll(
        "#spots .spot img, #spots article img"
      )
      .forEach(
        img => {

          img.classList.add(
            "eah-cms-image"
          );


          img.loading =
            "eager";


          img.decoding =
            "async";


          try {

            img.fetchPriority =
              "high";

          } catch (_) {}

        }
      );

  }



  /* ============================================================
     PAGE DETAIL ACTUALITE
  ============================================================ */

  function assurerPageActualiteDetail() {

    let page =
      document.getElementById(
        "actualite-detail"
      );


    if (page) {

      return page;

    }


    const main =
      document.querySelector(
        "main"
      );


    if (!main) {

      return null;

    }


    page =
      document.createElement(
        "section"
      );


    page.id =
      "actualite-detail";


    page.className =
      "page actualite-detail-page";


    page.innerHTML = `

      <section class="section actualite-detail-section">

        <div class="actualite-detail-wrap">

          <button
            type="button"
            id="actualite-back"
            class="actualite-back"
          >
            ← Retour aux actualités
          </button>


          <div
            id="actualite-detail-content"
          >
          </div>

        </div>

      </section>

    `;


    main.appendChild(
      page
    );


    return page;

  }



  /* ============================================================
     YOUTUBE
  ============================================================ */

  function youtubeEmbed(
    url
  ) {

    if (!url) {

      return "";

    }


    try {

      const u =
        new URL(
          url,
          window.location.href
        );


      let id =
        "";


      if (
        u.hostname.includes(
          "youtu.be"
        )
      ) {

        id =
          u.pathname
            .replace(
              "/",
              ""
            )
            .split(
              "/"
            )[
              0
            ];

      }


      else if (
        u.hostname.includes(
          "youtube.com"
        )
      ) {

        if (
          u.pathname ===
          "/watch"
        ) {

          id =
            u.searchParams.get(
              "v"
            )
            ||
            "";

        }


        else if (
          u.pathname.includes(
            "/shorts/"
          )
        ) {

          id =
            u.pathname
              .split(
                "/shorts/"
              )[
                1
              ]
              ?.split(
                "/"
              )[
                0
              ]
            ||
            "";

        }


        else if (
          u.pathname.includes(
            "/embed/"
          )
        ) {

          id =
            u.pathname
              .split(
                "/embed/"
              )[
                1
              ]
              ?.split(
                "/"
              )[
                0
              ]
            ||
            "";

        }

      }


      if (!id) {

        return "";

      }


      return (
        "https://www.youtube.com/embed/"
        +
        encodeURIComponent(
          id
        )
        +
        "?rel=0"
      );


    } catch (_) {

      return "";

    }

  }



  /* ============================================================
     VIDEO ACTUALITE
  ============================================================ */

  function creerVideoActualite(
    url
  ) {

    if (!url) {

      return "";

    }


    const youtube =
      youtubeEmbed(
        url
      );


    if (youtube) {

      return `

        <div class="actualite-video">

          <iframe
            src="${escapeHtml(youtube)}"
            title="Vidéo de l'actualité"
            allow="
              encrypted-media;
              picture-in-picture
            "
            allowfullscreen
          ></iframe>

        </div>

      `;

    }


    if (
      /\.(mp4|webm|ogg)(\?.*)?$/i
        .test(
          url
        )
    ) {

      return `

        <div class="actualite-video">

          <video
            src="${escapeHtml(url)}"
            controls
            playsinline
          ></video>

        </div>

      `;

    }


    return `

      <a
        class="actualite-detail-link"
        href="${escapeHtml(url)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Voir la vidéo
      </a>

    `;

  }



  /* ============================================================
     RECUPERER ACTUALITE DEPUIS CARTE
  ============================================================ */

  function actualiteDepuisCarte(
    card
  ) {

    if (!card) {

      return null;

    }


    const cards =
      Array.from(
        document.querySelectorAll(
          "#newsGrid .news-card"
        )
      );


    const index =
      cards.indexOf(
        card
      );


    if (
      index < 0
    ) {

      return null;

    }


    try {

      if (
        typeof state !==
          "undefined"
        &&
        Array.isArray(
          state.news
        )
      ) {

        return (
          state.news[
            index
          ]
          ||
          null
        );

      }

    } catch (_) {}


    return null;

  }



  /* ============================================================
     OUVRIR ACTUALITE
  ============================================================ */

  function ouvrirActualite(
    news
  ) {

    if (!news) {

      return;

    }


    const page =
      assurerPageActualiteDetail();


    if (!page) {

      return;

    }


    const content =
      page.querySelector(
        "#actualite-detail-content"
      );


    if (!content) {

      return;

    }


    const image =

      news.image_url

      ||

      news.imageUrl

      ||

      news.IMAGE_URL

      ||

      "";


    const title =

      news.title

      ||

      news.TITLE

      ||

      "Actualité";


    const category =

      news.category

      ||

      news.CATEGORY

      ||

      "EAH DIVING";


    const date =

      news.published_at

      ||

      news.date

      ||

      news.DATE

      ||

      "";


    const summary =

      news.summary

      ||

      news.SUMMARY

      ||

      "";


    const texte =

      news.content

      ||

      news.CONTENT

      ||

      news.description

      ||

      news.DESCRIPTION

      ||

      "";


    const video =

      news.video_url

      ||

      news.videoUrl

      ||

      news.VIDEO_URL

      ||

      "";


    const link =

      news.link_url

      ||

      news.linkUrl

      ||

      news.LINK_URL

      ||

      "";


    const texteHtml =
      escapeHtml(
        texte
      )
      .replace(
        /\r?\n/g,
        "<br>"
      );


    content.innerHTML = `

      <article class="actualite-detail-card">

        ${
          image
          ?
          `

            <img
              class="actualite-detail-image"
              src="${escapeHtml(image)}"
              alt="${escapeHtml(title)}"
              loading="eager"
              decoding="async"
            >

          `
          :
          ""
        }


        <div class="actualite-detail-body">

          ${
            category
            ?
            `

              <span class="actualite-detail-category">
                ${escapeHtml(category)}
              </span>

            `
            :
            ""
          }


          <h1 class="actualite-detail-title">
            ${escapeHtml(title)}
          </h1>


          ${
            date
            ?
            `

              <div class="actualite-detail-date">
                ${escapeHtml(
                  formatDate(
                    date
                  )
                )}
              </div>

            `
            :
            ""
          }


          ${
            summary
            ?
            `

              <div class="actualite-detail-summary">
                ${escapeHtml(summary)}
              </div>

            `
            :
            ""
          }


          ${
            texte
            ?
            `

              <div class="actualite-detail-text">
                ${texteHtml}
              </div>

            `
            :
            ""
          }


          ${creerVideoActualite(
            video
          )}


          ${
            link
            ?
            `

              <a
                class="actualite-detail-link"
                href="${escapeHtml(link)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                En savoir plus
              </a>

            `
            :
            ""
          }

        </div>

      </article>

    `;


    document
      .querySelectorAll(
        "main > .page"
      )
      .forEach(
        section => {

          section.classList.remove(
            "active"
          );

        }
      );


    page.classList.add(
      "active"
    );


    window.scrollTo({

      top:
        0,

      behavior:
        "auto"

    });

  }



  /* ============================================================
     RETOUR ACTUALITES
  ============================================================ */

  function retourActualites() {

    const detail =
      document.getElementById(
        "actualite-detail"
      );


    detail
      ?.classList
      .remove(
        "active"
      );


    document
      .querySelectorAll(
        "main > .page"
      )
      .forEach(
        page => {

          page.classList.remove(
            "active"
          );

        }
      );


    document
      .getElementById(
        "actualites"
      )
      ?.classList
      .add(
        "active"
      );


    history.replaceState(

      null,

      "",

      (
        window.location.pathname
        +
        window.location.search
        +
        "#actualites"
      )

    );


    window.scrollTo({

      top:
        0,

      behavior:
        "auto"

    });

  }



  /* ============================================================
     ESPACE CLUB
  ============================================================ */

  function gererAffichageEspaceClub() {

    const hash =
      (
        window.location.hash
        ||
        "#accueil"
      )
      .toLowerCase();


    const estPageClub =

      hash ===
        "#club"

      ||

      hash ===
        "#espace-club"

      ||

      hash ===
        "#espaceclub"

      ||

      hash.startsWith(
        "#club-"
      );


    document
      .documentElement
      .classList
      .toggle(

        "eah-page-club",

        estPageClub

      );

  }



  /* ============================================================
     APPLICATION
  ============================================================ */

  function appliquer() {

    installerCSS();

    assurerPageActualiteDetail();

    corrigerAccueil();

    corrigerHeroesPrincipaux();

    corrigerDisciplines();

    corrigerBlazons();

    corrigerActualites();

    corrigerSpots();

    gererAffichageEspaceClub();

  }



  /* ============================================================
     ROUTE
  ============================================================ */

  function routeChange() {

    appliquer();


    requestAnimationFrame(
      () => {

        appliquer();


        requestAnimationFrame(
          appliquer
        );

      }
    );


    setTimeout(
      appliquer,
      60
    );


    setTimeout(
      appliquer,
      180
    );


    setTimeout(
      appliquer,
      450
    );


    setTimeout(
      appliquer,
      1000
    );

  }



  /* ============================================================
     CLIC GLOBAL
  ============================================================ */

  document.addEventListener(

    "click",

    event => {


      if (
        event.target.closest(
          "#actualite-back"
        )
      ) {

        event.preventDefault();

        retourActualites();

        return;

      }


      const newsCard =
        event.target.closest(
          "#newsGrid .news-card"
        );


      if (newsCard) {

        if (
          event.target.closest(
            "a"
          )
        ) {

          return;

        }


        const news =
          actualiteDepuisCarte(
            newsCard
          );


        if (news) {

          ouvrirActualite(
            news
          );

        }


        return;

      }


      const spotCard =
        event.target.closest(
          "#spots .spot, #spots .spot-card, #spots .eah-public-card, #spots article"
        );


      if (spotCard) {

        if (
          event.target.closest(
            "a"
          )
        ) {

          return;

        }


        const details =
          spotCard.querySelector(
            ".spot-details"
          );


        if (details) {

          const label =
            spotCard.querySelector(
              ".spot-open-label"
            );


          const ouvert =
            !details.hidden;


          details.hidden =
            ouvert;


          spotCard.classList.toggle(

            "spot-is-open",

            !ouvert

          );


          spotCard.setAttribute(

            "aria-expanded",

            String(
              !ouvert
            )

          );


          if (label) {

            label.textContent =
              ouvert
              ?
              "Voir les informations"
              :
              "Masquer les informations";

          }

        }

      }


      const navigation =
        event.target.closest(
          "[data-page], [data-page-button], [data-open]"
        );


      if (navigation) {

        document
          .getElementById(
            "actualite-detail"
          )
          ?.classList
          .remove(
            "active"
          );


        setTimeout(
          routeChange,
          0
        );


        setTimeout(
          routeChange,
          120
        );

      }

    }

  );



  /* ============================================================
     CLAVIER ACTUALITES
  ============================================================ */

  document.addEventListener(

    "keydown",

    event => {

      if (
        event.key !==
          "Enter"
        &&
        event.key !==
          " "
      ) {

        return;

      }


      const card =
        event.target.closest(
          "#newsGrid .news-card"
        );


      if (!card) {

        return;

      }


      event.preventDefault();


      const news =
        actualiteDepuisCarte(
          card
        );


      if (news) {

        ouvrirActualite(
          news
        );

      }

    }

  );



  /* ============================================================
     DEMARRAGE
  ============================================================ */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(

      "DOMContentLoaded",

      routeChange,

      {
        once:
          true
      }

    );

  } else {

    routeChange();

  }


  window.addEventListener(

    "hashchange",

    routeChange

  );



  /* ============================================================
     OBSERVER DOM DYNAMIQUE
  ============================================================ */

  let timer;


  const observer =
    new MutationObserver(
      () => {

        clearTimeout(
          timer
        );


        timer =
          setTimeout(
            appliquer,
            90
          );

      }
    );


  if (
    document.body
  ) {

    observer.observe(

      document.body,

      {

        childList:
          true,

        subtree:
          true

      }

    );

  }



  /* ============================================================
     REDIMENSIONNEMENT
  ============================================================ */

  let resizeTimer;


  window.addEventListener(

    "resize",

    () => {

      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        setTimeout(
          routeChange,
          180
        );

    }

  );

})();
