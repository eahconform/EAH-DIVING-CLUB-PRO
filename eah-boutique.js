
/* EAH DIVING - BOUTIQUE V1 */

(() => {
  "use strict";

  const API_URL =
    "https://script.google.com/macros/s/AKfycbxUEodF5UQr774_QPn6E4xbifBr0f7nRov3-FtywhsDuPSXNMbJC3z_kKKjxKVqddgqBQ/exec";

  const page = document.getElementById("boutique");
  const grid = document.getElementById("eahShopProducts");
  const status = document.getElementById("eahShopStatus");
  const refresh = document.getElementById("eahShopRefresh");
  const overlay = document.getElementById("eahShopModal");
  const dialog = document.getElementById("eahShopDialog");

  if (!page || !grid || !status || !overlay || !dialog) return;

  const money = new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR"
  });

  let products = [];
  let loading = false;
  let lastLoad = 0;
  let activeProduct = null;

  const esc = value => String(value ?? "").replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    })[char]
  );

  
function url(value) {
  const raw = String(value ?? "").trim();

  if (!raw) return "";

  try {
    const result = new URL(raw, location.href);

    return ["http:", "https:"].includes(result.protocol)
      ? result.href
      : "";
  } catch (_) {
    return "";
  }
}


  function cover(product) {
    const image = url((product.photos || [])[0]);
    return image
      ? `<img src="${esc(image)}" alt="${esc(product.nom)}" loading="lazy">`
      : `<div class="eah-shop-placeholder">EAH DIVING</div>`;
  }

  function findProduct(id) {
    return products.find(
      p => String(p.id) === String(id)
    );
  }

  function render() {
    grid.innerHTML = products.map(p => {
      const soldOut = Number(p.stock) <= 0;
      const sizes = (p.tailles || []).length
        ? `Tailles : ${esc(p.tailles.join(" · "))}`
        : "Taille unique / non applicable";

      return `
        <article class="eah-shop-card">

          <button
            type="button"
            class="eah-shop-photo"
            data-shop-action="details"
            data-shop-id="${esc(p.id)}"
          >
            ${cover(p)}
          </button>

          <div class="eah-shop-card-body">
            <h3>${esc(p.nom)}</h3>

            <strong class="eah-shop-price">
              ${money.format(Number(p.prix) || 0)}
            </strong>

            <p>${sizes}</p>

            <p>
              ${soldOut
                ? "Rupture de stock"
                : `Stock : ${Math.floor(p.stock)}`}
            </p>

            <div class="eah-shop-actions">

              <button
                type="button"
                class="eah-shop-button-secondary"
                data-shop-action="details"
                data-shop-id="${esc(p.id)}"
              >
                Détails
              </button>

              <button
                type="button"
                class="eah-shop-button"
                data-shop-action="buy"
                data-shop-id="${esc(p.id)}"
                ${soldOut ? "disabled" : ""}
              >
                ${soldOut ? "Indisponible" : "Acheter"}
              </button>

            </div>
          </div>
        </article>`;
    }).join("");
  }

  function videoHTML(value) {
    const safe = url(value);
    if (!safe) return "";

    const u = new URL(safe);
    const host = u.hostname.toLowerCase();
    let id = "";

    if (host === "youtu.be") {
      id = u.pathname.split("/")[1] || "";
    } else if ([
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "www.youtube-nocookie.com"
    ].includes(host)) {
      id = u.pathname.startsWith("/shorts/")
        ? (u.pathname.split("/")[2] || "")
        : u.pathname.startsWith("/embed/")
          ? (u.pathname.split("/")[2] || "")
          : (u.searchParams.get("v") || "");
    }

    if (/^[\w-]{11}$/.test(id)) {
      return `
        <iframe
          src="https://www.youtube-nocookie.com/embed/${id}"
          title="Vidéo de l'article"
          loading="lazy"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>`;
    }

    if (/\.(mp4|webm|ogg)(\?|$)/i.test(safe)) {
      return `
        <video
          controls
          playsinline
          preload="metadata"
          src="${esc(safe)}"
        ></video>`;
    }

    return `
      <a href="${esc(safe)}"
         target="_blank"
         rel="noopener noreferrer">
        Voir la vidéo de l'article
      </a>`;
  }

  function openDialog(html) {
    dialog.innerHTML = html;
    overlay.hidden = false;
  }

  function closeDialog() {
    overlay.hidden = true;
    dialog.innerHTML = "";
    activeProduct = null;
  }

  function details(product) {
    activeProduct = product.id;

    const images = (product.photos || [])
      .map(url)
      .filter(Boolean);

    const gallery = images.map(
      img => `
        <img src="${esc(img)}"
             alt="${esc(product.nom)}"
             loading="lazy">`
    ).join("");

    const video = videoHTML(product.video);
    const soldOut = Number(product.stock) <= 0;

    openDialog(`
      <button type="button"
              class="eah-shop-close"
              data-shop-action="close"
              aria-label="Fermer">×</button>

      <h2>${esc(product.nom)}</h2>

      <div class="eah-shop-gallery">
        ${gallery || cover(product)}
        ${video}
      </div>

      <strong class="eah-shop-price">
        ${money.format(Number(product.prix) || 0)}
      </strong>

      <p class="eah-shop-description">
        ${esc(product.description || "")}
      </p>

      <p>
        Tailles :
        ${esc(
          (product.tailles || []).join(" · ")
          || "Unique / sans taille"
        )}
      </p>

      <p>
        ${soldOut
          ? "Rupture de stock"
          : `Quantité disponible : ${Math.floor(product.stock)}`}
      </p>

      <button
        type="button"
        class="eah-shop-button"
        data-shop-action="checkout"
        ${soldOut ? "disabled" : ""}
      >
        ${soldOut ? "Indisponible" : "Acheter cet article"}
      </button>
    `);
  }

  function checkout(product) {
    if (Number(product.stock) <= 0) return;

    activeProduct = product.id;

    const sizes = (product.tailles || []).length
      ? `
        <label>Taille
          <select name="taille" required>
            <option value="">Choisir une taille</option>
            ${product.tailles.map(size => `
              <option value="${esc(size)}">
                ${esc(size)}
              </option>`).join("")}
          </select>
        </label>`
      : `<input type="hidden" name="taille" value="Unique">`;

    openDialog(`
      <button type="button"
              class="eah-shop-close"
              data-shop-action="close"
              aria-label="Fermer">×</button>

      <h2>Achat simulé</h2>

      <p>
        <strong>${esc(product.nom)}</strong>
        — ${money.format(Number(product.prix) || 0)}
      </p>

      <form id="eahShopForm" class="eah-shop-form">

        ${sizes}

        <label>Quantité
          <input type="number"
                 name="quantite"
                 min="1"
                 max="${Math.floor(product.stock)}"
                 value="1"
                 required>
        </label>

        <label>Prénom
          <input name="prenom"
                 autocomplete="given-name" required>
        </label>

        <label>Nom
          <input name="nom"
                 autocomplete="family-name" required>
        </label>

        <label>E-mail
          <input type="email"
                 name="email"
                 autocomplete="email" required>
        </label>

        <label>Téléphone
          <input type="tel"
                 name="telephone"
                 autocomplete="tel" required>
        </label>

        <label>Adresse
          <input name="adresse"
                 autocomplete="street-address" required>
        </label>

        <label>Code postal
          <input name="postal"
                 autocomplete="postal-code" required>
        </label>

        <label>Ville
          <input name="ville"
                 autocomplete="address-level2" required>
        </label>

        <p class="eah-shop-notice">
          Démonstration uniquement :
          aucune carte bancaire ni aucun débit réel.
          Vos informations ne sont pas envoyées
          ni enregistrées.
        </p>

        <button class="eah-shop-button" type="submit">
          Valider le paiement simulé
        </button>

      </form>
    `);
  }

  function submitDemo(form) {
    if (!form.reportValidity()) return;

    const product = findProduct(activeProduct);

    if (!product || Number(product.stock) <= 0) {
      alert("Cet article n'est plus disponible.");
      closeDialog();
      return;
    }

    const data = new FormData(form);
    const quantity = Number(data.get("quantite"));
    const size = String(data.get("taille") || "");

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > product.stock ||
      (
        (product.tailles || []).length &&
        !product.tailles.includes(size)
      )
    ) {
      alert("Vérifie la taille et la quantité.");
      return;
    }

    const firstName = String(
      data.get("prenom") || ""
    ).trim();

    const total = money.format(
      (Number(product.prix) || 0) * quantity
    );

    openDialog(`
      <button type="button"
              class="eah-shop-close"
              data-shop-action="close"
              aria-label="Fermer">×</button>

      <div class="eah-shop-success">✓</div>

      <h2>Paiement simulé validé !</h2>

      <p>Merci ${esc(firstName)}.</p>

      <p>
        ${quantity} × ${esc(product.nom)}
        — <strong>${total}</strong>
      </p>

      <p class="eah-shop-notice">
        Simulation terminée.
        Aucune commande, aucun paiement
        et aucune modification du stock
        n'ont été effectués.
      </p>

      <button
        type="button"
        class="eah-shop-button"
        data-shop-action="close"
      >
        Retour à la boutique
      </button>
    `);
  }

  function loadProducts() {
    if (
      loading ||
      !page.classList.contains("active")
    ) return;

    loading = true;
    status.textContent = "Actualisation des articles...";

    const tag = document.createElement("script");
    let finished = false;

    const timeout = setTimeout(
      () => complete("Délai de connexion dépassé"),
      16000
    );

    function complete(error, response) {
      if (finished) return;
      finished = true;

      clearTimeout(timeout);
      tag.remove();
      loading = false;
      window.EAH_BOUTIQUE_CALLBACK = () => {};

      if (
        error ||
        !response ||
        !response.ok ||
        !Array.isArray(response.products)
      ) {
        status.textContent =
          "Catalogue indisponible. Clique sur Actualiser.";
        return;
      }

      products = response.products;
      lastLoad = Date.now();
      render();

      status.textContent = products.length
        ? `${products.length} article(s) dans la boutique`
        : "Aucun article actif pour le moment.";
    }

    window.EAH_BOUTIQUE_CALLBACK = response =>
      complete(null, response);

    tag.onerror = () => complete("Erreur réseau");

    tag.src =
      `${API_URL}?action=eah_boutique&t=${Date.now()}`;

    document.head.appendChild(tag);
  }

  grid.addEventListener("click", event => {
    const button = event.target.closest(
      "[data-shop-action]"
    );

    if (!button) return;

    const product = findProduct(button.dataset.shopId);
    if (!product) return;

    if (button.dataset.shopAction === "buy") {
      checkout(product);
    } else {
      details(product);
    }
  });

  dialog.addEventListener("click", event => {
    const button = event.target.closest(
      "[data-shop-action]"
    );

    if (!button) return;

    const action = button.dataset.shopAction;

    if (action === "close") {
      closeDialog();
    }

    if (action === "checkout") {
      const product = findProduct(activeProduct);
      if (product) checkout(product);
    }
  });

  dialog.addEventListener("submit", event => {
    if (event.target.id !== "eahShopForm") return;

    event.preventDefault();
    submitDemo(event.target);
  });

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeDialog();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !overlay.hidden) {
      closeDialog();
    }
  });

  refresh?.addEventListener(
    "click",
    loadProducts
  );

  document.querySelectorAll(
    '[data-page="boutique"]'
  ).forEach(link => {
    link.addEventListener(
      "click",
      () => setTimeout(loadProducts, 0)
    );
  });

  setTimeout(loadProducts, 700);

  setInterval(() => {
    if (
      page.classList.contains("active") &&
      Date.now() - lastLoad > 25000
    ) {
      loadProducts();
    }
  }, 25000);

})();
