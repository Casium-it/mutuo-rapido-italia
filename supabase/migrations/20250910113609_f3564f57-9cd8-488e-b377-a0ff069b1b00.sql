-- Add missing foreign key constraint for last_message_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'whatsapp_conversations_last_message_id_fkey'
    ) THEN
        ALTER TABLE whatsapp_conversations 
        ADD CONSTRAINT whatsapp_conversations_last_message_id_fkey 
        FOREIGN KEY (last_message_id) REFERENCES whatsapp_messages(id);
    END IF;
END $$;