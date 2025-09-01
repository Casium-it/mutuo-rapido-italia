import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

interface BlogArticle {
  slug: string;
  updated_at: string;
  created_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching published blog articles for sitemap...');

    // Fetch published blog articles
    const { data: articles, error } = await supabase
      .from('blog_articles')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .not('published_at', 'is', null);

    if (error) {
      console.error('Error fetching articles:', error);
    }

    const blogArticles = (articles || []) as BlogArticle[];
    console.log(`Found ${blogArticles.length} published articles`);

    // Generate sitemap XML
    const baseUrl = 'https://gomutuo.it';
    const currentDate = new Date().toISOString();

    const staticPages = [
      { url: '', lastmod: currentDate, changefreq: 'weekly', priority: '1.0' },
      { url: '/blog', lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
      { url: '/chi-siamo', lastmod: currentDate, changefreq: 'monthly', priority: '0.8' },
      { url: '/simulazioni', lastmod: currentDate, changefreq: 'weekly', priority: '0.9' },
      { url: '/privacy', lastmod: currentDate, changefreq: 'yearly', priority: '0.3' },
    ];

    const escapeXml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add blog articles
    blogArticles.forEach(article => {
      const lastmod = article.updated_at || article.created_at;
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog/${escapeXml(article.slug)}</loc>\n`;
      xml += `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    console.log('Sitemap generated successfully');

    return new Response(xml, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
});