-- Add missing foreign key constraint for last_message_id
ALTER TABLE whatsapp_conversations 
ADD CONSTRAINT whatsapp_conversations_last_message_id_fkey 
FOREIGN KEY (last_message_id) REFERENCES whatsapp_messages(id);

-- Add missing foreign key constraint for contact_id
ALTER TABLE whatsapp_conversations 
ADD CONSTRAINT whatsapp_conversations_contact_id_fkey 
FOREIGN KEY (contact_id) REFERENCES whatsapp_contacts(id);