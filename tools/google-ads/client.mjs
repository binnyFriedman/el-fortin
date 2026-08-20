import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { OAuth2Client } from 'google-auth-library';

const API_VERSION = process.env.GOOGLE_ADS_API_VERSION || 'v25';
const CREDENTIALS_PATH = resolve(
  process.env.GOOGLE_ADS_OAUTH_CREDENTIALS ||
    `${homedir()}/.config/el-fortin/google-ads-oauth.json`
);
const TOKEN_PATH = resolve(
  process.env.GOOGLE_ADS_TOKEN_PATH ||
    `${homedir()}/.config/el-fortin/google-ads-token.json`
);
const KEYCHAIN_SERVICE =
  process.env.GOOGLE_ADS_KEYCHAIN_SERVICE ||
  'el-fortin-google-ads-developer-token';

export async function googleAdsRequest(
  path,
  { method = 'GET', body, loginCustomerId } = {}
) {
  const [accessToken, developerToken] = await Promise.all([
    getAccessToken(),
    Promise.resolve(readDeveloperToken())
  ]);

  const headers = {
    authorization: `Bearer ${accessToken}`,
    'developer-token': developerToken
  };
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (loginCustomerId) {
    headers['login-customer-id'] = normalizeCustomerId(loginCustomerId);
  }

  const response = await fetch(
    `https://googleads.googleapis.com/${API_VERSION}/${path.replace(/^\//, '')}`,
    {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    }
  );
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data?.error?.message || `Google Ads API request failed (${response.status})`;
    throw new Error(`${message}\n${JSON.stringify(data, null, 2)}`);
  }
  return data;
}

export function normalizeCustomerId(customerId) {
  return String(customerId).replaceAll('-', '');
}

async function getAccessToken() {
  const [credentials, tokens] = await Promise.all([
    readJson(CREDENTIALS_PATH),
    readJson(TOKEN_PATH)
  ]);
  const client = credentials.installed || credentials.web;
  if (!client?.client_id || !client?.client_secret) {
    throw new Error('OAuth credentials are incomplete.');
  }

  const oauth = new OAuth2Client(client.client_id, client.client_secret);
  oauth.setCredentials(tokens);
  const result = await oauth.getAccessToken();
  if (!result.token) throw new Error('Could not refresh the Google OAuth token.');
  return result.token;
}

function readDeveloperToken() {
  const account = process.env.USER;
  if (!account) throw new Error('USER is unavailable for Keychain lookup.');

  const token = execFileSync(
    'security',
    [
      'find-generic-password',
      '-a',
      account,
      '-s',
      KEYCHAIN_SERVICE,
      '-w'
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  ).trim();
  if (!token) throw new Error('Google Ads developer token is missing from Keychain.');
  return token;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}
