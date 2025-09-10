import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Search, MessageCircle, Phone, User, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminWhatsAppChats() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch WhatsApp conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['whatsapp-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select(`
          *,
          contact:whatsapp_contacts(
            id,
            phone_number,
            display_name,
            profile_name
          ),
          last_message:whatsapp_messages!whatsapp_conversations_last_message_id_fkey(
            id,
            content,
            message_type,
            direction,
            created_at
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredConversations = conversations?.filter(conversation => {
    const searchLower = searchTerm.toLowerCase();
    const contact = conversation.contact;
    const phone = conversation.phone_number?.toLowerCase() || '';
    const displayName = contact?.display_name?.toLowerCase() || '';
    const profileName = contact?.profile_name?.toLowerCase() || '';
    
    return phone.includes(searchLower) || 
           displayName.includes(searchLower) || 
           profileName.includes(searchLower);
  });

  const formatMessagePreview = (message: any) => {
    if (!message) return 'Nessun messaggio';
    
    if (message.message_type === 'text') {
      const text = message.content?.text || '';
      return text.length > 50 ? text.substring(0, 50) + '...' : text;
    }
    
    return `${message.message_type || 'Messaggio'}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/admin')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna all'Admin
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F]">WhatsApp Chats</h1>
              <p className="text-gray-600">Gestisci le conversazioni WhatsApp</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca per numero di telefono o nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Caricamento conversazioni...</p>
            </div>
          ) : filteredConversations?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nessuna conversazione trovata' : 'Nessuna conversazione'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Prova a modificare i termini di ricerca.'
                    : 'Le conversazioni WhatsApp appariranno qui quando riceverai i primi messaggi.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredConversations?.map((conversation) => (
              <Card 
                key={conversation.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/admin/whatsapp-chats/${conversation.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-[#245C4F] rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      
                      {/* Contact Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conversation.contact?.display_name || 
                             conversation.contact?.profile_name || 
                             'Contatto sconosciuto'}
                          </h3>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Phone className="h-3 w-3" />
                          <span>{conversation.phone_number}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {formatMessagePreview(conversation.last_message)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Time and Status */}
                    <div className="flex flex-col items-end gap-2">
                      {conversation.last_message_at && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(conversation.last_message_at)}</span>
                        </div>
                      )}
                      <Badge 
                        variant={conversation.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {conversation.status === 'active' ? 'Attiva' : 'Archiviata'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}