import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ManualScreenshot from "@/components/manual/ManualScreenshot";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    onError,
    className,
  }: {
    src: string;
    alt: string;
    onError?: React.ReactEventHandler<HTMLImageElement>;
    className?: string;
  }) => <img src={src} alt={alt} onError={onError} className={className} data-testid="manual-image" />,
}));

vi.mock("@/components/icons/CameraIcon", () => ({
  default: ({ className }: { className?: string }) => <svg data-testid="camera-icon" className={className} />,
}));

describe("ManualScreenshot", () => {
  it("renderiza la imagen correctamente usando el alt recibido", () => {
    render(<ManualScreenshot src="/manual/paso1.png" alt="Captura del paso 1" />);

    expect(screen.getByAltText("Captura del paso 1")).toBeInTheDocument();
  });

  it("normaliza el src si no empieza con /", () => {
    render(<ManualScreenshot src="manual/paso1.png" alt="Captura normalizada" />);

    expect(screen.getByAltText("Captura normalizada")).toHaveAttribute("src", "/manual/paso1.png");
  });

  it("conserva el src si ya empieza con /", () => {
    render(<ManualScreenshot src="/manual/paso1.png" alt="Captura absoluta" />);

    expect(screen.getByAltText("Captura absoluta")).toHaveAttribute("src", "/manual/paso1.png");
  });

  it("muestra el texto por defecto del callout cuando no se manda calloutText", () => {
    render(<ManualScreenshot src="/manual/paso1.png" alt="Captura con callout default" />);

    expect(screen.getByText(/Haz clic aqu[ií]/i)).toBeInTheDocument();
  });

  it("muestra un calloutText personalizado", () => {
    render(
      <ManualScreenshot
        src="/manual/paso1.png"
        alt="Captura con callout personalizado"
        calloutText="Presiona guardar"
      />,
    );

    expect(screen.getByText("Presiona guardar")).toBeInTheDocument();
  });

  it("muestra el caption cuando se recibe", () => {
    render(
      <ManualScreenshot
        src="/manual/paso1.png"
        alt="Captura con caption"
        caption="Descripción inferior de apoyo"
      />,
    );

    expect(screen.getByText("Descripción inferior de apoyo")).toBeInTheDocument();
  });

  it("no muestra caption cuando no se recibe", () => {
    render(<ManualScreenshot src="/manual/paso1.png" alt="Captura sin caption" />);

    expect(screen.queryByText(/Descripción inferior de apoyo/i)).not.toBeInTheDocument();
  });

  it("muestra el fallback cuando la imagen falla", () => {
    render(<ManualScreenshot src="/manual/paso1.png" alt="Captura con error" />);

    fireEvent.error(screen.getByTestId("manual-image"));

    expect(screen.getByText(/Captura pendiente/i)).toBeInTheDocument();
    expect(screen.getByText(/Se agregar[aá] esta imagen cuando la interfaz est[eé] finalizada\./i)).toBeInTheDocument();
    expect(screen.getByTestId("camera-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("manual-image")).not.toBeInTheDocument();
  });
});