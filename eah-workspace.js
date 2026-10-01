/* ============================================================
   EAH DIVING PRO
   ACTIONS COACH
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


  let coachData =
    null;


  const criteria = {

    takeoff: [
      ["D1", "Coordination / élan"],
      ["D2", "Impulsion / détente / élévation"],
      ["D3", "Trajectoire verticale"],
      ["D4", "Temps de fixation"],
      ["D5", "Amplitude des bras"]
    ],

    trick: [
      ["T1", "Vitesse des rotations"],
      ["T2", "Saltos et/ou vrilles contrôlés"],
      ["T3", "Ligne / tenue / position du corps"],
      ["T4", "Ouverture si applicable"],
      ["T5", "Continuité / rythme"]
    ],

    entry: [
      ["E1", "Angle vertical"],
      ["E2", "Éclaboussures"],
      ["E3", "Position des bras"],
      ["E4", "Jambes"],
      ["E5", "Axe d'entrée"]
    ]

  };


  /* ========================================================
     CHARGER DONNEES
  ======================================================== */

  async function loadCoachData() {

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


    coachData =
      data;


    return data;

  }


  /* ========================================================
     AJOUTER LES ACTIONS
  ======================================================== */

  async function installActions() {

    const app =
      document.getElementById(
        "eahCoachCardApp"
      );


    if (!app) {
      return;
    }


    if (!coachData) {

      try {

        await loadCoachData();

      } catch (_) {

        return;

      }

    }


    if (
      !coachData ||
      coachData.assigned !== true
    ) {
      return;
    }


    /* EVALUER LIBREMENT */

    const stats =
      app.querySelector(
        ".coach-stat-grid"
      );


    if (
      stats &&
      !document.getElementById(
        "eahEvaluateDive"
      )
    ) {

      const button =
        document.createElement(
          "button"
        );


      button.id =
        "eahEvaluateDive";


      button.type =
        "button";


      button.textContent =
        "Évaluer un plongeon";


      button.style.cssText = `
        width:100%;
        min-height:58px;
        margin:20px 0;
        border:0;
        border-radius:16px;
        background:#0b6bff;
        color:white;
        font-size:16px;
        font-weight:900;
      `;


      button.onclick =
        () =>
          openEvaluation();


      stats.insertAdjacentElement(
        "afterend",
        button
      );

    }


    /* DEMANDES */

    const sections =
      app.querySelectorAll(
        ".coach-section"
      );


    if (!sections[0]) {
      return;
    }


    const requests =
      (
        coachData.gradingRequests ||
        []
      )
      .filter(
        request =>
          ![
            "GRADED",
            "DONE",
            "COMPLETED"
          ]
          .includes(
            String(
              request.status ||
              "PENDING"
            )
            .toUpperCase()
          )
      );


    const cards =
      sections[0]
        .querySelectorAll(
          ".coach-list-card"
        );


    requests.forEach(
      (request, index) => {

        const card =
          cards[index];


        if (
          !card ||
          card.querySelector(
            ".eah-grade-button"
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
          "eah-grade-button";


        button.textContent =
          "Grader le plongeon";


        button.style.cssText = `
          width:100%;
          min-height:50px;
          margin-top:12px;
          border:1px solid rgba(48,207,255,.35);
          border-radius:14px;
          background:rgba(48,207,255,.10);
          color:#30cfff;
          font-weight:900;
        `;


        button.onclick =
          () =>
            openEvaluation({

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


        card.appendChild(
          button
        );

      }
    );


    /* PROFILS PLONGEURS */

    if (
      sections[1]
    ) {

      const diverCards =
        sections[1]
          .querySelectorAll(
            ".coach-list-card"
          );


      (
        coachData.divers ||
        []
      )
      .forEach(
        (diver, index) => {

          const card =
            diverCards[index];


          if (
            !card ||
            card.querySelector(
              ".eah-open-diver"
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
            "eah-open-diver";


          button.textContent =
            "Ouvrir le profil";


          button.style.cssText = `
            width:100%;
            min-height:48px;
            margin-top:10px;
            border:1px solid rgba(48,207,255,.30);
            border-radius:14px;
            background:transparent;
            color:#30cfff;
            font-weight:900;
          `;


          button.onclick =
            () =>
              openDiverProfile(
                diver
              );


          card.appendChild(
            button
          );

        }
      );

    }

  }


  /* ========================================================
     HTML CRITERE
  ======================================================== */

  function phaseHTML(
    key,
    title
  ) {

    return `

      <section
        style="
          margin-top:18px;
          padding:18px;
          border-radius:18px;
          background:rgba(3,19,31,.55);
        "
      >

        <h3>
          ${title}
          —
          <span id="score-${key}">
            0/10
          </span>
        </h3>


        ${
          criteria[key]
            .map(
              ([code, name]) => `

                <label
                  style="
                    display:grid;
                    grid-template-columns:1fr 90px;
                    gap:10px;
                    align-items:center;
                    margin-top:10px;
                  "
                >

                  <span>
                    <strong>${code}</strong>
                    ${name}
                  </span>


                  <select
                    data-phase="${key}"
                    data-code="${code}"
                    style="
                      min-height:45px;
                      background:#10273a;
                      color:white;
                      border-radius:10px;
                    "
                  >

                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="">N/A</option>

                  </select>

                </label>

              `
            )
            .join("")
        }

      </section>

    `;

  }


  /* ========================================================
     FORMULAIRE EVALUATION
  ======================================================== */

  async function openEvaluation(
    prefill = {}
  ) {

    const app =
      document.getElementById(
        "eahCoachCardApp"
      );


    if (!app) {
      return;
    }


    if (!coachData) {
      await loadCoachData();
    }


    const divers =
      coachData.divers ||
      [];


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


    modal.dataset.requestId =
      prefill.requestId ||
      "";


    modal.style.cssText = `

      position:fixed;
      inset:0;
      z-index:2147483647;

      overflow-y:auto;

      padding:12px;

      background:rgba(1,9,18,.97);

      color:white;

      visibility:visible;
      pointer-events:auto;

    `;


    modal.innerHTML = `

      <div
        style="
          width:100%;
          max-width:850px;
          margin:10px auto 80px;
          box-sizing:border-box;
          padding:22px;
          border-radius:24px;
          background:#061e33;
        "
      >

        <div
          style="
            display:flex;
            justify-content:space-between;
            gap:15px;
          "
        >

          <div>

            <span
              style="
                color:#30cfff;
                font-weight:900;
              "
            >
              EAH DIVING
            </span>

            <h1>
              Grader un plongeon
            </h1>

          </div>


          <button
            id="closeEval"
            type="button"
            style="
              width:45px;
              height:45px;
              border:0;
              border-radius:50%;
            "
          >
            ×
          </button>

        </div>


        <form id="coachEvaluationForm">


          <label>
            Plongeur
          </label>

          <select
            id="evalDiver"
            style="
              width:100%;
              min-height:52px;
              margin-bottom:12px;
            "
          >

            ${
              divers.map(
                diver => `

                  <option
                    value="${esc(diver.id)}"

                    ${
                      prefill.eahId
                      &&
                      String(
                        prefill.eahId
                      )
                      ===
                      String(
                        diver.eahId
                      )
                      ?
                      "selected"
                      :
                      ""
                    }
                  >

                    ${esc(
                      `${diver.firstName || ""} ${diver.lastName || ""}`
                    )}

                    —
                    ${esc(
                      diver.eahId ||
                      ""
                    )}

                  </option>

                `
              )
              .join("")
            }

          </select>


          <label>
            Code du plongeon
          </label>

          <input
            id="evalCode"
            value="${esc(
              prefill.diveCode ||
              ""
            )}"
            style="
              width:100%;
              min-height:52px;
              box-sizing:border-box;
            "
          >


          <label>
            Nom
          </label>

          <input
            id="evalName"
            value="${esc(
              prefill.diveName ||
              ""
            )}"
            style="
              width:100%;
              min-height:52px;
              box-sizing:border-box;
            "
          >


          <label>
            Hauteur
          </label>

          <input
            id="evalHeight"
            type="number"
            step="0.1"
            value="${esc(
              prefill.height ??
              ""
            )}"
            style="
              width:100%;
              min-height:52px;
              box-sizing:border-box;
            "
          >


          <label>
            Note WA /10
          </label>

          <input
            id="evalWA"
            type="number"
            min="0"
            max="10"
            step="0.5"
            style="
              width:100%;
              min-height:52px;
              box-sizing:border-box;
            "
          >


          <label>
            Vidéo
          </label>

          <input
            id="evalVideo"
            type="url"
            value="${esc(
              prefill.videoUrl ||
              ""
            )}"
            style="
              width:100%;
              min-height:52px;
              box-sizing:border-box;
            "
          >


          ${phaseHTML(
            "takeoff",
            "Takeoff"
          )}


          ${phaseHTML(
            "trick",
            "Trick"
          )}


          ${phaseHTML(
            "entry",
            "Entry"
          )}


          <div
            style="
              margin-top:20px;
              padding:20px;
              text-align:center;
              background:rgba(11,107,255,.12);
              border-radius:18px;
            "
          >

            NOTE EAH

            <strong
              id="finalEAH"
              style="
                display:block;
                font-size:3rem;
                color:#30cfff;
              "
            >
              0
            </strong>

          </div>


          <textarea
            id="evalPositive"
            placeholder="Points réussis"
            style="
              width:100%;
              min-height:90px;
              box-sizing:border-box;
              margin-top:15px;
            "
          ></textarea>


          <textarea
            id="evalImprove"
            placeholder="Critères à améliorer"
            style="
              width:100%;
              min-height:90px;
              box-sizing:border-box;
              margin-top:10px;
            "
          ></textarea>


          <textarea
            id="evalComment"
            placeholder="Commentaire Coach"
            style="
              width:100%;
              min-height:90px;
              box-sizing:border-box;
              margin-top:10px;
            "
          ></textarea>


          <button
            id="submitEval"
            type="submit"
            style="
              width:100%;
              min-height:58px;
              margin-top:18px;
              border:0;
              border-radius:16px;
              background:#0b6bff;
              color:white;
              font-weight:900;
            "
          >
            Valider l'évaluation
          </button>


          <div id="evalMessage"></div>

        </form>

      </div>

    `;


    /*
      TRÈS IMPORTANT :
      le modal est ajouté dans l'application Coach.
    */

    app.appendChild(
      modal
    );


    document
      .getElementById(
        "closeEval"
      )
      .onclick =
        () =>
          modal.remove();


    modal
      .querySelectorAll(
        "[data-phase]"
      )
      .forEach(
        select => {

          select.onchange =
            updateScores;

        }
      );


    document
      .getElementById(
        "coachEvaluationForm"
      )
      .onsubmit =
        submitEvaluation;


    updateScores();

  }


  /* ========================================================
     SCORES
  ======================================================== */

  function getPhaseScore(
    phase
  ) {

    const fields =
      Array.from(
        document.querySelectorAll(
          `[data-phase="${phase}"]`
        )
      );


    let obtained = 0;
    let max = 0;


    fields.forEach(
      field => {

        if (
          field.value ===
          ""
        ) {
          return;
        }


        obtained +=
          Number(
            field.value
          );


        max += 2;

      }
    );


    return max
      ?
      Math.round(
        obtained /
        max *
        10
      )
      :
      0;

  }


  function getFinal(
    d,
    t,
    e
  ) {

    const values = [
      d,
      t,
      e
    ];


    const min =
      Math.min(
        ...values
      );


    const count =
      values.filter(
        value =>
          value === min
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


  function updateScores() {

    const d =
      getPhaseScore(
        "takeoff"
      );


    const t =
      getPhaseScore(
        "trick"
      );


    const e =
      getPhaseScore(
        "entry"
      );


    document.getElementById(
      "score-takeoff"
    ).textContent =
      `${d}/10`;


    document.getElementById(
      "score-trick"
    ).textContent =
      `${t}/10`;


    document.getElementById(
      "score-entry"
    ).textContent =
      `${e}/10`;


    document.getElementById(
      "finalEAH"
    ).textContent =
      getFinal(
        d,
        t,
        e
      );

  }


  function getCriteria() {

    const result = {};


    document
      .querySelectorAll(
        "[data-code]"
      )
      .forEach(
        field => {

          result[
            field.dataset.code
          ] =
            field.value ===
            ""
            ?
            null
            :
            Number(
              field.value
            );

        }
      );


    return result;

  }


  /* ========================================================
     ENVOI
  ======================================================== */

  async function submitEvaluation(
    event
  ) {

    event.preventDefault();


    const modal =
      document.getElementById(
        "eahEvaluationModal"
      );


    const button =
      document.getElementById(
        "submitEval"
      );


    const message =
      document.getElementById(
        "evalMessage"
      );


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
              "evalDiver"
            )
            .value,

        discipline:
          "Plongeon",

        diveCode:
          document
            .getElementById(
              "evalCode"
            )
            .value
            .trim()
            .toUpperCase(),

        diveName:
          document
            .getElementById(
              "evalName"
            )
            .value
            .trim(),

        height:
          document
            .getElementById(
              "evalHeight"
            )
            .value,

        waScore:
          document
            .getElementById(
              "evalWA"
            )
            .value,

        takeoff:
          getPhaseScore(
            "takeoff"
          ),

        trick:
          getPhaseScore(
            "trick"
          ),

        entry:
          getPhaseScore(
            "entry"
          ),

        criteria:
          getCriteria(),

        videoUrl:
          document
            .getElementById(
              "evalVideo"
            )
            .value,

        positive:
          document
            .getElementById(
              "evalPositive"
            )
            .value,

        improve:
          document
            .getElementById(
              "evalImprove"
            )
            .value,

        comment:
          document
            .getElementById(
              "evalComment"
            )
            .value

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
            margin-top:12px;
            padding:15px;
            border-radius:14px;
            background:rgba(24,185,120,.15);
          "
        >

          Évaluation enregistrée.

          <br>

          Note EAH :
          ${esc(
            data.eahScore
          )}
          /10

        </div>

      `;


      /*
        Recharge :
        la demande passée GRADED
        disparaîtra.
      */

      setTimeout(
        () =>
          window.location.reload(),
        700
      );


    } catch(error) {

      button.disabled =
        false;


      button.textContent =
        "Valider l'évaluation";


      message.innerHTML = `

        <div
          style="
            margin-top:12px;
            padding:15px;
            background:rgba(224,82,94,.15);
            border-radius:14px;
          "
        >

          ${esc(
            error.message ||
            "Erreur."
          )}

        </div>

      `;

    }

  }


  /* ========================================================
     PROFIL PLONGEUR DEPUIS COACH
  ======================================================== */

  function openDiverProfile(
    diver
  ) {

    const app =
      document.getElementById(
        "eahCoachCardApp"
      );


    if (!app) {
      return;
    }


    const modal =
      document.createElement(
        "div"
      );


    modal.style.cssText = `

      position:fixed;
      inset:0;
      z-index:2147483647;
      overflow-y:auto;
      padding:15px;
      background:rgba(1,9,18,.97);
      color:white;

    `;


    modal.innerHTML = `

      <div
        style="
          width:100%;
          max-width:700px;
          margin:auto;
          padding:25px;
          box-sizing:border-box;
          border-radius:25px;
          background:#061e33;
          text-align:center;
        "
      >

        <button
          id="closeDiverCoach"
          style="
            float:right;
          "
        >
          ×
        </button>


        ${
          diver.photoUrl
          ?
          `

            <img
              src="${esc(
                diver.photoUrl
              )}"
              style="
                width:160px;
                height:160px;
                object-fit:cover;
                border:6px solid #30cfff;
                border-radius:34px;
              "
            >

          `
          :
          ""
        }


        <h1>

          ${esc(
            `${diver.firstName || ""} ${diver.lastName || ""}`
          )}

        </h1>


        <p>
          ${esc(
            diver.eahId ||
            ""
          )}
        </p>


        <p>

          ${esc(
            diver.group ||
            ""
          )}

        </p>


        <p>

          Blazon :
          ${esc(
            diver.currentBlazon ||
            "En progression"
          )}

        </p>


        <button
          id="evalThisDiver"
          type="button"
          style="
            width:100%;
            min-height:55px;
            margin-top:20px;
            border:0;
            border-radius:15px;
            background:#0b6bff;
            color:white;
            font-weight:900;
          "
        >
          Évaluer un plongeon
        </button>

      </div>

    `;


    app.appendChild(
      modal
    );


    modal.querySelector(
      "#closeDiverCoach"
    ).onclick =
      () =>
        modal.remove();


    modal.querySelector(
      "#evalThisDiver"
    ).onclick =
      () => {

        modal.remove();


        openEvaluation({

          eahId:
            diver.eahId

        });

      };

  }


  function esc(
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


  /* ========================================================
     DEMARRAGE
  ======================================================== */

  let tries = 0;


  const timer =
    setInterval(

      async () => {

        tries++;


        await installActions();


        if (
          document.getElementById(
            "eahEvaluateDive"
          )
          ||
          tries > 30
        ) {

          clearInterval(
            timer
          );

        }

      },

      350

    );

})();
