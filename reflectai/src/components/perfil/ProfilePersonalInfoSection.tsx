import type { UseFormClearErrors, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';

import LockIcon from '@/components/icons/LockIcon';
import PencilIcon from '@/components/icons/PencilIcon';
import SaveIcon from '@/components/icons/SaveIcon';
import { DataRow, SectionTitle } from '@/components/perfil/ProfilePagePrimitives';
import CustomLink from '@/components/ui/CustomLink';
import Input from '@/components/ui/Input';
import type { ProfileFormValues } from '@/lib/validations/profile';

import {
  formatDisplayBirthDate,
  formatFullName,
  type ProfileViewData,
} from './profilePageUtils';

interface ProfilePersonalInfoSectionProps {
  profile: ProfileViewData;
  isEditing: boolean;
  isSaving: boolean;
  editSessionKey: number;
  formError: string | null;
  register: UseFormRegister<ProfileFormValues>;
  handleSubmit: UseFormHandleSubmit<ProfileFormValues>;
  errors: Record<string, { message?: string } | undefined>;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  onStartEditing: () => void;
  onCancel: () => void;
  clearErrors: UseFormClearErrors<ProfileFormValues>;
}

export function ProfilePersonalInfoSection({
  profile,
  isEditing,
  isSaving,
  editSessionKey,
  formError,
  register,
  handleSubmit,
  errors,
  onSubmit,
  onStartEditing,
  onCancel,
}: ProfilePersonalInfoSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <SectionTitle>Información Personal</SectionTitle>
        {isEditing ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-slate-400 transition-colors hover:text-slate-600"
            >
              Cancelar
            </button>
            <button
              form="profile-form"
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 text-xs font-bold text-orange-500 transition-colors hover:text-orange-600"
            >
              <SaveIcon className="h-4 w-4" />{' '}
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onStartEditing}
            className="flex items-center gap-1.5 text-xs font-bold text-orange-500 transition-colors hover:text-orange-600"
          >
            <PencilIcon className="h-4 w-4" /> Editar
          </button>
        )}
      </div>

      <form
        id="profile-form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-2xl border border-white/50 bg-white/30 p-4"
      >
        <div
          key={editSessionKey}
          className={
            isEditing ? 'flex flex-col gap-3 animate-in fade-in duration-300' : 'hidden'
          }
        >
          <Input
            {...register('firstName')}
            placeholder="Nombre(s)"
            maxLength={120}
            error={errors.firstName?.message}
          />
          <Input
            {...register('lastName')}
            placeholder="Apellido(s)"
            maxLength={120}
            error={errors.lastName?.message}
          />
          <Input
            {...register('birthDate')}
            type="date"
            className="text-slate-700"
            error={errors.birthDate?.message}
          />
        </div>

        <div
          className={
            isEditing ? 'hidden' : 'flex flex-col gap-4 animate-in fade-in duration-300'
          }
        >
          <DataRow
            label="Nombre Completo"
            value={formatFullName(profile.firstName, profile.lastName)}
          />
          <hr className="border-slate-200/50" />
          <DataRow
            label="Fecha de Nacimiento"
            value={formatDisplayBirthDate(profile.birthDate)}
          />
        </div>

        <hr className="border-slate-200/50" />

        <div className="flex flex-col px-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">
            Correo Electrónico
          </span>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-medium text-slate-500">{profile.email}</span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-600">
              Verificado
            </span>
          </div>
        </div>

        <hr className="border-slate-200/50" />

        <CustomLink
          href="/cambiar-contrasena"
          className="w-fit px-1 pt-1 text-sm font-bold text-orange-500 transition-colors hover:text-orange-600 flex items-center gap-2"
        >
          <LockIcon className="h-4 w-4" /> Cambiar contraseña
        </CustomLink>

        {formError && (
          <p role="alert" className="text-sm font-semibold text-red-500">
            {formError}
          </p>
        )}
      </form>
    </section>
  );
}
