import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ManualStep from "@/components/manual/ManualStep";

const manualScreenshotMock = vi.fn(
  ({
    src,
    alt,
    calloutText,
    caption,
  }: {
    src: string;
    alt: string;
    calloutText?: string;
    caption?: string;
  }) => (
    <div data-testid="manual-screenshot">
      <span>{src}</span>
      <span>{alt}</span>
      {calloutText ? <span>{calloutText}</span> : null}
      {caption ? <span>{caption}</span> : null}
    </div>
  ),
);

vi.mock("@/components/manual/ManualScreenshot", () => ({
  default: (props: {
    src: string;
    alt: string;
    calloutText?: string;
    caption?: string;
  }) => manualScreenshotMock(props),
}));

describe("ManualStep", () => {
  it("renderiza el titulo y la descripcion del paso", () => {
    render(
      <ManualStep
        title="Crear tu cuenta"
        description={<p>Usa tu correo para comenzar.</p>}
        screenshot={{
          src: "/manual/paso1.png",
          alt: "Pantalla de registro",
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Crear tu cuenta" })).toBeInTheDocument();
    expect(screen.getByText("Usa tu correo para comenzar.")).toBeInTheDocument();
  });

  it("renderiza el componente ManualScreenshot y le pasa correctamente src, alt, calloutText y caption", () => {
    render(
      <ManualStep
        title="Guardar sesión"
        description="Confirma los cambios antes de salir."
        screenshot={{
          src: "/manual/paso2.png",
          alt: "Botón de guardado",
          calloutText: "Presiona guardar",
          caption: "Referencia visual del botón principal.",
        }}
      />,
    );

    expect(screen.getByTestId("manual-screenshot")).toBeInTheDocument();
    expect(manualScreenshotMock).toHaveBeenCalledWith(
      {
        src: "/manual/paso2.png",
        alt: "Botón de guardado",
        calloutText: "Presiona guardar",
        caption: "Referencia visual del botón principal.",
      },
    );
    expect(screen.getByText("/manual/paso2.png")).toBeInTheDocument();
    expect(screen.getByText("Botón de guardado")).toBeInTheDocument();
    expect(screen.getByText("Presiona guardar")).toBeInTheDocument();
    expect(screen.getByText("Referencia visual del botón principal.")).toBeInTheDocument();
  });

  it("funciona aunque calloutText y caption no se manden", () => {
    render(
      <ManualStep
        title="Paso sin extras"
        description="Este paso no requiere textos opcionales."
        screenshot={{
          src: "/manual/paso3.png",
          alt: "Captura simple",
        }}
      />,
    );

    expect(screen.getByTestId("manual-screenshot")).toBeInTheDocument();
    expect(manualScreenshotMock).toHaveBeenLastCalledWith(
      {
        src: "/manual/paso3.png",
        alt: "Captura simple",
        calloutText: undefined,
        caption: undefined,
      },
    );
  });
});