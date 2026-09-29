import process from 'node:process';
import { URL } from 'node:url';

process.env.PORT ??= '8080';
process.env.HOSTNAME = '0.0.0.0';

await import(new URL('../.next/standalone/server.js', import.meta.url));
