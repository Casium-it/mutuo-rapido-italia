import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface CleanupRequest {
  maxAgeHours?: number // Default 48 hours
  dryRun?: boolean     // Default false
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID()
  console.log(`[${requestId}] === PDF Cleanup Started ===`)

  try {
    const { maxAgeHours = 48, dryRun = false }: CleanupRequest = await req.json().catch(() => ({}))
    
    console.log(`[${requestId}] Cleanup parameters:`, { maxAgeHours, dryRun })

    // Calculate cutoff date
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - maxAgeHours)
    
    console.log(`[${requestId}] Looking for files older than:`, cutoffDate.toISOString())

    // List all files in temp-pdfs bucket
    const { data: files, error: listError } = await supabase.storage
      .from('temp-pdfs')
      .list('', {
        limit: 1000,
        offset: 0
      })

    if (listError) {
      console.error(`[${requestId}] Error listing files:`, listError)
      return Response.json({
        success: false,
        error: "Failed to list files"
      }, { status: 500, headers: corsHeaders })
    }

    if (!files || files.length === 0) {
      console.log(`[${requestId}] No files found in temp-pdfs bucket`)
      return Response.json({
        success: true,
        message: "No files to cleanup",
        filesProcessed: 0,
        filesDeleted: 0
      }, { headers: corsHeaders })
    }

    // Filter files by age
    const expiredFiles = []
    const allFiles = []

    // Process directories (date folders)
    for (const item of files) {
      if (item.name && !item.name.includes('.')) {
        // This is likely a date directory, list its contents
        const { data: dateFiles, error: dateListError } = await supabase.storage
          .from('temp-pdfs')
          .list(item.name, {
            limit: 1000,
            offset: 0
          })

        if (!dateListError && dateFiles) {
          for (const file of dateFiles) {
            if (file.name && file.created_at) {
              const filePath = `${item.name}/${file.name}`
              const fileDate = new Date(file.created_at)
              allFiles.push({ path: filePath, date: fileDate })
              
              if (fileDate < cutoffDate) {
                expiredFiles.push(filePath)
              }
            }
          }
        }
      }
    }

    console.log(`[${requestId}] Found ${allFiles.length} total files, ${expiredFiles.length} expired`)

    let deletedCount = 0
    const deleteErrors: string[] = []

    if (!dryRun && expiredFiles.length > 0) {
      // Delete expired files
      for (const filePath of expiredFiles) {
        try {
          const { error: deleteError } = await supabase.storage
            .from('temp-pdfs')
            .remove([filePath])

          if (deleteError) {
            console.error(`[${requestId}] Error deleting file ${filePath}:`, deleteError)
            deleteErrors.push(`${filePath}: ${deleteError.message}`)
          } else {
            console.log(`[${requestId}] ✅ Deleted expired file: ${filePath}`)
            deletedCount++
          }
        } catch (error) {
          console.error(`[${requestId}] Exception deleting file ${filePath}:`, error)
          deleteErrors.push(`${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    const result = {
      success: true,
      message: dryRun ? "Dry run completed" : "Cleanup completed",
      filesProcessed: allFiles.length,
      expiredFiles: expiredFiles.length,
      filesDeleted: deletedCount,
      errors: deleteErrors,
      cutoffDate: cutoffDate.toISOString(),
      dryRun
    }

    console.log(`[${requestId}] ✅ Cleanup completed:`, result)

    return Response.json(result, { headers: corsHeaders })

  } catch (error) {
    console.error(`[${requestId}] ❌ Error in PDF cleanup:`, error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500, headers: corsHeaders })
  }
})