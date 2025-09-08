-- Add new values to pratica_status enum
ALTER TYPE pratica_status ADD VALUE 'non_risponde';
ALTER TYPE pratica_status ADD VALUE 'persa';
ALTER TYPE pratica_status ADD VALUE 'consulenza_saltata';