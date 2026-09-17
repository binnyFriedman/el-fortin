/**
 * Responsive Search Ad copy for campaign 24259919998 — single source.
 *
 * Housing, not a yield poster: a named apartment for sale. Differentiation
 * is boutique scale (ten units), whole-building professional management,
 * title in the buyer's name, furnished turnkey. No Uriel, no return %,
 * no "not a fund". The 4% floor lives on the landing page.
 */

export const HEADLINE_MAX = 30;
export const DESCRIPTION_MAX = 90;

export const FINAL_URL_EN = 'https://invest.elfortincapital.com/';
export const FINAL_URL_NL = 'https://invest.elfortincapital.com/index-nl';

export const RSA_NL = {
  headlines: [
    'Nieuw Appartement in Valencia',
    'Professioneel Beheerd',
    'Boutique. Tien Appartementen.',
    'Heel Gebouw. Eén Beheer.',
    'Eigendom op Uw Naam',
    'Gemeubileerd en Instapklaar',
    'Nieuwbouw. Volledig Beheerd.',
    'Vanaf € 236.000 Gemeubileerd',
    'U Bezit het Appartement',
    'Tien Appartementen. Eén Team.',
    'Gebouw Professioneel Beheerd',
    'In de Oude Kern',
    'Metro naar Hartje Valencia',
    'Oplevering Augustus 2027',
    'Nieuwbouw bij Valencia'
  ],
  descriptions: [
    'Nieuw appartement in Valencia. Professioneel beheerd, op uw naam. Heel gebouw als één.',
    'Boutique gebouw: tien appartementen, één beheer. Gemeubileerd, op uw naam.',
    'Vanaf € 236.000 gemeubileerd. Vier betalingen van 25%. Klaar augustus 2027.',
    'Klein nieuwbouwgebouw, professioneel verhuurd. Appartement op uw naam.'
  ],
  path1: 'Valencia',
  path2: 'Appartement'
};

export const RSA_EN = {
  headlines: [
    'New Apartment in Valencia',
    'Professionally Managed',
    'Boutique. Ten Apartments.',
    'Whole Building. One Operator.',
    'Title in Your Name',
    'Furnished. Ready to Let.',
    'New Build. Fully Managed.',
    'From EUR 236,000 Furnished',
    'You Own the Apartment',
    'Ten Apartments. One Team.',
    'Building Professionally Run',
    'In the Historic Centre',
    'Metro to Central Valencia',
    'Completion August 2027',
    'New Build near Valencia'
  ],
  descriptions: [
    'New apartment in Valencia. Professionally managed, in your name. Whole building as one.',
    'Boutique building: ten apartments, one operator. Furnished, titled in your name.',
    'From EUR 236,000 furnished. Four payments of 25%. Ready August 2027.',
    'A small new building, professionally let. Apartment titled in your name.'
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
