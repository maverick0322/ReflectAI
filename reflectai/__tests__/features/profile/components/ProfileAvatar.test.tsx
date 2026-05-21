import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProfileAvatar from '@/features/profile/components/ProfileAvatar';

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
});

describe('ProfileAvatar', () => {
  it('shows the initials when there is no profile photo', () => {
    render(<ProfileAvatar firstName="Arturo" lastName="Cuevas" onPhotoSelected={vi.fn()} />);

    expect(screen.getByText('AC')).toBeInTheDocument();
  });

  it('shows an error when the file type is not JPG, PNG, or WEBP', async () => {
    render(<ProfileAvatar firstName="Arturo" lastName="Cuevas" onPhotoSelected={vi.fn()} />);

    const file = new File(['dummy'], 'document.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText('Solo se permiten archivos JPG, PNG y WEBP.')).toBeInTheDocument();
  });

  it('shows an error when the image is larger than 2MB', async () => {
    const user = userEvent.setup();
    render(<ProfileAvatar firstName="Arturo" lastName="Cuevas" onPhotoSelected={vi.fn()} />);

    const file = new File(['a'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    expect(await screen.findByText('La imagen debe pesar menos de 2 MB.')).toBeInTheDocument();
  });

  it('calls onPhotoSelected when a valid image is uploaded', async () => {
    const user = userEvent.setup();
    const onPhotoSelected = vi.fn();
    render(<ProfileAvatar firstName="Arturo" lastName="Cuevas" onPhotoSelected={onPhotoSelected} />);

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    expect(screen.queryByText(/only jpg/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/smaller than 2mb/i)).not.toBeInTheDocument();
    expect(onPhotoSelected).toHaveBeenCalledWith(file);
  });

  it('handles async upload rejections without leaving unhandled promises', async () => {
    const user = userEvent.setup();
    const onPhotoSelected = vi.fn().mockRejectedValue(new Error('upload failed'));
    render(<ProfileAvatar firstName="Arturo" lastName="Cuevas" onPhotoSelected={onPhotoSelected} />);

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    expect(onPhotoSelected).toHaveBeenCalledWith(file);
    expect(
      await screen.findByText('No se pudo guardar la foto. Intentalo de nuevo.'),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('AC')).toBeInTheDocument());
  });

  it('shows a specific message when the upload is interrupted', async () => {
    const user = userEvent.setup();
    const interruptedError = new Error('aborted');
    interruptedError.name = 'AbortError';
    const onPhotoSelected = vi.fn().mockRejectedValue(interruptedError);

    render(<ProfileAvatar firstName="Arturo" lastName="Cuevas" onPhotoSelected={onPhotoSelected} />);

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    expect(
      await screen.findByText('La carga se interrumpio. Intentalo de nuevo.'),
    ).toBeInTheDocument();
  });
});
