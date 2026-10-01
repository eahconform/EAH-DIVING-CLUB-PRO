/* ============================================================
   EAH DIVING PRO
   WORKSPACE V1

   - Espace Coach
   - Photo Coach comme profil plongeur
   - Evaluation libre
   - Evaluation depuis demande de grading
   - Takeoff / Trick / Entry
   - Espace plongeur simplifié
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


  /* =========================================================
     CRITERES EAH
  ========================================================= */

  const CRITERIA = {

    takeoff: [

      [
        "D1",
        "Coordination / élan"
      ],

      [
        "D2",
        "Impulsion / détente / élévation"
      ],

      [
        "D3",
        "Trajectoire verticale"
      ],

      [
        "D4",
        "Temps de fixation"
      ],

      [
        "D5",
        "Amplitude des bras"
      ]

    ],


    trick: [

      [
        "T1",
        "Vitesse des rotations"
      ],

      [
        "T2",
        "Saltos et/ou vrilles contrôlés"
      ],

      [
        "T3",
        "Ligne / tenue / position du corps"
      ],

      [
        "T4",
        "Ouverture si applicable"
      ],

      [
        "T5",
        "Continuité / rythme"
      ]

    ],


    entry: [

      [
        "E1",
        "Angle vertical"
      ],

      [
        "E2",
        "Éclaboussures"
      ],

      [
        "E3",
        "Position des bras"
      ],

      [
        "E4",
        "Jambes tendues et serrées"
      ],

      [
        "E5",
        "Axe d'entrée"
      ]

    ]

  };


  let coachWorkspaceData =
    null;


  /* =========================================================
     PHOTO COACH
     MÊME ESPRIT QUE LE PROFIL PLONGEUR
  ========================================================= */

  function installWorkspaceCSS() {

    if (
      document.getElementById(
        "eahWorkspaceCss"
      )
    ) {
      return;
    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "eahWorkspaceCss";


    style.textContent = `

      /* =====================================================
         PHOTO COACH
         carré arrondi comme profil plongeur
      ===================================================== */

      #eahCoachCardApp
      .coach-profile-photo {

        width: 185px !important;

        height: 185px !important;

        margin-left: auto !important;

        margin-right: auto !important;

        border:
          7px solid
          #30cfff !important;

        border-radius:
          38px !important;

        overflow:
          hidden !important;

      }


      #eahCoachCardApp
      .coach-profile-photo img {

        width: 100% !important;

        height: 100% !important;

        object-fit: cover !important;

      }


      /* =====================================================
         ACTION COACH
      ===================================================== */

      .eah-coach-evaluate-main {

        width: 100%;

        margin:
          8px 0 28px;

        padding:
          17px 20px;

        border: 0;

        border-radius: 17px;

        background:
          linear-gradient(
            135deg,
            #0b6bff,
            #168dff
          );

        color: white;

        font-size: 1rem;

        font-weight: 900;

        cursor: pointer;

      }


      .eah-grade-request-button {

        width: 100%;

        margin-top: 10px;

        padding:
          13px 16px;

        border:
          1px solid
          rgba(
            48,
            207,
            255,
            .35
          );

        border-radius: 13px;

        background:
          rgba(
            48,
            207,
            255,
            .12
          );

        color:
          #30cfff;

        font-weight:
          900;

        cursor: pointer;

      }


      /* =====================================================
         MODAL NOTATION
      ===================================================== */

      #eahEvaluationModal {

        position: fixed;

        inset: 0;

        z-index:
          2147483647;

        overflow-y: auto;

        padding: 14px;

        background:
          rgba(
            1,
            9,
            18,
            .94
          );

        color:
          #f5f9ff;

      }


      .eah-eval-shell {

        width: 100%;

        max-width: 900px;

        margin:
          10px auto 70px;

      }


      .eah-eval-panel {

        padding:
          clamp(
            20px,
            5vw,
            42px
          );

        border:
          1px solid
          rgba(
            143,
            205,
            255,
            .22
          );

        border-radius: 28px;

        background:
          #061e33;

      }


      .eah-eval-top {

        display: flex;

        align-items: flex-start;

        justify-content: space-between;

        gap: 15px;

      }


      .eah-eval-close {

        width: 44px;

        height: 44px;

        border: 0;

        border-radius: 50%;

        background:
          rgba(
            255,
            255,
            255,
            .08
          );

        color: white;

        font-size: 1.5rem;

      }


      .eah-eval-form {

        display: grid;

        gap: 18px;

        margin-top: 25px;

      }


      .eah-eval-grid {

        display: grid;

        grid-template-columns:
          repeat(
            2,
            minmax(
              0,
              1fr
            )
          );

        gap: 14px;

      }


      .eah-eval-form label {

        display: grid;

        gap: 7px;

        color: #c3d8e8;

        font-weight: 700;

      }


      .eah-eval-form input,
      .eah-eval-form select,
      .eah-eval-form textarea {

        box-sizing: border-box;

        width: 100%;

        padding: 14px 15px;

        border:
          1px solid
          rgba(
            143,
            205,
            255,
            .22
          );

        border-radius: 14px;

        outline: none;

        background:
          #10273a;

        color: white;

        font-size: 16px;

      }


      .eah-criteria-card {

        padding: 18px;

        border:
          1px solid
          rgba(
            143,
            205,
            255,
            .18
          );

        border-radius: 20px;

        background:
          rgba(
            3,
            19,
            31,
            .45
          );

      }


      .eah-criteria-head {

        display: flex;

        align-items: center;

        justify-content: space-between;

        gap: 15px;

        margin-bottom: 15px;

      }


      .eah-criteria-score {

        padding:
          8px 13px;

        border-radius: 999px;

        background:
          rgba(
            48,
            207,
            255,
            .12
          );

        color:
          #30cfff;

        font-weight:
          900;

      }


      .eah-criteria-line {

        display: grid;

        grid-template-columns:
          1fr 105px;

        align-items: center;

        gap: 12px;

        padding:
          9px 0;

        border-bottom:
          1px solid
          rgba(
            143,
            205,
            255,
            .08
          );

      }


      .eah-criteria-line:last-child {

        border-bottom: 0;

      }


      .eah-final-score {

        padding: 22px;

        border:
          1px solid
          rgba(
            48,
            207,
            255,
            .30
          );

        border-radius: 20px;

        text-align: center;

        background:
          rgba(
            11,
            107,
            255,
            .10
          );

      }


      .eah-final-score strong {

        display: block;

        margin-top: 5px;

        color: #30cfff;

        font-size: 3rem;

      }


      .eah-eval-submit {

        min-height: 58px;

        border: 0;

        border-radius: 17px;

        background:
          linear-gradient(
            135deg,
            #0b6bff,
            #168dff
          );

        color: white;

        font-weight: 900;

        font-size: 1rem;

      }


      /* =====================================================
         PROFIL PLONGEUR UNIQUEMENT
      ===================================================== */

      body.eah-diver-simple {

        overflow: hidden !important;

      }


      #eahDiverSimpleApp {

        position: fixed;

        inset: 0;

        z-index: 2147483000;

        overflow-y: auto;

        padding:
          10px 10px 60px;

        background:
          linear-gradient(
            145deg,
            #03131f,
            #061e33
          );

      }


      #eahDiverSimpleInner {

        width: 100%;

        max-width: 760px;

        margin: 0 auto;

      }


      #eahDiverSimpleApp
      #profileView {

        display: block !important;

      }


      .eah-diver-simple-home {

        display: block;

        width: fit-content;

        margin:
          8px 0 12px;

        padding:
          9px 14px;

        border-radius: 999px;

        background:
          rgba(
            48,
            207,
            255,
            .10
          );

        color:
          #30cfff;

        text-decoration: none;

        font-weight: 800;

      }


      @media(max-width:600px) {

        #eahCoachCardApp
        .coach-profile-photo {

          width:
            155px !important;

          height:
            155px !important;

          border-radius:
            30px !important;

        }


        .eah-eval-grid {

          grid-template-columns:
            1fr;

        }


        .eah-criteria-line {

          grid-template-columns:
            1fr 90px;

        }

      }

    `;


    document.head
      .appendChild(
        style
      );

  }



  /* =========================================================
     RECUPERER ESPACE COACH
  ========================================================= */

  async function getCoachWorkspace() {

    if (!coachToken) {
      return null;
    }


    const {
      data,
      error
    } =
      await requireSupabase()
        .rpc(

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
      return null;
    }


    coachWorkspaceData =
      data;


    return data;

  }



  /* =========================================================
     BOUTONS ESPACE COACH
  ========================================================= */

  async function installCoachEvaluationButtons() {

    if (!coachToken) {
      return;
    }


    const app =
      document.getElementById(
        "eahCoachCardApp"
      );


    if (!app) {
      return;
    }


    let data =
      coachWorkspaceData;


    if (!data) {

      try {

        data =
          await getCoachWorkspace();

      } catch (_) {

        return;

      }

    }


    if (
      !data ||
      data.assigned !== true
    ) {
      return;
    }


    /* ======================================================
       BOUTON EVALUATION LIBRE
    ====================================================== */

    const statGrid =
      app.querySelector(
        ".coach-stat-grid"
      );


    if (
      statGrid &&
      !document.getElementById(
        "eahCoachEvaluateAny"
      )
    ) {

      const button =
        document.createElement(
          "button"
        );


      button.id =
        "eahCoachEvaluateAny";


      button.className =
        "eah-coach-evaluate-main";


      button.textContent =
        "Évaluer un plongeon";


      button.addEventListener(
        "click",
        () =>
          openEvaluationModal()
      );


      statGrid.insertAdjacentElement(
        "afterend",
        button
      );

    }


    /* ======================================================
       BOUTONS SUR LES DEMANDES
    ====================================================== */

    const sections =
      app.querySelectorAll(
        ".coach-section"
      );


    if (!sections.length) {
      return;
    }


    const requestCards =
      sections[0]
        .querySelectorAll(
          ".coach-list-card"
        );


    (
      data.gradingRequests ||
      []
    )
    .forEach(
      (request, index) => {

        const card =
          requestCards[index];


        if (!card) {
          return;
        }


        if (
          String(
            request.status ||
            ""
          )
          .toUpperCase()
          ===
          "GRADED"
        ) {

          return;

        }


        if (
          card.querySelector(
            ".eah-grade-request-button"
          )
        ) {

          return;

        }


        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "eah-grade-request-button";


        button.textContent =
          "Grader le plongeon";


        button.addEventListener(
          "click",
          () => {

            openEvaluationModal({

              requestId:
                request.id,

              eahId:
                request.eahId,

              diveCode:
                request.diveCode,

              diveName:
                request.diveName,

              height:
                request.height,

              videoUrl:
                request.videoUrl

            });

          }
        );


        card.appendChild(
          button
        );

      }
    );

  }



  /* =========================================================
     HTML CRITERES
  ========================================================= */

  function criteriaHtml(
    phase,
    title
  ) {

    return `

      <section class="eah-criteria-card">

        <div class="eah-criteria-head">

          <h3>
            ${title}
          </h3>

          <span
            id="score-${phase}"
            class="eah-criteria-score"
          >
            0 / 10
          </span>

        </div>


        ${
          CRITERIA[
            phase
          ]
          .map(
            ([code, name]) => `

              <div class="eah-criteria-line">

                <span>

                  <strong>
                    ${code}
                  </strong>

                  ${name}

                </span>


                <select
                  data-eah-phase="${phase}"
                  data-eah-code="${code}"
                >

                  <option value="0">
                    0
                  </option>

                  <option value="1">
                    1
                  </option>

                  <option value="2">
                    2
                  </option>

                  <option value="">
                    N/A
                  </option>

                </select>

              </div>

            `
          )
          .join("")
        }

      </section>

    `;

  }



  /* =========================================================
     OUVRIR NOTATION
  ========================================================= */

  async function openEvaluationModal(
    prefill = {}
  ) {

    let data =
      coachWorkspaceData;


    if (!data) {

      data =
        await getCoachWorkspace();

    }


    const divers =
      data?.divers ||
      [];


    if (!divers.length) {

      alert(
        "Aucun plongeur actif dans ce club."
      );

      return;

    }


    document
      .getElementById(
        "eahEvaluationModal"
      )
      ?.remove();


    const modal =
      document.createElement(
        "div"
      );


    modal.id =
      "eahEvaluationModal";


    modal.innerHTML = `

      <div class="eah-eval-shell">

        <div class="eah-eval-panel">

          <div class="eah-eval-top">

            <div>

              <span
                style="
                  color:#30cfff;
                  font-weight:900;
                  letter-spacing:.12em;
                "
              >
                EAH DIVING
              </span>

              <h1>
                Grader un plongeon
              </h1>

            </div>


            <button
              id="closeEAHEvaluation"
              class="eah-eval-close"
              type="button"
            >
              ×
            </button>

          </div>


          <form
            id="eahCoachEvaluationForm"
            class="eah-eval-form"
          >

            <div class="eah-eval-grid">


              <label>

                Plongeur

                <select
                  id="eahEvalDiver"
                  required
                >

                  ${

                    divers.map(
                      diver => `

                        <option
                          value="${escapeHTML(
                            diver.id
                          )}"

                          ${
                            (
                              prefill.eahId

                              &&

                              String(
                                diver.eahId
                              )
                              ===
                              String(
                                prefill.eahId
                              )
                            )
                            ?
                            "selected"
                            :
                            ""
                          }
                        >

                          ${escapeHTML(
                            (
                              diver.firstName ||
                              ""
                            )
                            +
                            " "
                            +
                            (
                              diver.lastName ||
                              ""
                            )
                          )}

                          —
                          ${escapeHTML(
                            diver.eahId ||
                            ""
                          )}

                        </option>

                      `
                    )
                    .join("")

                  }

                </select>

              </label>


              <label>

                Discipline

                <select
                  id="eahEvalDiscipline"
                >

                  <option>
                    Plongeon
                  </option>

                  <option>
                    High Diving
                  </option>

                  <option>
                    Freestyle
                  </option>

                  <option>
                    Dods
                  </option>

                  <option>
                    Saut de l'ange
                  </option>

                </select>

              </label>


              <label>

                Code du plongeon

                <input
                  id="eahEvalDiveCode"
                  value="${escapeHTML(
                    prefill.diveCode ||
                    ""
                  )}"
                  placeholder="Ex : 107B"
                  required
                >

              </label>


              <label>

                Nom du plongeon

                <input
                  id="eahEvalDiveName"
                  value="${escapeHTML(
                    prefill.diveName ||
                    ""
                  )}"
                >

              </label>


              <label>

                Hauteur

                <input
                  id="eahEvalHeight"
                  type="number"
                  step="0.1"
                  value="${escapeHTML(
                    prefill.height ??
                    ""
                  )}"
                  placeholder="Ex : 10"
                >

              </label>


              <label>

                Note WA /10

                <input
                  id="eahEvalWA"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  placeholder="Optionnel"
                >

              </label>

            </div>


            <label>

              Vidéo

              <input
                id="eahEvalVideo"
                type="url"
                value="${escapeHTML(
                  prefill.videoUrl ||
                  ""
                )}"
                placeholder="https://..."
              >

            </label>


            ${criteriaHtml(
              "takeoff",
              "Takeoff"
            )}


            ${criteriaHtml(
              "trick",
              "Trick"
            )}


            ${criteriaHtml(
              "entry",
              "Entry"
            )}


            <div class="eah-final-score">

              NOTE EAH

              <strong
                id="eahFinalScore"
              >
                0
              </strong>

            </div>


            <label>

              Points réussis

              <textarea
                id="eahEvalPositive"
                rows="2"
              ></textarea>

            </label>


            <label>

              Critères à améliorer

              <textarea
                id="eahEvalImprove"
                rows="2"
              ></textarea>

            </label>


            <label>

              Commentaire Coach

              <textarea
                id="eahEvalComment"
                rows="3"
              ></textarea>

            </label>


            <button
              id="eahEvalSubmit"
              class="eah-eval-submit"
              type="submit"
            >
              Valider le Grade Report
            </button>


            <div
              id="eahEvalMessage"
            ></div>

          </form>

        </div>

      </div>

    `;


    document.body
      .appendChild(
        modal
      );


    modal.dataset.requestId =
      prefill.requestId ||
      "";


    document
      .getElementById(
        "closeEAHEvaluation"
      )
      .addEventListener(
        "click",
        () =>
          modal.remove()
      );


    modal
      .querySelectorAll(
        "[data-eah-phase]"
      )
      .forEach(
        select => {

          select.addEventListener(
            "change",
            updateEvaluationScores
          );

        }
      );


    document
      .getElementById(
        "eahCoachEvaluationForm"
      )
      .addEventListener(
        "submit",
        submitCoachEvaluation
      );


    updateEvaluationScores();

  }



  /* =========================================================
     SCORE D'UNE PHASE
  ========================================================= */

  function calculatePhase(
    phase
  ) {

    const selects =
      Array.from(
        document.querySelectorAll(
          `[data-eah-phase="${phase}"]`
        )
      );


    let obtained =
      0;


    let max =
      0;


    selects.forEach(
      select => {

        if (
          select.value ===
          ""
        ) {

          return;

        }


        obtained +=
          Number(
            select.value
          );


        max += 2;

      }
    );


    if (!max) {
      return 0;
    }


    return Math.round(
      obtained /
      max *
      10
    );

  }



  /* =========================================================
     SCORE EAH
  ========================================================= */

  function calculateEAHFinal(
    takeoff,
    trick,
    entry
  ) {

    const scores = [
      takeoff,
      trick,
      entry
    ];


    const min =
      Math.min(
        ...scores
      );


    const count =
      scores.filter(
        score =>
          score === min
      ).length;


    return Math.min(

      10,

      count === 1
      ?
      min + 0.5
      :
      min

    );

  }



  function updateEvaluationScores() {

    const takeoff =
      calculatePhase(
        "takeoff"
      );


    const trick =
      calculatePhase(
        "trick"
      );


    const entry =
      calculatePhase(
        "entry"
      );


    document
      .getElementById(
        "score-takeoff"
      )
      .textContent =
        `${takeoff} / 10`;


    document
      .getElementById(
        "score-trick"
      )
      .textContent =
        `${trick} / 10`;


    document
      .getElementById(
        "score-entry"
      )
      .textContent =
        `${entry} / 10`;


    document
      .getElementById(
        "eahFinalScore"
      )
      .textContent =
        calculateEAHFinal(
          takeoff,
          trick,
          entry
        );

  }



  /* =========================================================
     JSON DES 15 ITEMS
  ========================================================= */

  function getCriteriaValues() {

    const result =
      {};


    document
      .querySelectorAll(
        "[data-eah-code]"
      )
      .forEach(
        select => {

          result[
            select.dataset.eahCode
          ] =
            select.value === ""
            ?
            null
            :
            Number(
              select.value
            );

        }
      );


    return result;

  }



  /* =========================================================
     ENREGISTRER EVALUATION
  ========================================================= */

  async function submitCoachEvaluation(
    event
  ) {

    event.preventDefault();


    const modal =
      document.getElementById(
        "eahEvaluationModal"
      );


    const button =
      document.getElementById(
        "eahEvalSubmit"
      );


    const message =
      document.getElementById(
        "eahEvalMessage"
      );


    const takeoff =
      calculatePhase(
        "takeoff"
      );


    const trick =
      calculatePhase(
        "trick"
      );


    const entry =
      calculatePhase(
        "entry"
      );


    const diveCode =
      document
        .getElementById(
          "eahEvalDiveCode"
        )
        .value
        .trim()
        .toUpperCase();


    if (!diveCode) {

      message.innerHTML = `

        <div
          style="
            padding:14px;
            background:rgba(224,82,94,.15);
            border-radius:14px;
          "
        >
          Code du plongeon obligatoire.
        </div>

      `;

      return;

    }


    button.disabled =
      true;


    button.textContent =
      "Enregistrement…";


    try {

      const payload = {

        requestId:
          modal.dataset.requestId ||
          "",

        diverId:
          document
            .getElementById(
              "eahEvalDiver"
            )
            .value,

        discipline:
          document
            .getElementById(
              "eahEvalDiscipline"
            )
            .value,

        diveCode:
          diveCode,

        diveName:
          document
            .getElementById(
              "eahEvalDiveName"
            )
            .value
            .trim(),

        height:
          document
            .getElementById(
              "eahEvalHeight"
            )
            .value,

        waScore:
          document
            .getElementById(
              "eahEvalWA"
            )
            .value,

        takeoff:
          takeoff,

        trick:
          trick,

        entry:
          entry,

        criteria:
          getCriteriaValues(),

        videoUrl:
          document
            .getElementById(
              "eahEvalVideo"
            )
            .value
            .trim(),

        positive:
          document
            .getElementById(
              "eahEvalPositive"
            )
            .value
            .trim(),

        improve:
          document
            .getElementById(
              "eahEvalImprove"
            )
            .value
            .trim(),

        comment:
          document
            .getElementById(
              "eahEvalComment"
            )
            .value
            .trim()

      };


      const {
        data,
        error
      } =
        await requireSupabase()
          .rpc(

            "eah_coach_submit_evaluation",

            {

              p_token:
                coachToken,

              p_payload:
                payload

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
          "Evaluation impossible."
        );

      }


      message.innerHTML = `

        <div
          style="
            padding:15px;
            margin-top:12px;
            background:rgba(24,185,120,.15);
            border-radius:14px;
          "
        >

          <strong>
            Evaluation enregistrée.
          </strong>

          <br>

          Note EAH :
          ${escapeHTML(
            data.eahScore
          )}
          /10

        </div>

      `;


      setTimeout(
        () =>
          window.location.reload(),
        900
      );


    } catch(error) {

      button.disabled =
        false;


      button.textContent =
        "Valider le Grade Report";


      message.innerHTML = `

        <div
          style="
            padding:15px;
            margin-top:12px;
            background:rgba(224,82,94,.15);
            border-radius:14px;
          "
        >

          ${escapeHTML(
            error.message ||
            "Erreur."
          )}

        </div>

      `;

    }

  }



  /* =========================================================
     ESPACE PLONGEUR SIMPLE

     On conserve :
     - photo
     - identité
     - progression
     - historique
     - demande de grading

     On masque tout le reste du site.
  ========================================================= */

  function trySimpleDiverProfile() {

    if (coachToken) {
      return;
    }


    const profileView =
      document.getElementById(
        "profileView"
      );


    if (
      !profileView ||
      !profileView.innerHTML.trim()
    ) {
      return;
    }


    /*
      Il faut que le profil soit réellement affiché.
    */

    const rect =
      profileView
        .getBoundingClientRect();


    if (
      rect.width === 0
    ) {
      return;
    }


    if (
      document.getElementById(
        "eahDiverSimpleApp"
      )
    ) {
      return;
    }


    const parent =
      profileView.parentNode;


    const marker =
      document.createComment(
        "EAH_PROFILE_POSITION"
      );


    parent.insertBefore(
      marker,
      profileView
    );


    const app =
      document.createElement(
        "div"
      );


    app.id =
      "eahDiverSimpleApp";


    app.innerHTML = `

      <div id="eahDiverSimpleInner">

        <a
          href="./"
          class="eah-diver-simple-home"
        >
          ← EAH Diving
        </a>

      </div>

    `;


    document.body.appendChild(
      app
    );


    document
      .getElementById(
        "eahDiverSimpleInner"
      )
      .appendChild(
        profileView
      );


    document.body
      .classList
      .add(
        "eah-diver-simple"
      );

  }



  /* =========================================================
     ESCAPE
  ========================================================= */

  function escapeHTML(
    value
  ) {

    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );

  }



  /* =========================================================
     INITIALISATION
  ========================================================= */

  installWorkspaceCSS();


  if (coachToken) {

    /*
      coach-card.js construit d'abord l'interface.
      On ajoute ensuite les fonctions d'évaluation.
    */

    let tries =
      0;


    const timer =
      setInterval(

        async () => {

          tries++;


          await installCoachEvaluationButtons();


          if (
            document.getElementById(
              "eahCoachEvaluateAny"
            )
            ||
            tries > 20
          ) {

            clearInterval(
              timer
            );

          }

        },

        500

      );

  }


  /*
    Observer profil plongeur.
  */

  const observer =
    new MutationObserver(
      () => {

        trySimpleDiverProfile();

      }
    );


  observer.observe(

    document.body,

    {
      childList: true,
      subtree: true
    }

  );


  setTimeout(
    trySimpleDiverProfile,
    700
  );

})();
