
/* ============================================================
   EAH DIVING PRO CLUB - ACTIONS COACH NFC
   VERSION 2.0 - 11/10/2026

   - Conserve les cartes NFC et les demandes existantes
   - Notation EAH / WA / EAH + WA
   - Nomenclature automatique avec saisie manuelle possible
   - 15 critères, N/A, scores et contrôles
   - Enregistrement par eah_coach_submit_evaluation_v2
   - Ne modifie pas les Grade Reports PDF
============================================================ */

(() => {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const coachToken = String(params.get('coachToken') || '').trim();
  if (!coachToken) return;

  let coachData = null;
  let loadingActions = false;
  let saving = false;

  const criteria = {
    takeoff: [
      ['D1', 'Coordination / élan'],
      ['D2', 'Impulsion / détente / élévation'],
      ['D3', 'Trajectoire verticale'],
      ['D4', 'Temps de fixation'],
      ['D5', 'Amplitude des bras']
    ],
    trick: [
      ['T1', 'Vitesse des rotations'],
      ['T2', 'Saltos et/ou vrilles contrôlés'],
      ['T3', 'Ligne / tenue / position du corps'],
      ['T4', 'Ouverture si applicable'],
      ['T5', 'Continuité / rythme']
    ],
    entry: [
      ['E1', 'Angle vertical'],
      ['E2', 'Éclaboussures'],
      ['E3', 'Position des bras'],
      ['E4', 'Jambes'],
      ['E5', "Axe d'entrée"]
    ]
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function safeImage(url) {
    const value = String(url || '').trim();
    return /^https:\/\//i.test(value) ? value : '';
  }

  function normalizeCode(value) {
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  }

  function halfNumber(raw) {
    const v = Number(String(raw).replace(/[()]/g, ''));
    return Number.isInteger(v) && v >= 1 && v <= 40 ? v : null;
  }

  function halfText(n) {
    return (Math.floor(n / 2) || '') + (n % 2 ? '½' : '');
  }

  function movement(n, noun) {
    return halfText(n) + ' ' + noun + (n > 3 ? 's' : '');
  }

  function automaticDiveName(raw) {
    // Réutiliser le module de nomenclature si déjà chargé.
    if (typeof window.EAH_DIVE_NAME_V2 === 'function') {
      const external = window.EAH_DIVE_NAME_V2(raw);
      if (external) return external;
    }

    const code = normalizeCode(raw);
    const special = {
      '001A': 'Chute avant droite',
      '001B': 'Chute avant carpée',
      '001C': 'Chute avant groupée',
      '002A': 'Chute arrière droite',
      '002AS': 'Plongeon arrière droit en sautant',
      '100A': 'Chandelle avant droite'
    };
    if (special[code]) return special[code];

    const direction = { 1: 'avant', 2: 'arrière', 3: 'renversé', 4: 'retourné' };
    const position = {
      A: 'droite', B: 'carpée', C: 'groupée',
      D: 'libre', E: 'trois positions (A/B/C)'
    };
    const adjective = {
      A: 'droit', B: 'carpé', C: 'groupé',
      D: 'libre', E: 'en trois positions (A/B/C)'
    };
    const positionPhrase = letter => letter === 'E'
      ? ', en trois positions (A/B/C)'
      : ', position ' + position[letter];

    let m = code.match(/^([1-4])([01])(\d{1,2})([ABCDE])$/);
    if (m) {
      const n = halfNumber(m[3]);
      if (n === null || (m[3].length > 1 && m[3][0] === '0')) return '';
      const flying = m[2] === '1' ? ' en vol plané' : '';
      return n === 1
        ? 'Plongeon ' + direction[m[1]] + ' ' + adjective[m[4]] + flying
        : movement(n, 'salto') + ' ' + direction[m[1]] + flying + positionPhrase(m[4]);
    }

    m = code.match(/^5([1-4])(\d|\(\d{2,}\))(\d|\(\d{2,}\))([ABCDE])$/);
    if (m) {
      const n = halfNumber(m[2]);
      const twists = halfNumber(m[3]);
      if (n === null || twists === null) return '';
      const base = n === 1
        ? 'Plongeon ' + direction[m[1]]
        : movement(n, 'salto') + ' ' + direction[m[1]];
      return base + ' avec ' + movement(twists, 'vrille') + positionPhrase(m[4]);
    }

    m = code.match(/^6([12])(\d|\(\d{2,}\))(\d|\(\d{2,}\))?([ABCDE])$/);
    if (m) {
      const n = halfNumber(m[2]);
      const twists = m[3] ? halfNumber(m[3]) : null;
      if (n === null || (m[3] && twists === null)) return '';
      const base = n === 1
        ? 'plongeon ' + direction[m[1]]
        : movement(n, 'salto') + ' ' + direction[m[1]];
      return 'Départ en équilibre, ' + base +
        (twists ? ' avec ' + movement(twists, 'vrille') : '') +
        positionPhrase(m[4]);
    }
    // Aucun nom inventé pour un code inconnu.
    return '';
  }

  function activeMode(modal) {
    return $('#evalScoringMode', modal)?.value || 'EAH';
  }

  function message(modal, text, isError = false) {
    const target = $('#evalMessage', modal);
    if (!target) return;
    target.textContent = text;
    target.style.cssText = [
      'margin-top:14px', 'padding:12px', 'border-radius:12px',
      isError ? 'background:rgba(224,82,94,.17)' : 'background:rgba(24,185,120,.17)'
    ].join(';');
  }

  async function loadCoachData() {
    const { data, error } = await requireSupabase().rpc(
      'eah_coach_card_workspace',
      { p_token: coachToken }
    );
    if (error) throw error;
    if (!data) throw new Error('Espace coach inaccessible.');
    coachData = data;
    return data;
  }

  async function installActions() {
    if (loadingActions) return;
    loadingActions = true;
    try {
      const app = $('#eahCoachCardApp');
      if (!app) return;
      if (!coachData) await loadCoachData();
      if (coachData.assigned !== true) return;

      // Bouton évaluation libre.
      const stats = $('.coach-stat-grid', app);
      if (stats && !$('#eahEvaluateDive')) {
        const button = document.createElement('button');
        button.id = 'eahEvaluateDive';
        button.type = 'button';
        button.textContent = 'Évaluer un plongeon';
        button.style.cssText = 'width:100%;min-height:58px;margin:20px 0;border:0;border-radius:16px;background:#0b6bff;color:white;font-size:16px;font-weight:900';
        button.onclick = () => openEvaluation().catch(console.error);
        stats.insertAdjacentElement('afterend', button);
      }

      const sections = $$('.coach-section', app);
      if (!sections[0]) return;

      // Demandes de grading non terminées.
      const requests = (coachData.gradingRequests || []).filter(request =>
        !['GRADED','DONE','COMPLETED'].includes(
          String(request.status || 'PENDING').toUpperCase()
        )
      );
      const cards = $$('.coach-list-card', sections[0]);
      requests.forEach((request, index) => {
        const card = cards[index];
        if (!card || $('.eah-grade-button', card)) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'eah-grade-button';
        button.textContent = 'Grader le plongeon';
        button.style.cssText = 'width:100%;min-height:50px;margin-top:12px;border:1px solid rgba(48,207,255,.35);border-radius:14px;background:rgba(48,207,255,.10);color:#30cfff;font-weight:900';
        button.onclick = () => openEvaluation({
          requestId: request.id,
          eahId: request.eahId,
          diveCode: request.diveCode,
          diveName: request.diveName,
          height: request.height,
          videoUrl: request.videoUrl
        }).catch(console.error);
        card.appendChild(button);
      });

      // Accès au profil des plongeurs depuis l'espace coach.
      if (sections[1]) {
        const diverCards = $$('.coach-list-card', sections[1]);
        (coachData.divers || []).forEach((diver, index) => {
          const card = diverCards[index];
          if (!card || $('.eah-open-diver', card)) return;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'eah-open-diver';
          button.textContent = 'Ouvrir le profil';
          button.style.cssText = 'width:100%;min-height:48px;margin-top:10px;border:1px solid rgba(48,207,255,.30);border-radius:14px;background:transparent;color:#30cfff;font-weight:900';
          button.onclick = () => openDiverProfile(diver);
          card.appendChild(button);
        });
      }
    } catch (error) {
      console.warn('EAH Workspace :', error.message);
    } finally {
      loadingActions = false;
    }
  }

  function phaseHTML(phase, title) {
    return `
      <section class="eah-phase" data-phase-panel="${phase}" style="margin-top:18px;padding:18px;border-radius:18px;background:rgba(3,19,31,.55)">
        <h3>${esc(title)} — <span id="score-${phase}">—/10</span></h3>
        ${criteria[phase].map(([code, label]) => `
          <label style="display:grid;grid-template-columns:1fr 90px;gap:10px;align-items:center;margin-top:10px">
            <span><strong>${code}</strong> ${esc(label)}</span>
            <select data-phase="${phase}" data-code="${code}" style="min-height:45px;background:#10273a;color:white;border-radius:10px">
              <option value="">Choisir</option>
              <option value="0">0 / 2</option>
              <option value="1">1 / 2</option>
              <option value="2">2 / 2</option>
              <option value="NA">N/A</option>
            </select>
          </label>
        `).join('')}
      </section>`;
  }

  function getCriteria(modal, strict = false) {
    const result = {};
    for (const field of $$('[data-code]', modal)) {
      const value = field.value;
      if (strict && value === '') {
        throw new Error('Renseigne ' + field.dataset.code + ' (ou N/A).');
      }
      result[field.dataset.code] = (value === '' || value === 'NA')
        ? null : Number(value);
    }
    return result;
  }

  function getPhaseScore(modal, phase) {
    const fields = $$(`[data-phase="${phase}"]`, modal);
    let obtained = 0;
    let applicable = 0;
    for (const field of fields) {
      if (field.value === '' || field.value === 'NA') continue;
      obtained += Number(field.value);
      applicable++;
    }
    if (!applicable) return null;
    // Même arrondi que dans le fichier d'origine.
    return Math.round((obtained / (applicable * 2)) * 10);
  }

  function getFinal(d, t, e) {
    if ([d, t, e].some(v => v === null || !Number.isFinite(v))) return null;
    const min = Math.min(d, t, e);
    const count = [d, t, e].filter(v => v === min).length;
    return Math.min(10, min + (count === 1 ? 0.5 : 0));
  }

  function updateScores(modal) {
    const scores = {
      takeoff: getPhaseScore(modal, 'takeoff'),
      trick: getPhaseScore(modal, 'trick'),
      entry: getPhaseScore(modal, 'entry')
    };
    for (const [phase, score] of Object.entries(scores)) {
      const label = $('#score-' + phase, modal);
      if (label) label.textContent = score === null ? '—/10' : score + '/10';
    }
    const score = getFinal(scores.takeoff, scores.trick, scores.entry);
    const label = $('#finalEAH', modal);
    if (label) label.textContent = score === null ? '—' : String(score);
    return { ...scores, eah: score };
  }

  function updateEvalMode(modal) {
    const mode = activeMode(modal);
    
const wa = document.getElementById('evalWA');

if (wa) {
  wa.style.display = needsWA ? '' : 'none';
  wa.required = needsWA;

  const waLabel = wa.previousElementSibling;

  if (waLabel?.tagName === 'LABEL') {
    waLabel.style.display =
      needsWA ? '' : 'none';
  }
}

const eahResult = document.getElementById('finalEAH');

if (eahResult?.parentElement) {
  eahResult.parentElement.style.display =
    needsEAH ? '' : 'none';
}

    const needsWA = mode !== 'EAH';
    const phases = $('#eahEvalPhaseFields', modal);
    if (phases) phases.style.display = needsEAH ? '' : 'none';
    const result = $('#eahEvalFinal', modal);
    if (result) result.style.display = needsEAH ? '' : 'none';
    const waLabel = $('#eahEvalWaField', modal);
    if (waLabel) waLabel.style.display = needsWA ? '' : 'none';
    const wa = $('#evalWA', modal);
    if (wa) wa.required = needsWA;
    updateScores(modal);
  }

  async function openEvaluation(prefill = {}) {
    const app = $('#eahCoachCardApp');
    if (!app) return;
    if (!coachData) await loadCoachData();
    if (coachData.assigned !== true) throw new Error('Carte coach non attribuée.');

    $('#eahEvaluationModal')?.remove();
    const divers = coachData.divers || [];
    if (!divers.length) {
      alert('Aucun plongeur disponible pour ce club.');
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'eahEvaluationModal';
    modal.dataset.requestId = String(prefill.requestId || '');
    modal.style.cssText = 'position:fixed;inset:0;z-index:2147483647;overflow-y:auto;padding:12px;background:rgba(1,9,18,.97);color:white;visibility:visible;pointer-events:auto';

    const selectedMode = ['EAH','WA','BOTH'].includes(prefill.scoringMode)
      ? prefill.scoringMode : 'EAH';
    const initialCode = normalizeCode(prefill.diveCode);
    const initialName = String(prefill.diveName || '');
    const automatic = automaticDiveName(initialCode);
    const displayName = initialName || automatic;
    const fieldStyle = 'width:100%;min-height:52px;box-sizing:border-box;margin:6px 0 14px;background:#10273a;color:white;border:1px solid rgba(143,205,255,.28);border-radius:10px;padding:10px';

    modal.innerHTML = `
      <div style="width:100%;max-width:850px;margin:10px auto 80px;box-sizing:border-box;padding:22px;border-radius:24px;background:#061e33">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:15px">
          <div><span style="color:#30cfff;font-weight:900">EAH DIVING</span><h1>Grader un plongeon</h1></div>
          <button id="closeEval" type="button" aria-label="Fermer" style="width:45px;height:45px;border:0;border-radius:50%">×</button>
        </div>
        <form id="coachEvaluationForm">
          <label for="evalDiver">Plongeur</label>
          <select id="evalDiver" required style="${fieldStyle}">
            ${divers.map(diver => `
              <option value="${esc(diver.id)}" ${prefill.eahId && String(prefill.eahId) === String(diver.eahId) ? 'selected' : ''}>
                ${esc((diver.firstName || '') + ' ' + (diver.lastName || '') + ' — ' + (diver.eahId || ''))}
              </option>
            `).join('')}
          </select>

          <label for="evalCode">Code du plongeon</label>
          <input id="evalCode" required autocomplete="off" value="${esc(initialCode)}" style="${fieldStyle}">

          <label for="evalName">Nom du plongeon (modifiable)</label>
          <input id="evalName" required value="${esc(displayName)}" style="${fieldStyle}">

          <label for="evalHeight">Hauteur en mètres</label>
          <input id="evalHeight" type="number" min="0" step="0.1" required value="${esc(prefill.height ?? '')}" style="${fieldStyle}">

          <label for="evalScoringMode">Type de notation</label>
          <select id="evalScoringMode" style="${fieldStyle}">
            <option value="EAH" ${selectedMode === 'EAH' ? 'selected' : ''}>EAH Diving</option>
            <option value="WA" ${selectedMode === 'WA' ? 'selected' : ''}>World Aquatics</option>
            <option value="BOTH" ${selectedMode === 'BOTH' ? 'selected' : ''}>EAH + WA</option>
          </select>

          <label id="eahEvalWaField" style="display:block">
            <span>Note World Aquatics /10</span>
            <input id="evalWA" type="number" min="0" max="10" step="0.5" value="${esc(prefill.waScore ?? '')}" style="${fieldStyle}">
          </label>

          <label for="evalVideo">Lien vidéo (facultatif)</label>
          <input id="evalVideo" type="url" value="${esc(prefill.videoUrl || '')}" style="${fieldStyle}">

          <div id="eahEvalPhaseFields">
            ${phaseHTML('takeoff', 'Takeoff — Départ')}
            ${phaseHTML('trick', 'Trick — Vol')}
            ${phaseHTML('entry', 'Entry — Entrée')}
          </div>

          <div id="eahEvalFinal" style="margin-top:20px;padding:20px;text-align:center;background:rgba(11,107,255,.12);border-radius:18px">
            NOTE EAH
            <strong id="finalEAH" style="display:block;font-size:3rem;color:#30cfff">—</strong>
          </div>

          <textarea id="evalPositive" placeholder="Points réussis" style="${fieldStyle};min-height:90px"></textarea>
          <textarea id="evalImprove" placeholder="Critères à améliorer" style="${fieldStyle};min-height:90px"></textarea>
          <textarea id="evalComment" placeholder="Commentaire coach" style="${fieldStyle};min-height:90px"></textarea>

          <button id="submitEval" type="submit" style="width:100%;min-height:58px;margin-top:18px;border:0;border-radius:16px;background:#0b6bff;color:white;font-weight:900">
            Valider l'évaluation
          </button>
          <div id="evalMessage" role="status" aria-live="polite"></div>
        </form>
      </div>
    `;

    app.appendChild(modal);
    $('#closeEval', modal).onclick = () => {
      if (!saving) modal.remove();
    };

    // Le nom généré ne remplace jamais un nom écrit manuellement.
    const codeField = $('#evalCode', modal);
    const nameField = $('#evalName', modal);
    let manualName = !!initialName && initialName !== automatic;
    nameField.dataset.eahManual = manualName ? '1' : '';
    nameField.addEventListener('input', () => {
      manualName = nameField.value.trim().length > 0;
      nameField.dataset.eahManual = manualName ? '1' : '';
    });
    codeField.addEventListener('input', () => {
      codeField.value = normalizeCode(codeField.value);
      if (!manualName) nameField.value = automaticDiveName(codeField.value);
    });

    $('#evalScoringMode', modal).addEventListener('change', () => updateEvalMode(modal));
    $$('[data-phase]', modal).forEach(select => {
      select.addEventListener('change', () => updateScores(modal));
    });
    $('#coachEvaluationForm', modal).addEventListener('submit', submitEvaluation);
    updateEvalMode(modal);
  }

  async function submitEvaluation(event) {
    event.preventDefault();
    const modal = $('#eahEvaluationModal');
    if (!modal || saving) return;
    saving = true;
    const button = $('#submitEval', modal);
    button.disabled = true;
    button.textContent = 'Enregistrement…';

    try {
      const get = id => $('#' + id, modal)?.value.trim() || '';
      const mode = activeMode(modal);
      const needsWA = mode === 'WA' || mode === 'BOTH';
      const needsEAH = mode === 'EAH' || mode === 'BOTH';
      const diveCode = normalizeCode(get('evalCode'));
      const diveName = get('evalName') || automaticDiveName(diveCode);
      const height = Number(get('evalHeight'));
      const waScore = needsWA ? Number(get('evalWA')) : null;

      if (!get('evalDiver')) throw new Error('Choisis un plongeur.');
      if (!diveCode || !diveName) {
        throw new Error('Code ou nom du plongeon manquant.');
      }
      if (!get('evalHeight') || !Number.isFinite(height) || height < 0) {
        throw new Error('Hauteur invalide.');
      }
      if (needsWA && (!get('evalWA') || !Number.isFinite(waScore) || waScore < 0 || waScore > 10)) {
        throw new Error('Note WA obligatoire entre 0 et 10.');
      }

      const scores = needsEAH ? updateScores(modal) : null;
      const selectedCriteria = needsEAH ? getCriteria(modal, true) : {};
      if (needsEAH && [scores.takeoff, scores.trick, scores.entry, scores.eah].some(v => v === null)) {
        throw new Error('Au moins un critère applicable par phase est nécessaire.');
      }

      const payload = {
        requestId: modal.dataset.requestId || '',
        diverId: get('evalDiver'),
        discipline: 'Plongeon',
        scoringMode: mode,
        scoreType: mode === 'BOTH' ? 'EAH' : mode,
        primaryScoreType: mode === 'WA' ? 'WA' : 'EAH',
        diveCode,
        diveName,
        height: String(height),
        waScore: needsWA ? String(waScore) : null,
        takeoff: needsEAH ? scores.takeoff : null,
        trick: needsEAH ? scores.trick : null,
        entry: needsEAH ? scores.entry : null,
        eahScore: needsEAH ? scores.eah : null,
        criteria: selectedCriteria,
        videoUrl: get('evalVideo'),
        positive: get('evalPositive'),
        improve: get('evalImprove'),
        comment: get('evalComment')
      };

      // IMPORTANT : V2 doit être installée dans Supabase.
      // Ne pas revenir à V1 en mode WA : V1 écrit une fausse note EAH.
      const { data, error } = await requireSupabase().rpc(
        'eah_coach_submit_evaluation_v2',
        { p_token: coachToken, p_payload: payload }
      );
      if (error) throw error;
      if (!data || data.ok === false) {
        throw new Error(data?.error || 'Évaluation impossible.');
      }

      const label = mode === 'WA'
        ? 'World Aquatics : ' + waScore + '/10'
        : mode === 'BOTH'
          ? 'EAH : ' + (data.eahScore ?? scores.eah) + '/10 — WA : ' + waScore + '/10'
          : 'EAH : ' + (data.eahScore ?? scores.eah) + '/10';

      message(modal, 'Évaluation enregistrée. ' + label + '. Le Grade Report PDF est traité séparément.');
      button.textContent = 'Enregistré';

      // Les demandes notées disparaissent au prochain chargement.
      setTimeout(() => window.location.reload(), 1400);

    } catch (error) {
      message(modal, error.message || 'Enregistrement impossible.', true);
      button.textContent = "Valider l'évaluation";
      button.disabled = false;
    } finally {
      saving = false;
    }
  }

  function openDiverProfile(diver) {
    const app = $('#eahCoachCardApp');
    if (!app) return;

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;z-index:2147483647;overflow-y:auto;padding:15px;background:rgba(1,9,18,.97);color:white';
    const image = safeImage(diver.photoUrl);

    modal.innerHTML = `
      <div style="width:100%;max-width:700px;margin:auto;padding:25px;box-sizing:border-box;border-radius:25px;background:#061e33;text-align:center">
        <button id="closeDiverCoach" type="button" style="float:right">×</button>
        ${image ? `<img src="${esc(image)}" alt="Portrait du plongeur" style="width:160px;height:160px;object-fit:cover;border:6px solid #30cfff;border-radius:34px">` : ''}
        <h1>${esc((diver.firstName || '') + ' ' + (diver.lastName || ''))}</h1>
        <p>${esc(diver.eahId || '')}</p>
        <p>${esc(diver.group || '')}</p>
        <p>Blason : ${esc(diver.currentBlazon || 'En progression')}</p>
        <button id="evalThisDiver" type="button" style="width:100%;min-height:55px;margin-top:20px;border:0;border-radius:15px;background:#0b6bff;color:white;font-weight:900">Évaluer un plongeon</button>
      </div>
    `;

    app.appendChild(modal);
    $('#closeDiverCoach', modal).onclick = () => modal.remove();
    $('#evalThisDiver', modal).onclick = () => {
      modal.remove();
      openEvaluation({ eahId: diver.eahId }).catch(console.error);
    };
  }

  // L'application coach NFC est injectée de manière asynchrone.
  let tries = 0;
  const timer = setInterval(async () => {
    tries++;
    await installActions();
    if ($('#eahEvaluateDive') || tries > 30) clearInterval(timer);
  }, 350);
})();
