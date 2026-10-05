'use strict';


/* ============================================================
   EAH DIVING PRO
   DIVER-PROFILE.JS
   VERSION 2.1
   05/10/2026

   - profil personnel
   - profil public lecture seule
   - accès NFC
   - accès EAH ID + PIN
   - progression
   - historique
   - demande Club
   - demande EAH Grading
============================================================ */

(() => {

  const params =
    new URLSearchParams(
      window.location.search
    );


  if (
    params.get(
      'coachToken'
    )
  ) {

    return;

  }


  let installed =
    false;



  /* ==========================================================
     SESSION
  ========================================================== */

  function getStoredPinSession() {

    try {

      const raw =
        sessionStorage.getItem(
          'EAH_DIVER_PIN_SESSION'
        );


      if (!raw) {

        return null;

      }


      const data =
        JSON.parse(
          raw
        );


      if (
        !data ||
        !data.eahId ||
        !data.pinHash
      ) {

        return null;

      }


      return data;


    } catch (_) {

      return null;

    }

  }



  function getSession() {

    let clubSlug =
      String(
        params.get(
          'club'
        )
        ||
        ''
      )
      .trim();


    let eahId =
      String(
        params.get(
          'id'
        )
        ||
        ''
      )
      .trim()
      .toUpperCase();


    let token =
      String(
        params.get(
          'token'
        )
        ||
        ''
      )
      .trim();


    let pinHash =
      '';


    try {

      if (
        typeof state !==
        'undefined'
      ) {

        clubSlug =
          clubSlug
          ||
          state.club?.slug
          ||
          state.profile?.clubSlug
          ||
          state.profile?.club_slug
          ||
          '';


        eahId =
          eahId
          ||
          state.profile?.eahId
          ||
          state.profile?.eah_id
          ||
          '';


        pinHash =
          state.diverPinHash
          ||
          '';

      }

    } catch (_) {}


    const stored =
      getStoredPinSession();


    if (
      stored &&
      String(
        stored.eahId
      )
      .toUpperCase() ===
      String(
        eahId
      )
      .toUpperCase()
    ) {

      pinHash =
        pinHash
        ||
        stored.pinHash
        ||
        '';


      clubSlug =
        clubSlug
        ||
        stored.clubSlug
        ||
        '';

    }


    return {

      clubSlug:

        String(
          clubSlug ||
          ''
        )
        .trim(),


      eahId:

        String(
          eahId ||
          ''
        )
        .trim()
        .toUpperCase(),


      token:

        String(
          token ||
          ''
        )
        .trim(),


      pinHash:

        String(
          pinHash ||
          ''
        )
        .trim()

    };

  }



  function hasPrivateAccess() {

    const session =
      getSession();


    return Boolean(

      session.eahId

      &&

      (
        session.token
        ||
        session.pinHash
      )

    );

  }



  function pinIsStillPreparing() {

    try {

      return Boolean(

        sessionStorage.getItem(
          'EAH_DIVER_PIN_PENDING'
        )

      );

    } catch (_) {

      return false;

    }

  }



  /* ==========================================================
     CSS
  ========================================================== */

  function installCSS() {

    if (
      document.getElementById(
        'eahDiverOnlyCss'
      )
    ) {

      return;

    }


    const style =
      document.createElement(
        'style'
      );


    style.id =
      'eahDiverOnlyCss';


    style.textContent = `

      #eahDiverOnlyApp {

        position:
          fixed !important;

        inset:
          0 !important;

        z-index:
          2147483000 !important;

        overflow-y:
          auto !important;

        background:
          radial-gradient(
            circle at 50% 0%,
            rgba(
              11,
              107,
              255,
              .14
            ),
            transparent 42%
          ),
          linear-gradient(
            145deg,
            #03131f,
            #061e33
          );

        color:
          white;

        -webkit-overflow-scrolling:
          touch;

      }


      .eah-diver-only-shell {

        width:
          min(
            820px,
            calc(
              100% - 24px
            )
          );

        margin:
          0 auto;

        padding:
          22px 0 80px;

      }


      .eah-diver-brand {

        margin:
          4px 4px 15px;

        color:
          #30cfff;

        font-size:
          .78rem;

        font-weight:
          900;

        letter-spacing:
          .16em;

      }


      #eahDiverOnlyApp
      #profileView {

        display:
          block !important;

        width:
          100% !important;

        margin:
          0 !important;

      }


      .eah-diver-public-info,
      .eah-diver-request-box {

        box-sizing:
          border-box;

        width:
          100%;

        margin-top:
          20px;

        padding:
          22px;

        border:
          1px solid
          rgba(
            143,
            205,
            255,
            .22
          );

        border-radius:
          24px;

        background:
          rgba(
            5,
            23,
            42,
            .94
          );

        box-shadow:
          0 20px 60px
          rgba(
            0,
            0,
            0,
            .18
          );

      }


      .eah-diver-public-info h2,
      .eah-diver-request-box h2 {

        margin-top:
          0;

      }


      .eah-diver-main-button {

        width:
          100%;

        min-height:
          58px;

        margin-top:
          5px;

        border:
          0;

        border-radius:
          16px;

        background:
          linear-gradient(
            135deg,
            #0b6bff,
            #168dff
          );

        color:
          white;

        font-size:
          16px;

        font-weight:
          900;

        cursor:
          pointer;

      }


      .eah-diver-main-button:hover {

        filter:
          brightness(
            1.08
          );

      }


      #eahDiverRequestModal {

        position:
          fixed;

        inset:
          0;

        z-index:
          2147483647;

        overflow-y:
          auto;

        padding:
          12px;

        background:
          rgba(
            1,
            9,
            18,
            .97
          );

        -webkit-overflow-scrolling:
          touch;

      }


      .eah-diver-request-panel {

        box-sizing:
          border-box;

        width:
          100%;

        max-width:
          700px;

        margin:
          10px auto 70px;

        padding:
          22px;

        border:
          1px solid
          rgba(
            143,
            205,
            255,
            .20
          );

        border-radius:
          26px;

        background:
          #061e33;

        box-shadow:
          0 30px 100px
          rgba(
            0,
            0,
            0,
            .45
          );

      }


      .eah-diver-modal-top {

        display:
          flex;

        justify-content:
          space-between;

        align-items:
          flex-start;

        gap:
          15px;

      }


      .eah-diver-modal-top h1 {

        margin:
          7px 0 0;

      }


      .eah-diver-close {

        width:
          44px;

        height:
          44px;

        flex:
          0 0 auto;

        border:
          1px solid
          rgba(
            255,
            255,
            255,
            .14
          );

        border-radius:
          50%;

        background:
          rgba(
            255,
            255,
            255,
            .08
          );

        color:
          white;

        font-size:
          24px;

        cursor:
          pointer;

      }


      .eah-diver-form {

        display:
          grid;

        gap:
          16px;

        margin-top:
          22px;

      }


      .eah-diver-form label {

        display:
          grid;

        gap:
          7px;

        color:
          #c3d8e8;

        font-weight:
          700;

      }


      .eah-diver-form input,
      .eah-diver-form select,
      .eah-diver-form textarea {

        box-sizing:
          border-box;

        width:
          100%;

        min-height:
          54px;

        padding:
          13px 14px;

        border:
          1px solid
          rgba(
            143,
            205,
            255,
            .22
          );

        border-radius:
          14px;

        outline:
          none;

        background:
          #10273a;

        color:
          white;

        font-size:
          16px;

      }


      .eah-diver-form input:focus,
      .eah-diver-form select:focus,
      .eah-diver-form textarea:focus {

        border-color:
          rgba(
            48,
            207,
            255,
            .70
          );

        box-shadow:
          0 0 0 3px
          rgba(
            48,
            207,
            255,
            .08
          );

      }


      .eah-destination-button {

        width:
          100%;

        min-height:
          56px;

        border:
          0;

        border-radius:
          15px;

        background:
          #0b6bff;

        color:
          white;

        font-weight:
          900;

        cursor:
          pointer;

      }


      .eah-destination-button.eah {

        border:
          1px solid
          rgba(
            48,
            207,
            255,
            .4
          );

        background:
          rgba(
            48,
            207,
            255,
            .10
          );

        color:
          #30cfff;

      }


      .eah-destination-button:disabled {

        opacity:
          .55;

        cursor:
          wait;

      }


      .eah-diver-success {

        margin-top:
          12px;

        padding:
          15px;

        border-radius:
          14px;

        border:
          1px solid
          rgba(
            24,
            185,
            120,
            .25
          );

        background:
          rgba(
            24,
            185,
            120,
            .15
          );

      }


      .eah-diver-error {

        margin-top:
          12px;

        padding:
          15px;

        border-radius:
          14px;

        border:
          1px solid
          rgba(
            224,
            82,
            94,
            .25
          );

        background:
          rgba(
            224,
            82,
            94,
            .15
          );

      }


      @media(
        max-width:
        600px
      ) {

        .eah-diver-only-shell {

          width:
            calc(
              100% - 12px
            );

          padding-top:
            8px;

        }


        .eah-diver-request-panel {

          margin-top:
            0;

          padding:
            18px 14px;

          border-radius:
            20px;

        }


        .eah-diver-public-info,
        .eah-diver-request-box {

          padding:
            18px 15px;

          border-radius:
            20px;

        }

      }

    `;


    document.head
      .appendChild(
        style
      );

  }



  /* ==========================================================
     INSTALLATION PROFIL
  ========================================================== */

  function installProfile() {

    if (installed) {

      return;

    }


    /*
      Lors d'une connexion PIN,
      on attend quelques millisecondes
      que le hash soit disponible.
    */

    if (
      pinIsStillPreparing()
    ) {

      return;

    }


    const profile =
      document.getElementById(
        'profileView'
      );


    if (
      !profile ||
      !profile.innerHTML.trim()
    ) {

      return;

    }


    const rect =
      profile
        .getBoundingClientRect();


    if (
      rect.width ===
      0
    ) {

      return;

    }


    installed =
      true;


    installCSS();


    const privateAccess =
      hasPrivateAccess();


    const app =
      document.createElement(
        'div'
      );


    app.id =
      'eahDiverOnlyApp';


    app.innerHTML = `

      <div class="eah-diver-only-shell">

        <div class="eah-diver-brand">

          EAH DIVING

          ${
            privateAccess
            ?
            ' • ESPACE PERSONNEL'
            :
            ' • PROFIL PUBLIC'
          }

        </div>


        <div
          id="eahDiverProfileHost"
        ></div>


        ${
          privateAccess
          ?
          `

            <section
              class="eah-diver-request-box"
            >

              <h2>
                Faire grader un plongeon
              </h2>


              <p>

                Envoie une vidéo de ton plongeon
                à ton Coach ou directement
                à EAH Grading.

              </p>


              <button
                id="openDiverGradingRequest"
                type="button"
                class="eah-diver-main-button"
              >
                Soumettre un plongeon
              </button>

            </section>

          `
          :
          `

            <section
              class="eah-diver-public-info"
            >

              <h2>
                Profil public EAH
              </h2>


              <p>

                Cette page présente uniquement
                les informations publiques
                de ce plongeur.

              </p>

            </section>

          `
        }

      </div>

    `;


    document.body
      .appendChild(
        app
      );


    document
      .getElementById(
        'eahDiverProfileHost'
      )
      ?.appendChild(
        profile
      );


    if (
      privateAccess
    ) {

      document
        .getElementById(
          'openDiverGradingRequest'
        )
        ?.addEventListener(

          'click',

          openRequestForm

        );

    }

  }



  /* ==========================================================
     FORMULAIRE DE GRADING
  ========================================================== */

  function openRequestForm() {

    if (
      !hasPrivateAccess()
    ) {

      return;

    }


    const app =
      document.getElementById(
        'eahDiverOnlyApp'
      );


    if (!app) {

      return;

    }


    document
      .getElementById(
        'eahDiverRequestModal'
      )
      ?.remove();


    const modal =
      document.createElement(
        'div'
      );


    modal.id =
      'eahDiverRequestModal';


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
            aria-label="Fermer"
          >
            ×
          </button>

        </div>


        <div class="eah-diver-form">


          <label>

            Discipline

            <select
              id="diverRequestDiscipline"
            >

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
              autocomplete="off"
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
              min="0"
              step="0.1"
              inputmode="decimal"
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
              rows="4"
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


          <div
            id="diverRequestResult"
          ></div>

        </div>

      </div>

    `;


    app.appendChild(
      modal
    );


    const close =
      () => {

        modal.remove();

      };


    document
      .getElementById(
        'closeDiverRequest'
      )
      ?.addEventListener(

        'click',

        close

      );


    modal.addEventListener(

      'click',

      event => {

        if (
          event.target ===
          modal
        ) {

          close();

        }

      }

    );


    modal
      .querySelectorAll(
        '[data-destination]'
      )
      .forEach(
        button => {

          button.addEventListener(

            'click',

            () => {

              submitRequest(

                button.dataset.destination,

                button

              );

            }

          );

        }
      );


    const codeField =
      document.getElementById(
        'diverRequestCode'
      );


    codeField
      ?.addEventListener(

        'input',

        () => {

          const code =
            String(
              codeField.value ||
              ''
            )
            .trim()
            .toUpperCase()
            .replace(
              /\s+/g,
              ''
            );


          codeField.value =
            code;


          try {

            if (
              typeof DIVE_NAMES !==
                'undefined'
              &&
              DIVE_NAMES[
                code
              ]
            ) {

              const nameField =
                document.getElementById(
                  'diverRequestName'
                );


              if (
                nameField &&
                !nameField.value.trim()
              ) {

                nameField.value =
                  DIVE_NAMES[
                    code
                  ];

              }

            }

          } catch (_) {}

        }

      );

  }



  /* ==========================================================
     ENVOI
  ========================================================== */

  async function submitRequest(
    destination,
    button
  ) {

    const session =
      getSession();


    const result =
      document.getElementById(
        'diverRequestResult'
      );


    if (!result) {

      return;

    }


    if (
      !session.eahId
      ||
      (
        !session.token
        &&
        !session.pinHash
      )
    ) {

      result.innerHTML = `

        <div class="eah-diver-error">

          Ta session plongeur
          n'est plus valide.

          <br>

          Reconnecte-toi à ton profil.

        </div>

      `;


      return;

    }


    const code =
      String(
        document
          .getElementById(
            'diverRequestCode'
          )
          ?.value
        ||
        ''
      )
      .trim()
      .toUpperCase()
      .replace(
        /\s+/g,
        ''
      );


    const videoUrl =
      String(
        document
          .getElementById(
            'diverRequestVideo'
          )
          ?.value
        ||
        ''
      )
      .trim();


    if (
      !code ||
      !videoUrl
    ) {

      result.innerHTML = `

        <div class="eah-diver-error">

          Code du plongeon
          et vidéo obligatoires.

        </div>

      `;


      return;

    }


    let parsedVideoUrl;


    try {

      parsedVideoUrl =
        new URL(
          videoUrl
        );


      if (
        parsedVideoUrl.protocol !==
          'https:'
        &&
        parsedVideoUrl.protocol !==
          'http:'
      ) {

        throw new Error();

      }


    } catch (_) {

      result.innerHTML = `

        <div class="eah-diver-error">

          Le lien vidéo n'est pas valide.

        </div>

      `;


      return;

    }


    const buttons =
      document.querySelectorAll(

        '#eahDiverRequestModal [data-destination]'

      );


    buttons.forEach(
      item => {

        item.disabled =
          true;

      }
    );


    const originalText =
      button.textContent;


    button.textContent =
      'Envoi…';


    result.innerHTML = `

      <div class="notice">

        Envoi de la demande…

      </div>

    `;


    try {

      const heightRaw =
        document
          .getElementById(
            'diverRequestHeight'
          )
          ?.value
        ||
        '';


      const height =
        heightRaw ===
        ''
        ?
        null
        :
        Number(
          heightRaw
        );


      const payload = {

        discipline:

          document
            .getElementById(
              'diverRequestDiscipline'
            )
            ?.value
          ||
          'Plongeon',


        diveCode:
          code,


        diveName:

          document
            .getElementById(
              'diverRequestName'
            )
            ?.value
            ?.trim()
          ||
          '',


        height:

          Number.isFinite(
            height
          )
          ?
          height
          :
          null,


        heightType:

          document
            .getElementById(
              'diverRequestHeightType'
            )
            ?.value
          ||
          'KNOWN',


        videoUrl:
          parsedVideoUrl.href,


        message:

          document
            .getElementById(
              'diverRequestMessage'
            )
            ?.value
            ?.trim()
          ||
          ''

      };


      const {
        data,
        error
      } =
        await requireSupabase()
          .rpc(

            'submit_diver_grading_request',

            {

              p_club_slug:
                session.clubSlug ||
                null,

              p_eah_id:
                session.eahId,

              p_token:
                session.token ||
                null,

              p_pin_hash:
                session.pinHash ||
                null,

              p_destination:
                destination,

              p_payload:
                payload

            }

          );


      if (error) {

        throw error;

      }


      if (
        !data ||
        data.ok ===
          false
      ) {

        throw new Error(

          data?.error ||
          "Impossible d'envoyer la demande."

        );

      }


      const requestCode =

        data.requestCode

        ??

        data.request_code

        ??

        data.code

        ??

        '';


      result.innerHTML = `

        <div class="eah-diver-success">

          <strong>
            Demande envoyée.
          </strong>

          <br><br>

          ${
            destination ===
            'CLUB'
            ?
            'Ton Coach recevra cette demande.'
            :
            'Ta demande a été envoyée à EAH Grading.'
          }

          ${
            requestCode
            ?
            `

              <br><br>

              Référence :

              <strong>
                ${escapeHTML(requestCode)}
              </strong>

            `
            :
            ''
          }

        </div>

      `;


      const codeField =
        document.getElementById(
          'diverRequestCode'
        );


      const nameField =
        document.getElementById(
          'diverRequestName'
        );


      const videoField =
        document.getElementById(
          'diverRequestVideo'
        );


      const messageField =
        document.getElementById(
          'diverRequestMessage'
        );


      if (codeField) {

        codeField.value =
          '';

      }


      if (nameField) {

        nameField.value =
          '';

      }


      if (videoField) {

        videoField.value =
          '';

      }


      if (messageField) {

        messageField.value =
          '';

      }


    } catch (
      error
    ) {

      console.error(
        'EAH DIVER GRADING REQUEST:',
        error
      );


      result.innerHTML = `

        <div class="eah-diver-error">

          ${escapeHTML(
            error?.message ||
            "Erreur d'envoi."
          )}

        </div>

      `;


    } finally {

      buttons.forEach(
        item => {

          item.disabled =
            false;

        }
      );


      button.textContent =
        originalText;

    }

  }



  /* ==========================================================
     ESCAPE
  ========================================================== */

  document.addEventListener(

    'keydown',

    event => {

      if (
        event.key ===
        'Escape'
      ) {

        document
          .getElementById(
            'eahDiverRequestModal'
          )
          ?.remove();

      }

    }

  );



  /* ==========================================================
     HTML ESCAPE
  ========================================================== */

  function escapeHTML(
    value
  ) {

    return String(
      value ??
      ''
    )

    .replace(
      /&/g,
      '&amp;'
    )

    .replace(
      /</g,
      '&lt;'
    )

    .replace(
      />/g,
      '&gt;'
    )

    .replace(
      /"/g,
      '&quot;'
    )

    .replace(
      /'/g,
      '&#039;'
    );

  }



  /* ==========================================================
     ATTENDRE LE PROFIL
  ========================================================== */

  const observer =
    new MutationObserver(
      installProfile
    );


  observer.observe(

    document.body,

    {

      childList:
        true,

      subtree:
        true

    }

  );


  window.addEventListener(

    'eah-diver-pin-ready',

    () => {

      installed =
        false;


      installProfile();

    }

  );


  window.setTimeout(
    installProfile,
    250
  );


  window.setTimeout(
    installProfile,
    700
  );


  window.setTimeout(
    installProfile,
    1500
  );


})();
