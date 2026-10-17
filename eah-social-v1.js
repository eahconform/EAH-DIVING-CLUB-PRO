
/* ============================================================
   EAH DIVING PRO CLUB
   SOCIAL V1 — LIKES / FOLLOW / NOTIFICATIONS

   Fonctionne avec :
   - Population
   - Profils publics
   - Espace plongeur connecté par PIN
   - Espace coach Supabase Auth

   Sécurité et compteurs gérés par Supabase.
============================================================ */

(() => {
  "use strict";

  const CSS = `
    .eah-social-bar,
    .eah-social-tabs {
      display:flex;
      align-items:center;
      gap:10px;
      flex-wrap:wrap;
    }

    .eah-social-bar {
      margin:14px 0;
    }

    .eah-social-card {
      padding:20px;
      margin:16px 0;
      background:rgba(3,23,43,.93);
      border:1px solid rgba(48,207,255,.3);
      border-radius:20px;
      color:#eef8ff;
    }

    .eah-social-card h3 {
      margin:0 0 12px;
      font-size:20px;
    }

    .eah-social-button {
      cursor:pointer;
      border:1px solid rgba(48,207,255,.5);
      color:#ecf8ff;
      background:#083357;
      border-radius:12px;
      padding:9px 13px;
      font:inherit;
      font-weight:650;
    }

    .eah-social-button.primary,
    .eah-social-tab-active {
      background:#0b6bff;
      border-color:#0b6bff;
    }

    .eah-social-button:disabled {
      opacity:.45;
      cursor:wait;
    }

    .eah-social-counter {
      font-weight:700;
      color:#c9eafa;
    }

    .eah-social-red {
      color:#ff6585;
    }

    .eah-social-list {
      margin-top:14px;
      display:grid;
      gap:10px;
    }

    .eah-social-item {
      background:rgba(255,255,255,.04);
      border:1px solid rgba(143,205,255,.14);
      border-radius:13px;
      padding:12px;
      display:flex;
      gap:10px;
      align-items:center;
      justify-content:space-between;
      flex-wrap:wrap;
    }

    .eah-social-item a {
      color:#6edfff;
    }

    .eah-social-profile,
    .eah-social-pop {
      margin-top:14px;
    }

    .eah-social-grade {
      display:flex;
      align-items:center;
      gap:8px;
      flex-wrap:wrap;
      margin-top:8px;
    }

    @media(max-width:600px) {
      .eah-social-card {
        padding:14px;
        border-radius:16px;
      }

      .eah-social-button {
        padding:8px 11px;
      }
    }
  `;

  const cache = new Map();

  let meData = null;
  let mePromise = null;
  let loading = false;

  /* ==========================================================
     CONNEXION EXISTANTE
  ========================================================== */

  function sb() {
    if (typeof requireSupabase !== "function") {
      throw new Error("Supabase non chargé.");
    }

    return requireSupabase();
  }

  function appState() {
    try {
      return typeof state === "undefined"
        ? null
        : state;
    } catch (_) {
      return null;
    }
  }

  function actorArgs() {
    const st = appState();

    const pin = st?.diverPinHash || "";

    const id =
      st?.profile?.eahId ||
      st?.profile?.eah_id ||
      "";

    if (pin && id) {
      return {
        p_actor_eah_id: id,
        p_pin_hash: pin
      };
    }

    try {
      const stored = JSON.parse(
        sessionStorage.getItem(
          "EAH_DIVER_PIN_SESSION"
        ) || "null"
      );

      if (stored?.pinHash && stored?.eahId) {
        return {
          p_actor_eah_id: stored.eahId,
          p_pin_hash: stored.pinHash
        };
      }
    } catch (_) {}

    return {};
  }

  async function rpc(action, extra = {}) {
    const { data, error } = await sb().rpc(
      "eah_social_v1",
      {
        p_action: action,
        ...actorArgs(),
        ...extra
      }
    );

    if (error) throw error;

    if (data?.ok === false) {
      throw new Error(
        data.error || "Action impossible."
      );
    }

    return data;
  }

  /* ==========================================================
     STATISTIQUES PUBLIQUES
  ========================================================== */

  async function publicData(eahId, force = false) {
    if (!eahId) return null;

    const key = String(eahId).toUpperCase();
    const old = cache.get(key);

    if (
      !force &&
      old &&
      Date.now() - old.at < 20000
    ) {
      return old.data;
    }

    const data = await rpc("PUBLIC", {
      p_target_eah_id: key
    });

    cache.set(key, {
      data,
      at: Date.now()
    });

    return data;
  }

  /* ==========================================================
     ELEMENTS D'INTERFACE
  ========================================================== */

  function element(tag, className = "", text = "") {
    const el = document.createElement(tag);

    if (className) el.className = className;

    if (text) el.textContent = text;

    return el;
  }

  function button(label, callback, primary = false) {
    const btn = element(
      "button",
      "eah-social-button" +
        (primary ? " primary" : ""),
      label
    );

    btn.type = "button";

    btn.addEventListener("click", async () => {
      btn.disabled = true;

      try {
        await callback(btn);
      } catch (error) {
        alert(error.message || String(error));
      } finally {
        btn.disabled = false;
      }
    });

    return btn;
  }

  function loginMessage() {
    alert(
      "Connecte-toi dans Espace Club avec ton " +
      "compte coach ou ton profil plongeur et " +
      "ton code personnel pour aimer ou suivre."
    );
  }

  function profileLink(eahId) {
    const url = new window.URL(location.href);

    url.searchParams.set("id", eahId);
    url.hash = "profil";

    return url.href;
  }

  /* ==========================================================
     FOLLOW / UNFOLLOW
  ========================================================== */

  async function toggleFollow(eahId, btn, count) {
    try {
      const result = await rpc("FOLLOW", {
        p_target_eah_id: eahId
      });

      btn.textContent = result.following
        ? "✓ Abonné"
        : "＋ Suivre";

      if (count) {
        count.textContent =
          "👥 " + result.followers + " followers";
      }

      cache.delete(
        String(eahId).toUpperCase()
      );

      meData = null;

    } catch (error) {
      if (/Connectez-vous/.test(error.message)) {
        loginMessage();
      } else {
        throw error;
      }
    }
  }

  /* ==========================================================
     LIKE / UNLIKE
  ========================================================== */

  async function toggleLike(
    eahId,
    evaluationId,
    btn,
    count
  ) {
    try {
      const result = await rpc("LIKE", {
        p_evaluation_id: evaluationId
      });

      btn.textContent = result.liked
        ? "♥ Aimé"
        : "♡ J’aime";

      count.textContent =
        "♥ " + result.likes;

      cache.delete(
        String(eahId).toUpperCase()
      );

      meData = null;

    } catch (error) {
      if (/Connectez-vous/.test(error.message)) {
        loginMessage();
      } else {
        throw error;
      }
    }
  }

  function followUI(eahId, stats) {
    const bar = element(
      "div",
      "eah-social-bar"
    );

    const count = element(
      "span",
      "eah-social-counter",
      "👥 " + stats.followers + " followers"
    );

    const btn = button(
      "＋ Suivre",
      b => toggleFollow(eahId, b, count),
      true
    );

    const st = appState();

    if (
      st?.profile?.eahId === eahId &&
      st?.diverPinHash
    ) {
      btn.hidden = true;
    }

    bar.append(count, btn);

    return bar;
  }

  function likeUI(eahId, grading) {
    const bar = element(
      "div",
      "eah-social-grade"
    );

    const count = element(
      "span",
      "eah-social-red",
      "♥ " + grading.likes
    );

    const btn = button(
      "♡ J’aime",
      b => toggleLike(
        eahId,
        grading.id,
        b,
        count
      )
    );

    const st = appState();

    if (
      st?.profile?.eahId === eahId &&
      st?.diverPinHash
    ) {
      btn.hidden = true;
    }

    bar.append(count, btn);

    return bar;
  }

  /* ==========================================================
     UTILISATEUR CONNECTE
  ========================================================== */

  function personalContext() {
    const st = appState();

    if (
      st?.diverPinHash &&
      st?.profile?.eahId
    ) {
      return "diver";
    }

    const coach = document.getElementById(
      "coachPrivate"
    );

    if (
      st?.user &&
      coach &&
      !coach.classList.contains("hidden")
    ) {
      return "coach";
    }

    return null;
  }

  async function loadMe(force = false) {
    if (!force && meData) {
      return meData;
    }

    if (mePromise) {
      return mePromise;
    }

    mePromise = rpc("ME")
      .then(data => {
        meData = data;
        return data;
      })
      .finally(() => {
        mePromise = null;
      });

    return mePromise;
  }

  /* ==========================================================
     LISTES FOLLOW / FOLLOWERS / NOTIFICATIONS
  ========================================================== */

  function listRow(text, href = null, right = "") {
    const row = element(
      "div",
      "eah-social-item"
    );

    const name = href
      ? element("a")
      : element("span", "", text);

    if (href) {
      name.href = href;
      name.textContent = text;
    }

    row.append(name);

    if (right) {
      row.append(
        element(
          "small",
          "eah-social-counter",
          right
        )
      );
    }

    return row;
  }

  function buildPersonal(data, kind) {
    const card = element(
      "section",
      "eah-social-card"
    );

    card.dataset.eahSocialPersonal = kind;

    const head = element(
      "h3",
      "",
      "Mon activité EAH Diving"
    );

    const count = element(
      "div",
      "eah-social-bar"
    );

    const followingCount =
      (data.following || []).length;

    const followerCount =
      data.followers_count || 0;

    count.append(
      element(
        "strong",
        "eah-social-counter",
        "👥 " + followerCount + " followers"
      ),
      element(
        "strong",
        "eah-social-counter",
        "✓ " + followingCount + " profils suivis"
      )
    );

    const tabs = element(
      "div",
      "eah-social-tabs"
    );

    const content = element(
      "div",
      "eah-social-list"
    );

    const collections = {
      following: () =>
        (data.following || []).map(p =>
          listRow(
            p.name,
            profileLink(p.eah_id),
            p.followers + " followers"
          )
        ),

      followers: () =>
        (data.followers || []).map(p =>
          listRow(
            p.name,
            p.eah_id
              ? profileLink(p.eah_id)
              : null
          )
        ),

      notifications: () =>
        (data.notifications || []).map(n => {
          const date = new Date(
            n.at
          ).toLocaleString("fr-FR");

          const message = n.kind === "FOLLOW"
            ? n.actor + " suit ton profil"
            : n.actor + " a aimé un grading";

          const row = listRow(
            message,
            null,
            date
          );

          if (!n.read) {
            row.append(
              button(
                "Marquer comme lu",
                async () => {
                  await rpc("READ", {
                    p_notification_id: n.id
                  });

                  n.read = true;
                  show("notifications");
                }
              )
            );
          }

          return row;
        })
    };

    const tabDefinitions = [
      ["following", "Je follow"],
      ["followers", "Mes Followers"],
      ["notifications", "Notifications"]
    ];

    const buttons = new Map();

    tabDefinitions.forEach(([key, label]) => {
      const unread = key === "notifications"
        ? (data.notifications || [])
            .filter(n => !n.read).length
        : 0;

      const btn = button(
        label + (unread ? " (" + unread + ")" : ""),
        () => show(key)
      );

      tabs.append(btn);
      buttons.set(key, btn);
    });

    function show(tab) {
      for (const [key, btn] of buttons) {
        btn.classList.toggle(
          "eah-social-tab-active",
          key === tab
        );
      }

      const rows = collections[tab]();

      content.replaceChildren(
        ...(rows.length
          ? rows
          : [listRow("Aucune activité pour le moment")])
      );
    }

    card.append(
      head,
      count,
      tabs,
      content
    );

    show("notifications");

    return card;
  }

  async function insertPersonal(root, kind) {
    if (
      !root ||
      root.querySelector(
        '[data-eah-social-personal="' + kind + '"]'
      ) ||
      loading
    ) {
      return;
    }

    loading = true;

    try {
      const data = await loadMe();

      if (
        !root.isConnected ||
        root.querySelector(
          '[data-eah-social-personal="' + kind + '"]'
        )
      ) {
        return;
      }

      const block = buildPersonal(
        data,
        kind
      );

      if (kind === "diver") {
        root.prepend(block);
      } else {
        const top = root.querySelector(
          ".dashboard-topbar"
        );

        if (top) {
          top.after(block);
        } else {
          root.prepend(block);
        }
      }

      if (kind === "diver") {
        showOwnGradeLikes(
          root,
          data.grades || []
        );
      }

    } catch (error) {
      console.debug(
        "EAH Social personnel :",
        error.message
      );
    } finally {
      loading = false;
    }
  }

  /* ==========================================================
     LIKES DANS L'HISTORIQUE PERSONNEL
  ========================================================== */

  function showOwnGradeLikes(root, grades) {
    const rows = [
      ...root.querySelectorAll(
        "#profileHistory .profile-history-item"
      )
    ];

    const evaluations =
      appState()?.profileHistory?.evaluations || [];

    rows.forEach((row, index) => {
      if (
        row.querySelector(
          "[data-eah-social-own-grade]"
        )
      ) {
        return;
      }

      const grading = grades.find(
        g => g.id === evaluations[index]?.id
      );

      if (!grading) return;

      const count = element(
        "div",
        "eah-social-grade",
        "♥ " + grading.likes + " likes"
      );

      count.dataset.eahSocialOwnGrade = "1";

      row.append(count);
    });
  }

  /* ==========================================================
     PROFIL PUBLIC
  ========================================================== */

  async function addPublicProfile() {
    const root = document.getElementById(
      "profileView"
    );

    const hero = root?.querySelector(
      ".eah-fast-profile-top"
    );

    if (!hero) return;

    const id = appState()?.profile?.eahId;

    if (!id) return;

    const data = await publicData(id);

    if (!data?.public || !hero.isConnected) {
      return;
    }

    if (
      !hero.querySelector(
        "[data-eah-social-profile]"
      )
    ) {
      const wrapper = element(
        "div",
        "eah-social-profile"
      );

      wrapper.dataset.eahSocialProfile = "1";

      wrapper.append(
        followUI(id, data)
      );

      hero.querySelector(
        ".eah-fast-profile-text"
      )?.append(wrapper);
    }

    const rows = [
      ...root.querySelectorAll(
        "#profileHistory .profile-history-item"
      )
    ];

    const evaluations =
      appState()?.profileHistory?.evaluations || [];

    rows.forEach((row, index) => {
      if (
        row.querySelector(".eah-social-grade")
      ) {
        return;
      }

      const grading = data.gradings?.find(
        g => g.id === evaluations[index]?.id
      );

      if (grading) {
        row.append(
          likeUI(id, grading)
        );
      }
    });
  }

  /* ==========================================================
     POPULATION PUBLIQUE
  ========================================================== */

  function getIdFromCard(card) {
    const link = card.querySelector(
      'a[href*="id="]'
    );

    if (!link) return "";

    try {
      return new window.URL(
        link.href
      ).searchParams.get("id") || "";
    } catch (_) {
      return "";
    }
  }

  async function decoratePopulation() {
    const root = document.getElementById(
      "populationResults"
    );

    if (!root) return;

    const cards = [
      ...root.querySelectorAll(
        ".eah-population-person-card.is-public" +
        ":not([data-eah-social-added])"
      )
    ];

    for (const card of cards) {
      const id = getIdFromCard(card);

      if (!id) continue;

      card.dataset.eahSocialAdded = "1";

      try {
        const data = await publicData(id);

        if (!data?.public || !card.isConnected) {
          continue;
        }

        const container = card.querySelector(
          ".eah-population-person-info"
        ) || card;

        const wrapper = element(
          "div",
          "eah-social-pop"
        );

        wrapper.append(
          followUI(id, data)
        );

        const totalLikes = (
          data.gradings || []
        ).reduce(
          (sum, g) => sum + Number(g.likes || 0),
          0
        );

        wrapper.append(
          element(
            "small",
            "eah-social-counter",
            "♥ " + totalLikes + " likes sur ses gradings"
          )
        );

        container.append(wrapper);

      } catch (error) {
        console.debug(error.message);
      }
    }

    /* Gradings de Population */

    const gradingRows = [
      ...root.querySelectorAll(
        ".history-item[data-eah-social-eah]" +
        ":not([data-eah-social-added])"
      )
    ];

    for (const row of gradingRows) {
      const id = row.dataset.eahSocialEah;

      if (!id) continue;

      row.dataset.eahSocialAdded = "1";

      try {
        const data = await publicData(id);

        const grading = (
          data?.gradings || []
        ).find(g =>
          g.code === row.dataset.eahSocialCode &&
          Math.abs(
            Date.parse(g.at) -
            Date.parse(row.dataset.eahSocialAt)
          ) < 2000
        );

        if (grading && row.isConnected) {
          row.append(
            likeUI(id, grading)
          );
        }

      } catch (error) {
        console.debug(error.message);
      }
    }
  }

  /* ==========================================================
     ACTUALISATION DES ESPACES
  ========================================================== */

  let pending = false;

  function queueScan() {
    if (pending) return;

    pending = true;

    requestAnimationFrame(async () => {
      pending = false;

      await decoratePopulation();

      const profile = document.getElementById(
        "profileView"
      );

      if (
        profile?.isConnected &&
        !profile.classList.contains("hidden")
      ) {
        await addPublicProfile();

        if (personalContext() === "diver") {
          await insertPersonal(
            profile,
            "diver"
          );

          if (meData?.grades) {
            showOwnGradeLikes(
              profile,
              meData.grades
            );
          }
        }
      }

      const coach = document.getElementById(
        "coachPrivate"
      );

      if (personalContext() === "coach") {
        await insertPersonal(
          coach,
          "coach"
        );
      }
    });
  }

  function init() {
    const style = element("style");
    style.textContent = CSS;

    document.head.append(style);

    new MutationObserver(
      queueScan
    ).observe(document.body, {
      childList: true,
      subtree: true
    });

    queueScan();

    window.addEventListener("pageshow", () => {
      meData = null;
      cache.clear();
      queueScan();
    });

    window.EAHSocialRefresh = () => {
      meData = null;
      cache.clear();

      document.querySelectorAll(
        "[data-eah-social-personal]"
      ).forEach(el => el.remove());

      queueScan();
    };
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
