#!/usr/bin/env node

import {
  googleAdsRequest,
  normalizeCustomerId
} from './client.mjs';

const customerId = normalizeCustomerId(
  process.env.GOOGLE_ADS_CUSTOMER_ID || '664-073-0266'
);

const [campaignRows, adGroupRows, keywordRows, criterionRows, adRows, assetRows] =
  await Promise.all([
    search(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign.target_spend.cpc_bid_ceiling_micros,
        campaign.network_settings.target_google_search,
        campaign.network_settings.target_search_network,
        campaign.network_settings.target_content_network,
        campaign.geo_target_type_setting.positive_geo_target_type,
        campaign_budget.amount_micros
      FROM campaign
      WHERE campaign.name LIKE 'elfortin-search-%'
        AND campaign.status != 'REMOVED'
      ORDER BY campaign.id
    `),
    search(`
      SELECT campaign.id, campaign.name, ad_group.id
      FROM ad_group
      WHERE campaign.name LIKE 'elfortin-search-%'
        AND ad_group.status != 'REMOVED'
    `),
    search(`
      SELECT campaign.id, campaign.name, ad_group_criterion.criterion_id
      FROM keyword_view
      WHERE campaign.name LIKE 'elfortin-search-%'
        AND ad_group_criterion.status != 'REMOVED'
    `),
    search(`
      SELECT campaign.id, campaign.name, campaign_criterion.criterion_id
      FROM campaign_criterion
      WHERE campaign.name LIKE 'elfortin-search-%'
        AND campaign_criterion.status != 'REMOVED'
    `),
    search(`
      SELECT
        campaign.id,
        campaign.name,
        ad_group_ad.ad.id,
        ad_group_ad.status,
        ad_group_ad.policy_summary.approval_status
      FROM ad_group_ad
      WHERE campaign.name LIKE 'elfortin-search-%'
        AND ad_group_ad.status != 'REMOVED'
    `),
    search(`
      SELECT campaign.id, campaign.name, campaign_asset.resource_name
      FROM campaign_asset
      WHERE campaign.name LIKE 'elfortin-search-%'
        AND campaign_asset.status != 'REMOVED'
    `)
  ]);

const campaigns = campaignRows.map((row) => ({
  id: row.campaign.id,
  name: row.campaign.name,
  status: row.campaign.status,
  channel: row.campaign.advertisingChannelType,
  biddingStrategy: row.campaign.biddingStrategyType,
  dailyBudgetMicros: row.campaignBudget?.amountMicros,
  cpcBidCeilingMicros: row.campaign.targetSpend?.cpcBidCeilingMicros,
  googleSearch: row.campaign.networkSettings?.targetGoogleSearch,
  searchPartners: row.campaign.networkSettings?.targetSearchNetwork,
  displayNetwork: row.campaign.networkSettings?.targetContentNetwork,
  positiveLocationTargeting:
    row.campaign.geoTargetTypeSetting?.positiveGeoTargetType,
  adGroups: countForCampaign(adGroupRows, row.campaign.id),
  keywords: countForCampaign(keywordRows, row.campaign.id),
  campaignCriteria: countForCampaign(criterionRows, row.campaign.id),
  ads: adRows
    .filter((candidate) => candidate.campaign.id === row.campaign.id)
    .map((candidate) => ({
      id: candidate.adGroupAd.ad.id,
      status: candidate.adGroupAd.status,
      approvalStatus: candidate.adGroupAd.policySummary?.approvalStatus
    })),
  campaignAssets: countForCampaign(assetRows, row.campaign.id)
}));

console.log(JSON.stringify(campaigns, null, 2));

async function search(query) {
  const response = await googleAdsRequest(
    `customers/${customerId}/googleAds:searchStream`,
    { method: 'POST', body: { query } }
  );
  return response.flatMap((batch) => batch.results || []);
}

function countForCampaign(rows, campaignId) {
  return rows.filter((row) => row.campaign.id === campaignId).length;
}
