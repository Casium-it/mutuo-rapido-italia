
import React, { useState } from 'react';
import { useForm } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Bug, Eye, EyeOff } from 'lucide-react';

export const FormDebugPanel: React.FC = () => {
  const { state, blocks } = useForm();
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const exportFormState = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      formState: {
        activeBlocks: state.activeBlocks,
        activeQuestion: state.activeQuestion,
        responses: state.responses,
        answeredQuestions: Array.from(state.answeredQuestions),
        completedBlocks: state.completedBlocks,
        dynamicBlocks: state.dynamicBlocks,
        blockActivations: state.blockActivations,
        pendingRemovals: state.pendingRemovals
      },
      blocks: blocks.map(b => ({
        id: b.block_id,
        title: b.title,
        priority: b.priority,
        questionsCount: b.questions?.length || 0
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-state-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
          size="sm"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="shadow-xl border-2 border-orange-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Bug className="h-5 w-5 mr-2 text-orange-500" />
              Form Debug Panel
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50 p-2 rounded">
              <div className="font-semibold text-blue-700">Responses</div>
              <div className="text-blue-600">{Object.keys(state.responses).length}</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="font-semibold text-green-700">Active Blocks</div>
              <div className="text-green-600">{state.activeBlocks.length}</div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="font-semibold text-purple-700">Completed</div>
              <div className="text-purple-600">{state.completedBlocks.length}</div>
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <div className="font-semibold text-orange-700">Dynamic</div>
              <div className="text-orange-600">{state.dynamicBlocks?.length || 0}</div>
            </div>
          </div>

          {/* Current Question */}
          <Collapsible open={expandedSections.current} onOpenChange={() => toggleSection('current')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-yellow-50 rounded hover:bg-yellow-100">
              <span className="font-medium text-yellow-800">Current Question</span>
              {expandedSections.current ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-2 bg-yellow-25 rounded text-xs">
              <div><strong>Block:</strong> {state.activeQuestion.block_id}</div>
              <div><strong>Question:</strong> {state.activeQuestion.question_id}</div>
            </CollapsibleContent>
          </Collapsible>

          {/* Form Responses */}
          <Collapsible open={expandedSections.responses} onOpenChange={() => toggleSection('responses')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-blue-50 rounded hover:bg-blue-100">
              <span className="font-medium text-blue-800">Form Responses ({Object.keys(state.responses).length})</span>
              {expandedSections.responses ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 max-h-40 overflow-y-auto">
              {Object.entries(state.responses).map(([questionId, response]) => (
                <div key={questionId} className="mb-2 p-2 bg-blue-25 rounded text-xs">
                  <div className="font-medium text-blue-700">{questionId}</div>
                  <pre className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                    {formatJSON(response)}
                  </pre>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Active Blocks */}
          <Collapsible open={expandedSections.blocks} onOpenChange={() => toggleSection('blocks')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-green-50 rounded hover:bg-green-100">
              <span className="font-medium text-green-800">Active Blocks ({state.activeBlocks.length})</span>
              {expandedSections.blocks ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1">
              {state.activeBlocks.map(blockId => {
                const block = blocks.find(b => b.block_id === blockId);
                const isCompleted = state.completedBlocks.includes(blockId);
                return (
                  <div key={blockId} className="flex items-center justify-between p-2 bg-green-25 rounded text-xs">
                    <span className="font-medium">{block?.title || blockId}</span>
                    <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
                      {isCompleted ? "Complete" : "Active"}
                    </Badge>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* Dynamic Blocks */}
          {state.dynamicBlocks && state.dynamicBlocks.length > 0 && (
            <Collapsible open={expandedSections.dynamic} onOpenChange={() => toggleSection('dynamic')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-purple-50 rounded hover:bg-purple-100">
                <span className="font-medium text-purple-800">Dynamic Blocks ({state.dynamicBlocks.length})</span>
                {expandedSections.dynamic ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-1">
                {state.dynamicBlocks.map(block => (
                  <div key={block.block_id} className="p-2 bg-purple-25 rounded text-xs">
                    <div className="font-medium text-purple-700">{block.title}</div>
                    <div className="text-gray-600">ID: {block.block_id}</div>
                    <div className="text-gray-600">Questions: {block.questions?.length || 0}</div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={exportFormState}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              Export State
            </Button>
            <Button
              onClick={() => console.log('Form State:', { state, blocks })}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              Log to Console
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
