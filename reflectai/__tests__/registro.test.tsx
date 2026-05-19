import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RegisterPage from '@/app/registro/page';
import { ApiError } from '@/lib/api/http';

const { pushMock, registerUserMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  registerUserMock: vi.fn(async () => ({ message: 'ok' })),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('@/lib/api/auth', () => ({
  registerUser: registerUserMock,
}));

describe('Registro Page', () => {
  beforeEach(() => {
    pushMock.mockReset();
    registerUserMock.mockReset();
    registerUserMock.mockResolvedValue({ message: 'ok' });
  });

  it('muestra la estructura principal del formulario', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /inicia sesi.n aqu./i })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('valida los campos requeridos al enviar vacio', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
    });
  });

  it('muestra errores rojos mientras se capturan campos invalidos', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Ana1');

    const nameError = await screen.findByText(/el nombre solo puede contener letras/i);
    expect(nameError).toBeInTheDocument();
    expect(nameError).toHaveClass('text-red-500');
  });

  it('muestra error debajo del correo cuando el formato es invalido', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/^correo electr/i), 'correo-mal');

    const emailError = await screen.findByText(/ingresa un correo v.lido/i);
    expect(emailError).toBeInTheDocument();
    expect(emailError).toHaveClass('text-red-500');
  });

  it('muestra error debajo de la contrasena cuando falta caracter especial', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/^contrase/i), 'Password123');

    const passwordError = await screen.findByText(/car.cter especial/i);
    expect(passwordError).toBeInTheDocument();
    expect(passwordError).toHaveClass('text-red-500');
  });

  it('muestra error debajo de la fecha cuando es mayor a la actual', async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/fecha de nacimiento/i), {
      target: { value: '2999-01-01' },
    });

    const birthDateError = await screen.findByText(
      /la fecha de nacimiento no puede ser mayor a la fecha actual/i,
    );
    expect(birthDateError).toBeInTheDocument();
    expect(birthDateError).toHaveClass('text-red-500');
  });

  it('marca en rojo los campos invalidos al intentar registrar', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/apellido/i), 'eduardo');
    await user.type(screen.getByPlaceholderText(/^correo electr/i), 'miguelguevara850523@gmail.com');
    await user.type(
      screen.getByPlaceholderText(/confirmar correo electr/i),
      'miguelguevara850523@gmail.com',
    );
    await user.type(screen.getByPlaceholderText(/^contrase/i), '........');
    await user.type(screen.getByPlaceholderText(/confirmar contrase/i), '........');
    fireEvent.change(screen.getByPlaceholderText(/fecha de nacimiento/i), {
      target: { value: '2222-06-01' },
    });

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    const nameError = await screen.findByText(/el nombre es obligatorio/i);
    const passwordError = await screen.findAllByText(
      /debe contener al menos una may.scula, una min.scula y un n.mero/i,
    );
    const birthDateError = await screen.findByText(
      /la fecha de nacimiento no puede ser mayor a la fecha actual/i,
    );

    expect(nameError).toHaveClass('text-red-500');
    expect(passwordError[0]).toHaveClass('text-red-500');
    expect(birthDateError).toHaveClass('text-red-500');
    expect(registerUserMock).not.toHaveBeenCalled();
  });

  it('muestra correo ya registrado debajo del campo de correo', async () => {
    const user = userEvent.setup();
    registerUserMock.mockRejectedValue(
      new ApiError('No se pudo crear la cuenta', 400, {
        message: 'Ya existe una cuenta con ese correo.',
      }),
    );

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Ana');
    await user.type(screen.getByPlaceholderText(/^correo electr/i), 'ana@example.com');
    await user.type(
      screen.getByPlaceholderText(/confirmar correo electr/i),
      'ana@example.com',
    );
    await user.type(screen.getByPlaceholderText(/^contrase/i), 'ValidPassword123!');
    await user.type(
      screen.getByPlaceholderText(/confirmar contrase/i),
      'ValidPassword123!',
    );
    await user.type(screen.getByPlaceholderText(/fecha de nacimiento/i), '1998-05-10');

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    const emailErrors = await screen.findAllByText('Ya existe una cuenta con ese correo.');
    expect(emailErrors).toHaveLength(3);
    expect(emailErrors[0]).toHaveClass('text-red-500');
    expect(emailErrors[1]).toHaveClass('text-red-500');
    expect(screen.getByRole('alert')).toHaveClass('border-red-200');
  });

  it('redirige a login cuando el registro se completa', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Ana');
    await user.type(screen.getByPlaceholderText(/^correo electr/i), 'ana@example.com');
    await user.type(
      screen.getByPlaceholderText(/confirmar correo electr/i),
      'ana@example.com',
    );
    await user.type(screen.getByPlaceholderText(/^contrase/i), 'ValidPassword123!');
    await user.type(
      screen.getByPlaceholderText(/confirmar contrase/i),
      'ValidPassword123!',
    );
    await user.type(screen.getByPlaceholderText(/fecha de nacimiento/i), '1998-05-10');

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(registerUserMock).toHaveBeenCalledWith({
        firstName: 'Ana',
        lastName: '',
        email: 'ana@example.com',
        password: 'ValidPassword123!',
        birthDate: '1998-05-10',
      });
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('muestra un error general si el registro falla sin campo especifico', async () => {
    const user = userEvent.setup();
    registerUserMock.mockRejectedValue(
      new ApiError('No se pudo crear la cuenta', 400, {
        message: 'No se pudo crear la cuenta',
      }),
    );

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Ana');
    await user.type(screen.getByPlaceholderText(/^correo electr/i), 'ana@example.com');
    await user.type(
      screen.getByPlaceholderText(/confirmar correo electr/i),
      'ana@example.com',
    );
    await user.type(screen.getByPlaceholderText(/^contrase/i), 'ValidPassword123!');
    await user.type(
      screen.getByPlaceholderText(/confirmar contrase/i),
      'ValidPassword123!',
    );
    await user.type(screen.getByPlaceholderText(/fecha de nacimiento/i), '1998-05-10');

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudo crear la cuenta');
    });
  });
});
