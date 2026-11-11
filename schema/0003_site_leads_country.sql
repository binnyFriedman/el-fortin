-- Country of residence, asked on the Hebrew page (site/index-he.html). It tells
-- Uriel which tax situation to expect and shows where the ads reached.
-- Nullable: the other pages do not ask.
--
-- Apply to --remote BEFORE deploying the functions/api/leads.js that writes it:
-- an insert that names a missing column fails, and that lead is lost.
--   wrangler d1 execute el-fortin-analytics --local  --command "ALTER TABLE site_leads ADD COLUMN country TEXT;"
--   wrangler d1 execute el-fortin-analytics --remote --command "ALTER TABLE site_leads ADD COLUMN country TEXT;"

ALTER TABLE site_leads ADD COLUMN country TEXT;
