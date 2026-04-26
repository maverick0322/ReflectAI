import { describe, expect, it } from "vitest";

import {
  addReflectionResponseSchema,
  completeReflectionSessionSchema,
  createReflectionSessionSchema,
} from "@/lib/validations/reflection";

describe("Validaciones de sesiones de reflexion", () => {
  it("permite crear una sesion sin titulo", () => {
    const result = createReflectionSessionSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("permite crear una sesion con titulo valido", () => {
    const result = createReflectionSessionSchema.safeParse({
      title: "Reflexion sobre trabajo",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza titulos demasiado largos", () => {
    const result = createReflectionSessionSchema.safeParse({
      title: "a".repeat(121),
    });
    expect(result.success).toBe(false);
  });
});

describe("Validaciones de respuestas de reflexion", () => {
  it("permite una respuesta valida", () => {
    const result = addReflectionResponseSchema.safeParse({
      question: "Que ocurrio?",
      userResponse: "Tuve una discusion con un companero.",
      detectedEmotion: "frustracion",
      intensity: 8,
    });

    expect(result.success).toBe(true);
  });

  it("rechaza respuesta vacia", () => {
    const result = addReflectionResponseSchema.safeParse({
      question: "Que ocurrio?",
      userResponse: "",
      intensity: 5,
    });

    expect(result.success).toBe(false);
  });

  it("rechaza intensidad menor que 1", () => {
    const result = addReflectionResponseSchema.safeParse({
      question: "Que ocurrio?",
      userResponse: "Me senti mal.",
      intensity: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rechaza intensidad mayor que 10", () => {
    const result = addReflectionResponseSchema.safeParse({
      question: "Que ocurrio?",
      userResponse: "Me senti mal.",
      intensity: 11,
    });

    expect(result.success).toBe(false);
  });
});

describe("Validaciones para completar sesion", () => {
  it("permite completar sesion sin titulo", () => {
    const result = completeReflectionSessionSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("permite completar sesion con titulo valido", () => {
    const result = completeReflectionSessionSchema.safeParse({
      title: "Reflexion completada",
    });

    expect(result.success).toBe(true);
  });
});
