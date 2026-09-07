/**
 * Return model used on the later estimator pages.
 * Gross rent → operator fee → opex → tax/community → net; payout is max(net, 4% of price).
 *
 * Type A price is the developer-confirmed €236,141 all-in.
 * Type B price here is the workbook all-in at presale (€253,885) — not rebuilt to €236,141.
 * taxCommunityEur is a draft (€400); the workbook community cell was #REF!.
 */
(function (global) {
  'use strict';

  global.EFConfig = {
    floorPct: 0.04,
    taxCommunityEur: 400,
    units: {
      A: {
        label: 'Type A',
        price: 236141,
        rentMonthly: { long: 900, mixed: 1400, tourist: 2200 },
        opexEur: { long: 500, mixed: 1450, tourist: 1700 },
        feePct: { long: 0.08, mixed: 0.1, tourist: 0.14 }
      },
      B: {
        label: 'Type B',
        price: 253885,
        rentMonthly: { long: 1100, mixed: 1650, tourist: 2500 },
        opexEur: { long: 500, mixed: 1450, tourist: 1700 },
        feePct: { long: 0.08, mixed: 0.1, tourist: 0.14 }
      }
    },
    inventory: [
      { id: 'A1', type: 'A', puerta: 5, status: 'available' },
      { id: 'A2', type: 'A', puerta: 6, status: 'available' },
      { id: 'A3', type: 'A', puerta: 7, status: 'available' },
      { id: 'A4', type: 'A', puerta: 8, status: 'available' },
      { id: 'B1', type: 'B', puerta: 1, status: 'available' },
      { id: 'B2', type: 'B', puerta: 2, status: 'available' },
      { id: 'B3', type: 'B', puerta: 3, status: 'available' },
      { id: 'B4', type: 'B', puerta: 4, status: 'available' },
      { id: 'B5', type: 'B', puerta: 9, status: 'available' },
      { id: 'B6', type: 'B', puerta: 10, status: 'reserved' }
    ]
  };

  global.EFMath = {
    euro: function (n) {
      return '€' + Math.round(n).toLocaleString('en-GB');
    },
    pct: function (n) {
      return (n * 100).toFixed(1) + '%';
    },
    compute: function (unitKey, strategy, purchase, ltvPct, ratePct) {
      var u = global.EFConfig.units[unitKey];
      var gross = u.rentMonthly[strategy] * 12;
      var fee = gross * u.feePct[strategy];
      var opex = u.opexEur[strategy];
      var tax = global.EFConfig.taxCommunityEur;
      var net = Math.max(0, gross - fee - opex - tax);
      var floorEur = u.price * global.EFConfig.floorPct;
      var payout = Math.max(net, floorEur);
      var equity = u.price;
      var interest = 0;
      var cashOnCash = null;
      purchase = purchase || 'cash';
      ltvPct = ltvPct || 0;
      ratePct = ratePct || 0;
      if (purchase === 'leveraged') {
        var loan = u.price * (ltvPct / 100);
        equity = Math.max(u.price - loan, 1);
        interest = loan * (ratePct / 100);
        cashOnCash = (payout - interest) / equity;
      }
      return {
        unit: u,
        gross: gross,
        fee: fee,
        feePct: u.feePct[strategy],
        opex: opex,
        tax: tax,
        net: net,
        yieldOnPrice: net / u.price,
        floorEur: floorEur,
        floorPct: global.EFConfig.floorPct,
        floorApplies: floorEur > net,
        payout: payout,
        payoutYield: payout / u.price,
        equity: equity,
        interest: interest,
        cashOnCash: cashOnCash,
        price: u.price
      };
    },
    cascadeRows: function (r) {
      var g = r.gross || 1;
      var rows = [
        {
          label: 'Gross rent',
          detail: global.EFMath.euro(r.gross / 12) + ' / mo × 12',
          value: global.EFMath.euro(r.gross),
          width: 100,
          kind: 'gross'
        },
        {
          label: '− Operator fee',
          detail: Math.round(r.feePct * 100) + '% of gross',
          value: '−' + global.EFMath.euro(r.fee),
          width: Math.max(2, (r.fee / g) * 100),
          kind: 'deduction'
        },
        {
          label: '− Operating costs',
          detail: 'Cleaning, utilities, insurance',
          value: '−' + global.EFMath.euro(r.opex),
          width: Math.max(2, (r.opex / g) * 100),
          kind: 'deduction'
        },
        {
          label: '− Property tax & community',
          detail: 'Draft estimate',
          value: '−' + global.EFMath.euro(r.tax),
          width: Math.max(2, (r.tax / g) * 100),
          kind: 'deduction'
        },
        {
          label: r.floorApplies ? 'Modelled net cash flow' : 'Net cash flow',
          detail:
            '≈ ' +
            global.EFMath.euro(r.net / 12) +
            ' / mo · ' +
            global.EFMath.pct(r.yieldOnPrice) +
            ' on price',
          value: global.EFMath.euro(r.net),
          width: Math.max(2, Math.min(100, (r.net / g) * 100)),
          kind: r.floorApplies ? 'modelled' : 'net'
        }
      ];
      if (r.floorApplies) {
        rows.push({
          label: 'You receive',
          detail:
            global.EFMath.pct(r.floorPct) +
            ' covenant floor · ≈ ' +
            global.EFMath.euro(r.payout / 12) +
            ' / mo',
          value: global.EFMath.euro(r.payout),
          width: Math.max(2, Math.min(100, (r.payout / g) * 100)),
          kind: 'net'
        });
      }
      return rows;
    },
    renderCascade: function (el, rows) {
      if (!el) return;
      el.innerHTML = rows
        .map(function (row) {
          var barClass = 'cascade-bar';
          if (row.kind === 'deduction') barClass += ' is-deduction';
          if (row.kind === 'net') barClass += ' is-net';
          if (row.kind === 'modelled') barClass += ' is-modelled';
          var valClass = 'cascade-value';
          if (row.kind === 'deduction') valClass += ' is-deduction';
          if (row.kind === 'modelled') valClass += ' is-modelled';
          return (
            '<div class="cascade-row">' +
            '<div class="cascade-label">' +
            row.label +
            '<small>' +
            row.detail +
            '</small></div>' +
            '<div class="cascade-bar-track" aria-hidden="true">' +
            '<div class="' +
            barClass +
            '" style="width:' +
            row.width +
            '%"></div></div>' +
            '<div class="' +
            valClass +
            '">' +
            row.value +
            '</div></div>'
          );
        })
        .join('');
    }
  };
})(window);
