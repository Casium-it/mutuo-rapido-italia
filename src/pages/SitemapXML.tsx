import { useEffect, useState } from 'react';

interface BlogArticle {
  slug: string;
  updated_at: string;
  created_at: string;
}

const SitemapXML = () => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);

  useEffect(() => {
    // Set proper headers for XML
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Type';
    meta.content = 'application/xml; charset=utf-8';
    document.head.appendChild(meta);

    // Set title for the sitemap
    document.title = 'Sitemap';

    return () => {
      // Cleanup
      if (document.head.contains(meta)) {
        document.head.removeChild(meta);
      }
    };
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Use Supabase but with simple typing
        const supabaseUrl = 'https://jegdbtznkwzpqntzzlvf.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2RidHpua3d6cHFudHp6bHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NjExNzksImV4cCI6MjA2MzMzNzE3OX0.KS7wtHU2jRggJ06JKu_4YbVOvn8Bvz04wfE0qLpQPwU';
        
        const response = await fetch(`${supabaseUrl}/rest/v1/blog_articles?select=slug,updated_at,created_at&published=eq.true`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setArticles(data || []);
        }
      } catch (error) {
        console.error('Error fetching articles for sitemap:', error);
        // Continue with empty articles array if fetch fails
      }
    };

    fetchArticles();
  }, []);

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

  const generateSitemapXml = () => {
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
    articles.forEach(article => {
      const lastmod = article.updated_at || article.created_at;
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog/${escapeXml(article.slug)}</loc>\n`;
      xml += `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  };

  const xmlContent = generateSitemapXml();

  return (
    <div 
      style={{ 
        whiteSpace: 'pre-wrap', 
        fontFamily: 'monospace',
        fontSize: '12px',
        margin: 0,
        padding: 0
      }}
      dangerouslySetInnerHTML={{ __html: xmlContent }}
    />
  );
};

export default SitemapXML;