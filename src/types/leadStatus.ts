export type LeadStatus = 
  | 'not_contacted' 
  | 'non_risponde_x1' 
  | 'non_risponde_x2' 
  | 'non_risponde_x3' 
  | 'non_interessato' 
  | 'da_risentire' 
  | 'prenotata_consulenza' 
  | 'pratica_bocciata' 
  | 'converted'
  // Legacy values for backward compatibility
  | 'first_contact'
  | 'advanced_conversations' 
  | 'rejected';