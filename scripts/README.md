# Sitemap Generation Script

## Overview

This directory contains the sitemap generation script that replaces the client-side React component with a proper server-side generated XML sitemap.

## Files

- `generate-sitemap.js` - Node.js script that generates the sitemap.xml file
- `validate-sitemap.js` - Script to validate the generated sitemap structure  
- `README.md` - This documentation file

## Implementation Status

✅ **Phase 1 Complete**: Sitemap generation script created  
✅ **Phase 2 Partial**: Script created, client-side component removed  
⏳ **Phase 2 Remaining**: Add scripts to package.json  
⏳ **Phase 3**: Automation options  
⏳ **Phase 4**: Validation & optimization  

## Required Package.json Updates

Since package.json is read-only in Lovable, you'll need to manually add these scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "npm run generate:sitemap && vite build",
    "build:dev": "npm run generate:sitemap && vite build --mode development", 
    "generate:sitemap": "node scripts/generate-sitemap.js",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

## How to Use

### Manual Generation
```bash
# Generate sitemap manually
node scripts/generate-sitemap.js

# Validate generated sitemap
node scripts/validate-sitemap.js
```

### Automatic Generation (after package.json update)
```bash
# Generate and build
npm run build

# Just generate sitemap
npm run generate:sitemap

# Validate sitemap
npm run validate:sitemap  # Add this script to package.json
```

## Features

- ✅ Fetches published blog articles from Supabase
- ✅ Includes all static pages (home, blog, chi-siamo, etc.)
- ✅ Proper XML structure with lastmod, changefreq, priority
- ✅ Only includes articles with published_at set
- ✅ Generates to `public/sitemap.xml` for static serving
- ✅ SEO-friendly with proper priorities and change frequencies

## Next Steps

### Phase 3: Automation Options
1. **Build Integration**: Already configured to run on build
2. **Webhook Trigger**: Create Supabase webhook on blog_articles changes
3. **Scheduled Regeneration**: Add cron job for regular updates
4. **CI/CD Integration**: Add to deployment pipeline

### Phase 4: Validation & Optimization  
1. **XML Validation**: Test with XML validators
2. **Google Search Console**: Submit updated sitemap
3. **Performance Monitoring**: Track crawling performance
4. **Cache Headers**: Configure proper HTTP cache headers

## Benefits

- 🚀 **Faster**: Static file serving vs React component rendering
- 🤖 **SEO Friendly**: Proper XML content-type headers
- 📱 **Reliable**: Works without JavaScript
- 🔄 **Fresh Content**: Updates with blog changes
- 🌐 **Standards Compliant**: Follows sitemap protocol

## Technical Details

- Uses same Supabase client and queries as original component
- Filters for `status = 'published'` AND `published_at IS NOT NULL`
- Sorts by `updated_at` for freshest content first
- Includes proper XML namespaces and structure
- Generates to `/public/sitemap.xml` for static serving