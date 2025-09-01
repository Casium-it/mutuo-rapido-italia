import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  placeholder?: string;
}

export function ImageUploader({ value, onChange, label, placeholder }: ImageUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Errore",
        description: "Il file deve essere un'immagine",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Errore", 
        description: "L'immagine deve essere inferiore a 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Convert to base64 for demo purposes
      // In production, upload to a proper storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onChange(base64);
        toast({
          title: "Successo",
          description: "Immagine caricata con successo",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nel caricamento dell'immagine",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* URL Input */}
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "URL immagine o carica file..."}
      />
      
      {/* File Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="text-sm text-gray-500">Caricamento...</div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-6 h-6 mx-auto text-gray-400" />
            <p className="text-sm text-gray-500">
              Clicca per caricare o trascina qui un'immagine
            </p>
          </div>
        )}
      </div>
      
      {/* Preview */}
      {value && (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="max-w-full h-32 object-cover rounded border"
            onError={() => {
              toast({
                title: "Errore",
                description: "Impossibile caricare l'immagine",
                variant: "destructive",
              });
            }}
          />
          <Button
            size="sm"
            variant="outline"
            className="absolute top-1 right-1"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
    </div>
  );
}