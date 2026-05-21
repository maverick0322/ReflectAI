import type {
  Control,
  UseFormClearErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { APP_ROUTES } from '@/core/routing/routes';
import type { ProfileFormValues } from '@/features/profile/schemas/profile';
import {
  formatDisplayBirthDate,
  formatFullName,
  type ProfileViewData,
} from '@/features/profile/utils/profilePageUtils';
import LockIcon from '@/shared/icons/LockIcon';
import PencilIcon from '@/shared/icons/PencilIcon';
import SaveIcon from '@/shared/icons/SaveIcon';
import CustomLink from '@/shared/ui/CustomLink';
import Input from '@/shared/ui/Input';
import { formatDisplayDateForInput } from '@/shared/utils/date';

import { DataRow, SectionTitle } from './ProfilePagePrimitives';

interface ProfilePersonalInfoSectionProps {
  profile: ProfileViewData;
  isEditing: boolean;
  isSaving: boolean;
  editSessionKey: number;
  formError: string | null;
  register: UseFormRegister<ProfileFormValues>;
  control: Control<ProfileFormValues>;
  handleSubmit: UseFormHandleSubmit<ProfileFormValues>;
  errors: Record<string, { message?: string } | undefined>;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  onStartEditing: () => void;
  onCancel: () => void;
  clearErrors: UseFormClearErrors<ProfileFormValues>;
}

const actionButtonClassName = [
  'flex items-center gap-1.5 text-xs font-bold text-orange-500',
  'transition-colors hover:text-orange-600',
].join(' ');

const verifiedBadgeClassName = [
  'rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold',
  'uppercase text-green-600',
].join(' ');

const changePasswordLinkClassName = [
  'flex w-fit items-center gap-2 px-1 pt-1 text-sm font-bold',
  'text-orange-500 transition-colors hover:text-orange-600',
].join(' ');

function getEditFieldsClassName(isEditing: boolean) {
  return isEditing
    ? 'animate-in flex flex-col gap-3 fade-in duration-300'
    : 'hidden';
}

function getReadOnlyFieldsClassName(isEditing: boolean) {
  return isEditing
    ? 'hidden'
    : 'animate-in flex flex-col gap-4 fade-in duration-300';
}

export function ProfilePersonalInfoSection({
  profile,
  isEditing,
  isSaving,
  editSessionKey,
  formError,
  register,
  control,
  handleSubmit,
  errors,
  onSubmit,
  onStartEditing,
  onCancel,
}: ProfilePersonalInfoSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <SectionTitle>Información personal</SectionTitle>
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
              className={actionButtonClassName}
            >
              <SaveIcon className="h-4 w-4" /> {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onStartEditing}
            className={actionButtonClassName}
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
          className={getEditFieldsClassName(isEditing)}
        >
          <Input
            {...register('firstName')}
            placeholder="Nombre"
            maxLength={120}
            error={errors.firstName?.message}
          />
          <Input
            {...register('lastName')}
            placeholder="Apellidos"
            maxLength={120}
            error={errors.lastName?.message}
          />
          <Controller
            control={control}
            name="birthDate"
            render={({ field }) => (
              <Input
                id="profile-birth-date"
                ref={field.ref}
                name={field.name}
                value={field.value ?? ''}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(formatDisplayDateForInput(event.target.value));
                }}
                placeholder="dd/mm/yyyy"
                inputMode="numeric"
                autoComplete="bday"
                maxLength={10}
                showCounter={false}
                className="text-slate-700"
                error={errors.birthDate?.message}
              />
            )}
          />
        </div>

        <div className={getReadOnlyFieldsClassName(isEditing)}>
          <DataRow
            label="Nombre completo"
            value={formatFullName(profile.firstName, profile.lastName)}
          />
          <hr className="border-slate-200/50" />
          <DataRow
            label="Fecha de nacimiento"
            value={formatDisplayBirthDate(profile.birthDate)}
          />
        </div>

        <hr className="border-slate-200/50" />

        <div className="flex flex-col px-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">
            Correo electrónico
          </span>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-medium text-slate-500">{profile.email}</span>
            <span className={verifiedBadgeClassName}>
              Verificado
            </span>
          </div>
        </div>

        <hr className="border-slate-200/50" />

        <CustomLink
          href={APP_ROUTES.changePassword}
          className={changePasswordLinkClassName}
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
