#!/usr/bin/env node
/**
 * Read-only MCP server for El Fortín campaign analytics.
 * Connects to the admin API with ADMIN_TOKEN / EF_ADMIN_TOKEN.
 *
 * Env:
 *   EF_ANALYTICS_BASE_URL  default http://127.0.0.1:8788
 *   EF_ADMIN_TOKEN         required
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

const BASE = (process.env.EF_ANALYTICS_BASE_URL || 'http://127.0.0.1:8788').replace(/\/$/, '');
const TOKEN = process.env.EF_ADMIN_TOKEN || process.env.ADMIN_TOKEN || '';

async function admin(path, query) {
  if (!TOKEN) throw new Error('EF_ADMIN_TOKEN is not set');
  const url = new URL(BASE + '/api/admin/' + path.replace(/^\//, ''));
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v != null && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${TOKEN}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function textResult(data) {
  return {
    content: [
      {
        type: 'text',
        text: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      }
    ]
  };
}

const tools = [
  {
    name: 'campaign_summary',
    description: 'Spend, leads, calls, reservations, sales and unit economics for a date range.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'YYYY-MM-DD' },
        to: { type: 'string', description: 'YYYY-MM-DD' }
      }
    }
  },
  {
    name: 'funnel_breakdown',
    description: 'Funnel step counts, conversion rates, and current bottleneck.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string' },
        to: { type: 'string' }
      }
    }
  },
  {
    name: 'compare_sources',
    description: 'Compare leads/outcomes by campaign, term, source, locale, page version, or keyword.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string' },
        to: { type: 'string' },
        by: {
          type: 'string',
          enum: ['utm_campaign', 'utm_term', 'utm_source', 'locale', 'page_version', 'keyword', 'campaign']
        }
      }
    }
  },
  {
    name: 'list_leads',
    description: 'List leads with contact details, stage, value judgment, and source.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string' },
        to: { type: 'string' },
        stage: { type: 'string' },
        value_judgment: { type: 'string' },
        q: { type: 'string' },
        limit: { type: 'number' }
      }
    }
  },
  {
    name: 'get_lead',
    description: 'Full lead history including PII, notes, events, and stage changes.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'lead_id or lead_code' }
      },
      required: ['id']
    }
  },
  {
    name: 'search_feedback',
    description: 'Search fears, free-text questions, objections, and loss reasons.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string' },
        to: { type: 'string' },
        q: { type: 'string' }
      }
    }
  },
  {
    name: 'compare_versions',
    description: 'Compare page versions and list experiment/change cards.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string' },
        to: { type: 'string' }
      }
    }
  },
  {
    name: 'data_dictionary',
    description: 'Exact meaning of stages, events, judgments, and main score.',
    inputSchema: { type: 'object', properties: {} }
  }
];

const server = new Server(
  { name: 'el-fortin-campaign', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = request.params.arguments || {};
  try {
    switch (name) {
      case 'campaign_summary':
        return textResult(await admin('summary', args));
      case 'funnel_breakdown':
        return textResult(await admin('funnel', args));
      case 'compare_sources':
        return textResult(await admin('sources', args));
      case 'list_leads':
        return textResult(await admin('leads', args));
      case 'get_lead':
        return textResult(await admin(`lead/${encodeURIComponent(args.id)}`));
      case 'search_feedback':
        return textResult(await admin('feedback', args));
      case 'compare_versions':
        return textResult(await admin('versions', args));
      case 'data_dictionary':
        return textResult(await admin('dictionary'));
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: err.message || String(err) }]
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
