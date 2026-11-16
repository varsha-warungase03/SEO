import * as cheerio from 'cheerio';

function safeUrl(raw: string) {
  const u = new URL(raw);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Only HTTP(S) URLs are allowed');
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(u.hostname) || u.hostname.endsWith('.local')) {
    throw new Error('Local/private hosts are not allowed');
  }
  return u;
}
async function getText(url: string) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'EdgelinkSEOAuditBot/1.0 (+technical assessment)' },
    signal: AbortSignal.timeout(12000), redirect: 'follow'
  });
  if (!response.ok) throw new Error(`Fetch failed (${response.status}) for ${url}`);
  return response.text();
}
export async function crawlSite(rawUrl: string) {
  const parsed = safeUrl(rawUrl);
  const html = await getText(parsed.toString());
  const $ = cheerio.load(html);
  const headings = { h1: $('h1').map((_,e) => $(e).text().trim()).get(), h2: $('h2').map((_,e) => $(e).text().trim()).get(), h3: $('h3').map((_,e) => $(e).text().trim()).get() };
  const images = $('img').map((_,e) => ({ src: $(e).attr('src') || '', alt: $(e).attr('alt') || '' })).get();
  const links = $('a[href]').map((_,e) => $(e).attr('href')).get();
  const schema: unknown[] = [];
  $('script[type="application/ld+json"]').each((_,e) => {
    try { schema.push(JSON.parse($(e).contents().text())); } catch { schema.push({ invalidJsonLd: true }); }
  });
  const title = $('title').first().text().trim();
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const robotsUrl = new URL('/robots.txt', parsed).toString();
  const sitemapUrl = new URL('/sitemap.xml', parsed).toString();
  const [robots, sitemap] = await Promise.allSettled([getText(robotsUrl), getText(sitemapUrl)]);
  const technical = {
    status: 'fetched',
    robotsTxtFound: robots.status === 'fulfilled',
    robotsTxt: robots.status === 'fulfilled' ? robots.value.slice(0, 4000) : null,
    sitemapFound: sitemap.status === 'fulfilled',
    sitemapPreview: sitemap.status === 'fulfilled' ? sitemap.value.slice(0, 2000) : null,
    canonical
  };
  return {
    url: parsed.toString(), title, titleLength: title.length,
    metaDescription, metaDescriptionLength: metaDescription.length,
    headings, h1Count: headings.h1.length,
    imageCount: images.length, imagesMissingAlt: images.filter(i => !i.alt.trim()).length,
    images: images.slice(0, 100), linkCount: links.length,
    internalLinks: links.filter(h => { try { return new URL(h!, parsed).hostname === parsed.hostname; } catch { return false; } }).length,
    externalLinks: links.filter(h => { try { return new URL(h!, parsed).hostname !== parsed.hostname; } catch { return false; } }).length,
    schema, technical
  };
}