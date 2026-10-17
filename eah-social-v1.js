
/* ============================================================
   EAH DIVING PRO CLUB
   SOCIAL V2 — CORRECTIF NFC, FOLLOW, LIKE, NOTIFICATIONS

   Compatible :
   - Espace coach par carte NFC
   - Espace coach Supabase Auth
   - Espace plongeur avec code personnel
   - Population et profils publics

   Navigation sans déconnexion dans le même onglet.
   Serveur : public.eah_social_v2
============================================================ */

(() => {
  "use strict";

  const STORE = sessionStorage;

  const COACH_KEY = "EAH_SOCIAL_COACH_TOKEN";
  const DIVER_KEY = "EAH_SOCIAL_DIVER_ACTOR";
  const ACTIVE_KEY = "EAH_SOCIAL_ACTIVE_ACCOUNT";

  const $ = (s, root = document) =>
    root.querySelector(s);

  const $$ = (s, root = document) =>
    [...root.querySelectorAll(s)];

  const stateRef = () => {
    try {
      return typeof state !== "undefined"
        ? state
        : null;
    } catch (_) {
      return null;
    }
  };

  function db() {
    if (typeof requireSupabase !== "function") {
      throw new Error("Supabase indisponible.");
    }

    return requireSupabase();
  }

  let account = null;
  let accountKey = "";

  let myCache = null;
  let myCacheTime = 0;
  let myPromise = null;

  const publicCache = new Map();

  let scanning = false;
  let queued = false;

  /* ==========================================================
     DESIGN
  ========================================================== */

  function installCSS() {
    const style = document.createElement("style");

    style.id = "eahSocialV2CSS";

    style.textContent = `
      .eahs-box {
        color: #f5faff;
        background: rgba(4,26,47,.95);
        border: 1px solid rgba(48,207,255,.3);
        border-radius: 19px;
        padding: 18px;
        margin: 16px 0;
      }

      .eahs-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .eahs-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin: 14px 0;
      }

      .eahs-btn {
        background: #0b6bff;
        color: white;
        border: 1px solid rgba(48,207,255,.45);
        border-radius: 12px;
        padding: 10px 14px;
        font: inherit;
        font-weight: 750;
        cursor: pointer;
      }

      .eahs-btn.alt {
        background: #0a324e;
      }

      .eahs-btn:disabled {
        opacity: .5;
      }

      .eahs-tabs {
        display: flex;
        gap: 7px;
        flex-wrap: wrap;
        margin: 15px 0;
      }

      .eahs-tabs .active {
        background: #0b6bff;
      }

      .eahs-list {
        display: grid;
        gap: 9px;
        max-height: 370px;
        overflow: auto;
      }

      .eahs-list[hidden] {
        display: none !important;
      }

      .eahs-entry {
        padding: 12px;
        border: 1px solid rgba(143,205,255,.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }

      .eahs-entry a {
        color: #4cdbff;
      }

      .eahs-muted {
        color: #a9c7dc;
        font-size: 14px;
      }

      .eahs-mini {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin: 10px 0;
      }

      .eahs-float {
        position: fixed;
        bottom: 75px;
        right: 14px;
        z-index: 2147482000;
        box-shadow: 0 10px 25px rgba(0,0,0,.4);
      }

      #eahCoachCardApp.eahs-hidden,
      #eahDiverOnlyApp.eahs-hidden {
        display: none !important;
      }

      @media(max-width:600px) {
        .eahs-box {
          padding: 13px;
          border-radius: 16px;
        }

        .eahs-btn {
          padding: 9px 11px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* ==========================================================
     IDENTITE DU COMPTE CONNECTE
  ========================================================== */

  function rememberAccount() {
    const coach = $("#eahCoachCardApp");

    // Le token n'est mémorisé qu'après ouverture
    // effective de l'espace coach attribué.

    if (
      coach &&
      !coach.classList.contains("eahs-hidden") &&
      $("#coachCardContent .coach-stat-grid", coach)
    ) {
      const token = new URLSearchParams(
        location.search
      ).get("coachToken");

      if (token && token.length > 10) {
        STORE.setItem(COACH_KEY, token);
        STORE.setItem(ACTIVE_KEY, "coach");
      }
    }

    // Identité du plongeur vérifiée par son PIN.
    // Ne pas reprendre state.profile lorsque le
    // plongeur consulte un profil public différent.

    const diver = $("#eahDiverOnlyApp");
    const st = stateRef();

    if (
      diver &&
      !diver.classList.contains("eahs-hidden") &&
      st?.diverPinHash &&
      st?.profile?.eahId
    ) {
      STORE.setItem(
        DIVER_KEY,
        JSON.stringify({
          id: st.profile.eahId,
          hash: st.diverPinHash
        })
      );

      STORE.setItem(ACTIVE_KEY, "diver");
    }

    if (
      st?.user?.id &&
      !$("#eahCoachCardApp:not(.eahs-hidden)") &&
      !$("#eahDiverOnlyApp:not(.eahs-hidden)")
    ) {
      // Ne pas écraser une session NFC encore active.
      if (!STORE.getItem(ACTIVE_KEY)) {
        STORE.setItem(ACTIVE_KEY, "auth");
      }
    }

    account = currentAccount();

    const newKey = account?.key || "";

    if (newKey !== accountKey) {
      accountKey = newKey;
      myCache = null;
      myCacheTime = 0;
      publicCache.clear();
    }
  }

  function currentAccount() {
    const mode = STORE.getItem(ACTIVE_KEY);

    if (mode === "diver") {
      try {
        const d = JSON.parse(
          STORE.getItem(DIVER_KEY) || "null"
        );

        if (d?.id && d?.hash) {
          return {
            type: "diver",
            id: d.id,
            hash: d.hash,
            key: "D:" + d.id
          };
        }
      } catch (_) {}
    }

    if (mode === "coach") {
      const token = STORE.getItem(COACH_KEY);

      if (token) {
        return {
          type: "coach",
          token,
          key: "C:" + token.slice(-12)
        };
      }
    }

    const st = stateRef();

    if (st?.user?.id) {
      return {
        type: "auth",
        key: "U:" + st.user.id
      };
    }

    return null;
  }

  /* ==========================================================
     REQUETES SUPABASE
  ========================================================== */

  async function request(action, values = {}) {
    rememberAccount();

    const args = {
      p_action: action,
      ...values
    };

    if (action !== "PUBLIC") {
      if (!account) {
        throw new Error(
          "Connecte-toi à ton profil EAH pour interagir."
        );
      }

      if (account.type === "diver") {
        args.p_actor_eah_id = account.id;
        args.p_pin_hash = account.hash;
      }

      if (account.type === "coach") {
        args.p_coach_token = account.token;
      }
    }

    const { data, error } = await db().rpc(
      "eah_social_v2",
      args
    );

    if (error) throw error;

    if (data?.ok === false) {
      throw new Error(
        data.error || "Action refusée."
      );
    }

    return data;
  }

  async function getMe(force = false) {
    rememberAccount();

    if (!account) return null;

    if (
      !force &&
      myCache &&
      Date.now() - myCacheTime < 15000
    ) {
      return myCache;
    }

    if (myPromise) return myPromise;

    myPromise = request("ME")
      .then(data => {
        myCache = data;
        myCacheTime = Date.now();
        return data;
      })
      .finally(() => {
        myPromise = null;
      });

    return myPromise;
  }

  async function getPublic(eahId) {
    if (!eahId) return null;

    const key = String(eahId).toUpperCase();
    const old = publicCache.get(key);

    if (
      old &&
      Date.now() - old.time < 10000
    ) {
      return old.data;
    }

    const data = await request("PUBLIC", {
      p_target_eah_id: eahId
    });

    publicCache.set(key, {
      data,
      time: Date.now()
    });

    return data;
  }

  /* ==========================================================
     OUTILS HTML
  ========================================================== */

  function el(tag, className = "", text) {
    const n = document.createElement(tag);

    if (className) n.className = className;

    if (text !== undefined) {
      n.textContent = String(text);
    }

    return n;
  }

  function button(text, callback, secondary = false) {
    const b = el(
      "button",
      "eahs-btn" + (secondary ? " alt" : ""),
      text
    );

    b.type = "button";

    b.addEventListener("click", async event => {
      event.preventDefault();
      event.stopPropagation();

      b.disabled = true;

      try {
        await callback(b);
      } catch (error) {
        alert(error.message || String(error));
      } finally {
        b.disabled = false;
      }
    });

    return b;
  }

  function profileLink(id) {
    const url = new URL(
      location.pathname,
      location.origin
    );

    url.searchParams.set("id", id);
    url.hash = "profil";

    return url.toString();
  }

  /* ==========================================================
     LIKES
  ========================================================== */

  function likeButton(eahId, grading) {
    const row = el("div", "eahs-mini");

    row.dataset.eahSocialLike = "1";

    const count = el(
      "strong",
      "",
      "♥ " + (grading.likes || 0)
    );

    row.append(count);

    if (
      currentAccount()?.id?.toUpperCase() !==
      String(eahId).toUpperCase()
    ) {
      row.append(
        button("♡ J'aime", async b => {
          const result = await request("LIKE", {
            p_evaluation_id: grading.id
          });

          count.textContent =
            "♥ " + result.likes;

          b.textContent = result.liked
            ? "♥ Aimé"
            : "♡ J'aime";

          publicCache.delete(
            String(eahId).toUpperCase()
          );

          myCache = null;
        }, true)
      );
    }

    return row;
  }

  /* ==========================================================
     FOLLOW
  ========================================================== */

  function followButton(eahId, stats) {
    const row = el("div", "eahs-mini");

    row.dataset.eahSocialFollow = "1";

    const count = el(
      "strong",
      "",
      "👥 " + (stats.followers || 0) +
      " followers"
    );

    row.append(count);

    if (
      currentAccount()?.id?.toUpperCase() !==
      String(eahId).toUpperCase()
    ) {
      row.append(
        button("＋ Suivre", async b => {
          const result = await request("FOLLOW", {
            p_target_eah_id: eahId
          });

          count.textContent =
            "👥 " + result.followers + " followers";

          b.textContent = result.following
            ? "✓ Abonné"
            : "＋ Suivre";

          publicCache.delete(
            String(eahId).toUpperCase()
          );

          myCache = null;
        })
      );
    }

    return row;
  }

  /* ==========================================================
     NOTIFICATIONS ET LISTES
  ========================================================== */

  function entry(text, id = null, detail = "") {
    const row = el("div", "eahs-entry");

    if (id) {
      const link = el("a", "", text);
      link.href = profileLink(id);
      row.append(link);
    } else {
      row.append(el("span", "", text));
    }

    if (detail) {
      row.append(
        el("small", "eahs-muted", detail)
      );
    }

    return row;
  }

  function personalPanel(type) {
    const root = el("section", "eahs-box");

    root.dataset.eahSocialPanel = type;

    const header = el("div", "eahs-head");
    header.append(
      el("h3", "", "Mon activité EAH")
    );

    const bell = button(
      "🔔 Notifications",
      () => openTab("notifications"),
      true
    );

    header.append(bell);

    const counters = el("div", "eahs-row");
    const tabs = el("div", "eahs-tabs");
    const list = el("div", "eahs-list");

    list.hidden = true;

    const definitions = {
      following: "Je follow",
      followers: "Mes Followers",
      notifications: "Notifications"
    };

    const tabButtons = {};

    for (const [key, title] of Object.entries(
      definitions
    )) {
      const b = button(
        title,
        () => openTab(key),
        true
      );

      tabs.append(b);
      tabButtons[key] = b;
    }

    root.append(header, counters, tabs, list);

    async function refresh(force = false) {
      const data = await getMe(force);

      if (!data) return null;

      const followers =
        Number(data.followers_count || 0);

      const following =
        (data.following || []).length;

      const unread =
        (data.notifications || [])
          .filter(n => !n.read).length;

      counters.replaceChildren(
        el(
          "strong",
          "",
          "👥 " + followers + " Mes Followers"
        ),
        el(
          "strong",
          "",
          "✓ " + following + " Je follow"
        )
      );

      bell.textContent =
        "🔔 Notifications" +
        (unread ? " (" + unread + ")" : "");

      return data;
    }

    async function openTab(key) {
      const data = await refresh(true);

      if (!data) return;

      list.hidden = false;
      list.replaceChildren();

      for (const [name, b] of Object.entries(
        tabButtons
      )) {
        b.classList.toggle(
          "active",
          name === key
        );
      }

      for (const item of data[key] || []) {
        if (key === "notifications") {
          const message =
            item.actor +
            (
              item.kind === "FOLLOW"
                ? " suit ton profil"
                : " a aimé un grading"
            );

          const date = new Date(
            item.at
          ).toLocaleString("fr-FR");

          const row = entry(
            message,
            null,
            date
          );

          if (!item.read) {
            row.append(
              button(
                "Marquer comme lu",
                async b => {
                  await request("READ", {
                    p_notification_id: item.id
                  });

                  b.remove();
                  item.read = true;
                },
                true
              )
            );
          }

          list.append(row);

        } else {
          list.append(
            entry(
              item.name,
              item.eah_id || null,
              key === "following"
                ? (item.followers || 0) +
                  " followers"
                : ""
            )
          );
        }
      }

      if (!list.children.length) {
        list.append(
          el(
            "p",
            "eahs-muted",
            "Aucune activité pour le moment."
          )
        );
      }
    }

    refresh().catch(error => {
      counters.append(
        el(
          "p",
          "eahs-muted",
          error.message
        )
      );
    });

    return root;
  }

  /* ==========================================================
     NAVIGATION : PROFIL <-> SITE
  ========================================================== */

  function returnToSite() {
    const coach = $("#eahCoachCardApp");
    const diver = $("#eahDiverOnlyApp");

    if (coach) {
      coach.classList.add("eahs-hidden");

      document.documentElement.classList.remove(
        "eah-coach-card-mode"
      );

      document.body.classList.remove(
        "eah-coach-card-mode"
      );
    }

    if (diver) {
      diver.classList.add("eahs-hidden");
    }

    if (typeof showPage === "function") {
      showPage("population");
    } else {
      location.hash = "population";
    }

    showReturnButton();
  }

  function returnToAccount() {
    rememberAccount();

    const coach = $("#eahCoachCardApp");
    const diver = $("#eahDiverOnlyApp");

    if (account?.type === "coach") {
      if (coach) {
        coach.classList.remove("eahs-hidden");

        document.documentElement.classList.add(
          "eah-coach-card-mode"
        );

        document.body.classList.add(
          "eah-coach-card-mode"
        );
      } else {
        location.href =
          location.pathname +
          "?coachToken=" +
          encodeURIComponent(account.token) +
          "#club";

        return;
      }

    } else if (
      account?.type === "diver" &&
      diver
    ) {
      diver.classList.remove("eahs-hidden");

    } else if (typeof showPage === "function") {
      showPage(
        account?.type === "diver"
          ? "profil"
          : "club"
      );
    }

    showReturnButton();
  }

  function showReturnButton() {
    rememberAccount();

    let control = $("#eahSocialReturn");

    if (!account) {
      control?.remove();
      return;
    }

    if (!control) {
      control = button(
        "👤 Mon espace EAH",
        returnToAccount
      );

      control.id = "eahSocialReturn";
      control.classList.add("eahs-float");

      document.body.append(control);
    }

    control.hidden = Boolean(
      $("#eahCoachCardApp:not(.eahs-hidden)") ||
      $("#eahDiverOnlyApp:not(.eahs-hidden)")
    );
  }

  /* ==========================================================
     ESPACE COACH NFC
  ========================================================== */

  function coachCardUI() {
    const app = $("#eahCoachCardApp");

    const host = $(
      "#coachCardContent",
      app || document
    );

    if (
      !host ||
      !$(".coach-stat-grid", host)
    ) {
      return;
    }

    rememberAccount();

    if (
      !host.querySelector(
        '[data-eah-social-panel="coach"]'
      )
    ) {
      const panel = personalPanel("coach");

      const header = $(
        ".coach-card-header",
        host
      );

      if (header) {
        header.after(panel);
      } else {
        host.prepend(panel);
      }
    }

    if (!$("#eahSocialBrowseCoach", host)) {
      const b = button(
        "🌐 Explorer le site",
        returnToSite
      );

      b.id = "eahSocialBrowseCoach";
      b.style.margin = "12px 0";

      const header = $(
        ".coach-card-header",
        host
      );

      if (header) {
        header.after(b);
      } else {
        host.prepend(b);
      }
    }
  }

  /* ==========================================================
     ESPACE COACH AVEC MOT DE PASSE
  ========================================================== */

  function coachAuthUI() {
    const host = $("#coachPrivate");

    if (
      !host ||
      host.classList.contains("hidden") ||
      !stateRef()?.user
    ) {
      return;
    }

    if (
      host.querySelector(
        '[data-eah-social-panel="auth"]'
      )
    ) {
      return;
    }

    const panel = personalPanel("auth");
    const top = $(".dashboard-topbar", host);

    if (top) {
      top.after(panel);
    } else {
      host.prepend(panel);
    }
  }

  /* ==========================================================
     ESPACE PLONGEUR PERSONNEL
  ========================================================== */

  function diverUI() {
    const app = $("#eahDiverOnlyApp");

    if (!app) return;

    rememberAccount();

    if (account?.type !== "diver") {
      return;
    }

    const host = $(
      ".eah-diver-only-shell",
      app
    );

    if (!host) return;

    const brand = $(
      ".eah-diver-brand",
      host
    );

    if (
      !host.querySelector(
        '[data-eah-social-panel="diver"]'
      )
    ) {
      const panel = personalPanel("diver");

      if (brand) {
        brand.after(panel);
      } else {
        host.prepend(panel);
      }
    }

    if (!$("#eahSocialBrowseDiver", host)) {
      const b = button(
        "🌐 Explorer le site",
        returnToSite
      );

      b.id = "eahSocialBrowseDiver";
      b.style.margin = "12px 0";

      if (brand) {
        brand.after(b);
      } else {
        host.prepend(b);
      }
    }
  }

  /* ==========================================================
     PROFIL PUBLIC + COMPTEURS DES GRADINGS
  ========================================================== */

  async function publicProfileUI() {
    const host = $("#profileView");
    const hero = $(
      ".eah-fast-profile-top",
      host || document
    );

    if (!hero) return;

    const st = stateRef();

    const id =
      st?.profile?.eahId ||
      st?.profile?.eah_id;

    if (!id) return;

    const data = await getPublic(id);

    // Aucune information sociale pour un profil privé.
    if (!data?.public) return;

    const target = $(
      ".eah-fast-profile-text",
      hero
    ) || hero;

    const key = "public-" + id;

    if (
      !target.querySelector(
        '[data-eah-social-public="' + key + '"]'
      )
    ) {
      const block = el("div", "eahs-row");
      block.dataset.eahSocialPublic = key;

      block.append(
        followButton(id, data)
      );

      target.append(block);
    }

    const rows = $$(
      "#profileHistory .profile-history-item",
      host
    );

    const evaluations =
      st?.profileHistory?.evaluations || [];

    rows.forEach((row, index) => {
      if (
        row.querySelector(
          "[data-eah-social-like]"
        )
      ) {
        return;
      }

      const grading = data.gradings?.find(
        g => g.id === evaluations[index]?.id
      );

      if (grading) {
        row.append(
          likeButton(id, grading)
        );
      }
    });
  }

  /* ==========================================================
     POPULATION
  ========================================================== */

  async function populationUI() {
    const root = $("#populationResults");

    if (!root) return;

    const profiles = $$(
      ".eah-population-person-card.is-public",
      root
    );

    for (const card of profiles) {
      if (card.dataset.eahSocialDone) {
        continue;
      }

      const link = card.querySelector(
        'a[href*="id="]'
      );

      if (!link) continue;

      const id = new URL(
        link.href
      ).searchParams.get("id");

      if (!id) continue;

      card.dataset.eahSocialDone = "1";

      const data = await getPublic(id);

      if (!data?.public || !card.isConnected) {
        continue;
      }

      const target = $(
        ".eah-population-person-info",
        card
      ) || card;

      target.append(
        followButton(id, data)
      );
    }

    // Les lignes de gradings sont identifiées
    // dans script.js par leurs attributs data.

    const gradings = $$(
      ".history-item[data-eah-social-eah]",
      root
    );

    for (const row of gradings) {
      if (row.dataset.eahSocialDone) {
        continue;
      }

      const id = row.dataset.eahSocialEah;

      if (!id) continue;

      row.dataset.eahSocialDone = "1";

      const data = await getPublic(id);

      const grading = data?.gradings?.find(
        g =>
          g.code === row.dataset.eahSocialCode &&
          Math.abs(
            Date.parse(g.at) -
            Date.parse(row.dataset.eahSocialAt)
          ) < 2500
      );

      if (grading && row.isConnected) {
        row.append(
          likeButton(id, grading)
        );
      }
    }
  }

  /* ==========================================================
     ACTUALISATION
  ========================================================== */

  async function scan() {
    if (scanning) return;

    scanning = true;

    try {
      coachCardUI();
      coachAuthUI();
      diverUI();
      showReturnButton();

      await Promise.all([
        publicProfileUI(),
        populationUI()
      ]);

    } catch (error) {
      console.warn(
        "EAH Social V2 :",
        error.message
      );
    } finally {
      scanning = false;
    }
  }

  function scheduleScan() {
    if (queued) return;

    queued = true;

    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  }

  function start() {
    installCSS();

    new MutationObserver(
      scheduleScan
    ).observe(document.body, {
      childList: true,
      subtree: true
    });

    scheduleScan();

    window.addEventListener(
      "hashchange",
      scheduleScan
    );

    window.addEventListener(
      "pageshow",
      scheduleScan
    );

    // Effacer l'identité sociale lors de la
    // déconnexion coach classique.
    $("#logoutCoachButton")?.addEventListener(
      "click",
      () => {
        STORE.removeItem(COACH_KEY);
        STORE.removeItem(ACTIVE_KEY);
        account = null;
        myCache = null;
      }
    );

    window.EAHSocialRefresh = () => {
      publicCache.clear();
      myCache = null;
      myCacheTime = 0;

      $$(
        "[data-eah-social-panel]"
      ).forEach(x => x.remove());

      $$(
        "[data-eah-social-public]"
      ).forEach(x => x.remove());

      $$(
        "[data-eah-social-like]"
      ).forEach(x => x.remove());

      $$(
        "[data-eah-social-done]"
      ).forEach(x => {
        delete x.dataset.eahSocialDone;
      });

      scheduleScan();
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start,
      { once: true }
    );
  } else {
    start();
  }

})();
