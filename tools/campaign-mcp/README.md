# Campaign Analytics MCP

Read-only tools over the owned campaign database (includes lead PII).

## Run locally

```bash
npm install
export EF_ADMIN_TOKEN='your-admin-token'
export EF_ANALYTICS_BASE_URL='http://127.0.0.1:8788'   # wrangler pages dev
npm run mcp
```

## Cursor MCP config example

```json
{
  "mcpServers": {
    "el-fortin-campaign": {
      "command": "node",
      "args": ["tools/campaign-mcp/server.mjs"],
      "env": {
        "EF_ADMIN_TOKEN": "replace-me",
        "EF_ANALYTICS_BASE_URL": "http://127.0.0.1:8788"
      }
    }
  }
}
```

## Tools

| Tool | Purpose |
|---|---|
| `campaign_summary` | Spend + funnel counts + unit economics |
| `funnel_breakdown` | Step rates + bottleneck |
| `compare_sources` | Results by campaign/term/locale/version |
| `list_leads` | Pipeline list with contacts |
| `get_lead` | Full lead history + PII |
| `search_feedback` | Fears / objections / loss reasons |
| `compare_versions` | Page version outcomes + experiments |
| `data_dictionary` | Field meanings |

Every answer should cite date range, filters, and sample size. This server cannot write or delete data.

## Production

1. Set Pages secret `ADMIN_TOKEN`.
2. Put Cloudflare Access in front of `/analytics/*` and `/api/admin/*` (Binny allowlist).
3. Point `EF_ANALYTICS_BASE_URL` at the live origin when using MCP remotely.
