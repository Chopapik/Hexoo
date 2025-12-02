import '@testing-library/jest-dom';

// Polyfills for Next.js 13+ environment
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Ensure global.Response is defined (it should be by jsdom/whatwg-fetch, but let's be safe)
if (!global.Response) {
  // @ts-ignore
  global.Response = fetch.Response;
}

if (!global.Response.json) {
    global.Response.json = (data: any, init?: ResponseInit) => {
        // We need to ensure body is stringified properly
        const body = JSON.stringify(data);
        return new global.Response(body, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...init?.headers,
            }
        });
    }
}
