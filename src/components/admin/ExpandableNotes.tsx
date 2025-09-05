import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableNotesProps {
  notes: string;
  maxLines?: number;
}

export function ExpandableNotes({ notes, maxLines = 8 }: ExpandableNotesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Split notes into lines and filter out empty lines
  const lines = notes.split('\n').filter(line => line.trim() !== '');
  const shouldShowExpandButton = lines.length > maxLines;
  
  // Determine which lines to show
  const displayLines = isExpanded ? lines : lines.slice(0, maxLines);
  
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
        {displayLines.map((line, index) => (
          <div key={index} className={index > 0 ? 'mt-1' : ''}>
            {line.trim()}
          </div>
        ))}
      </div>
      
      {shouldShowExpandButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto p-0 font-bold text-[#245C4F] hover:text-[#1a453b] hover:bg-transparent"
        >
          <span className="flex items-center gap-1">
            {isExpanded ? 'Comprimi' : 'Espandi'}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </Button>
      )}
    </div>
  );
}