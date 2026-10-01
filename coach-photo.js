/* ============================================================
   EAH DIVING PRO
   PHOTO COACH - VERSION COMPATIBLE AVEC TON COACH-CARD.JS

   Fonctionne avec :
   - .coach-profile-photo
   - .coach-logo-box
   - .coach-logo-fallback
============================================================ */

(() => {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const coachToken =
    String(
      params.get("coachToken") || ""
    ).trim();

  if (!coachToken) {
    return;
  }


  let photoUrl = "";
  let coachName = "";
  let loading = false;


  /* =========================================================
     RECUPERER LA PHOTO DEPUIS SUPABASE
  ========================================================= */

  async function loadCoachPhoto() {

    if (
      loading ||
      photoUrl
    ) {
      return;
    }


    loading = true;


    try {

      const sb =
        requireSupabase();


      const {
        data,
        error
      } =
        await sb.rpc(

          "eah_get_coach_photo",

          {
            p_token:
              coachToken
          }

        );


      if (error) {
        throw error;
      }


      if (
        !data ||
        data.ok === false
      ) {

        console.log(
          "EAH photo Coach :",
          data?.error || "aucune donnée"
        );

        return;
      }


      photoUrl =
        String(
          data.photoUrl || ""
        ).trim();


      coachName =
        String(
          data.name || "Coach"
        );


      if (!photoUrl) {

        console.log(
          "EAH : aucune PHOTO_URL pour ce Coach."
        );

        return;
      }


      showCoachPhoto();


    } catch(error) {

      console.error(
        "EAH Coach photo error:",
        error
      );

    } finally {

      loading = false;

    }

  }



  /* =========================================================
     TROUVER LE BLOC ACTUEL
  ========================================================= */

  function findPhotoContainer() {

    const app =
      document.getElementById(
        "eahCoachCardApp"
      );


    if (!app) {
      return null;
    }


    /*
      Version avec vraie zone photo
    */

    const profilePhoto =
      app.querySelector(
        ".coach-profile-photo"
      );


    if (profilePhoto) {
      return profilePhoto;
    }


    /*
      Version actuelle visible sur ta capture
    */

    const logoBox =
      app.querySelector(
        ".coach-logo-box"
      );


    if (logoBox) {
      return logoBox;
    }


    /*
      Dernier recours :
      le carré EAH lui-même
    */

    const fallback =
      app.querySelector(
        ".coach-logo-fallback"
      );


    if (fallback) {
      return fallback;
    }


    return null;

  }



  /* =========================================================
     AFFICHER LA PHOTO
  ========================================================= */

  function showCoachPhoto() {

    if (!photoUrl) {
      return;
    }


    const container =
      findPhotoContainer();


    if (!container) {
      return;
    }


    /*
      Ne pas refaire si déjà installé
    */

    if (
      container.querySelector(
        "img[data-eah-coach-photo='true']"
      )
    ) {

      return;

    }


    const img =
      document.createElement(
        "img"
      );


    img.dataset.eahCoachPhoto =
      "true";


    img.alt =
      coachName;


    img.src =
      photoUrl;


    img.style.cssText = `

      display:block !important;

      width:100% !important;

      height:100% !important;

      object-fit:cover !important;

      border-radius:30px !important;

    `;


    img.onload =
      () => {

        container.innerHTML =
          "";


        container.appendChild(
          img
        );


        /*
          Taille proche de ton profil plongeur
        */

        container.style.setProperty(
          "width",
          "170px",
          "important"
        );


        container.style.setProperty(
          "height",
          "170px",
          "important"
        );


        container.style.setProperty(
          "min-width",
          "170px",
          "important"
        );


        container.style.setProperty(
          "border",
          "6px solid #30cfff",
          "important"
        );


        container.style.setProperty(
          "border-radius",
          "36px",
          "important"
        );


        container.style.setProperty(
          "overflow",
          "hidden",
          "important"
        );


        container.style.setProperty(
          "padding",
          "0",
          "important"
        );


        container.style.setProperty(
          "background",
          "#061e33",
          "important"
        );


        console.log(
          "✅ PHOTO COACH EAH affichée"
        );

      };


    img.onerror =
      () => {

        console.error(
          "EAH : impossible d'afficher l'image :",
          photoUrl
        );

      };

  }



  /* =========================================================
     LE COACH-CARD.JS CONSTRUIT L'INTERFACE APRES
     LE CHARGEMENT : ON SURVEILLE DONC LA PAGE
  ========================================================= */

  function refresh() {

    if (!photoUrl) {

      loadCoachPhoto();

      return;

    }


    showCoachPhoto();

  }


  const observer =
    new MutationObserver(
      refresh
    );


  observer.observe(

    document.documentElement,

    {
      childList: true,
      subtree: true
    }

  );


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(

      "DOMContentLoaded",

      refresh,

      {
        once: true
      }

    );

  } else {

    refresh();

  }


  setTimeout(
    refresh,
    300
  );


  setTimeout(
    refresh,
    800
  );


  setTimeout(
    refresh,
    1500
  );


  setTimeout(
    refresh,
    3000
  );

})();
