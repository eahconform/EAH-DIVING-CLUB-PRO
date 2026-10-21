
/* EAH DIVING - BOUTIQUE V2 */

const EAH_BOUTIQUE_ID =
  '1eZMs98Z5sig9RJLP5UjaF-fUub2KwvQ2DP-C9GH84zE';

const EAH_BOUTIQUE_TAB = 'BOUTIQUE';

function EAH_BOUTIQUE_SHEET_() {
  const sheet = SpreadsheetApp
    .openById(EAH_BOUTIQUE_ID)
    .getSheetByName(EAH_BOUTIQUE_TAB);

  if (!sheet) {
    throw new Error('Feuille BOUTIQUE introuvable');
  }
  return sheet;
}

function EAH_BOUTIQUE_BOOL_(value) {
  return value === true ||
    ['TRUE', 'VRAI', 'OUI', '1']
      .includes(String(value).toUpperCase());
}

function EAH_BOUTIQUE_NUM_(value) {
  if (value === '' || value === null) return NaN;

  return Number(
    String(value)
      .replace(/[\s€]/g, '')
      .replace(',', '.')
  );
}

/* INSTALLATION : À EXÉCUTER UNE SEULE FOIS */

function EAH_BOUTIQUE_INSTALLER() {
  EAH_BOUTIQUE_SHEET_();

  ScriptApp.getProjectTriggers()
    .filter(t =>
      t.getHandlerFunction() === 'EAH_BOUTIQUE_ON_EDIT'
    )
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('EAH_BOUTIQUE_ON_EDIT')
    .forSpreadsheet(EAH_BOUTIQUE_ID)
    .onEdit()
    .create();

  EAH_BOUTIQUE_RECALCULER_(new Set());

  Logger.log('Boutique : automatisation installée.');
}

/* DÉCLENCHÉ LORS DES MODIFICATIONS DU SHEET */

function EAH_BOUTIQUE_ON_EDIT(e) {
  if (
    !e ||
    !e.range ||
    e.range.getSheet().getName() !== EAH_BOUTIQUE_TAB
  ) return;

  const range = e.range;

  if (
    range.getLastRow() < 2 ||
    range.getColumn() > 16
  ) return;

  const changed = new Set();

  for (
    let n = Math.max(2, range.getRow());
    n <= range.getLastRow();
    n++
  ) {
    changed.add(n);
  }

  EAH_BOUTIQUE_RECALCULER_(changed);
}

/* ID UNIQUE / ORDRE / STATUT */

function EAH_BOUTIQUE_RECALCULER_(changedRows) {
  const changed = changedRows || new Set();
  const lock = LockService.getScriptLock();

  lock.waitLock(25000);

  try {
    const sheet = EAH_BOUTIQUE_SHEET_();
    const count = sheet.getLastRow() - 1;

    if (count <= 0) return;

    const source = sheet
      .getRange(2, 1, count, 18)
      .getValues();

    const seen = new Set();
    let next = 1;

    for (const row of source) {
      const id = String(row[0] || '').trim();
      const match = id.match(/^EAH-BTQ-(\d+)$/);

      if (match) {
        next = Math.max(
          next,
          Number(match[1]) + 1
        );
      }
    }

    let order = 0;
    let dirty = false;

    const ids = [];
    const ordres = [];
    const sync = [];

    source.forEach((row, index) => {
      const sheetRow = index + 2;
      const name = String(row[3] || '').trim();
      const active = EAH_BOUTIQUE_BOOL_(row[1]);

      let id = String(row[0] || '').trim();
      let ordre = '';
      let statut = '';
      let syncedAt = row[17] || '';

      if (active && name) {
        if (!id || seen.has(id)) {
          do {
            id =
              'EAH-BTQ-' +
              String(next++).padStart(4, '0');
          } while (seen.has(id));
        }

        seen.add(id);
        ordre = ++order;

        const prix = EAH_BOUTIQUE_NUM_(row[4]);
        const stock = EAH_BOUTIQUE_NUM_(row[5]);

        const valid =
          Number.isFinite(prix) &&
          prix >= 0 &&
          Number.isInteger(stock) &&
          stock >= 0;

        const altered =
          changed.has(sheetRow) ||
          id !== String(row[0] || '').trim() ||
          Number(row[2]) !== ordre;

        if (!valid) {
          statut = 'A_COMPLETER';
          syncedAt = '';
        } else if (
          altered ||
          row[16] !== 'SYNCHRONISE'
        ) {
          statut = 'EN_ATTENTE';
          syncedAt = '';
        } else {
          statut = 'SYNCHRONISE';
        }

      } else if (name) {
        if (id) seen.add(id);

        statut = active
          ? 'A_COMPLETER'
          : 'INACTIF';

        syncedAt = '';

      } else {
        if (id) seen.add(id);

        statut = active
          ? 'A_COMPLETER'
          : '';

        syncedAt = '';
      }

      ids.push([id]);
      ordres.push([ordre]);
      sync.push([statut, syncedAt]);

      if (
        id !== String(row[0] || '').trim() ||
        String(ordre) !== String(row[2] ?? '') ||
        statut !== String(row[16] || '') ||
        String(syncedAt) !== String(row[17] || '')
      ) {
        dirty = true;
      }
    });

    if (dirty) {
      sheet.getRange(2, 1, count, 1)
        .setValues(ids);

      sheet.getRange(2, 3, count, 1)
        .setValues(ordres);

      sheet.getRange(2, 17, count, 2)
        .setValues(sync);

      SpreadsheetApp.flush();
    }

  } finally {
    lock.releaseLock();
  }
}

