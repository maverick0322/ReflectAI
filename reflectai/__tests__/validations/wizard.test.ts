import { describe, it, expect } from 'vitest';
import { wizardFormSchema } from '@/lib/validations/reflection';
import { PrimaryEmotion } from '@/types/reflection';

describe('Wizard Form Validations (HT-13)', () => {
  it('Debe pasar la validación con datos correctos (Flujo Estándar)', () => {
    const validData = {
      situacion: "Mi jefe me corrigió frente al equipo.",
      pensamiento: "Pienso que no valora mi esfuerzo.",
      emocion: PrimaryEmotion.ENOJO,
      intensidad: 6,
      proposito: "Proteger mi orgullo.",
      controlMio: "La calidad de mi trabajo.",
      controlOtros: "La forma de comunicar de mi jefe.",
      alternativa: "Buscaba la excelencia del proyecto, no atacarme."
    };

    const result = wizardFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('Debe fallar si el pensamiento tiene menos de 3 caracteres (Evitación Cognitiva)', () => {
    const dataWithAvoidance = {
      situacion: "Mi jefe me corrigió frente al equipo.",
      pensamiento: "no", 
      emocion: PrimaryEmotion.ENOJO,
      intensidad: 6,
      proposito: "Proteger mi orgullo.",
      controlMio: "La calidad de mi trabajo.",
      controlOtros: "La forma de comunicar de mi jefe.",
      alternativa: "Buscaba la excelencia del proyecto."
    };

    const result = wizardFormSchema.safeParse(dataWithAvoidance);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.includes("pensamiento"));
      expect(issue?.message).toContain("Identificar el pensamiento es el paso más difícil");
    }
  });

  it('Debe fallar si la intensidad es mayor a 10', () => {
    const invalidIntensityData = {
      situacion: "Situación válida",
      pensamiento: "Pensamiento válido",
      emocion: PrimaryEmotion.MIEDO,
      intensidad: 15, 
      proposito: "Propósito válido",
      controlMio: "Control mío válido",
      controlOtros: "Control otros válido",
      alternativa: "Alternativa válida"
    };

    const result = wizardFormSchema.safeParse(invalidIntensityData);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.includes("intensidad"));
      expect(issue?.message).toBe("La intensidad máxima es 10");
    }
  });

  it('Debe fallar si la emoción no pertenece al Enum de Plutchik', () => {
    const invalidEmotionData = {
      situacion: "Situación válida",
      pensamiento: "Pensamiento válida",
      emocion: "Aburrimiento", 
      intensidad: 5,
      proposito: "Propósito válido",
      controlMio: "Control mío válido",
      controlOtros: "Control otros válido",
      alternativa: "Alternativa válida"
    };

    const result = wizardFormSchema.safeParse(invalidEmotionData);
    expect(result.success).toBe(false);
  });
});