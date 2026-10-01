/* ============================================================
   EAH DIVING PRO
   COACH CARD UI FINAL
   Mobile / Tablette / Ordinateur
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


  /* =========================================================
     DEMARRAGE
  ========================================================= */

  async function startCoachCardEAH() {

    document.documentElement.classList.add(
      "eah-coach-card-mode"
    );

    document.body.classList.add(
      "eah-coach-card-mode"
    );

    installCoachCardStyle();

    const root =
      document.createElement(
        "div"
      );

    root.id =
      "eahCoachCardApp";

    root.innerHTML = `

      <main class="coach-card-screen">

        <div class="coach-card-container">

          <section
            id="coachCardContent"
            class="coach-card-panel"
          >

            <div class="coach-card-loading">

              <div class="coach-loader"></div>

              <strong>
                Ouverture de l'espace Coach…
              </strong>

            </div>

          </section>

        </div>

      </main>

    `;

    document.body.appendChild(
      root
    );


    await loadCoachCardEAH();

  }


  /* =========================================================
     SUPABASE
  ========================================================= */

  async function loadCoachCardEAH() {

    const content =
      document.getElementById(
        "coachCardContent"
      );

    try {

      const sb =
        requireSupabase();


      const {
        data,
        error
      } =
        await sb.rpc(

          "eah_coach_card_workspace",

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

        throw new Error(
          data?.error ||
          "Carte Coach inconnue."
        );

      }


      if (
        data.assigned === false
      ) {

        renderCoachActivation(
          data
        );

        return;

      }


      renderCoachWorkspace(
        data
      );


    } catch(error) {

      content.innerHTML = `

        <div class="coach-card-error">

          <span class="coach-overline">
            CARTE COACH EAH
          </span>

          <h1>
            Impossible d'ouvrir cette carte
          </h1>

          <p>
            ${escapeCoach(
              error.message ||
              "Erreur inconnue."
            )}
          </p>

        </div>

      `;

    }

  }


  /* =========================================================
     PREMIER SCAN
  ========================================================= */

  function renderCoachActivation(
    data
  ) {

    const content =
      document.getElementById(
        "coachCardContent"
      );

    const club =
      data.club || {};

    const slot =
      data.card?.slot || "—";


    content.innerHTML = `

      <div class="coach-card-header">

        <div class="coach-logo-box">

          ${
            club.logoUrl
            ?
            `
              <img
                src="${escapeCoach(
                  club.logoUrl
                )}"
                alt=""
              >
            `
            :
            `
              <div class="coach-logo-fallback">
                EAH
              </div>
            `
          }

        </div>


        <div>

          <span class="coach-overline">
            PREMIÈRE ACTIVATION
          </span>

          <h1>
            Carte Coach n°${escapeCoach(slot)}
          </h1>

          <p class="coach-club-name">
            ${escapeCoach(
              club.name ||
              "EAH Diving"
            )}
          </p>

        </div>

      </div>


      <div class="coach-info-box">

        Cette carte n'est pas encore attribuée.

        <br>

        Configure ton profil Coach une seule fois.
        Les prochains scans ouvriront directement ton espace.

      </div>


      <form
        id="coachActivationForm"
        class="coach-form"
      >

        <label>

          <span>
            Nom et prénom
          </span>

          <input
            id="coachActivationName"
            type="text"
            autocomplete="name"
            placeholder="Ex : Emeric Goin"
            required
          >

        </label>


        <label>

          <span>
            Adresse e-mail
          </span>

          <input
            id="coachActivationEmail"
            type="email"
            autocomplete="email"
            placeholder="coach@email.fr"
            required
          >

        </label>


        <label>

          <span>
            Fonction
          </span>

          <select
            id="coachActivationRole"
          >

            <option value="COACH">
              Coach
            </option>

            <option value="RESPONSABLE">
              Responsable
            </option>

            <option value="ADMIN">
              Administrateur
            </option>

          </select>

        </label>


        <button
          id="coachActivationButton"
          class="coach-main-button"
          type="submit"
        >
          Activer mon espace Coach
        </button>


        <div
          id="coachActivationMessage"
        ></div>

      </form>

    `;


    document
      .getElementById(
        "coachActivationForm"
      )
      .addEventListener(

        "submit",

        activateCoachCardEAH

      );

  }


  /* =========================================================
     ACTIVATION
  ========================================================= */

  async function activateCoachCardEAH(
    event
  ) {

    event.preventDefault();


    const name =
      document
        .getElementById(
          "coachActivationName"
        )
        .value
        .trim();


    const email =
      document
        .getElementById(
          "coachActivationEmail"
        )
        .value
        .trim()
        .toLowerCase();


    const role =
      document
        .getElementById(
          "coachActivationRole"
        )
        .value;


    const button =
      document.getElementById(
        "coachActivationButton"
      );


    const message =
      document.getElementById(
        "coachActivationMessage"
      );


    if (
      !name ||
      !email
    ) {

      message.innerHTML = `

        <div class="coach-message error">
          Nom et adresse e-mail obligatoires.
        </div>

      `;

      return;

    }


    button.disabled =
      true;

    button.textContent =
      "Activation en cours…";


    try {

      const {
        data,
        error
      } =
        await requireSupabase()
          .rpc(

            "eah_activate_coach_card",

            {

              p_token:
                coachToken,

              p_name:
                name,

              p_email:
                email,

              p_role:
                role

            }

          );


      if (error) {
        throw error;
      }


      if (
        !data ||
        data.ok === false
      ) {

        throw new Error(
          data?.error ||
          "Activation impossible."
        );

      }


      message.innerHTML = `

        <div class="coach-message success">

          <strong>
            Carte Coach activée.
          </strong>

          <br>

          Bienvenue ${escapeCoach(name)}.

        </div>

      `;


      setTimeout(
        loadCoachCardEAH,
        500
      );


    } catch(error) {

      button.disabled =
        false;

      button.textContent =
        "Activer mon espace Coach";


      message.innerHTML = `

        <div class="coach-message error">

          ${escapeCoach(
            error.message ||
            "Activation impossible."
          )}

        </div>

      `;

    }

  }


  /* =========================================================
     ESPACE COACH APRES ACTIVATION
  ========================================================= */

  function renderCoachWorkspace(
    data
  ) {

    const content =
      document.getElementById(
        "coachCardContent"
      );

    const coach =
      data.coach || {};

    const club =
      data.club || {};

    const divers =
      data.divers || [];

    const requests =
      data.gradingRequests || [];

    const availableCards =
      data.availableCards || [];


    const pending =
      requests.filter(
        item =>
          String(
            item.status || ""
          ).toUpperCase()
          ===
          "PENDING"
      ).length;


    content.innerHTML = `

      <div class="coach-card-header">

        <div class="coach-logo-box">

          ${
            club.logoUrl
            ?
            `
              <img
                src="${escapeCoach(
                  club.logoUrl
                )}"
                alt=""
              >
            `
            :
            `
              <div class="coach-logo-fallback">
                EAH
              </div>
            `
          }

        </div>


        <div>

          <span class="coach-overline">
            ESPACE COACH EAH
          </span>

          <h1>
            Bienvenue ${escapeCoach(
              coach.name ||
              "Coach"
            )}
          </h1>

          <p class="coach-club-name">

            ${escapeCoach(
              club.name || ""
            )}

            ${
              coach.role
              ?
              " • "
              +
              escapeCoach(
                coach.role
              )
              :
              ""
            }

          </p>

        </div>

      </div>


      <div class="coach-stat-grid">

        <article>

          <span>
            PLONGEURS
          </span>

          <strong>
            ${divers.length}
          </strong>

        </article>


        <article>

          <span>
            CARTES DISPONIBLES
          </span>

          <strong>
            ${availableCards.length}
          </strong>

        </article>


        <article>

          <span>
            DEMANDES
          </span>

          <strong>
            ${pending}
          </strong>

        </article>

      </div>


      <div class="coach-section">

        <h2>
          Demandes de grading
        </h2>

        ${
          requests.length
          ?
          requests.map(
            request => `

              <article class="coach-list-card">

                <div>

                  <small>
                    ${escapeCoach(
                      request.requestCode || ""
                    )}
                  </small>

                  <h3>

                    ${escapeCoach(
                      `${request.firstName || ""} ${request.lastName || ""}`.trim()
                    )}

                  </h3>

                  <p>

                    ${escapeCoach(
                      request.diveCode || ""
                    )}

                    ${
                      request.height
                      ?
                      ` • ${escapeCoach(
                        request.height
                      )} m`
                      :
                      ""
                    }

                  </p>

                </div>


                ${
                  request.videoUrl
                  ?
                  `
                    <a
                      href="${escapeCoach(
                        request.videoUrl
                      )}"
                      target="_blank"
                      rel="noopener"
                    >
                      Voir la vidéo
                    </a>
                  `
                  :
                  ""
                }

              </article>

            `
          )
          .join("")
          :
          `
            <div class="coach-empty">
              Aucune demande pour le moment.
            </div>
          `
        }

      </div>


      <div class="coach-section">

        <h2>
          Mes plongeurs
        </h2>

        ${
          divers.length
          ?
          divers.map(
            diver => `

              <article class="coach-list-card">

                <div>

                  <h3>

                    ${escapeCoach(
                      `${diver.firstName || ""} ${diver.lastName || ""}`.trim()
                    )}

                  </h3>

                  <p>

                    ${escapeCoach(
                      diver.eahId || ""
                    )}

                    ${
                      diver.group
                      ?
                      ` • ${escapeCoach(
                        diver.group
                      )}`
                      :
                      ""
                    }

                  </p>

                </div>

              </article>

            `
          )
          .join("")
          :
          `
            <div class="coach-empty">
              Aucun plongeur attribué.
            </div>
          `
        }

      </div>

    `;

  }


  /* =========================================================
     CSS RESPONSIVE
  ========================================================= */

  function installCoachCardStyle() {

    if (
      document.getElementById(
        "coachCardFinalCss"
      )
    ) {
      return;
    }


    const style =
      document.createElement(
        "style"
      );

    style.id =
      "coachCardFinalCss";


    style.textContent = `

      html.eah-coach-card-mode,
      body.eah-coach-card-mode {
        margin: 0 !important;
        padding: 0 !important;
        min-height: 100% !important;
        overflow: hidden !important;
      }


      body.eah-coach-card-mode > *:not(#eahCoachCardApp) {
        visibility: hidden !important;
        pointer-events: none !important;
      }


      #eahCoachCardApp {
        visibility: visible !important;
        pointer-events: auto !important;

        position: fixed !important;

        inset: 0 !important;

        z-index: 2147483647 !important;

        width: 100vw !important;

        height: 100dvh !important;

        overflow-y: auto !important;

        overscroll-behavior: contain;

        background:
          radial-gradient(
            circle at 80% 10%,
            rgba(11,107,255,.18),
            transparent 36%
          ),
          linear-gradient(
            145deg,
            #03131f,
            #061e33
          );

        color: #f5f9ff;

        -webkit-overflow-scrolling: touch;

      }


      .coach-card-screen {
        min-height: 100dvh;

        box-sizing: border-box;

        padding:
          max(
            18px,
            env(safe-area-inset-top)
          )
          14px
          max(
            40px,
            env(safe-area-inset-bottom)
          );
      }


      .coach-card-container {
        width: 100%;

        max-width: 900px;

        margin: 0 auto;
      }


      .coach-card-panel {
        box-sizing: border-box;

        width: 100%;

        padding:
          clamp(
            22px,
            5vw,
            52px
          );

        border:
          1px solid
          rgba(143,205,255,.22);

        border-radius:
          30px;

        background:
          rgba(5,23,42,.94);

        box-shadow:
          0 30px 90px
          rgba(0,0,0,.38);
      }


      .coach-card-header {
        display: flex;

        align-items: center;

        gap: 22px;

        margin-bottom: 28px;
      }


      .coach-logo-box {
        width: 82px;
        height: 82px;

        flex: 0 0 82px;

        overflow: hidden;

        border-radius: 20px;

        background:
          #061e33;

        border:
          1px solid
          rgba(48,207,255,.25);
      }


      .coach-logo-box img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }


      .coach-logo-fallback {
        display: grid;

        width: 100%;
        height: 100%;

        place-items: center;

        font-weight: 900;

        color: #30cfff;
      }


      .coach-overline {
        display: block;

        margin-bottom: 7px;

        color: #30cfff;

        font-size: .76rem;

        font-weight: 900;

        letter-spacing: .14em;
      }


      .coach-card-panel h1 {
        margin: 0;

        color: white;

        font-size:
          clamp(
            1.8rem,
            6vw,
            3.7rem
          );

        line-height: 1.05;
      }


      .coach-club-name {
        margin: 8px 0 0;

        color: #9eb7ca;
      }


      .coach-info-box,
      .coach-empty {
        padding: 18px;

        border:
          1px solid
          rgba(48,207,255,.18);

        border-radius: 18px;

        background:
          rgba(11,42,72,.5);

        color: #c3d8e8;

        line-height: 1.55;
      }


      .coach-form {
        display: grid;

        gap: 19px;

        margin-top: 25px;
      }


      .coach-form label {
        display: grid;

        gap: 8px;

        min-width: 0;

        color: #c3d8e8;

        font-weight: 700;
      }


      .coach-form input,
      .coach-form select {
        appearance: none;

        box-sizing: border-box;

        width: 100%;

        min-width: 0;

        min-height: 56px;

        padding: 14px 16px;

        border:
          1px solid
          rgba(143,205,255,.22);

        border-radius: 16px;

        outline: none;

        background: #10273a;

        color: #fff;

        font-size: 16px;
      }


      .coach-main-button {
        width: 100%;

        min-height: 56px;

        margin-top: 4px;

        border: 0;

        border-radius: 16px;

        background:
          linear-gradient(
            135deg,
            #0b6bff,
            #168dff
          );

        color: white;

        font-size: 1rem;

        font-weight: 900;
      }


      .coach-main-button:disabled {
        opacity: .65;
      }


      .coach-message {
        padding: 16px;

        border-radius: 16px;

        line-height: 1.45;
      }


      .coach-message.success {
        border:
          1px solid
          rgba(24,185,120,.5);

        background:
          rgba(24,185,120,.13);

        color: #caffea;
      }


      .coach-message.error,
      .coach-card-error {
        border:
          1px solid
          rgba(224,82,94,.5);

        background:
          rgba(224,82,94,.13);

        color: #ffd8dc;
      }


      .coach-stat-grid {
        display: grid;

        grid-template-columns:
          repeat(3, minmax(0,1fr));

        gap: 12px;

        margin: 28px 0;
      }


      .coach-stat-grid article {
        padding: 18px;

        border:
          1px solid
          rgba(143,205,255,.15);

        border-radius: 18px;

        background:
          rgba(11,42,72,.55);
      }


      .coach-stat-grid span {
        display: block;

        color: #8fa8bc;

        font-size: .72rem;

        font-weight: 800;
      }


      .coach-stat-grid strong {
        display: block;

        margin-top: 8px;

        font-size: 2rem;
      }


      .coach-section {
        margin-top: 30px;
      }


      .coach-section h2 {
        margin-bottom: 14px;
      }


      .coach-list-card {
        display: flex;

        align-items: center;

        justify-content: space-between;

        gap: 15px;

        margin-top: 10px;

        padding: 16px;

        border:
          1px solid
          rgba(143,205,255,.14);

        border-radius: 18px;

        background:
          rgba(3,19,31,.45);
      }


      .coach-list-card h3 {
        margin: 4px 0;
      }


      .coach-list-card p,
      .coach-list-card small {
        margin: 0;

        color: #9eb7ca;
      }


      .coach-list-card a {
        flex: 0 0 auto;

        padding: 11px 14px;

        border-radius: 12px;

        background: #0b6bff;

        color: white;

        text-decoration: none;

        font-weight: 800;
      }


      .coach-card-loading {
        display: grid;

        min-height: 260px;

        place-items: center;

        align-content: center;

        gap: 18px;

        text-align: center;
      }


      .coach-loader {
        width: 36px;
        height: 36px;

        border:
          4px solid
          rgba(255,255,255,.15);

        border-top-color:
          #30cfff;

        border-radius: 50%;

        animation:
          coachSpin .7s linear infinite;
      }


      @keyframes coachSpin {
        to {
          transform: rotate(360deg);
        }
      }


      /* =====================================================
         TELEPHONE
      ===================================================== */

      @media (max-width: 600px) {

        .coach-card-screen {
          padding:
            max(
              10px,
              env(safe-area-inset-top)
            )
            10px
            max(
              28px,
              env(safe-area-inset-bottom)
            );
        }


        .coach-card-panel {
          padding: 20px 16px;

          border-radius: 22px;
        }


        .coach-card-header {
          display: grid;

          justify-items: center;

          gap: 15px;

          text-align: center;
        }


        .coach-logo-box {
          width: 76px;
          height: 76px;

          flex-basis: 76px;
        }


        .coach-card-panel h1 {
          font-size:
            clamp(
              1.75rem,
              9vw,
              2.6rem
            );
        }


        .coach-stat-grid {
          grid-template-columns: 1fr;
        }


        .coach-list-card {
          align-items: stretch;

          flex-direction: column;
        }


        .coach-list-card a {
          width: 100%;

          box-sizing: border-box;

          text-align: center;
        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  function escapeCoach(
    value
  ) {

    return String(
      value ?? ""
    )
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      startCoachCardEAH,
      {
        once: true
      }
    );

  } else {

    startCoachCardEAH();

  }

})();