/* CATALOGUE PUBLIC SERVI AU SITE */

function EAH_BOUTIQUE_PUBLIC_GET() {
  try {
    const sheet = EAH_BOUTIQUE_SHEET_();
    const count = sheet.getLastRow() - 1;

    const rows = count > 0
      ? sheet.getRange(2, 1, count, 18).getValues()
      : [];

    const products = [];
    const published = [];

    rows.forEach((row, i) => {
      if (
        !EAH_BOUTIQUE_BOOL_(row[1]) ||
        !String(row[3] || '').trim()
      ) return;

      const price = EAH_BOUTIQUE_NUM_(row[4]);
      const stock = EAH_BOUTIQUE_NUM_(row[5]);

      if (
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(stock) ||
        stock < 0
      ) return;

      const sizes = ['XS', 'S', 'M', 'L', 'XL']
        .filter((size, s) =>
          EAH_BOUTIQUE_BOOL_(row[6 + s])
        );

      products.push({
        id: String(
          row[0] || 'EAH-BTQ-' + (i + 1)
        ),

        ordre: Number(row[2]) || (i + 1),

        nom: String(row[3] || ''),
        prix: price,
        stock: stock,
        tailles: sizes,

        description: String(row[11] || ''),

        photos: row.slice(12, 15)
          .map(v => String(v || '').trim())
          .filter(Boolean),

        video: String(row[15] || '').trim()
      });

      if (row[16] !== 'SYNCHRONISE') {
        published.push(i);
      }
    });

    products.sort(
      (a, b) => a.ordre - b.ordre
    );

    if (published.length) {
      const lock = LockService.getScriptLock();
      lock.waitLock(20000);

      try {
        const current = sheet
          .getRange(2, 17, count, 2)
          .getValues();

        const now = new Date();

        for (const i of published) {
          if (
            current[i][0] === 'EN_ATTENTE' ||
            current[i][0] === 'SYNCHRONISE'
          ) {
            current[i] = ['SYNCHRONISE', now];
          }
        }

        sheet.getRange(2, 17, count, 2)
          .setValues(current);

      } finally {
        lock.releaseLock();
      }
    }

    return EAH_BOUTIQUE_JSONP_({
      ok: true,
      products: products
    });

  } catch (error) {
    console.error(error);

    return EAH_BOUTIQUE_JSONP_({
      ok: false,
      error: 'Catalogue inaccessible'
    });
  }
}

function EAH_BOUTIQUE_JSONP_(result) {
  return ContentService
    .createTextOutput(
      'window.EAH_BOUTIQUE_CALLBACK(' +
      JSON.stringify(result) +
      ');'
    )
    .setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
}
