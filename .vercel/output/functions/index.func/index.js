
import serverModule from './dist/server/server.js';

export default async function handler(req, res) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = `${protocol}://${host}${req.url}`;

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
