-- Drop WhatsApp tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS whatsapp_conversations CASCADE;
DROP TABLE IF EXISTS whatsapp_contacts CASCADE;