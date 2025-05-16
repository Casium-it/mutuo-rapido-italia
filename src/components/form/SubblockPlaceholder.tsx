
import React, { useState } from "react";
import { useForm } from "@/contexts/FormContext";
import { SubblockInstanceCard } from "./SubblockInstanceCard";
import { SubblockInstanceForm } from "./SubblockInstanceForm";
import { Button } from "@/components/ui/button";
import { SubblockPlaceholder as SubblockPlaceholderType } from "@/types/form";
import { Plus, ArrowRight } from "lucide-react";

interface SubblockPlaceholderProps {
  questionId: string;
  placeholderKey: string;
  placeholder: SubblockPlaceholderType;
  onContinue: () => void;
}

export function SubblockPlaceholder({ questionId, placeholderKey, placeholder, onContinue }: SubblockPlaceholderProps) {
  const {
    startSubblockCreation,
    startSubblockEditing,
    cancelSubblockEditing,
    saveSubblockInstance,
    deleteSubblockInstance,
    getSubblockInstances,
    state
  } = useForm();
  
  // Ottieni tutte le istanze esistenti per questo sottoblocco
  const instances = getSubblockInstances(questionId, placeholderKey);
  
  // Controlla se siamo in modalità creazione o modifica
  const isCreating = state.activeSubblock?.question_id === questionId && 
                    state.activeSubblock?.placeholder_key === placeholderKey &&
                    !state.activeSubblock?.isEditing;
                    
  const isEditing = state.activeSubblock?.question_id === questionId && 
                   state.activeSubblock?.placeholder_key === placeholderKey &&
                   state.activeSubblock?.isEditing;
  
  // Ottieni l'ID dell'istanza che stiamo modificando (se presente)
  const editingInstanceId = state.activeSubblock?.instance_id;
  
  // Trova l'istanza che stiamo modificando (se presente)
  const editingInstance = editingInstanceId 
    ? instances.find(i => i.instance_id === editingInstanceId)
    : undefined;
  
  // Gestisce l'aggiunta di una nuova istanza
  const handleAddInstance = () => {
    startSubblockCreation(questionId, placeholderKey);
  };
  
  // Gestisce la modifica di un'istanza esistente
  const handleEditInstance = (instanceId: string) => {
    startSubblockEditing(questionId, placeholderKey, instanceId);
  };
  
  // Gestisce l'eliminazione di un'istanza
  const handleDeleteInstance = (instanceId: string) => {
    deleteSubblockInstance(questionId, placeholderKey, instanceId);
  };
  
  // Gestisce il salvataggio di un'istanza
  const handleSaveInstance = (responses: any) => {
    saveSubblockInstance(responses);
  };
  
  // Gestisce l'annullamento della creazione/modifica di un'istanza
  const handleCancelEditing = () => {
    cancelSubblockEditing();
  };
  
  // Renderizza l'interfaccia condizionatamente in base allo stato
  return (
    <div className="py-4">
      {/* Titolo opzionale del sottoblocco */}
      {placeholder.placeholder_label && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {placeholder.placeholder_label}
        </h3>
      )}
      
      {/* Lista delle istanze esistenti */}
      {instances.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 text-sm font-medium text-gray-500">
            {instances.length} {instances.length === 1 ? "voce" : "voci"} inserite
          </div>
          
          <div className="space-y-2">
            {instances.map(instance => (
              <SubblockInstanceCard
                key={instance.instance_id}
                instance={instance}
                questions={placeholder.questions}
                onEdit={() => handleEditInstance(instance.instance_id)}
                onDelete={() => handleDeleteInstance(instance.instance_id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Form per la creazione o modifica */}
      {(isCreating || isEditing) && (
        <SubblockInstanceForm
          questions={placeholder.questions}
          initialResponses={editingInstance?.responses || {}}
          onSave={handleSaveInstance}
          onCancel={handleCancelEditing}
        />
      )}
      
      {/* Controlli per aggiungere o continuare */}
      {!isCreating && !isEditing && (
        <div className="flex flex-wrap gap-4 mt-4">
          {placeholder.repeatable !== false && (
            <Button
              onClick={handleAddInstance}
              variant="outline"
              className="border-[#245C4F] text-[#245C4F] hover:bg-[#F0F8F6]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {placeholder.repeat_label || "Aggiungi un'altra voce"}
            </Button>
          )}
          
          {/* Il pulsante "Avanti" appare solo se ci sono istanze o se il sottoblocco non è obbligatorio */}
          {(instances.length > 0 || placeholder.repeatable === false) && (
            <Button
              onClick={onContinue}
              className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-6"
            >
              Avanti <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
