-- Update pratica_status enum with new values
ALTER TYPE pratica_status RENAME TO pratica_status_old;

CREATE TYPE pratica_status AS ENUM (
  'lead',
  'consulenza_programmata',
  'consulenza_completata',
  'in_attesa_documenti',
  'documenti_ricevuti',
  'in_attesa_mandato',
  'mandato_firmato',
  'inviata_alla_banca',
  'predelibera_ricevuta',
  'istruttoria_ricevuta',
  'rogito_completato',
  'pratica_rifiutata',
  'pratica_sospesa'
);

-- Update the pratiche table column
ALTER TABLE pratiche 
ALTER COLUMN status DROP DEFAULT,
ALTER COLUMN status TYPE pratica_status USING 
  CASE status::text
    WHEN 'bozza' THEN 'lead'::pratica_status
    WHEN 'in_lavorazione' THEN 'consulenza_programmata'::pratica_status
    WHEN 'documenti_richiesti' THEN 'in_attesa_documenti'::pratica_status
    WHEN 'valutazione_banca' THEN 'inviata_alla_banca'::pratica_status
    WHEN 'approvata' THEN 'rogito_completato'::pratica_status
    WHEN 'rifiutata' THEN 'pratica_rifiutata'::pratica_status
    WHEN 'erogata' THEN 'rogito_completato'::pratica_status
    WHEN 'sospesa' THEN 'pratica_sospesa'::pratica_status
    ELSE 'lead'::pratica_status
  END,
ALTER COLUMN status SET DEFAULT 'lead'::pratica_status;

-- Drop the old enum
DROP TYPE pratica_status_old;