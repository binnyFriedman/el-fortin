/**
 * Responsive Search Ad copy for campaign 24259919998 — single source.
 *
 * Reads like the deal sheet, not a listing. Order: managed building and
 * passive income, the projected return, the contractual floor, the deed
 * and who operates, then price and delivery. Place is last.
 * No "guaranteed", "secured", or "risk-free". The 8% stays "projected"
 * or "verwacht". The 4% is a minimum in the contract, never a promise
 * of more.
 *
 * The first description is the AFM licence-exemption sentence, pinned
 * so a Dutch search ad carries it on every impression. The graphic
 * cannot be placed in a search ad. The English sentence does not fit
 * in 90 characters, so the English ad uses the AFM short form.
 */

export const HEADLINE_MAX = 30;
export const DESCRIPTION_MAX = 90;

export const FINAL_URL_EN = 'https://invest.elfortincapital.com/';
export const FINAL_URL_NL = 'https://invest.elfortincapital.com/index-nl';

export const RSA_NL = {
  headlines: [
    'Beheerd gebouw',
    'Passief inkomen',
    '8% verwacht rendement',
    '4% minimum in contract',
    'Akte op uw naam',
    'Wij exploiteren',
    'Eén slaapkamer €236.000',
    'Twee slaapkamers €270.000',
    'Meubels inbegrepen',
    'Oplevering augustus 2027',
    'Tien appartementen',
    'Eén gebouw, één beheer',
    'Klaar augustus 2027',
    'Indicatief, geen aanbod',
    'Riba-roja, Valencia'
  ],
  descriptions: [
    'Let op! U belegt buiten AFM-toezicht. Geen vergunningplicht voor deze activiteit.',
    'Beheerd gebouw. Passief inkomen. 8% verwacht. 4% minimum in het contract.',
    'Akte op uw naam. Wij exploiteren. Tien appartementen, één beheer.',
    'Eén slaapkamer €236.000. Twee slaapkamers €270.000. Meubels erbij. Augustus 2027.'
  ],
  path1: 'Rendement',
  path2: 'Contract'
};

export const RSA_EN = {
  headlines: [
    'Managed building',
    'Passive income',
    '8% projected return',
    '4% floor in the contract',
    'Deed in your name',
    'We operate it',
    'One bedroom EUR 236,000',
    'Two bedrooms EUR 270,000',
    'Furniture included',
    'Delivery August 2027',
    'Ten apartments',
    'One building, one operator',
    'Turnkey August 2027',
    'Indicative. Not an offer.',
    'Riba-roja, Valencia'
  ],
  descriptions: [
    'This investment falls outside AFM supervision',
    'Managed building. Passive income. 8% projected. 4% floor in the contract.',
    'Deed in your name. We operate. Ten apartments, one operator.',
    'One bedroom EUR 236,000. Two bedrooms EUR 270,000. Furnished. August 2027.'
  ],
  path1: 'Return',
  path2: 'Contract'
};

export function assertRsaLengths(rsa, label) {
  for (const h of rsa.headlines) {
    if (h.length > HEADLINE_MAX) throw new Error(`${label} headline too long (${h.length}): ${h}`);
  }
  for (const d of rsa.descriptions) {
    if (d.length > DESCRIPTION_MAX) throw new Error(`${label} description too long (${d.length}): ${d}`);
  }
  if (rsa.path1.length > 15) throw new Error(`${label} path1 too long`);
  if (rsa.path2.length > 15) throw new Error(`${label} path2 too long`);
}

export function toRsaAd(rsa, finalUrl) {
  return {
    finalUrls: [finalUrl],
    responsiveSearchAd: {
      headlines: rsa.headlines.map((text) => ({ text })),
      descriptions: rsa.descriptions.map((text, index) =>
        index === 0 ? { text, pinnedField: 'DESCRIPTION_1' } : { text }
      ),
      path1: rsa.path1,
      path2: rsa.path2
    }
  };
}
