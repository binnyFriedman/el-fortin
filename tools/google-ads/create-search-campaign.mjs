#!/usr/bin/env node

import {
  googleAdsRequest,
  normalizeCustomerId
} from './client.mjs';
import { englishCampaign } from './campaigns/english.mjs';
import { spanishCampaign } from './campaigns/spanish.mjs';

const customerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_CUSTOMER_ID || '664-073-0266'
);
const apply = process.argv.includes('--apply');
const localeArgument = process.argv.find((argument) =>
  argument.startsWith('--locale=')
);
const locale = localeArgument?.split('=')[1] || 'en';
const config = {
  en: englishCampaign,
  es: spanishCampaign
}[locale];

if (!config) {
  throw new Error(`Unsupported campaign locale: ${locale}`);
}

if (await campaignExists(config.name)) {
  console.log(`Campaign "${config.name}" already exists; no changes made.`);
  process.exit(0);
}

validateCopy(config);

const budgetResource = `customers/${customerId}/campaignBudgets/-1`;
const campaignResource = `customers/${customerId}/campaigns/-2`;
const adGroupResource = `customers/${customerId}/adGroups/-3`;
const mutateOperations = [
  {
    campaignBudgetOperation: {
      create: {
        resourceName: budgetResource,
        name: config.budgetName,
        amountMicros: config.dailyBudgetMicros,
        deliveryMethod: 'STANDARD',
        explicitlyShared: false
      }
    }
  },
  {
    campaignOperation: {
      create: {
        resourceName: campaignResource,
        name: config.name,
        status: 'PAUSED',
        advertisingChannelType: 'SEARCH',
        campaignBudget: budgetResource,
        targetSpend: {
          cpcBidCeilingMicros: config.cpcBidCeilingMicros
        },
        networkSettings: {
          targetGoogleSearch: true,
          targetSearchNetwork: false,
          targetContentNetwork: false,
          targetPartnerSearchNetwork: false
        },
        geoTargetTypeSetting: {
          positiveGeoTargetType: 'PRESENCE'
        },
        containsEuPoliticalAdvertising:
          'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING',
        finalUrlSuffix: config.finalUrlSuffix
      }
    }
  },
  ...config.locationConstantIds.map((locationId) => ({
    campaignCriterionOperation: {
      create: {
        campaign: campaignResource,
        location: {
          geoTargetConstant: `geoTargetConstants/${locationId}`
        }
      }
    }
  })),
  {
    campaignCriterionOperation: {
      create: {
        campaign: campaignResource,
        language: {
          languageConstant: `languageConstants/${config.languageConstantId}`
        }
      }
    }
  },
  ...config.negativeKeywords.map((text) => ({
    campaignCriterionOperation: {
      create: {
        campaign: campaignResource,
        negative: true,
        keyword: {
          text,
          matchType: 'BROAD'
        }
      }
    }
  })),
  {
    adGroupOperation: {
      create: {
        resourceName: adGroupResource,
        campaign: campaignResource,
        name: config.adGroup.name,
        status: 'ENABLED',
        type: 'SEARCH_STANDARD'
      }
    }
  },
  ...config.adGroup.keywords.map(([text, matchType]) => ({
    adGroupCriterionOperation: {
      create: {
        adGroup: adGroupResource,
        status: 'ENABLED',
        keyword: { text, matchType }
      }
    }
  })),
  {
    adGroupAdOperation: {
      create: {
        adGroup: adGroupResource,
        status: 'ENABLED',
        ad: {
          finalUrls: [config.finalUrl],
          responsiveSearchAd: {
            headlines: config.headlines.map((text) => ({ text })),
            descriptions: config.descriptions.map((text) => ({ text })),
            path1: config.displayPaths[0],
            path2: config.displayPaths[1]
          }
        }
      }
    }
  }
];

const result = await googleAdsRequest(
  `customers/${customerId}/googleAds:mutate`,
  {
    method: 'POST',
    body: {
      mutateOperations,
      partialFailure: false,
      validateOnly: !apply
    }
  }
);

if (apply) {
  console.log(
    `Created paused campaign "${config.name}" with ` +
      `${result.mutateOperationResponses?.length || 0} resources.`
  );
} else {
  console.log(
    `Validated "${config.name}" successfully. Run with --apply to create it paused.`
  );
}

async function campaignExists(name) {
  const response = await googleAdsRequest(
    `customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      body: {
        query: `
          SELECT campaign.id
          FROM campaign
          WHERE campaign.name = '${escapeGaql(name)}'
            AND campaign.status != 'REMOVED'
          LIMIT 1
        `
      }
    }
  );
  return Boolean(response?.[0]?.results?.length);
}

function validateCopy(campaign) {
  for (const headline of campaign.headlines) {
    if (headline.length > 30) {
      throw new Error(`Headline exceeds 30 characters: ${headline}`);
    }
  }
  for (const description of campaign.descriptions) {
    if (description.length > 90) {
      throw new Error(`Description exceeds 90 characters: ${description}`);
    }
  }
}

function escapeGaql(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}
