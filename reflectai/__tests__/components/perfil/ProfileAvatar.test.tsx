import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeAll } from "vitest";
import ProfileAvatar from "@/components/perfil/ProfileAvatar";

// JSDOM no tiene URL.createObjectURL, así que lo mockeamos
beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock-url");
});

describe("ProfileAvatar", () => {
  it("muestra las iniciales si no hay foto de perfil", () => {
    render(<ProfileAvatar firstName="Arturo" lastName="Cuevas" onPhotoSelected={vi.fn()} />);
    // Verifica que "AC" esté en el documento
    expect(screen.getByText("AC")).toBeInTheDocument();
  });

  it("muestra un error si el archivo no es JPG, PNG o WEBP", async () => {
    render(<ProfileAvatar firstName="Arturo" lastName="Cuevas" onPhotoSelected={vi.fn()} />);
    
    // Simulamos un archivo PDF
    const file = new File(["dummy content"], "documento.pdf", { type: "application/pdf" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Usamos fireEvent en lugar de userEvent.upload para saltarnos el atributo 'accept' de HTML
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(await screen.findByText("Solo se permiten formatos JPG, PNG o WEBP.")).toBeInTheDocument();
  });

  it("muestra un error si la imagen pesa más de 2MB", async () => {
    const user = userEvent.setup();
    render(<ProfileAvatar firstName="Arturo" lastName="Cuevas" onPhotoSelected={vi.fn()} />);
    
    const file = new File(["a"], "foto.png", { type: "image/png" });
    // Truco para simular el tamaño del archivo (3MB)
    Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 }); 
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    
    expect(await screen.findByText("La imagen debe pesar menos de 2MB.")).toBeInTheDocument();
  });

  it("llama a onPhotoSelected cuando se sube una imagen válida", async () => {
    const user = userEvent.setup();
    const handlePhotoSelected = vi.fn();
    render(<ProfileAvatar firstName="Arturo" lastName="Cuevas" onPhotoSelected={handlePhotoSelected} />);
    
    const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);
    
    // Verifica que el error no exista y la función se haya llamado
    expect(screen.queryByText(/Solo se permiten/)).not.toBeInTheDocument();
    expect(screen.queryByText(/pesar menos/)).not.toBeInTheDocument();
    expect(handlePhotoSelected).toHaveBeenCalledWith(file);
  });
});