# Google Ads automation

Local, approval-gated tooling for the El Fortín Google Ads account.

## Security

- OAuth client: `~/.config/el-fortin/google-ads-oauth.json`
- OAuth token: `~/.config/el-fortin/google-ads-token.json`
- Developer token: macOS Keychain service
  `el-fortin-google-ads-developer-token`
- Campaign creation defaults to API validation. Applying changes requires an
  explicit `:apply` command.
- New campaigns are always created paused.

## Accounts

- Manager: `925-809-1560`
- El Fortín: `664-073-0266`

## Commands

```bash
npm run ads:verify
node tools/google-ads/inspect.mjs

npm run ads:campaign:en:validate
npm run ads:campaign:en:apply
npm run ads:campaign:es:validate
npm run ads:campaign:es:apply

npm run ads:sitelinks:en:validate
npm run ads:sitelinks:en:apply
npm run ads:sitelinks:es:validate
npm run ads:sitelinks:es:apply

npm run ads:negatives:en:validate
npm run ads:negatives:en:apply
npm run ads:negatives:es:validate
npm run ads:negatives:es:apply
```

Manager linking is pending manual approval by a second El Fortín account
administrator. Direct API access works without that link.
