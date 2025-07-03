import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Block } from '@/types/form';
import { QuestionFlowCanvas } from './QuestionFlowCanvas';

interface FlowMapDialogProps {
  block: Block;
  isOpen: boolean;
  onClose: () => void;
}

export function FlowMapDialog({ block, isOpen, onClose }: FlowMapDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] p-0">
        <DialogHeader className="p-6 border-b bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-[#245C4F]">
              Mappa Flusso - Blocco #{block.block_number}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <QuestionFlowCanvas block={block} />
        </div>
      </DialogContent>
    </Dialog>
  );
}