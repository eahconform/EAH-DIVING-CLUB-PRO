/* ============================================================
   EAH DIVING PRO
   PROFIL PLONGEUR SIMPLE

   - uniquement le profil
   - progression
   - historique
   - bouton Soumettre un plongeon
   - demande au Club ou à EAH Grading
============================================================ */

(() => {

  const params =
    new URLSearchParams(
      window.location.search
    );


  if (
    params.get(
      "coachToken"
    )
  ) {
    return;
  }


  let installed =
    false;


  /* =========================================================
     CSS
  ========================================================= */

  function installDiverCSS() {

    if (
      document.getElementById(
        "eahDiverOnlyCss"
      )
    ) {
      return;
    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "eahDiverOnlyCss";


    style.textContent = `

      #eahDiverOnlyApp {

        position: fixed !important;

        inset: 0 !important;

        z-index: 2147483000 !important;

        overflow-y: auto !important;

        background:
          linear-gradient(
            145deg,
            #03131f,
            #061e33
          );

        color: white;

        -webkit-overflow-scrolling: touch;

      }


      .eah-diver-only-shell {

        width: min(
          760px,
          calc(100% - 20px)
        );

        margin: 0 auto;

        padding:
          20px 0 70px;

      }


      .eah-diver-brand {

        margin-bottom: 15px;

        color: #30cfff;

        font-size: .8rem;

        font-weight: 900;

        letter-spacing: .16em;

      }


      #eahDiverOnlyApp
      #profileView {

        display: block !important;

        width: 100% !important;

        margin: 0 !important;

      }


      .eah-diver-request-box {

        box-sizing: border-box;

        width: 100%;

        margin-top: 20px;

        padding: 22px;

        border:
          1px solid
          rgba(143,205,255,.22);

        border-radius: 24px;

        background:
          rgba(5,23,42,.94);

      }


      .eah-diver-request-box h2 {

        margin-top: 0;

      }


      .eah-diver-main-button {

        width: 100%;

        min-height: 58px;

        border: 0;

        border-radius: 16px;

        background:
          linear-gradient(
            135deg,
            #0b6bff,
            #168dff
          );

        color: white;

        font-size: 16px;

        font-weight: 900;

      }


      #eahDiverRequestModal {

        position: fixed;

        inset: 0;

        z-index: 2147483647;

        overflow-y: auto;

        padding: 12px;

        background:
          rgba(1,9,18,.97);

      }


      .eah-diver-request-panel {

        box-sizing: border-box;

        width: 100%;

        max-width: 700px;

        margin:
          10px auto 70px;

        padding:
          22px;

        border-radius: 26px;

        background: #061e33;

      }


      .eah-diver-modal-top {

        display: flex;

        justify-content: space-between;

        align-items: flex-start;

        gap: 15px;

      }


      .eah-diver-close {

        width: 44px;

        height: 44px;

        border: 0;

        border-radius: 50%;

        font-size: 24px;

      }


      .eah-diver-form {

        display: grid;

        gap: 16px;

        margin-top: 22px;

      }


      .eah-diver-form label {

        display: grid;

        gap: 7px;

        color: #c3d8e8;

        font-weight: 700;

      }


      .eah-diver-form input,
      .eah-diver-form select,
      .eah-diver-form textarea {

        box-sizing: border-box;

        width: 100%;

        min-height: 54px;

        padding: 13px 14px;

        border:
          1px solid
          rgba(143,205,255,.22);

        border-radius: 14px;

        background: #10273a;

        color: white;

        font-size: 16px;

      }


      .eah-destination-button {

        width: 100%;

        min-height: 56px;

        border: 0;

        border-radius: 15px;

        background: #0b6bff;

        color: white;

        font-weight: 900;

      }


      .eah-destination-button.eah {

        border:
          1px solid
          rgba(48,207,255,.4);

        background:
          rgba(48,207,255,.10);

        color: #30cfff;

      }


      @media(max-width:600px) {

        .eah-diver-only-shell {

          width:
            calc(100% - 12px);

          padding-top: 8px;

        }


        .eah-diver-request-panel {

          padding:
            18px 14px;

          border-radius: 20px;

        }

      }

    `;


    document.head.appendChild(
      style
    );

  }



  /* =========================================================
     TROUVER LE PROFIL
  ========================================================= */

  function installDiverProfile() {

    if (installed) {
      return;
    }


    const profile =
      document.getElementById(
        "profileView"
      );


    if (
      !profile ||
      !profile.innerHTML.trim()
    ) {
      return;
    }


    const rect =
      profile.getBoundingClientRect();


    if (
      rect.width === 0
    ) {
      return;
    }


    installed =
      true;


    installDiverCSS();


    const app =
      document.createElement(
        "div"
      );


    app.id =
      "eahDiverOnlyApp";


    app.innerHTML = `

      <div class="eah-diver-only-shell">

        <div class="eah-diver-brand">
          EAH DIVING • ESPACE PERSONNEL
        </div>

        <div id="eahDiverProfileHost"></div>


        <section
          class="eah-diver-request-box"
        >

          <h2>
            Faire grader un plongeon
          </h2>

          <p>
            Envoie ta vidéo à ton Coach
            ou directement à EAH Grading.
          </p>

          <button
            id="openDiverGradingRequest"
            type="button"
            class="eah-diver-main-button"
          >
            Soumettre un plongeon
          </button>

        </section>

      </div>

    `;


    document.body.appendChild(
      app
    );


    document
      .getElementById(
        "eahDiverProfileHost"
      )
      .appendChild(
        profile
      );


    /*
      Tout le reste de l'espace Club est maintenant
      derrière ce plein écran et inaccessible.
    */


    document
      .getElementById(
        "openDiverGradingRequest"
      )
      .addEventListener(
        "click",
        openRequestForm
      );

  }



  /* =========================================================
     FORMULAIRE
  ========================================================= */

  function openRequestForm() {

    const app =
      document.getElementById(
        "eahDiverOnlyApp"
      );


    if (!app) {
      return;
    }


    document
      .getElementById(
        "eahDiverRequestModal"
      )
      ?.remove();


    const modal =
      document.createElement(
        "div"
      );


    modal.id =
      "eahDiverRequestModal";


    modal.innerHTML = `

      <div class="eah-diver-request-panel">

        <div class="eah-diver-modal-top">

          <div>

            <span
              style="
                color:#30cfff;
                font-weight:900;
              "
            >
              EAH GRADING
            </span>

            <h1>
              Soumettre un plongeon
            </h1>

          </div>


          <button
            id="closeDiverRequest"
            type="button"
            class="eah-diver-close"
          >
            ×
          </button>

        </div>


        <div class="eah-diver-form">


          <label>

            Discipline

            <select id="diverRequestDiscipline">

              <option value="Plongeon">
                Plongeon
              </option>

              <option value="High Diving">
                High Diving
              </option>

              <option value="Freestyle">
                Freestyle
              </option>

              <option value="Dods">
                Døds
              </option>

              <option value="Saut de l'ange">
                Saut de l'ange
              </option>

            </select>

          </label>


          <label>

            Code du plongeon

            <input
              id="diverRequestCode"
              placeholder="Ex : 107B"
              required
            >

          </label>


          <label>

            Nom du plongeon

            <input
              id="diverRequestName"
              placeholder="Optionnel"
            >

          </label>


          <label>

            Hauteur

            <input
              id="diverRequestHeight"
              type="number"
              step="0.1"
              placeholder="Ex : 10"
            >

          </label>


          <label>

            Type de hauteur

            <select
              id="diverRequestHeightType"
            >

              <option value="KNOWN">
                Hauteur connue
              </option>

              <option value="ESTIMATED">
                Hauteur estimée
              </option>

              <option value="UNKNOWN">
                Hauteur inconnue
              </option>

            </select>

          </label>


          <label>

            Lien de la vidéo

            <input
              id="diverRequestVideo"
              type="url"
              placeholder="https://..."
              required
            >

          </label>


          <label>

            Message pour l'évaluateur

            <textarea
              id="diverRequestMessage"
              rows="3"
              placeholder="Informations complémentaires..."
            ></textarea>

          </label>


          <button
            type="button"
            class="eah-destination-button"
            data-destination="CLUB"
          >
            Envoyer à mon Coach
          </button>


          <button
            type="button"
            class="eah-destination-button eah"
            data-destination="EAH"
          >
            Envoyer à EAH Grading
          </button>


          <div id="diverRequestResult"></div>

        </div>

      </div>

    `;


    app.appendChild(
      modal
    );


    document
      .getElementById(
        "closeDiverRequest"
      )
      .onclick =
        () =>
          modal.remove();


    modal
      .querySelectorAll(
        "[data-destination]"
      )
      .forEach(
        button => {

          button.addEventListener(

            "click",

            () =>
              submitRequest(
                button.dataset.destination,
                button
              )

          );

        }
      );

  }



  /* =========================================================
     IDENTITE PLONGEUR
  ========================================================= */

  function getSession() {

    let clubSlug =
      String(
        params.get(
          "club"
        ) || ""
      );


    let eahId =
      String(
        params.get(
          "id"
        ) || ""
      );


    let token =
      String(
        params.get(
          "token"
        ) || ""
      );


    let pinHash =
      "";


    try {

      if (
        typeof state !==
        "undefined"
      ) {

        clubSlug =
          clubSlug
          ||
          state.club?.slug
          ||
          state.profile?.club_slug
          ||
          state.profile?.clubSlug
          ||
          "";


        eahId =
          eahId
          ||
          state.profile?.eah_id
          ||
          state.profile?.eahId
          ||
          "";


        pinHash =
          state.diverPinHash
          ||
          "";

      }

    } catch (_) {}


    return {

      clubSlug,
      eahId,
      token,
      pinHash

    };

  }



  /* =========================================================
     ENVOI
  ========================================================= */

  async function submitRequest(
    destination,
    button
  ) {

    const session =
      getSession();


    const result =
      document.getElementById(
        "diverRequestResult"
      );


    const code =
      document
        .getElementById(
          "diverRequestCode"
        )
        .value
        .trim()
        .toUpperCase();


    const videoUrl =
      document
        .getElementById(
          "diverRequestVideo"
        )
        .value
        .trim();


    if (
      !code ||
      !videoUrl
    ) {

      result.innerHTML = `

        <div
          style="
            margin-top:12px;
            padding:14px;
            border-radius:14px;
            background:rgba(224,82,94,.15);
          "
        >
          Code du plongeon et vidéo obligatoires.
        </div>

      `;

      return;

    }


    button.disabled =
      true;


    const original =
      button.textContent;


    button.textContent =
      "Envoi…";


    try {

      const {
        data,
        error
      } =
        await requireSupabase()
          .rpc(

            "submit_diver_grading_request",

            {

              p_club_slug:
                session.clubSlug,

              p_eah_id:
                session.eahId,

              p_token:
                session.token,

              p_pin_hash:
                session.pinHash,

              p_destination:
                destination,

              p_payload: {

                discipline:
                  document
                    .getElementById(
                      "diverRequestDiscipline"
                    )
                    .value,

                diveCode:
                  code,

                diveName:
                  document
                    .getElementById(
                      "diverRequestName"
                    )
                    .value
                    .trim(),

                height:
                  document
                    .getElementById(
                      "diverRequestHeight"
                    )
                    .value,

                heightType:
                  document
                    .getElementById(
                      "diverRequestHeightType"
                    )
                    .value,

                videoUrl:
                  videoUrl,

                message:
                  document
                    .getElementById(
                      "diverRequestMessage"
                    )
                    .value
                    .trim()

              }

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
          "Impossible d'envoyer la demande."
        );

      }


      result.innerHTML = `

        <div
          style="
            margin-top:12px;
            padding:15px;
            border-radius:14px;
            background:rgba(24,185,120,.15);
          "
        >

          <strong>
            Demande envoyée.
          </strong>

          <br>

          ${
            destination ===
            "CLUB"
            ?
            "Ton Coach recevra cette demande."
            :
            "Demande envoyée à EAH Grading."
          }

          ${
            data.requestCode
            ?
            `
              <br>
              Référence :
              ${escapeHTML(
                data.requestCode
              )}
            `
            :
            ""
          }

        </div>

      `;


    } catch(error) {

      button.disabled =
        false;


      button.textContent =
        original;


      result.innerHTML = `

        <div
          style="
            margin-top:12px;
            padding:15px;
            border-radius:14px;
            background:rgba(224,82,94,.15);
          "
        >

          ${escapeHTML(
            error.message ||
            "Erreur d'envoi."
          )}

        </div>

      `;

    }

  }



  function escapeHTML(
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



  /* =========================================================
     ATTENDRE LE CHARGEMENT DU PROFIL
  ========================================================= */

  const observer =
    new MutationObserver(
      installDiverProfile
    );


  observer.observe(

    document.body,

    {
      childList: true,
      subtree: true
    }

  );


  setTimeout(
    installDiverProfile,
    400
  );


  setTimeout(
    installDiverProfile,
    1000
  );

})();
