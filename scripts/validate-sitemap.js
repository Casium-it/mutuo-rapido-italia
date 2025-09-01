#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validateSitemap = () => {
  try {
    console.log('🔍 Validating sitemap.xml...');
    
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    
    if (!fs.existsSync(sitemapPath)) {
      console.error('❌ Sitemap not found at:', sitemapPath);
      console.log('💡 Run: node scripts/generate-sitemap.js');
      return false;
    }
    
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    
    // Basic XML structure validation
    const checks = [
      {
        test: sitemapContent.includes('<?xml version="1.0" encoding="UTF-8"?>'),
        message: 'XML declaration'
      },
      {
        test: sitemapContent.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'),
        message: 'Valid urlset with namespace'
      },
      {
        test: sitemapContent.includes('</urlset>'),
        message: 'Proper closing tag'
      },
      {
        test: sitemapContent.includes('<loc>https://gomutuo.it/</loc>'),
        message: 'Homepage URL'
      },
      {
        test: sitemapContent.includes('<loc>https://gomutuo.it/blog</loc>'),
        message: 'Blog page URL'
      },
      {
        test: sitemapContent.includes('<lastmod>'),
        message: 'Last modification dates'
      },
      {
        test: sitemapContent.includes('<priority>'),
        message: 'URL priorities'
      },
      {
        test: sitemapContent.includes('<changefreq>'),
        message: 'Change frequencies'
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    checks.forEach(check => {
      if (check.test) {
        console.log(`✅ ${check.message}`);
        passed++;
      } else {
        console.log(`❌ ${check.message}`);
        failed++;
      }
    });
    
    // Count URLs
    const urlCount = (sitemapContent.match(/<url>/g) || []).length;
    console.log(`\n📊 Statistics:`);
    console.log(`   URLs found: ${urlCount}`);
    console.log(`   Checks passed: ${passed}/${checks.length}`);
    
    if (failed === 0) {
      console.log('\n🎉 Sitemap validation passed!');
      console.log(`🌐 Sitemap available at: https://gomutuo.it/sitemap.xml`);
      return true;
    } else {
      console.log(`\n❌ Sitemap validation failed (${failed} errors)`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error validating sitemap:', error.message);
    return false;
  }
};

// Run validation
validateSitemap();