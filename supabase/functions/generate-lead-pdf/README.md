# Lead PDF Generation Function

## Overview
This edge function generates PDF documents from lead submission data and uploads them to temporary storage for use in WhatsApp notifications.

## Current Implementation
- **Status**: ✅ Functional (Basic Implementation)
- **PDF Format**: Currently generates text-based content (placeholder for real PDF)
- **Storage**: Uploads to `temp-pdfs` Supabase Storage bucket
- **Security**: Uses service role for database and storage access

## Input
```json
{
  "submissionId": "uuid-of-form-submission"
}
```

## Output
```json
{
  "success": true,
  "pdfUrl": "https://storage-url/temp-pdfs/date/filename.pdf",
  "filename": "nome_cognome_telefono_timestamp.pdf"
}
```

## Data Sources
1. **form_submissions**: Lead information (name, phone, email, status, etc.)
2. **form_responses**: All form responses for the submission
3. **forms**: Form title and metadata

## File Organization
- **Bucket**: `temp-pdfs` (public read access)
- **Path Structure**: `YYYY-MM-DD/nome_cognome_telefono_timestamp.pdf`
- **Cleanup**: Handled by `cleanup-temp-pdfs` function

## Integration
- Called by `send-admin-notifications` function
- PDF URL passed to YCloud for WhatsApp document attachment
- Fallback to text-only notifications if PDF generation fails

## Future Improvements Needed

### 1. Real PDF Generation
Currently generates text content. Need to implement proper PDF generation:

**Option A: External PDF Service**
```typescript
// Use service like HTMLCSStoImage, Puppeteer API, etc.
const response = await fetch('https://api.htmlcsstoimage.com/v1/pdf', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer API_KEY' },
  body: JSON.stringify({ html: htmlContent, format: 'A4' })
})
```

**Option B: Deno PDF Library**
```typescript
// Research Deno-compatible PDF libraries
import { PDF } from 'https://deno.land/x/pdf/mod.ts'
```

### 2. Enhanced PDF Content
- Add company branding/logo
- Improve formatting and styling
- Add charts/graphs for numerical data
- Better response value formatting

### 3. Error Handling
- Retry logic for failed uploads
- Better error messages
- Monitoring and alerting

### 4. Performance Optimization
- Caching for repeated requests
- Parallel processing of data fetching
- Compression for large PDFs

## Testing
Test the function manually:
```bash
curl -X POST 'https://jegdbtznkwzpqntzzlvf.supabase.co/functions/v1/generate-lead-pdf' \
  -H 'Authorization: Bearer SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"submissionId": "actual-submission-uuid"}'
```

## Dependencies
- Supabase client for database and storage
- Future: PDF generation library/service