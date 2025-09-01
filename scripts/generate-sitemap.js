#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = "https://jegdbtznkwzpqntzzlvf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2RidHpua3d6cHFudHp6bHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NjExNzksImV4cCI6MjA2MzMzNzE3OX0.KS7wtHU2jRggJ06JKu_4YbVOvn8Bvz04wfE0qLpQPwU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const generateSitemap = async () => {
  try {
    console.log('🔄 Generating sitemap...');
    
    // Fetch all published articles
    const { data: articles, error } = await supabase
      .from('blog_articles')
      .select(`
        slug,
        updated_at,
        created_at
      `)
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching articles:', error);
      throw error;
    }

    console.log(`📚 Found ${articles?.length || 0} published articles`);

    const baseUrl = 'https://gomutuo.it';
    const currentDate = new Date().toISOString();

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
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

    sitemap += '\n</urlset>';

    // Ensure public directory exists
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write sitemap to public directory
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');

    console.log(`✅ Sitemap generated successfully at ${sitemapPath}`);
    console.log(`📊 Total URLs: ${6 + (articles?.length || 0)}`);
    console.log(`🌐 Sitemap available at: ${baseUrl}/sitemap.xml`);

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
};

// Run the script
generateSitemap();