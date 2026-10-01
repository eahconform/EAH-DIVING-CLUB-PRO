/* ============================================================
   EAH DIVING PRO
   PHOTO COACH - AFFICHAGE FORCE
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


  let loading =
    false;


  let photoUrl =
    "";


  /* =========================================================
     RECUPERER PHOTO SUPABASE
  ========================================================= */

  async function chargerPhotoCoachEAH() {

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
        data.ok === false ||
        !data.photoUrl
      ) {

        console.log(
          "EAH Coach : aucune photo."
        );

        return;

      }


      photoUrl =
        String(
          data.photoUrl
        ).trim();


      afficherPhotoCoachEAH(
        photoUrl,
        data.name || "Coach"
      );


    } catch(error) {

      console.error(
        "EAH Coach photo :",
        error
      );

    } finally {

      loading = false;

    }

  }



  /* =========================================================
     AFFICHAGE
  ========================================================= */

  function afficherPhotoCoachEAH(
    url,
    name
  ) {

    const app =
      document.getElementById(
        "eahCoachCardApp"
      );


    if (!app) {
      return false;
    }


    const photoBox =
      app.querySelector(
        ".coach-profile-photo"
      );


    if (!photoBox) {
      return false;
    }


    /*
      Si la photo est déjà bonne,
      ne rien reconstruire.
    */

    const currentImage =
      photoBox.querySelector(
        "img"
      );


    if (
      currentImage &&
      currentImage.dataset.eahCoachPhoto ===
        "true"
    ) {

      return true;

    }


    const img =
      new Image();


    img.alt =
      name;


    img.dataset.eahCoachPhoto =
      "true";


    img.style.cssText = `

      display:block;

      width:100%;

      height:100%;

      object-fit:cover;

    `;


    /*
      On ne remplace EAH que lorsque
      l'image a réellement chargé.
    */

    img.onload =
      () => {

        photoBox.innerHTML =
          "";


        photoBox.appendChild(
          img
        );


        photoBox.style.width =
          "175px";


        photoBox.style.height =
          "175px";


        photoBox.style.border =
          "7px solid #30cfff";


        photoBox.style.borderRadius =
          "38px";


        photoBox.style.overflow =
          "hidden";


        photoBox.style.background =
          "#061e33";


        console.log(
          "✅ Photo Coach affichée."
        );

      };


    img.onerror =
      () => {

        console.error(
          "❌ L'URL de la photo existe mais l'image ne peut pas être chargée :",
          url
        );

      };


    img.src =
      url;


    return true;

  }



  /* =========================================================
     SURVEILLER CAR coach-card.js
     CONSTRUIT L'INTERFACE APRÈS LE CHARGEMENT
  ========================================================= */

  function actualiserPhoto() {

    if (!photoUrl) {

      chargerPhotoCoachEAH();

      return;

    }


    afficherPhotoCoachEAH(
      photoUrl,
      "Coach"
    );

  }



  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(

      "DOMContentLoaded",

      actualiserPhoto,

      {
        once: true
      }

    );

  } else {

    actualiserPhoto();

  }



  const observer =
    new MutationObserver(
      () => {

        actualiserPhoto();

      }
    );


  observer.observe(

    document.body,

    {
      childList: true,
      subtree: true
    }

  );


  /*
    Sécurité pour appareils mobiles plus lents.
  */

  setTimeout(
    actualiserPhoto,
    500
  );


  setTimeout(
    actualiserPhoto,
    1500
  );


  setTimeout(
    actualiserPhoto,
    3000
  );

})();
