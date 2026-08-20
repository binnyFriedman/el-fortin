#!/usr/bin/env node

import {
  googleAdsRequest,
  normalizeCustomerId
} from './client.mjs';

const managerCustomerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || '925-809-1560'
);
const customerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_CUSTOMER_ID || '664-073-0266'
);

const accessible = await googleAdsRequest('customers:listAccessibleCustomers');
const accessibleIds = (accessible.resourceNames || []).map((name) =>
  name.replace('customers/', '')
);

if (!accessibleIds.includes(managerCustomerId)) {
  throw new Error(
    `OAuth user cannot directly access manager account ${managerCustomerId}.`
  );
}

const result = await googleAdsRequest(
  `customers/${customerId}/googleAds:searchStream`,
  {
    method: 'POST',
    loginCustomerId: managerCustomerId,
    body: {
      query: `
        SELECT
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone,
          customer.test_account
        FROM customer
        LIMIT 1
      `
    }
  }
);

const customer = result?.[0]?.results?.[0]?.customer;
if (!customer) {
  throw new Error(`Google Ads client account ${customerId} was not returned.`);
}

console.log('Google Ads API connection verified.');
console.log(
  JSON.stringify(
    {
      managerCustomerId,
      customerId: String(customer.id),
      descriptiveName: customer.descriptiveName,
      currencyCode: customer.currencyCode,
      timeZone: customer.timeZone,
      testAccount: customer.testAccount
    },
    null,
    2
  )
);
