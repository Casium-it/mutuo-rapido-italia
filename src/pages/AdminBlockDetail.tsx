
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ArrowLeft, Blocks, Settings, Users, MessageSquare, Eye, FileText } from 'lucide-react';
import { adminBlockService, type AdminBlockDetail as AdminBlockDetailType } from '@/services/adminBlockService';
import { toast } from '@/hooks/use-toast';
import { BlockFlowMap } from '@/components/admin/BlockFlowMap';

export default function AdminBlockDetail() {
  const { blockId } = useParams<{ blockId: string }>();
  const [searchParams] = useSearchParams();
  const formSlug = searchParams.get('form');
  const [block, setBlock] = useState<AdminBlockDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFlowMap, setShowFlowMap] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (blockId) {
      loadBlockDetail();
    }
  }, [blockId, formSlug]);

  const loadBlockDetail = async () => {
    if (!blockId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const blockData = await adminBlockService.getBlockDetail(blockId, formSlug || undefined);
      
      if (!blockData) {
        setError('Blocco non trovato');
        return;
      }
      
      setBlock(blockData);
    } catch (err) {
      console.error('Error loading block detail:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento del blocco');
      toast({
        title: "Errore",
        description: "Errore nel caricamento del dettaglio blocco",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getBlockTypeLabels = (block: AdminBlockDetailType) => {
    const labels = [];
    if (block.properties.defaultActive) labels.push('Attivo di default');
    if (block.properties.multiBlock) labels.push('Multi-blocco');
    if (block.properties.invisible) labels.push('Invisibile');
    if (block.properties.blueprintId) labels.push('Blueprint');
    return labels;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento dettaglio blocco...</p>
        </div>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Errore</h3>
              <p className="text-gray-600 mb-4">{error || 'Blocco non trovato'}</p>
              <Button onClick={() => navigate('/admin/blocks')}>Torna ai Blocchi</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f1]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(`/admin/blocks${formSlug ? `?form=${formSlug}` : ''}`)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna ai Blocchi
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F] flex items-center gap-2">
                <Blocks className="h-6 w-6" />
                Dettaglio Blocco
              </h1>
              <p className="text-gray-600">Benvenuto, {user?.email}</p>
            </div>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Esci
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Block Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs font-mono">
                Priorità: {block.priority}
              </Badge>
              <span className="text-[#245C4F]">#{block.blockNumber}</span>
              <span>{block.title}</span>
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                {block.formTitle}
              </Badge>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">{block.blockId}</code>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Domande:</span>
                <span className="font-medium">{block.questionCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Ordine:</span>
                <span className="font-medium">{block.sortOrder}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span>Creato:</span>
                <div className="font-medium">{formatDate(block.createdAt)}</div>
              </div>
              <div className="text-sm text-gray-600">
                <span>Aggiornato:</span>
                <div className="font-medium">{formatDate(block.updatedAt)}</div>
              </div>
            </div>

            {/* Block Properties */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Proprietà del Blocco</h3>
              <div className="flex flex-wrap gap-2">
                {getBlockTypeLabels(block).map((label, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="text-sm"
                  >
                    {label}
                  </Badge>
                ))}
                {getBlockTypeLabels(block).length === 0 && (
                  <span className="text-gray-500 text-sm">Nessuna proprietà speciale</span>
                )}
              </div>
            </div>

            {/* Additional Properties */}
            {(block.properties.blueprintId || block.properties.copyNumber) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Informazioni Aggiuntive</h3>
                <div className="space-y-2">
                  {block.properties.blueprintId && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Blueprint ID:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">{block.properties.blueprintId}</code>
                    </div>
                  )}
                  {block.properties.copyNumber && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Numero Copia:</span>
                      <span className="font-medium">{block.properties.copyNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFlowMap(!showFlowMap)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showFlowMap ? 'Nascondi' : 'Mostra'} Mappa Flusso
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Flow Map */}
        {showFlowMap && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mappa del Flusso delle Domande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BlockFlowMap 
                block={{
                  block_id: block.blockId,
                  block_number: block.blockNumber,
                  title: block.title,
                  priority: block.priority,
                  questions: block.questions,
                  default_active: block.properties.defaultActive,
                  invisible: block.properties.invisible,
                  multiBlock: block.properties.multiBlock,
                  blueprint_id: block.properties.blueprintId,
                  copy_number: block.properties.copyNumber
                }}
                isOpen={showFlowMap}
                onClose={() => setShowFlowMap(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Domande del Blocco ({block.questionCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {block.questions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nessuna domanda trovata in questo blocco</p>
            ) : (
              <div className="space-y-4">
                {block.questions.map((question, index) => (
                  <Card key={question.question_id} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {question.question_number}
                        </Badge>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{question.question_id}</code>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-800 mb-3">{question.question_text}</p>
                      
                      {question.question_notes && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-500">Note:</span>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">{question.question_notes}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Placeholders: {Object.keys(question.placeholders || {}).length}</span>
                        {question.inline && <Badge variant="secondary" className="text-xs">Inline</Badge>}
                        {question.endOfForm && <Badge variant="secondary" className="text-xs">Fine Form</Badge>}
                        {question.skippableWithNotSure && <Badge variant="secondary" className="text-xs">Saltabile</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
