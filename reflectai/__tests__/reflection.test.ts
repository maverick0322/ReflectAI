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
      response: {
        id: "Q1_SIT",
        text: "Tuve una discusion con un companero.",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rechaza respuesta vacia", () => {
    const result = addReflectionResponseSchema.safeParse({
      response: {
        id: "Q1_SIT",
        text: "",
      },
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "La respuesta debe incluir texto, valor, estado, metodo o intervencion",
    );
  });

  it("rechaza intensidad menor que 1", () => {
    const result = addReflectionResponseSchema.safeParse({
      response: {
        id: "Q4_INT",
        value: 0,
      },
    });

    expect(result.success).toBe(false);
  });

  it("rechaza intensidad mayor que 10", () => {
    const result = addReflectionResponseSchema.safeParse({
      response: {
        id: "Q4_INT",
        value: 11,
      },
    });

    expect(result.success).toBe(false);
  });

  it("acepta metadata patch con flags", () => {
    const result = addReflectionResponseSchema.safeParse({
      response: {
        id: "SYS_GROUNDING",
        status: "acknowledged",
        method: "box_breathing",
      },
      metadataPatch: {
        flags: ["high_intensity_triggered"],
      },
    });

    expect(result.success).toBe(true);
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
