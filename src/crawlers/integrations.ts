import { USE_MOCKS } from '../mocks/index.js';
const pagespeedMock = require('../mocks/pagespeed.mock.js');
const gscMock = require('../mocks/gsc.mock.js');
const dataforseoMock = require('../mocks/dataforseo.mock.js');

export async function getPageSpeed(url: string) {
  if (USE_MOCKS) return { ...pagespeedMock, url };
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) throw new Error('PAGESPEED_API_KEY required when USE_MOCKS=false');
  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', url); endpoint.searchParams.set('key', key);
  endpoint.searchParams.set('strategy', 'mobile');
  const r = await fetch(endpoint); if (!r.ok) throw new Error('PageSpeed request failed');
  return r.json();
}
export async function getGscData(_url: string) {
  if (USE_MOCKS) return gscMock;
  throw new Error('Google Search Console integration is intentionally stubbed by the assessment');
}
export async function getRankings(_url: string) {
  if (USE_MOCKS) return dataforseoMock;
  throw new Error('DataForSEO integration is intentionally stubbed by the assessment');
}