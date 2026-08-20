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

let link = await findManagerLink();

if (link?.status === 'ACTIVE') {
  console.log('El Fortín is already linked to the manager account.');
  process.exit(0);
}

if (!link) {
  const invitation = await googleAdsRequest(
    `customers/${managerCustomerId}/customerClientLinks:mutate`,
    {
      method: 'POST',
      loginCustomerId: managerCustomerId,
      body: {
        operation: {
          create: {
            clientCustomer: `customers/${customerId}`,
            status: 'PENDING'
          }
        }
      }
    }
  );

  const managerLinkId = invitation?.result?.resourceName?.split('~').at(-1);
  if (!managerLinkId) {
    throw new Error('Google Ads did not return the new manager link ID.');
  }

  link = {
    resourceName:
      `customers/${customerId}/customerManagerLinks/` +
      `${managerCustomerId}~${managerLinkId}`,
    status: 'PENDING'
  };
}

if (link.status !== 'PENDING') {
  throw new Error(`Cannot accept manager link with status ${link.status}.`);
}

await googleAdsRequest(
  `customers/${customerId}/customerManagerLinks:mutate`,
  {
    method: 'POST',
    loginCustomerId: customerId,
    body: {
      operations: [
        {
          update: {
            resourceName: link.resourceName,
            status: 'ACTIVE'
          },
          updateMask: 'status'
        }
      ]
    }
  }
);

console.log('El Fortín is now linked to the Google Ads manager account.');

async function findManagerLink() {
  const result = await googleAdsRequest(
    `customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      body: {
        query: `
          SELECT
            customer_manager_link.resource_name,
            customer_manager_link.status
          FROM customer_manager_link
          WHERE customer_manager_link.manager_customer =
            'customers/${managerCustomerId}'
          LIMIT 1
        `
      }
    }
  );

  return result?.[0]?.results?.[0]?.customerManagerLink || null;
}
