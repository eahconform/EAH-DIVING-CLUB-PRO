
/* =====================================================
   EAH DIVING - NOMENCLATURE PEDAGOGIQUE V2
   Décode les conventions connues.
   Ne certifie pas l'homologation World Aquatics.
===================================================== */

(() => {
  'use strict';

  const special = {
    '001A': 'Chute avant droite',
    '001B': 'Chute avant carpée',
    '001C': 'Chute avant groupée',
    '002A': 'Chute arrière droite',
    '002AS': 'Plongeon arrière droit en sautant',
    '100A': 'Chandelle avant droite'
  };

  const directions = {
    1: 'avant',
    2: 'arrière',
    3: 'renversé',
    4: 'retourné'
  };

  const positions = {
    A: 'droite',
    B: 'carpée',
    C: 'groupée',
    D: 'libre',
    E: 'trois positions (A/B/C)'
  };

  const adjectives = {
    A: 'droit',
    B: 'carpé',
    C: 'groupé',
    D: 'libre',
    E: 'en trois positions (A/B/C)'
  };

  function half(n) {
    const x = Number(
      String(n).replace(/[()]/g, '')
    );

    if (!Number.isInteger(x) || x < 1 || x > 40) {
      return null;
    }

    return x;
  }

  function quantity(n) {
    const whole = Math.floor(n / 2);
    return (
      (whole ? String(whole) : '') +
      (n % 2 ? '½' : '')
    );
  }

  function movement(n, name) {
    return (
      quantity(n) + ' ' +
      name + (n > 3 ? 's' : '')
    );
  }

  function position(letter) {
    return letter === 'E'
      ? ', en trois positions (A/B/C)'
      : ', position ' + positions[letter];
  }

  function decode(raw) {
    const code = String(raw || '')
      .toUpperCase()
      .replace(/\s+/g, '');

    if (special[code]) return special[code];

    let m = code.match(
      /^([1-4])([01])(\d{1,2})([ABCDE])$/
    );

    if (m) {
      const n = half(m[3]);

      if (n === null ||
          (m[3].length > 1 && m[3][0] === '0')) {
        return '';
      }

      const flying =
        m[2] === '1' ? ' en vol plané' : '';

      if (n === 1) {
        return (
          'Plongeon ' +
          directions[m[1]] + ' ' +
          adjectives[m[4]] +
          flying
        );
      }

      return (
        movement(n, 'salto') + ' ' +
        directions[m[1]] +
        flying +
        position(m[4])
      );
    }

    m = code.match(
      /^5([1-4])(\d|\(\d{2,}\))(\d|\(\d{2,}\))([ABCDE])$/
    );

    if (m) {
      const n = half(m[2]);
      const v = half(m[3]);

      if (n === null || v === null) return '';

      const base = n === 1
        ? 'Plongeon ' + directions[m[1]]
        : movement(n, 'salto') +
          ' ' + directions[m[1]];

      return (
        base + ' avec ' +
        movement(v, 'vrille') +
        position(m[4])
      );
    }

    m = code.match(
      /^6([12])(\d|\(\d{2,}\))(\d|\(\d{2,}\))?([ABCDE])$/
    );

    if (m) {
      const n = half(m[2]);
      const v = m[3] ? half(m[3]) : null;

      if (n === null || (m[3] && v === null)) {
        return '';
      }

      return (
        'Départ en équilibre, ' +
        (n === 1
          ? 'plongeon '
          : movement(n, 'salto') + ' ') +
        directions[m[1]] +
        (v ? ' avec ' + movement(v, 'vrille') : '') +
        position(m[4])
      );
    }

    return '';
  }

  window.EAH_DIVE_NAME_V2 = decode;

  // Formulaire classique et fenêtre coach NFC.
  document.addEventListener('input', event => {
    const el = event.target;

    if (el.id === 'diveName' ||
        el.id === 'evalName') {
      el.dataset.eahManual = '1';
      return;
    }

    if (el.id !== 'diveCode' &&
        el.id !== 'evalCode') {
      return;
    }

    const nameId = el.id === 'diveCode'
      ? 'diveName'
      : 'evalName';

    const name =
      document.getElementById(nameId);

    if (!name || name.dataset.eahManual === '1') {
      return;
    }

    const generated = decode(el.value);

    if (generated) {
      name.value = generated;
    }
  }, true);

  document.addEventListener('focusin', event => {
    const el = event.target;

    if (el.id !== 'diveName' &&
        el.id !== 'evalName') {
      return;
    }

    if (el.value.trim()) return;

    const codeId = el.id === 'diveName'
      ? 'diveCode'
      : 'evalCode';

    const code =
      document.getElementById(codeId);

    if (code) {
      el.value = decode(code.value);
    }
  });

})();
