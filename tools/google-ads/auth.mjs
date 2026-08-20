#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { OAuth2Client } from 'google-auth-library';

const SCOPE = 'https://www.googleapis.com/auth/adwords';
const credentialsPath = process.env.GOOGLE_ADS_OAUTH_CREDENTIALS;
const tokenPath = resolve(
  process.env.GOOGLE_ADS_TOKEN_PATH ||
    `${homedir()}/.config/el-fortin/google-ads-token.json`
);

if (!credentialsPath) {
  console.error(
    'Set GOOGLE_ADS_OAUTH_CREDENTIALS to the downloaded OAuth client JSON path.'
  );
  process.exit(1);
}

const credentials = JSON.parse(await readFile(resolve(credentialsPath), 'utf8'));
const client = credentials.installed || credentials.web;

if (!client?.client_id || !client?.client_secret) {
  throw new Error('OAuth JSON must contain installed or web client credentials.');
}

const server = createServer();
server.listen(0, '127.0.0.1');
await new Promise((resolveListening, reject) => {
  server.once('listening', resolveListening);
  server.once('error', reject);
});

const address = server.address();
if (!address || typeof address === 'string') {
  throw new Error('Could not start the local OAuth callback server.');
}

const redirectUri = `http://127.0.0.1:${address.port}`;
const oauth = new OAuth2Client(client.client_id, client.client_secret, redirectUri);
const oauthState = randomBytes(32).toString('base64url');
const authorizationUrl = oauth.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [SCOPE],
  state: oauthState
});

const codePromise = new Promise((resolveCode, reject) => {
  server.once('request', (request, response) => {
    const callback = new URL(request.url || '/', redirectUri);
    const error = callback.searchParams.get('error');
    const code = callback.searchParams.get('code');
    const stateMatches = callback.searchParams.get('state') === oauthState;

    response.writeHead(error || !code || !stateMatches ? 400 : 200, {
      'content-type': 'text/plain; charset=utf-8'
    });
    response.end(
      error || !code || !stateMatches
        ? 'Google Ads authorization failed. You can close this tab.'
        : 'Google Ads authorization completed. You can close this tab.'
    );

    if (error) reject(new Error(`OAuth authorization failed: ${error}`));
    else if (!code) reject(new Error('OAuth callback did not include a code.'));
    else if (!stateMatches) reject(new Error('OAuth callback state did not match.'));
    else resolveCode(code);
  });
});

console.log(`Opening Google authorization:\n${authorizationUrl}\n`);
openBrowser(authorizationUrl);

try {
  const code = await codePromise;
  const { tokens } = await oauth.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error(
      'Google did not return a refresh token. Revoke the app grant and run authorization again.'
    );
  }

  await mkdir(dirname(tokenPath), { recursive: true, mode: 0o700 });
  await writeFile(tokenPath, `${JSON.stringify(tokens, null, 2)}\n`, {
    mode: 0o600
  });
  await chmod(tokenPath, 0o600);

  console.log(`OAuth token saved securely to ${tokenPath}`);
} finally {
  server.closeAllConnections?.();
  server.close();
}

function openBrowser(url) {
  const command =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'cmd'
        : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();
}
