import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/partners/'],
      },
      // AI crawlers — allow for AI Overview / citation potential
      { userAgent: 'Googlebot', allow: '/' },
      // OpenAI Search uses OAI-SearchBot; GPTBot governs training access instead.
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
    ],
    sitemap: 'https://broadbandpicker.co.uk/sitemap.xml',
  }
}
