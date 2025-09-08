-- Add consulenza_saltata to pratica_status enum
ALTER TYPE pratica_status ADD VALUE IF NOT EXISTS 'consulenza_saltata';