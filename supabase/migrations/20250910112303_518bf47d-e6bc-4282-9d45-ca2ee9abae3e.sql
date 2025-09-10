-- Create tables for YCloud WhatsApp webhook data

-- Table for storing WhatsApp messages (inbound and outbound)
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ycloud_message_id TEXT UNIQUE NOT NULL,
  wamid TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT,
  message_type TEXT,
  from_phone TEXT NOT NULL,
  to_phone TEXT NOT NULL,
  content JSONB,
  media_url TEXT,
  media_type TEXT,
  error_code TEXT,
  error_message TEXT,
  total_price DECIMAL(10,4) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  webhook_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for storing WhatsApp contacts
CREATE TABLE public.whatsapp_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  display_name TEXT,
  profile_name TEXT,
  avatar_url TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  is_business BOOLEAN DEFAULT false,
  business_info JSONB,
  tags TEXT[],
  notes TEXT,
  webhook_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for storing chat conversations
CREATE TABLE public.whatsapp_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  contact_id UUID REFERENCES public.whatsapp_contacts(id) ON DELETE SET NULL,
  last_message_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key for last_message_id after whatsapp_messages table exists
ALTER TABLE public.whatsapp_conversations 
ADD CONSTRAINT fk_last_message 
FOREIGN KEY (last_message_id) REFERENCES public.whatsapp_messages(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX idx_whatsapp_messages_from_phone ON public.whatsapp_messages(from_phone);
CREATE INDEX idx_whatsapp_messages_to_phone ON public.whatsapp_messages(to_phone);
CREATE INDEX idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at DESC);
CREATE INDEX idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX idx_whatsapp_contacts_phone ON public.whatsapp_contacts(phone_number);
CREATE INDEX idx_whatsapp_conversations_phone ON public.whatsapp_conversations(phone_number);
CREATE INDEX idx_whatsapp_conversations_assigned ON public.whatsapp_conversations(assigned_to);

-- Enable RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for whatsapp_messages
CREATE POLICY "Admin can manage all WhatsApp messages" 
ON public.whatsapp_messages 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'mediatore')
  )
);

-- RLS policies for whatsapp_contacts
CREATE POLICY "Admin can manage all WhatsApp contacts" 
ON public.whatsapp_contacts 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'mediatore')
  )
);

-- RLS policies for whatsapp_conversations
CREATE POLICY "Admin can manage all WhatsApp conversations" 
ON public.whatsapp_conversations 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'mediatore')
  )
);

-- Mediatore can only see conversations assigned to them
CREATE POLICY "Mediatore can manage assigned conversations" 
ON public.whatsapp_conversations 
FOR ALL 
TO authenticated
USING (
  assigned_to = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'mediatore'
  )
);

-- Update triggers
CREATE TRIGGER update_whatsapp_messages_updated_at
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_contacts_updated_at
  BEFORE UPDATE ON public.whatsapp_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();