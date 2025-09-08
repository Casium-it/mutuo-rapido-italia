-- Add da_richiamare to pratica_status enum
ALTER TYPE pratica_status ADD VALUE IF NOT EXISTS 'da_richiamare';