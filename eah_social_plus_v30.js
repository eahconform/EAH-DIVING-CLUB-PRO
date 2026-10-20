
/* ==================================================
   EAH DIVING PRO CLUB — SOCIAL PLUS V30

   - Coachs : follow, followers et notifications
   - Certification EAH administrée
   - Instagram / TikTok / YouTube
   - Partage profils et Grade Reports
   - Lecteur Google Drive pour les vidéos
================================================== */

(() => {
  "use strict";

  const $ = (s, r = document) =>
    r.querySelector(s);

  const $$ = (s, r = document) =>
    [...r.querySelectorAll(s)];

  const cache = new Map();

  let coachesCache = null;
  let coachesAt = 0;
  let running = false;
  let pending = false;

  function el(tag, text = "", cls = "") {
    const e = document.createElement(tag);
    e.textContent = text;
    e.className = cls;
    return e;
  }

  function btn(text, callback) {
    const b = el("button", text, "eahp-btn");
    b.type = "button";
    b.addEventListener("click", callback);
    return b;
  }

  async function rpc(name, args) {
    const { data, error } =
      await requireSupabase().rpc(name, args);

    if (error) throw error;

    if (data?.ok === false) {
      throw Error(
        data.error ||
        data.message ||
        "Action refusée"
      );
    }

    return data;
  }

  function safeUrl(value) {
    try {
      const u = new URL(value, location.href);
      return u.protocol === "https:" ? u.href : "";
    } catch {
      return "";
    }
  }

  function publicUrl(eahId, club) {
    const u = new URL(
      location.origin + location.pathname
    );

    u.searchParams.set("id", eahId);

    if (club) {
      u.searchParams.set("club", club);
    }

    u.hash = "profil";

    // Aucun jeton NFC dans le partage.
    return u.href;
  }

  async function share(title, url) {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });

      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert("Lien copié");

      } else {
        prompt("Copier le lien :", url);
      }

    } catch (error) {
      if (error.name !== "AbortError") {
        alert(error.message);
      }
    }
  }

  /* ===============================================
     CERTIFICATION EAH
  =============================================== */

  function badge(target) {
    if (
      !target ||
      target.parentElement?.querySelector(
        ".eahp-badge"
      )
    ) {
      return;
    }

    const mark = el(
      "span",
      "✓",
      "eahp-badge"
    );

    mark.title = "Certifié EAH Diving";

    mark.setAttribute(
      "aria-label",
      "Certifié EAH Diving"
    );

    target.after(mark);
  }

  async function individualInfo(eahId) {
    const id = String(eahId).toUpperCase();

    if (!cache.has(id)) {
      cache.set(
        id,
        rpc(
          "eah_individual_social_public_v1",
          { p_eah_id: id }
        ).catch(error => {
          cache.delete(id);
          throw error;
        })
      );
    }

    return cache.get(id);
  }

  function networks(info, parent) {
    if (!info?.public) return;

    const platforms = [
      ["Instagram", info.instagram, "instagram.com"],
      ["TikTok", info.tiktok, "tiktok.com"],
      ["YouTube", info.youtube, "youtube.com"]
    ];

    for (const [name, value, domain] of platforms) {
      const href = safeUrl(value);

      if (!href) continue;

      const host = new URL(href)
        .hostname.toLowerCase();

      if (
        host !== domain &&
        !host.endsWith("." + domain)
      ) {
        continue;
      }

      const a = el("a", name, "eahp-btn");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      parent.append(a);
    }
  }

  /* ===============================================
     IDENTITÉ DU COMPTE CONNECTÉ
  =============================================== */

  function identity() {
    const store = sessionStorage;

    const mode = store.getItem(
      "EAH_SOCIAL_ACTIVE_ACCOUNT"
    );

    if (mode === "coach") {
      const token = store.getItem(
        "EAH_SOCIAL_COACH_TOKEN"
      );

      if (token) {
        return { p_coach_token: token };
      }
    }

    if (mode === "card") {
      try {
        const c = JSON.parse(
          store.getItem(
            "EAH_SOCIAL_VERIFIED_NFC"
          ) || "{}"
        );

        if (c.id && c.token?.length >= 48) {
          return {
            p_actor_eah_id: c.id,
            p_card_token: c.token
          };
        }
      } catch {}
    }

    if (mode === "diver") {
      try {
        const d = JSON.parse(
          store.getItem(
            "EAH_SOCIAL_DIVER_ACTOR"
          ) || "{}"
        );

        if (d.id && d.hash) {
          return {
            p_actor_eah_id: d.id,
            p_pin_hash: d.hash
          };
        }
      } catch {}
    }

    // Pour une session Supabase Auth,
    // le serveur vérifie auth.uid().
    return {};
  }

  function coachRpc(action, extra = {}) {
    return rpc(
      "eah_social_coach_v1",
      {
        p_action: action,
        ...(action === "PUBLIC" ? {} : identity()),
        ...extra
      }
    );
  }

  async function publicCoaches() {
    if (
      coachesCache &&
      Date.now() - coachesAt < 15000
    ) {
      return coachesCache;
    }

    coachesCache = await coachRpc("PUBLIC");
    coachesAt = Date.now();

    return coachesCache;
  }

  /* ===============================================
     POPULATION — BADGE ET PARTAGE
  =============================================== */

  async function population() {
    const root = $("#populationResults");

    if (!root) return;

    const cards = $$(
      "article.history-item",
      root
    ).filter(card =>
      $('a[href*="id="]', card)
    );

    for (const card of cards) {
      if (
        card.dataset.eahp === "ok" ||
        card.dataset.eahp === "pending"
      ) {
        continue;
      }

      const link = $('a[href*="id="]', card);
      const url = new URL(link.href, location.href);
      const id = url.searchParams.get("id");

      if (!id) continue;

      card.dataset.eahp = "pending";

      try {
        const info = await individualInfo(id);

        const group = el(
          "div",
          "",
          "eahp-actions"
        );

        if (info?.public) {
          if (info.certified) {
            badge($("h3", card));
            badge($("img", card));
          }

          networks(info, group);
        }

        group.append(
          btn("↗ Partager le profil", () =>
            share(
              "Profil EAH Diving",
              publicUrl(
                id,
                url.searchParams.get("club")
              )
            )
          )
        );

        card.append(group);
        card.dataset.eahp = "ok";

      } catch (error) {
        delete card.dataset.eahp;
        console.warn("EAH Population :", error);
      }
    }
  }

  /* ===============================================
     PROFIL PUBLIC COMPLET
  =============================================== */

  async function profile() {
    const view = $("#profileView");

    if (
      !view ||
      view.classList.contains("hidden")
    ) {
      return;
    }

    const hero = $(
      ".eah-fast-profile-top",
      view
    );

    if (!hero || hero.dataset.eahp) return;

    const st =
      typeof state !== "undefined"
        ? state
        : null;

    const id =
      st?.profile?.eahId ||
      st?.profile?.eah_id ||
      new URLSearchParams(
        location.search
      ).get("id");

    if (!id) return;

    hero.dataset.eahp = "pending";

    try {
      const info = await individualInfo(id);

      let isPublic = Boolean(info?.public);

      if (!isPublic) {
        const stats = await rpc(
          "eah_social_v2",
          {
            p_action: "PUBLIC",
            p_target_eah_id: id
          }
        );

        isPublic = Boolean(stats?.public);
      }

      if (isPublic) {
        const group = el(
          "div",
          "",
          "eahp-actions"
        );

        if (info?.public) {
          if (info.certified) {
            badge($("h1", hero));
            badge($("img", hero));
          }

          networks(info, group);
        }

        const club =
          st?.profile?.clubSlug ||
          st?.profile?.club_slug ||
          new URLSearchParams(
            location.search
          ).get("club") ||
          "";

        group.append(
          btn("↗ Partager mon profil", () =>
            share(
              "Profil EAH Diving",
              publicUrl(id, club)
            )
          )
        );

        hero.append(group);
      }

      hero.dataset.eahp = "ok";

    } catch (error) {
      delete hero.dataset.eahp;
      console.warn("Profil EAH :", error);
    }
  }

  /* ===============================================
     GRADE REPORTS ET VIDÉOS GOOGLE DRIVE
  =============================================== */

  function gradingLinks() {
    const links = $$(
      "#profileHistory a[href], " +
      "#coachPrivate a[href], " +
      "#eahDiverOnlyApp a[href]"
    );

    for (const a of links) {
      if (a.dataset.eahpShare) continue;

      const href = safeUrl(a.href);
      const label = (a.textContent || "").trim();

      if (!href) continue;

      if (
        /grade report/i.test(label) ||
        /\.pdf(?:[?#]|$)/i.test(href)
      ) {
        a.dataset.eahpShare = "1";

        a.after(
          btn("↗ Partager PDF", () =>
            share("EAH Grade Report", href)
          )
        );
      }

      if (
        /vid[eé]o/i.test(label) &&
        href.includes("drive.google.com/file/d/")
      ) {
        const match = href.match(
          /\/file\/d\/([A-Za-z0-9_-]{15,})/
        );

        if (
          match &&
          a.dataset.eahpVideo !== "1"
        ) {
          a.dataset.eahpVideo = "1";

          const play = btn(
            "▶ Voir la vidéo",
            () => {
              let frame = a.parentElement
                .querySelector(".eahp-preview");

              if (frame) {
                frame.remove();
                return;
              }

              frame = document.createElement(
                "iframe"
              );

              frame.className = "eahp-preview";

              frame.src =
                "https://drive.google.com/file/d/" +
                match[1] +
                "/preview";

              frame.loading = "lazy";
              frame.allow = "autoplay; fullscreen";
              frame.referrerPolicy = "no-referrer";
              frame.title = "Vidéo du plongeon";

              a.parentElement.append(frame);
            }
          );

          a.after(play);
        }
      }
    }
  }

  /* ===============================================
     COACHS PUBLICS — FOLLOW
  =============================================== */

  async function coachDirectory() {
    const root = $("#populationResults");

    if (!root) return;

    const data = await publicCoaches();

    let zone = $("#eahp-coaches");

    if (!zone) {
      zone = el(
        "section",
        "",
        "eahp-coaches"
      );

      zone.id = "eahp-coaches";
      root.after(zone);
    }

    const coaches = data?.coaches || [];

    const signature = coaches.map(
      c => c.id + ":" + c.followers
    ).join("|");

    if (zone.dataset.signature === signature) {
      return;
    }

    zone.dataset.signature = signature;
    zone.replaceChildren(
      el("h3", "Coachs EAH publics")
    );

    const all = el(
      "div",
      "",
      "eahp-grid"
    );

    zone.append(all);

    for (const coach of coaches) {
      const card = el(
        "article",
        "",
        "eahp-coach"
      );

      if (safeUrl(coach.photo_url)) {
        const photo = document.createElement(
          "img"
        );

        photo.src = safeUrl(coach.photo_url);
        photo.alt = "";
        photo.className = "eahp-photo";

        card.append(photo);
      }

      card.append(
        el("h4", coach.name || "Coach EAH"),
        el("p", coach.club_name || "")
      );

      const counter = el(
        "p",
        (coach.followers || 0) + " followers"
      );

      card.append(counter);

      const follow = btn(
        "＋ Follow",
        async () => {
          follow.disabled = true;

          try {
            const result = await coachRpc(
              "FOLLOW",
              {
                p_target_coach_id: coach.id
              }
            );

            counter.textContent =
              result.followers + " followers";

            follow.textContent =
              result.following
                ? "✓ Abonné"
                : "＋ Follow";

            coachesCache = null;
            zone.dataset.signature = "";

          } catch (error) {
            alert(error.message);

          } finally {
            follow.disabled = false;
          }
        }
      );

      card.append(follow);

      const link = new URL(
        location.origin + location.pathname
      );

      link.searchParams.set(
        "coach",
        coach.id
      );

      link.hash = "population";

      card.append(
        btn("↗ Partager", () =>
          share(
            "Coach EAH : " + coach.name,
            link.href
          )
        )
      );

      card.dataset.coachId = coach.id;

      all.append(card);
    }

    const sharedId = new URLSearchParams(
      location.search
    ).get("coach");

    if (sharedId) {
      const shared = $$(
        "article",
        all
      ).find(card =>
        card.dataset.coachId === sharedId
      );

      if (shared) {
        shared.style.borderColor = "#30cfff";
        shared.scrollIntoView({
          block: "center"
        });
      }
    }

    if (!coaches.length) {
      all.append(
        el(
          "p",
          "Aucun coach public pour le moment."
        )
      );
    }
  }

  /* ===============================================
     ESPACE PERSONNEL COACH
  =============================================== */

  async function coachPersonal() {
    const privateHost = $("#coachPrivate");
    const cardHost = $("#coachCardContent");

    let host = null;

    const cardApp = $("#eahCoachCardApp");

    if (
      cardHost &&
      cardApp &&
      !cardApp.classList.contains("eahs-hidden") &&
      $(".coach-stat-grid", cardHost)
    ) {
      host = cardHost;

    } else if (
      privateHost &&
      !privateHost.classList.contains("hidden") &&
      $(
        '#coachPrivate [data-eah-social-panel="auth"]'
      )
    ) {
      host = privateHost;
    }

    if (
      !host ||
      $("#eahp-coach-me", host)
    ) {
      return;
    }

    const box = el(
      "section",
      "",
      "eahp-coach"
    );

    box.id = "eahp-coach-me";

    box.append(
      el("h3", "Mon profil social Coach EAH")
    );

    const status = el(
      "p",
      "Chargement du profil coach…"
    );

    box.append(status);

    const toggle = btn(
      "Publier mon profil",
      () => {}
    );

    toggle.disabled = true;
    box.append(toggle);

    const info = el("div");
    box.append(info);

    host.prepend(box);

    try {
      const [me, activity] = await Promise.all([
        coachRpc("ME"),

        rpc(
          "eah_social_v2",
          {
            p_action: "ME",
            ...identity()
          }
        )
      ]);

      let published = Boolean(me.public);

      function draw() {
        status.textContent = published
          ? "Profil coach PUBLIC"
          : "Profil coach PRIVÉ";

        toggle.textContent = published
          ? "Rendre privé"
          : "Publier mon profil";
      }

      toggle.disabled = false;
      draw();

      toggle.onclick = async () => {
        toggle.disabled = true;

        try {
          const result = await coachRpc(
            "SET_PUBLIC",
            {
              p_public: !published
            }
          );

          published = Boolean(result.public);

          draw();
          coachesCache = null;

          $("#eahp-coaches")?.remove();
          schedule();

        } catch (error) {
          alert(error.message);

        } finally {
          toggle.disabled = false;
        }
      };

      const groups = [
        [
          "👥 Mes Followers",
          me.followers || [],
          item => item.name || "Membre EAH"
        ],

        [
          "✓ Je follow (coachs)",
          me.following || [],
          item => item.name || "Coach EAH"
        ],

        [
          "✓ Je follow (plongeurs)",
          activity.following || [],
          item => item.name || "Plongeur EAH"
        ],

        [
          "🔔 Notifications",
          activity.notifications || [],
          item =>
            (item.actor || "Membre EAH") +
            (
              item.kind === "FOLLOW"
                ? " suit ton profil"
                : " a aimé un grading"
            )
        ]
      ];

      info.replaceChildren(
        el(
          "p",
          (me.followers_count || 0) +
          " followers coach"
        )
      );

      for (const [title, items, format] of groups) {
        const details = document.createElement(
          "details"
        );

        details.append(
          el(
            "summary",
            title + " (" + items.length + ")"
          )
        );

        if (!items.length) {
          details.append(
            el("p", "Aucune activité")
          );

        } else {
          items.forEach(item =>
            details.append(
              el("p", format(item))
            )
          );
        }

        info.append(details);
      }

    } catch (error) {
      status.textContent =
        "Erreur : " + error.message;

      toggle.disabled = true;
    }
  }

  /* ===============================================
     INITIALISATION
  =============================================== */

  async function scan() {
    if (running) return;

    running = true;

    try {
      await Promise.allSettled([
        population(),
        profile(),
        coachDirectory(),
        coachPersonal()
      ]);

      gradingLinks();

    } finally {
      running = false;
    }
  }

  function schedule() {
    if (pending) return;

    pending = true;

    setTimeout(() => {
      pending = false;
      scan().catch(console.warn);
    }, 200);
  }

  const css = document.createElement("style");

  css.textContent = `
    .eahp-actions {
      display:flex;
      align-items:center;
      gap:8px;
      flex-wrap:wrap;
      margin:12px 0;
    }

    .eahp-btn {
      padding:8px 12px;
      background:#0b6bff;
      color:#fff!important;
      border:1px solid #30cfff;
      border-radius:10px;
      text-decoration:none;
      cursor:pointer;
      font:600 13px Arial;
    }

    .eahp-badge {
      display:inline-flex;
      vertical-align:middle;
      align-items:center;
      justify-content:center;
      width:23px;
      height:23px;
      border-radius:100%;
      background:#087eff;
      color:#fff;
      margin:0 8px;
      font-weight:900;
      border:2px solid white;
      box-shadow:0 0 0 2px #087eff;
    }

    .eahp-coaches,
    .eahp-coach {
      background:#08243e;
      border:1px solid #295674;
      border-radius:16px;
      color:#fff;
      padding:15px;
      margin:16px 0;
    }

    .eahp-grid {
      display:grid;
      grid-template-columns:
        repeat(auto-fit,minmax(190px,1fr));
      gap:12px;
    }

    .eahp-photo {
      width:72px;
      height:72px;
      object-fit:cover;
      border-radius:12px;
    }

    .eahp-coach details {
      padding:9px 0;
      border-top:1px solid #295674;
    }

    .eahp-preview {
      display:block;
      border:0;
      width:min(100%,560px);
      height:320px;
      margin:10px auto;
      border-radius:10px;
    }
  `;

  document.head.append(css);

  function init() {
    new MutationObserver(schedule).observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );

    schedule();
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

  window.addEventListener(
    "hashchange",
    schedule
  );

})();
