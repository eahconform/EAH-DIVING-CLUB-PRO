
/* ==========================================================
   EAH DIVING PRO CLUB
   PHOTO ADMINISTRATEUR
   VERSION 1.0

   Lit la photo depuis Supabase.
   N'intervient pas dans l'authentification.
========================================================== */

(() => {
  "use strict";

  const CONFIG = {
    url: "https://limyeqpdzjjwsdximehp.supabase.co",
    key: "sb_publishable_K9iUm_0Qhea65P1Zt6rbXQ_BXQCzJ9w"
  };

  function validImageUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:"
        ? url.href
        : "";
    } catch (_) {
      return "";
    }
  }

  function addStyles() {
    const style = document.createElement("style");

    style.textContent = `
      .eah-admin-identity {
        display: flex;
        align-items: center;
        gap: 22px;
        flex-wrap: wrap;
      }

      .eah-admin-avatar {
        width: 116px;
        height: 116px;
        flex: 0 0 116px;
        border-radius: 50%;
        object-fit: cover;
        background: #103956;
        border: 3px solid #30cfff;
        box-shadow: 0 0 25px rgba(48,207,255,.22);
      }

      .eah-admin-identity h2 {
        margin: 0 0 7px;
        font-size: 24px;
        color: #fff;
      }

      .eah-admin-identity p {
        margin: 0;
        color: #a7bed1;
      }

      .eah-admin-identity small {
        display: block;
        margin-top: 8px;
        color: #30cfff;
      }

      @media(max-width:600px) {
        .eah-admin-identity {
          justify-content: center;
          text-align: center;
        }
      }
    `;

    document.head.appendChild(style);
  }

  async function getPhotoUrl() {
    const endpoint =
      CONFIG.url +
      "/rest/v1/eah_admin_profile_public" +
      "?select=photo_url&id=eq.main";

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: CONFIG.key,
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        "Lecture de la photo : HTTP " + response.status
      );
    }

    const rows = await response.json();

    return validImageUrl(
      Array.isArray(rows)
        ? rows[0]?.photo_url
        : ""
    );
  }

  function createIdentityCard() {
    const dashboard = document.getElementById("dashboard");

    if (!dashboard) return null;

    let card = document.getElementById(
      "eahAdminIdentityCard"
    );

    if (card) return card;

    card = document.createElement("section");
    card.id = "eahAdminIdentityCard";
    card.className = "card";

    const wrapper = document.createElement("div");
    wrapper.className = "eah-admin-identity";

    const image = document.createElement("img");
    image.id = "eahAdminAvatar";
    image.className = "eah-admin-avatar";
    image.alt = "Photo de l'administrateur EAH Diving";
    image.referrerPolicy = "no-referrer";
    image.src = "eah-diving-logo.png";

    const info = document.createElement("div");

    const title = document.createElement("h2");
    title.textContent = "Administrateur EAH Diving";

    const description = document.createElement("p");
    description.textContent =
      "Profil officiel - Administration EAH Diving Pro Club";

    const status = document.createElement("small");
    status.id = "eahAdminPhotoStatus";
    status.textContent = "Chargement de la photo...";

    info.append(title, description, status);
    wrapper.append(image, info);
    card.appendChild(wrapper);

    dashboard.prepend(card);

    return card;
  }

  async function refreshPhoto() {
    const image = document.getElementById(
      "eahAdminAvatar"
    );

    const status = document.getElementById(
      "eahAdminPhotoStatus"
    );

    if (!image || !status) return;

    try {
      const photoUrl = await getPhotoUrl();

      if (!photoUrl) {
        image.src = "eah-diving-logo.png";
        status.textContent =
          "Ajoute ta photo dans EAH_ADMIN_NFC, cellule B7.";
        return;
      }

      image.onerror = () => {
        image.onerror = null;
        image.src = "eah-diving-logo.png";
        status.textContent =
          "Le lien de la photo est inaccessible.";
      };

      image.onload = () => {
        status.textContent = "Photo de profil";
      };

      image.src = photoUrl;

    } catch (error) {
      console.error("Photo administrateur :", error);
      status.textContent =
        "Impossible de charger la photo.";
    }
  }

  function init() {
    addStyles();
    createIdentityCard();
    refreshPhoto();

    // Actualise également au retour sur cette page.
    window.addEventListener("pageshow", refreshPhoto);

    document.addEventListener(
      "visibilitychange",
      () => {
        if (!document.hidden) refreshPhoto();
      }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
