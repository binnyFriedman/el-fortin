/**
 * Single runtime source for site contact + Google Ads conversion.
 * Product / deal numbers stay in /facts.md — do not duplicate them here.
 *
 * Loaded before desk.js and analytics.js on every advertised page.
 * Change Ads IDs only in this file.
 */
(function (global) {
  'use strict';

  var CONTACT = {
    email: 'uriel.nabel@elfortincapital.com',
    whatsapp: '34626459818',
    calendar: 'https://calendar.app.google/R9LJvZFYTPwuXNw7A',
    privacyUrl: 'privacy-policy-en.html'
  };

  /* El Fortín client account 664-073-0266 — NOT manager Beanie (AW-18382198696).
     Conversion: Goals → Submit lead form. Fires only after /api/leads returns 201. */
  var ADS = {
    conversionId: 'AW-18098845262',
    conversionLabel: 'fcvJCObXzKMcEM7smbZD'
  };

  var config = { contact: CONTACT, ads: ADS };

  global.__EF_CONFIG__ = config;
  global.__EF_CONTACT__ = CONTACT;
  global.__EF_ADS__ = ADS;
})(typeof window !== 'undefined' ? window : globalThis);
