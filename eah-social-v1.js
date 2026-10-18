
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
  followers: "Mes Followers"
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

    
const listTitle = el(
  "h4",
  "",
  "🔔 Mes notifications"
);

root.append(
  header,
  counters,
  tabs,
  listTitle,
  list
);


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
       
listTitle.textContent =
  key === "following"
    ? "✓ Profils que je follow"
    : key === "followers"
      ? "👥 Mes Followers"
      : "🔔 Mes notifications";


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

    
openTab("notifications").catch(error => {
  list.hidden = false;

  list.replaceChildren(
    el(
      "p",
      "eahs-muted",
      "Impossible de charger les notifications : " +
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
      
showPage("accueil");

    } else {
      
location.hash = "accueil";

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
      
diver &&
(
  account?.type === "diver" ||
  (
    !account &&
    new URLSearchParams(
      location.search
    ).has("token")
  )
)

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

    
const nfcProfile = Boolean(
  new URLSearchParams(
    location.search
  ).get("token") &&
  document.getElementById("eahDiverOnlyApp")
);

if (!account && !nfcProfile) {
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

  
/* ============================================================
   ESPACE PLONGEUR — RETOUR AU SITE
   FONCTIONNE AUSSI AVEC CARTE NFC
============================================================ */

function diverUI() {
  const app = document.getElementById(
    "eahDiverOnlyApp"
  );

  if (!app) return;

  const host = app.querySelector(
    ".eah-diver-only-shell"
  );

  if (!host) return;

  const brand = host.querySelector(
    ".eah-diver-brand"
  );

  // Le retour au site doit fonctionner
  // même quand le profil est ouvert par NFC.

  if (!document.getElementById(
    "eahSocialBrowseDiver"
  )) {
    const back = button(
      "← Retour à l'accueil",
      returnToSite
    );

    back.id = "eahSocialBrowseDiver";
    back.style.margin = "12px 0";

    if (brand) {
      brand.after(back);
    } else {
      host.prepend(back);
    }
  }

  rememberAccount();

  // Pour les notifications personnelles et les
  // actions sociales, une connexion vérifiée
  // reste nécessaire.

  if (account?.type !== "diver") {
    return;
  }

  if (!host.querySelector(
    '[data-eah-social-panel="diver"]'
  )) {
    const panel = personalPanel("diver");

    if (brand) {
      brand.after(panel);
    } else {
      host.prepend(panel);
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

  
/* ==========================================================
   POPULATION — FOLLOWERS ET LIKES
   CORRECTION V3
========================================================== */

async function populationUI() {
  const root = document.getElementById(
    "populationResults"
  );

  if (!root) return;

  // PROFILS PUBLICS
  const cards = [
    ...root.querySelectorAll(
      ".eah-population-person-card.is-public"
    )
  ];

  for (const card of cards) {
    if (card.querySelector(
      "[data-eah-social-follow]"
    )) {
      continue;
    }

    const link = card.querySelector(
      'a[href*="id="]'
    );

    if (!link) continue;

    let id = "";

    try {
      id = new URL(
        link.href
      ).searchParams.get("id") || "";
    } catch (_) {
      continue;
    }

    if (!id) continue;

    try {
      const data = await getPublic(id);

      if (!data?.public || !card.isConnected) {
        continue;
      }

      // Ne pas ajouter deux fois.
      if (card.querySelector(
        "[data-eah-social-follow]"
      )) {
        continue;
      }

      const target = card.querySelector(
        ".eah-population-person-info"
      ) || card;

      const holder = document.createElement("div");
      holder.className = "eahs-row";
      holder.dataset.eahSocialFollow = "1";

      const follow = followButton(id, data);
      holder.append(follow);

      // Total des likes des gradings publics.
      const total = (
        data.gradings || []
      ).reduce(
        (sum, g) => sum + Number(g.likes || 0),
        0
      );

      const likes = document.createElement("span");
      likes.className = "eahs-muted";
      likes.textContent =
        "♥ " + total + " likes sur ses gradings";

      holder.append(likes);
      target.append(holder);

    } catch (error) {
      console.warn(
        "Follow Population :",
        error
      );
    }
  }

  // GRADINGS PUBLICS
  const rows = [
    ...root.querySelectorAll(
      ".history-item[data-eah-social-eah]"
    )
  ];

  for (const row of rows) {
    if (row.querySelector(
      "[data-eah-social-like]"
    )) {
      continue;
    }

    const id = row.dataset.eahSocialEah;
    const code = row.dataset.eahSocialCode;
    const date = row.dataset.eahSocialAt;

    if (!id || !code) continue;

    try {
      const data = await getPublic(id);

      if (!data?.public || !row.isConnected) {
        continue;
      }

      const matches = (
        data.gradings || []
      ).filter(g =>
        String(g.code).toUpperCase() ===
        String(code).toUpperCase()
      );

      // Correspondance exacte par identifiant,
      // sinon par code et date.
      let grading = matches.find(
        g =>
          row.dataset.eahSocialId &&
          g.id === row.dataset.eahSocialId
      );

      if (!grading && date) {
        grading = matches.find(g =>
          Number.isFinite(Date.parse(g.at)) &&
          Number.isFinite(Date.parse(date)) &&
          Math.abs(
            Date.parse(g.at) -
            Date.parse(date)
          ) < 120000
        );
      }

      // Une seule évaluation avec ce code :
      // correspondance non ambiguë.
      if (!grading && matches.length === 1) {
        grading = matches[0];
      }

      if (!grading || row.querySelector(
        "[data-eah-social-like]"
      )) {
        continue;
      }

      row.append(
        likeButton(id, grading)
      );

    } catch (error) {
      console.warn(
        "Like Population :",
        error
      );
    }
  }
}

/* ==========================================================
   LIKES DANS L'HISTORIQUE PERSONNEL
========================================================== */

async function showOwnHistoryLikes() {
  rememberAccount();

  // Les statistiques personnelles sont affichées
  // uniquement pour le plongeur connecté.
  if (account?.type !== "diver") return;

  const st = stateRef();

  if (
    !st?.profile?.eahId ||
    st.profile.eahId.toUpperCase() !==
      account.id.toUpperCase()
  ) {
    return;
  }

  const data = await getMe();

  if (!data?.ok) return;

  const gradeCounts = new Map(
    (data.grades || []).map(g => [
      String(g.id),
      Number(g.likes || 0)
    ])
  );

  const history = st.profileHistory?.evaluations || [];

  const rows = [
    ...document.querySelectorAll(
      "#profileHistory .profile-history-item"
    )
  ];

  rows.forEach((row, index) => {
    const evaluation = history[index];

    const id =
      evaluation?.id ||
      evaluation?.evaluation_id;

    if (!id) return;

    const likes = gradeCounts.get(
      String(id)
    );

    if (likes === undefined) return;

    let counter = row.querySelector(
      "[data-eah-own-likes]"
    );

    if (!counter) {
      counter = document.createElement("div");
      counter.dataset.eahOwnLikes = "1";
      counter.className = "eahs-mini";
      row.append(counter);
    }

    counter.textContent =
      "♥ " + likes + " likes";
  });
}


  /* ==========================================================
     ACTUALISATION
  ========================================================== */

  
/* ==========================================================
   ACTUALISATION FIABLE DES INTERFACES
   CORRECTION V3
========================================================== */


let pendingScan = false;
let frameQueued = false;


async function scan() {
  if (scanning) {
    pendingScan = true;
    return;
  }

  scanning = true;
  pendingScan = false;

  try {
    // Espaces personnels
    coachCardUI();
    coachAuthUI();
    diverUI();

    // Bouton pour revenir à l'espace personnel
    showReturnButton();

    // Ne pas bloquer tous les éléments si
    // une seule requête échoue.
    const results = await Promise.allSettled([
      populationUI(),
      publicProfileUI(),
      showOwnHistoryLikes()
    ]);

    results.forEach(result => {
      if (result.status === "rejected") {
        console.warn(
          "EAH Social V3 :",
          result.reason
        );
      }
    });

  } catch (error) {
    console.warn(
      "EAH Social V3 :",
      error
    );

  } finally {
    scanning = false;

    // Repasser sur la page si des cartes ou
    // profils ont été ajoutés durant le chargement.
    if (pendingScan) {
      scheduleScan();
    }
  }
}


function scheduleScan() {
  pendingScan = true;

  if (scanning || frameQueued) {
    return;
  }

  frameQueued = true;

  requestAnimationFrame(() => {
    frameQueued = false;
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
