
/*
 * EAH DIVING — RÉCUPÉRATION V18
 *
 * Compatible avec la branche :
 * recuperation-eah-20261009
 *
 * Corrige :
 * - Historique EAH + WA
 * - Absence des champs Ville / Spot
 * - Présentation mobile
 *
 * Ne change aucun compte ou accès NFC.
 */
(() => {
  'use strict';

  const escape = value =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const note = value => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ''
    ) {
      return null;
    }

    const n = Number(
      String(value).replace(',', '.')
    );

    return Number.isFinite(n) ? n : null;
  };

  const fmt = n =>
    String(n).replace('.', ',');

  function style() {
    if (document.getElementById('eahV18Style')) {
      return;
    }

    const css = document.createElement('style');
    css.id = 'eahV18Style';

    css.textContent = `
      #profileHistory .history-score {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
        text-align: right;
        min-width: 105px;
      }

      #profileHistory .eah-v18-scores {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
      }

      #profileHistory .eah-v18-scores span {
        display: block;
        font-size: 17px;
        font-weight: 800;
        white-space: nowrap;
        line-height: 1.35;
      }

      #profileHistory .eah-v18-scores .eah {
        color: #ffffff;
      }

      #profileHistory .eah-v18-scores .wa {
        color: #30cfff;
      }

      #profileHistory .profile-history-item {
        display: flex;
        justify-content: space-between;
        gap: 15px;
        min-width: 0;
      }

      #profileHistory .history-score a {
        color: #30cfff;
        text-decoration: none;
        font-weight: 700;
        font-size: 13px;
      }

      #faire-grader .eah-v18-field input {
        width: 100%;
      }

      @media(max-width:550px) {
        #profileHistory .eah-v18-scores span {
          font-size: 15px;
        }

        #profileHistory .profile-history-item {
          gap: 8px;
        }
      }
    `;

    document.head.appendChild(css);
  }

  /*
   * Le vrai moteur de cette branche est
   * renderProfileHistory(data).
   *
   * Contrairement au correctif V15,
   * on utilise ici les vrais éléments
   * #profileHistory et .profile-history-item.
   */
  function installHistoryPatch() {
    const original = window.renderProfileHistory;

    if (
      typeof original !== 'function' ||
      original.__eahV18
    ) {
      return;
    }

    function corrected(data) {
      original.apply(this, arguments);

      const evaluations =
        Array.isArray(data?.evaluations)
          ? data.evaluations
          : [];

      const cards = document.querySelectorAll(
        '#profileHistory .profile-history-item'
      );

      cards.forEach((card, index) => {
        const evaluation = evaluations[index];

        if (!evaluation) {
          return;
        }

        const eah = note(
          evaluation.eah_score ??
          evaluation.eah
        );

        const wa = note(evaluation.wa_score);

        const container =
          card.querySelector('.history-score');

        const strong =
          container?.querySelector('strong');

        if (!strong || (eah === null && wa === null)) {
          return;
        }

        const group = document.createElement('span');
        group.className = 'eah-v18-scores';

        if (eah !== null) {
          const item = document.createElement('span');
          item.className = 'eah';
          item.textContent = 'EAH ' + fmt(eah) + '/10';
          group.appendChild(item);
        }

        if (wa !== null) {
          const item = document.createElement('span');
          item.className = 'wa';
          item.textContent = 'WA ' + fmt(wa) + '/10';
          group.appendChild(item);
        }

        strong.replaceChildren(group);
      });
    }

    corrected.__eahV18 = true;
    window.renderProfileHistory = corrected;
  }

  function addField(afterId, newId, labelText) {
    if (document.getElementById(newId)) {
      return;
    }

    const anchor = document.getElementById(afterId)
      ?.closest('label');

    if (!anchor) {
      return;
    }

    const label = document.createElement('label');
    label.className = 'eah-v18-field';

    const title = document.createElement('span');
    title.textContent = labelText;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = newId;
    input.maxLength = newId.toLowerCase().includes('city')
      ? 100
      : 160;

    input.placeholder = newId.toLowerCase().includes('city')
      ? 'Ex. : Lyon'
      : 'Ex. : Piscine de Vaise';

    label.append(title, input);
    anchor.after(label);
  }

  function installPublicFields() {
    addField(
      'publicVideo',
      'publicSpotName',
      'Spot / piscine'
    );

    addField(
      'publicVideo',
      'publicDiveCity',
      'Ville du plongeon'
    );
  }

  function installDiverFields() {
    addField(
      'diverRequestVideo',
      'diverRequestSpot',
      'Spot / piscine'
    );

    addField(
      'diverRequestVideo',
      'diverRequestCity',
      'Ville du plongeon'
    );
  }

  function start() {
    style();
    installHistoryPatch();
    installPublicFields();
    installDiverFields();

    // Le formulaire plongeur est une fenêtre
    // créée seulement quand le coach/plongeur
    // clique sur "Soumettre un plongeon".
    const observer = new MutationObserver(() => {
      if (
        document.getElementById('eahDiverRequestModal')
      ) {
        installDiverFields();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      start,
      { once: true }
    );
  } else {
    start();
  }
})();
