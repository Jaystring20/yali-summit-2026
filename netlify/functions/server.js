import serverModule from '../../dist/server/server.js';

export const handler = async (event) => {
  try {
    const origin = `https://${event.headers.host}`;
    const url = event.rawUrl || `${origin}${event.path}${event.rawQuery ? '?' + event.rawQuery : ''}`;

    const request = new Request(url, {
      method: event.httpMethod,
      headers: event.headers,
      body: ['GET', 'HEAD'].includes(event.httpMethod)
        ? null
        : event.isBase64Encoded
        ? Buffer.from(event.body || '', 'base64')
        : event.body || null,
    });

    const response = await serverModule.fetch(request);

    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      statusCode: response.status,
      headers,
      body: await response.text(),
    };
  } catch (error) {
    console.error('[server function error]', error);
    return {
      statusCode: 500,
      headers: { 'content-type': 'text/html' },
      body: '<h1>Server Error</h1><p>Something went wrong. Please try again.</p>',
    };
  }
};
