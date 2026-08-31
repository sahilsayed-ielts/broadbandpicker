import type { MetadataRoute } from 'next'

const allowAll = { allow: '/', disallow: ['/api/', '/partners/'] as string[] }

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', ...allowAll },
      { userAgent: 'Googlebot', ...allowAll },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Google-CloudVertexBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'Applebot', allow: '/' },
      { userAgent: 'DuckDuckBot', allow: '/' },
      { userAgent: 'Amazonbot', allow: '/' },
      { userAgent: 'meta-externalagent', allow: '/' },
    ],
    sitemap: [
      'https://broadbandpicker.co.uk/sitemap.xml',
      'https://broadbandpicker.co.uk/postcode/sitemap.xml',
    ],
    host: 'https://broadbandpicker.co.uk',
  }
}
