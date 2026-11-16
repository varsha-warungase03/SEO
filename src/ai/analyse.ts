import Anthropic from '@anthropic-ai/sdk';
import { USE_MOCKS } from '../mocks/index.js';

const systemPrompt = `You are a senior SEO analyst with 15+ years experience specialising in Indian local business websites, healthcare, dental, and real estate sectors. You produce honest, falsifiable, prioritised SEO audit reports. Your output must be valid JSON only — no markdown, no preamble. Every recommendation must include: finding, fix, estimated_impact (High/Medium/Low), effort (Hours/Days/Weeks), falsifiability_check (how we know if this worked).`;

function fallback(data: any) {
  const issues = [];
  if (!data.onPage.title) issues.push({ priority:'HIGH', category:'OnPage', finding:'The page has no title tag.', fix:'Add a unique, descriptive title tag.', estimated_impact:'High', effort:'Hours', falsifiability_check:'Re-crawl and confirm a non-empty title.' });
  if (data.onPage.imagesMissingAlt > 0) issues.push({ priority:'MEDIUM', category:'OnPage', finding:`${data.onPage.imagesMissingAlt} images have no alt text.`, fix:'Add concise descriptive alt text to meaningful images.', estimated_impact:'Medium', effort:'Hours', falsifiability_check:'Re-crawl and confirm missing-alt count decreases.' });
  if (!data.onPage.metaDescription) issues.push({ priority:'MEDIUM', category:'OnPage', finding:'Meta description is missing.', fix:'Write a unique meta description that accurately summarises the page.', estimated_impact:'Medium', effort:'Hours', falsifiability_check:'Re-crawl and confirm meta description is present.' });
  const recs = [...issues, { priority:'HIGH', category:'CWV', finding:'Mock PageSpeed performance score is 61/100.', fix:'Review LCP, render-blocking resources and unused JavaScript; optimise the largest above-the-fold content.', estimated_impact:'High', effort:'Days', falsifiability_check:'Run a fresh mobile PageSpeed test and compare performance and LCP.' }];
  return {
    audit_version:'v1.0', overall_score:68,
    score_breakdown:{technical:70,on_page:72,content:65,core_web_vitals:61,schema:70},
    critical_issues:[], important_issues:recs.slice(0,Math.min(8,recs.length)),
    quick_wins:recs.filter(x=>x.effort==='Hours').slice(0,5),
    recommendations:recs,
    executive_summary:'This audit uses assessment mock data for external search and performance services. Address missing or weak on-page elements and improve mobile performance. Re-run the audit after changes to verify measurable improvements.'
  };
}
export async function analyseSEO(data: any) {
 console.log("USE_MOCKS value:", USE_MOCKS);

  if (USE_MOCKS) {
    console.log("Using mock SEO analysis. Anthropic API will not be called.");
    return fallback(data);
  }
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is required when USE_MOCKS=false or AI mock fallback is disabled');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = `Analyse the following SEO signals for: ${data.url}
Business type: ${data.businessType}
Business location: ${data.city}, ${data.state}, India

=== ON-PAGE DATA ===
${JSON.stringify(data.onPage)}
=== TECHNICAL DATA ===
${JSON.stringify(data.technical)}
=== CORE WEB VITALS ===
${JSON.stringify(data.pageSpeed)}
=== SCHEMA.ORG DATA ===
${JSON.stringify(data.onPage.schema)}
=== GOOGLE SEARCH CONSOLE ===
${JSON.stringify(data.gsc)}
=== KEYWORD RANKINGS ===
${JSON.stringify(data.rankings)}

Respond ONLY with this JSON structure:
{
 "audit_version":"v1.0",
 "overall_score":0,
 "score_breakdown":{"technical":0,"on_page":0,"content":0,"core_web_vitals":0,"schema":0},
 "critical_issues":[],
 "important_issues":[],
 "quick_wins":[],
 "recommendations":[{"priority":"CRITICAL|HIGH|MEDIUM|LOW","category":"Technical|OnPage|Content|Schema|CWV","finding":"","fix":"","estimated_impact":"High|Medium|Low","effort":"Hours|Days|Weeks","falsifiability_check":""}],
 "executive_summary":""
}
Limit critical_issues to 5, important_issues to 8 and quick_wins to 5.`;
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    max_tokens: 3500, temperature: 0,
    system: systemPrompt,
    messages: [{ role:'user', content:prompt }]
  });
  const textBlock = response.content.find(
  (block) => block.type === "text"
);

const raw = textBlock && textBlock.type === "text"
  ? textBlock.text
  : "";
  const cleaned = raw.replace(/^```json\s*/i,'').replace(/\s*```$/,'').trim();
  const parsed = JSON.parse(cleaned);
  if (!Number.isInteger(parsed.overall_score) || !parsed.score_breakdown || !Array.isArray(parsed.recommendations)) throw new Error('Claude response did not match required audit JSON');
  return parsed;
}