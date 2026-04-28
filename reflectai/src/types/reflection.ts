export type ReflectionSessionStatus = "draft" | "completed";

export type ReflectionEntry = {
  step_order: number;
  question: string;
  user_response: string;
  detected_emotion: string | null;
  intensity: number | null;
  created_at: string;
};

export type ReflectionSession = {
  id: string;
  user_id: string;
  title: string | null;
  status: ReflectionSessionStatus;
  started_at: string;
  completed_at: string | null;
  payload: ReflectionEntry[];
  ai_analysis: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};


// 2. TIPOS DEL FRONTEND (WIZARD HT-13 Y MANEJO DE ESTADO LOCAL) 


// Las 8 emociones primarias de Plutchik (Requisito Clínico)
export enum PrimaryEmotion {
  ALEGRIA = "Alegría",
  CONFIANZA = "Confianza",
  MIEDO = "Miedo",
  SORPRESA = "Sorpresa",
  TRISTEZA = "Tristeza",
  AVERSION = "Aversión",
  ENOJO = "Enojo",
  ANTICIPACION = "Anticipación",
}

// IDs Estrictos de las Preguntas del Flujo (Para mapear al JSONB)
export type QuestionId = 
  | 'Q1_SIT'         // Situación
  | 'Q2_THO'         // Pensamiento
  | 'Q3_EMO'         // Emoción
  | 'Q4_INT'         // Intensidad (1-10)
  | 'Q5_TEL'         // Propósito
  | 'Q6_CON_MINE'    // Control Interno (Mi Tarea)
  | 'Q6_CON_OTHERS'  // Control Externo (Tarea de Otros)
  | 'Q7_ALT'         // Reestructuración (Alternativa)
  | 'SYS_GROUNDING'  // Metadato de intervención del sistema
  | 'SYS_AI_ADJUSTMENT';

// Estructura interna de respuesta requerida por el flujo (HT-13 JSONB)
export interface SessionResponse {
  id: QuestionId;
  text?: string;
  value?: number;
  category?: string;
  status?: string;
  method?: string;
  intervention?: string;
}

// Metadatos de la sesión
export interface SessionMetadata {
  version: string;
  started_at: string; 
  completed_at?: string; 
  interruption_detected?: boolean;
  flags?: string[]; 
  grounding_duration_seconds?: number;
  ai_hints?: string[];
}

// Lo que formaremos al final antes de acoplarlo al "payload" del Backend
export interface ReflectionSessionPayload {
  metadata: SessionMetadata;
  responses: SessionResponse[];
}

// Estado Local Interno del Formulario (Para React-Hook-Form)
export interface WizardFormValues {
  situacion: string;           
  pensamiento: string;         
  emocion: PrimaryEmotion | ""; 
  intensidad: number;          
  proposito: string;           
  controlMio: string;          
  controlOtros: string;        
  alternativa: string;         
}