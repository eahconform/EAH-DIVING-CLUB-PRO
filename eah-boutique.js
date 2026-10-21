
/* ===========================================================
   EAH DIVING - BOUTIQUE PUBLIQUE V3
   GitHub Pages / Google Sheets via Google Apps Script
   Aucun paiement reel, aucune donnee client enregistree.
=========================================================== */

(() => {
  "use strict";

  const API_URL =
    "https://script.google.com/macros/s/AKfycbxUEodF5UQr774_QPn6E4xbifBr0f7nRov3-FtywhsDuPSXNMbJC3z_kKKjxKVqddgqBQ/exec";

  const REFRESH_MS = 15000;
  const page = document.getElementById("boutique");
  const grid = document.getElementById("eahShopProducts");
  const status = document.getElementById("eahShopStatus");
  const refreshButton = document.getElementById("eahShopRefresh");
  const modal = document.getElementById("eahShopModal");
  const dialog = document.getElementById("eahShopDialog");

  if (!page || !grid || !status || !modal || !dialog) {
    console.warn("EAH Boutique : structure HTML introuvable.");
    return;
  }

  const euro = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  });

  let products = [];
  let loading = false;
  let lastLoad = 0;
  let currentId = null;

  const escapeHTML = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  const amount = value => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  function url(value, isVideo = false) {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    try {
      const parsed = new URL(raw, document.baseURI);
      if (!["https:", "http:"].includes(parsed.protocol)) return "";

      const host = parsed.hostname.toLowerCase();
      if (
        !isVideo &&
        ["drive.google.com", "www.drive.google.com"].includes(host)
      ) {
        const match = parsed.pathname.match(
          /\/file\/d\/([A-Za-z0-9_-]+)/
        );
        const id = match?.[1] || parsed.searchParams.get("id");
        if (id && /^[A-Za-z0-9_-]+$/.test(id)) {
          return "https://drive.google.com/thumbnail?id=" +
            encodeURIComponent(id) + "&sz=w1600";
        }
      }

      return parsed.href;
    } catch (_) {
      return "";
    }
  }

  function imageHTML(raw, alt = "Photo EAH Diving") {
    const image = url(raw);
    return image
      ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(alt)}" loading="lazy">`
      : '<div class="eah-shop-placeholder">EAH DIVING</div>';
  }

  function videoHTML(value) {
    const safe = url(value, true);
    if (!safe) return "";

    const parsed = new URL(safe);
    const host = parsed.hostname.toLowerCase();

    if (["drive.google.com", "www.drive.google.com"].includes(host)) {
      const match = parsed.pathname.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
      const id = match?.[1] || parsed.searchParams.get("id");
      if (id && /^[A-Za-z0-9_-]+$/.test(id)) {
        return `<iframe title="Vidéo de l'article" loading="lazy"
          src="https://drive.google.com/file/d/${encodeURIComponent(id)}/preview"
          allow="autoplay; fullscreen" allowfullscreen></iframe>`;
      }
    }

    let youtubeId = "";
    if (host === "youtu.be" || host === "www.youtu.be") {
      youtubeId = parsed.pathname.split("/")[1] || "";
    } else if ([
      "youtube.com", "www.youtube.com", "m.youtube.com",
      "www.youtube-nocookie.com"
    ].includes(host)) {
      const parts = parsed.pathname.split("/");
      youtubeId = ["shorts", "embed", "live"].includes(parts[1])
        ? (parts[2] || "")
        : (parsed.searchParams.get("v") || "");
    }

    if (/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
      return `<iframe title="Vidéo de l'article" loading="lazy"
        src="https://www.youtube-nocookie.com/embed/${youtubeId}"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>`;
    }

    if (/\.(mp4|webm|ogg)(\?|$)/i.test(safe)) {
      return `<video src="${escapeHTML(safe)}" controls playsinline preload="metadata"></video>`;
    }

    return `<a href="${escapeHTML(safe)}" target="_blank"
      rel="noopener noreferrer">Voir la vidéo de l'article</a>`;
  }

  function normalize(item, index) {
    const sizes = Array.isArray(item.tailles) ? item.tailles : [];
    const photos = Array.isArray(item.photos) ? item.photos : [];
    return {
      id: String(item.id || `PRODUIT-${index + 1}`),
      ordre: amount(item.ordre) || (index + 1),
      nom: String(item.nom || "").trim(),
      prix: Math.max(0, amount(item.prix)),
      stock: Math.max(0, Math.floor(amount(item.stock))),
      tailles: sizes.filter(s => ["XS", "S", "M", "L", "XL"].includes(s)),
      description: String(item.description || ""),
      photos: photos.filter(Boolean),
      video: String(item.video || "")
    };
  }

  function getProduct(id) {
    return products.find(product => product.id === String(id));
  }

  function render() {
    if (!products.length) {
      grid.innerHTML = "";
      status.textContent = "Aucun article actif pour le moment.";
      return;
    }

    grid.innerHTML = products.map(product => {
      const unavailable = product.stock === 0;
      const sizes = product.tailles.length
        ? `Tailles : ${escapeHTML(product.tailles.join(" · "))}`
        : "Taille unique / sans taille";

      return `
        <article class="eah-shop-card">
          <button type="button" class="eah-shop-photo"
            data-shop-action="details" data-shop-id="${escapeHTML(product.id)}"
            aria-label="Voir ${escapeHTML(product.nom)}">
            ${imageHTML(product.photos[0], product.nom)}
          </button>
          <div class="eah-shop-card-body">
            <h3>${escapeHTML(product.nom)}</h3>
            <strong class="eah-shop-price">${euro.format(product.prix)}</strong>
            <p>${sizes}</p>
            <p>${unavailable ? "Rupture de stock" : `Stock : ${product.stock}`}</p>
            <div class="eah-shop-actions">
              <button type="button" class="eah-shop-button-secondary"
                data-shop-action="details" data-shop-id="${escapeHTML(product.id)}">
                Détails
              </button>
              <button type="button" class="eah-shop-button"
                data-shop-action="buy" data-shop-id="${escapeHTML(product.id)}"
                ${unavailable ? "disabled" : ""}>
                ${unavailable ? "Indisponible" : "Acheter"}
              </button>
            </div>
          </div>
        </article>`;
    }).join("");

    status.textContent = `${products.length} article(s) disponible(s).`;
  }

  function openModal(html) {
    dialog.innerHTML = html;
    modal.hidden = false;
    dialog.querySelector("button")?.focus();
  }

  function closeModal() {
    modal.hidden = true;
    dialog.innerHTML = "";
    currentId = null;
  }

  function details(product) {
    currentId = product.id;
    const gallery = product.photos
      .map(photo => `<div>${imageHTML(photo, product.nom)}</div>`)
      .join("");
    const video = videoHTML(product.video);

    openModal(`
      <button type="button" class="eah-shop-close"
        data-shop-action="close" aria-label="Fermer">×</button>
      <h2>${escapeHTML(product.nom)}</h2>
      <div class="eah-shop-gallery">
        ${gallery || imageHTML("", product.nom)}
        ${video ? `<div>${video}</div>` : ""}
      </div>
      <strong class="eah-shop-price">${euro.format(product.prix)}</strong>
      <p class="eah-shop-description">${escapeHTML(product.description)}</p>
      <p>Tailles : ${escapeHTML(product.tailles.join(" · ") || "Unique / sans taille")}</p>
      <p>${product.stock ? `Stock : ${product.stock}` : "Rupture de stock"}</p>
      <button type="button" class="eah-shop-button"
        data-shop-action="checkout" ${product.stock ? "" : "disabled"}>
        Acheter cet article
      </button>`);
  }

  function checkout(product) {
    if (!product.stock) return;
    currentId = product.id;

    const selectSize = product.tailles.length
      ? `<label>Taille
          <select name="taille" required>
            <option value="">Choisir une taille</option>
            ${product.tailles.map(s => `<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join("")}
          </select>
        </label>`
      : '<input type="hidden" name="taille" value="Unique">';

    openModal(`
      <button type="button" class="eah-shop-close"
        data-shop-action="close" aria-label="Fermer">×</button>
      <h2>Paiement simulé</h2>
      <p><strong>${escapeHTML(product.nom)}</strong> — ${euro.format(product.prix)}</p>
      <form class="eah-shop-form" id="eahShopForm">
        ${selectSize}
        <label>Quantité
          <input name="quantite" type="number" min="1"
            max="${product.stock}" value="1" required>
        </label>
        <label>Prénom
          <input name="prenom" autocomplete="given-name" required>
        </label>
        <label>Nom
          <input name="nom" autocomplete="family-name" required>
        </label>
        <label>E-mail
          <input name="email" type="email" autocomplete="email" required>
        </label>
        <label>Téléphone
          <input name="telephone" type="tel" autocomplete="tel" required>
        </label>
        <label>Adresse
          <input name="adresse" autocomplete="street-address" required>
        </label>
        <label>Code postal
          <input name="postal" autocomplete="postal-code" required>
        </label>
        <label>Ville
          <input name="ville" autocomplete="address-level2" required>
        </label>
        <p class="eah-shop-notice">
          Démonstration uniquement : aucun paiement réel et aucun débit.
          Les coordonnées ne sont ni envoyées ni enregistrées.
        </p>
        <button class="eah-shop-button" type="submit">
          Valider le paiement simulé
        </button>
      </form>`);
  }

  function confirmSimulation(form) {
    if (!form.reportValidity()) return;
    const product = getProduct(currentId);
    if (!product) return;

    const data = new FormData(form);
    const qty = Number(data.get("quantite"));
    const size = String(data.get("taille") || "");

    if (
      !Number.isInteger(qty) || qty < 1 || qty > product.stock ||
      (product.tailles.length > 0 && !product.tailles.includes(size))
    ) {
      alert("Choisis une taille et une quantité valides.");
      return;
    }

    const firstName = String(data.get("prenom") || "").trim();
    const total = euro.format(product.prix * qty);

    openModal(`
      <button type="button" class="eah-shop-close"
        data-shop-action="close" aria-label="Fermer">×</button>
      <div class="eah-shop-success">✓</div>
      <h2>Paiement simulé validé !</h2>
      <p>Merci ${escapeHTML(firstName)}.</p>
      <p>${qty} × ${escapeHTML(product.nom)} — <strong>${total}</strong></p>
      <p class="eah-shop-notice">
        Aucune somme débitée, aucune commande enregistrée,
        aucun stock modifié.
      </p>
      <button type="button" class="eah-shop-button" data-shop-action="close">
        Retour à la boutique
      </button>`);
  }

  function loadProducts(force = false) {
    if (loading || (!force && !page.classList.contains("active"))) return;
    if (!force && Date.now() - lastLoad < 2000) return;

    loading = true;
    status.textContent = "Synchronisation de la boutique...";

    const script = document.createElement("script");
    let finished = false;
    const timeout = setTimeout(
      () => finish("Délai de connexion dépassé"),
      15000
    );

    function finish(error, data) {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      script.remove();
      loading = false;
      window.EAH_BOUTIQUE_CALLBACK = () => {};

      if (error || !data?.ok || !Array.isArray(data.products)) {
        console.warn("EAH Boutique :", error || data?.error || "Réponse invalide");
        status.textContent =
          "Impossible de charger les articles. Vérifie le déploiement Apps Script, puis clique sur Actualiser.";
        return;
      }

      products = data.products
        .filter(item => item && item.active !== false)
        .map(normalize)
        .filter(item => item.nom)
        .sort((a, b) => a.ordre - b.ordre);

      lastLoad = Date.now();
      render();
    }

    window.EAH_BOUTIQUE_CALLBACK = data => finish(null, data);
    script.onerror = () => finish("Impossible de joindre l'API");
    script.src = API_URL + "?action=eah_boutique&t=" + Date.now();
    document.head.appendChild(script);
  }

  grid.addEventListener("click", event => {
    const button = event.target.closest("[data-shop-action]");
    if (!button || button.disabled) return;
    const product = getProduct(button.dataset.shopId);
    if (!product) return;
    if (button.dataset.shopAction === "buy") checkout(product);
    else details(product);
  });

  dialog.addEventListener("click", event => {
    const button = event.target.closest("[data-shop-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.shopAction;
    if (action === "close") closeModal();
    if (action === "checkout") {
      const product = getProduct(currentId);
      if (product) checkout(product);
    }
  });

  dialog.addEventListener("submit", event => {
    if (event.target.id !== "eahShopForm") return;
    event.preventDefault();
    confirmSimulation(event.target);
  });

  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  refreshButton?.addEventListener("click", () => loadProducts(true));

  document.querySelectorAll('[data-page="boutique"]').forEach(link => {
    link.addEventListener("click", () => {
      setTimeout(() => loadProducts(true), 0);
    });
  });

  window.addEventListener("hashchange", () => {
    if (location.hash === "#boutique") {
      setTimeout(() => loadProducts(true), 0);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && page.classList.contains("active")) {
      loadProducts(true);
    }
  });

  const observer = new MutationObserver(() => {
    if (page.classList.contains("active")) loadProducts();
  });
  observer.observe(page, { attributes: true, attributeFilter: ["class"] });

  setTimeout(() => loadProducts(), 500);
  setInterval(() => {
    if (!document.hidden && page.classList.contains("active") &&
      Date.now() - lastLoad >= REFRESH_MS) {
      loadProducts();
    }
  }, REFRESH_MS);
})();
