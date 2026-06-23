#!/usr/bin/env node
/**
 * Custom Vercel build script using Build Output API v3.
 *
 * @lovable.dev/vite-tanstack-config overrides the Nitro server preset,
 * so `preset: "vercel"` in vite.config.ts is ignored and output always
 * lands in dist/ instead of .vercel/output/. This script bridges that gap.
 */

import { execSync } from 'child_process';
import { cpSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, '.vercel', 'output');

// 1. Run the regular build
console.log('▶ Running bun run build...');
execSync('bun run build', { stdio: 'inherit' });

// 2. Verify build output exists
if (!existsSync(join(DIST, 'client'))) {
  throw new Error('Build failed: dist/client not found');
}
if (!existsSync(join(DIST, 'server', 'server.js'))) {
  throw new Error('Build failed: dist/server/server.js not found');
}

console.log('▶ Assembling .vercel/output...');

// 3. Static assets → .vercel/output/static/
const staticOut = join(OUT, 'static');
mkdirSync(staticOut, { recursive: true });
cpSync(join(DIST, 'client'), staticOut, { recursive: true });

// 4. SSR function → .vercel/output/functions/index.func/
const funcDir = join(OUT, 'functions', 'index.func');
mkdirSync(funcDir, { recursive: true });

// Copy the server bundle
const serverOut = join(funcDir, 'dist', 'server');
mkdirSync(serverOut, { recursive: true });
cpSync(join(DIST, 'server'), serverOut, { recursive: true });

// Write the Vercel Node.js handler
writeFileSync(join(funcDir, 'index.js'), `
import serverModule from './dist/server/server.js';

export default async function handler(req, res) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = \`\${protocol}://\${host}\${req.url}\`;

    const body = req.method === 'GET' || req.method === 'HEAD'
      ? null
      : await new Promise((resolve) => {
          const chunks = [];
          req.on('data', (c) => chunks.push(c));
          req.on('end', () => resolve(Buffer.concat(chunks)));
        });

    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body,
    });

    const response = await serverModule.fetch(request);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const text = await response.text();
    res.end(text);
  } catch (err) {
    console.error('[SSR error]', err);
    res.statusCode = 500;
    res.setHeader('content-type', 'text/html');
    res.end('<h1>Server Error</h1><p>Something went wrong.</p>');
  }
}
`);

// Write the function config
writeFileSync(join(funcDir, '.vc-config.json'), JSON.stringify({
  runtime: 'nodejs20.x',
  handler: 'index.js',
  launcherType: 'Nodejs',
  shouldAddHelpers: true,
}, null, 2));

// 5. Write the top-level Vercel config
writeFileSync(join(OUT, 'config.json'), JSON.stringify({
  version: 3,
  routes: [
    // Serve static assets first
    { handle: 'filesystem' },
    // Everything else → SSR function
    { src: '/(.*)', dest: '/index' },
  ],
}, null, 2));

console.log('✓ .vercel/output assembled successfully');
console.log('  Static:', staticOut);
console.log('  SSR fn:', funcDir);
