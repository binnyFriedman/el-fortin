/**
 * Responsive Search Ad copy for campaign 24259919998 — single source.
 * Product numbers come from /facts.md. Wording rule (Google Ads Unreliable
 * Claims policy): the 4% is a contractual minimum, never "guaranteed";
 * 8% and IRR are always labelled as projections.
 */

export const HEADLINE_MAX = 30;
export const DESCRIPTION_MAX = 90;

export const FINAL_URL_EN = 'https://invest.elfortincapital.com/';
export const FINAL_URL_NL = 'https://invest.elfortincapital.com/index-nl';

export const RSA_NL = {
  headlines: [
    'Eigendom op Uw Naam',
    'Volledig Beheerd. Geen Fonds.',
    'Tien Appartementen. Eén Team.',
    '4% Minimum in het Contract',
    'Vanaf € 236.000 Gemeubileerd',
    'Nieuwbouw bij Valencia',
    'Geen Verhuurzorgen op Afstand',
    'Ontwikkelaar Vult Tekort Aan',
    'Oplevering Augustus 2027',
    'Praat Direct met Uriel',
    'Boutique Gebouw Riba-roja',
    'U Bezit. Wij Verhuren.',
    'Vastgoed Spanje Zonder Gedoe',
    'El Fortin Riba-roja',
    'Schrijf aan Uriel'
  ],
  descriptions: [
    'Appartement op uw naam bij Valencia. El Fortin beheert alle tien. U doet niets.',
    'Boutique nieuwbouw. Minimaal 4% per jaar op de koopsom, vastgelegd in het contract.',
    'Vanaf € 236.000 gemeubileerd. Vier betalingen van 25%. Verhuur start augustus 2027.',
    'Geen fonds, geen aandeel: volledig eigendom. Lees de details en schrijf aan Uriel.'
  ],
  path1: 'Valencia',
  path2: 'Appartement'
};

export const RSA_EN = {
  headlines: [
    'Deeded Apartment in Valencia',
    'You Own It. We Make It Earn.',
    'Ten Apartments. One Operator.',
    'Fully Managed. Not a Fund.',
    'Talk to Uriel Directly',
    'From EUR 236,000 Furnished',
    'Boutique Building Riba-roja',
    'No Remote Landlord Work',
    '4% Minimum in the Contract',
    'Operations August 2027',
    'Title in Your Name',
    'Write to Uriel',
    'El Fortin Riba-roja',
    'Named Apartment by Deed',
    'Developer Covers the Shortfall'
  ],
  descriptions: [
    'Own a named apartment by deed. El Fortin runs all ten. No remote landlord work.',
    'Boutique building. 4% minimum yearly return on the sale price, fixed in the contract.',
    'From EUR 236,000 furnished. Four payments of 25%. Ops August 2027. Write to Uriel.',
    'Not a fund. Title in your name. Fully managed operations from August 2027.'
  ],
  path1: 'Valencia',
  path2: 'Apartment'
};

export function assertRsaLengths(rsa, label) {
  for (const h of rsa.headlines) {
    if (h.length > HEADLINE_MAX) throw new Error(`${label} headline too long (${h.length}): ${h}`);
  }
  for (const d of rsa.descriptions) {
    if (d.length > DESCRIPTION_MAX) throw new Error(`${label} description too long (${d.length}): ${d}`);
  }
}

export function toRsaAd(rsa, finalUrl) {
  return {
    finalUrls: [finalUrl],
    responsiveSearchAd: {
      headlines: rsa.headlines.map((text) => ({ text })),
      descriptions: rsa.descriptions.map((text) => ({ text })),
      path1: rsa.path1,
      path2: rsa.path2
    }
  };
}
