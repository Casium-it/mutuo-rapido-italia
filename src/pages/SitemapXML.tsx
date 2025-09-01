import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SitemapXML: React.FC = () => {
  useEffect(() => {
    const generateSitemap = async () => {
      try {
        // Fetch all published articles
        const { data: articles, error } = await supabase
          .from('blog_articles')
          .select(`
            slug,
            updated_at,
            created_at,
            category:blog_categories(slug)
          `)
          .eq('status', 'published')
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching articles:', error);
          return;
        }

        // Fetch all categories
        const { data: categories, error: categoriesError } = await supabase
          .from('blog_categories')
          .select('slug, updated_at')
          .order('updated_at', { ascending: false });

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        }

        const baseUrl = 'https://gomutuo.it';
        const currentDate = new Date().toISOString();

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- Main pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/chi-siamo</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/simulazione-avanzata</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/simulazioni</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`;

        // Add blog articles
        if (articles && articles.length > 0) {
          sitemap += '\n  \n  <!-- Blog Articles -->';
          articles.forEach(article => {
            const lastmod = article.updated_at || article.created_at;
            sitemap += `
  <url>
    <loc>${baseUrl}/blog/${article.slug}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
          });
        }

        // Add blog categories
        if (categories && categories.length > 0) {
          sitemap += '\n  \n  <!-- Blog Categories -->';
          categories.forEach(category => {
            const lastmod = category.updated_at;
            sitemap += `
  <url>
    <loc>${baseUrl}/blog/categoria/${category.slug}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
          });
        }

        sitemap += '\n</urlset>';

        // Set proper headers and serve XML directly
        document.open();
        document.write(sitemap);
        document.close();

        // Set content type
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Content-Type');
        meta.setAttribute('content', 'application/xml; charset=utf-8');
        document.head.appendChild(meta);

      } catch (error) {
        console.error('Error generating sitemap:', error);
        document.write('<?xml version="1.0" encoding="UTF-8"?><error>Unable to generate sitemap</error>');
      }
    };

    generateSitemap();
  }, []);

  return null; // This component doesn't render anything visible in React
};

export default SitemapXML;