'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { logoutUser } from '@/lib/api/auth';
import {
  fetchProfile,
  updateProfile,
  uploadProfileAvatar,
} from '@/lib/api/profile';
import {
  profileSchema,
  type ProfileFormValues,
} from '@/lib/validations/profile';

import {
  getProfileErrorMessage,
  mapProfileResponseToViewData,
  toggleProfilePreference,
  type ProfileViewData,
} from './profilePageUtils';

interface UseProfilePageResult {
  profile: ProfileViewData | null;
  isEditing: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  formError: string | null;
  editSessionKey: number;
  register: ReturnType<typeof useForm<ProfileFormValues>>['register'];
  handleSubmit: ReturnType<typeof useForm<ProfileFormValues>>['handleSubmit'];
  clearErrors: ReturnType<typeof useForm<ProfileFormValues>>['clearErrors'];
  errors: ReturnType<typeof useForm<ProfileFormValues>>['formState']['errors'];
  startEditing: () => void;
  handleCancel: () => void;
  handleProfileSubmit: (data: ProfileFormValues) => Promise<void>;
  handleAvatarSelected: (file: File) => Promise<void>;
  handleLogout: () => Promise<void>;
  toggleNotifications: () => void;
  toggleDarkMode: () => void;
}

function buildProfileFormValues(profile: ProfileViewData) {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    birthDate: profile.birthDate,
  };
}

export function useProfilePage(): UseProfilePageResult {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileViewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editSessionKey, setEditSessionKey] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setFormError(null);

      try {
        const response = await fetchProfile();
        if (!isMounted) {
          return;
        }

        const profileData = mapProfileResponseToViewData(response.data);
        setProfile(profileData);
        reset(buildProfileFormValues(profileData));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setFormError(getProfileErrorMessage(error, 'No se pudo cargar el perfil'));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [reset]);

  const startEditing = () => {
    if (!profile) {
      return;
    }

    reset(buildProfileFormValues(profile));
    clearErrors();
    setEditSessionKey((current) => current + 1);
    setIsEditing(true);
  };

  const handleProfileSubmit = async (data: ProfileFormValues) => {
    if (!profile) {
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      const response = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName ?? '',
        birthDate: data.birthDate,
      });

      const updatedProfile = {
        ...profile,
        ...mapProfileResponseToViewData(response.data),
        preferences: profile.preferences,
      };

      setProfile(updatedProfile);
      reset(buildProfileFormValues(updatedProfile));
      clearErrors();
      setEditSessionKey((current) => current + 1);
      setIsEditing(false);
    } catch (error) {
      setFormError(
        getProfileErrorMessage(error, 'No se pudo actualizar el perfil'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    reset(buildProfileFormValues(profile));
    clearErrors();
    setEditSessionKey((current) => current + 1);
    setIsEditing(false);
  };

  const handleAvatarSelected = async (file: File) => {
    setFormError(null);
    setIsUploadingAvatar(true);

    try {
      const response = await uploadProfileAvatar(file);
      setProfile((current) =>
        current
          ? {
              ...current,
              avatarUrl: response.data.avatar_url ?? null,
            }
          : current,
      );
    } catch (error) {
      setFormError(
        getProfileErrorMessage(error, 'No se pudo subir la foto de perfil'),
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout errors and redirect to login anyway.
    } finally {
      router.push('/login');
    }
  };

  const toggleNotifications = () => {
    setProfile((current) => toggleProfilePreference(current, 'notifications'));
  };

  const toggleDarkMode = () => {
    setProfile((current) => toggleProfilePreference(current, 'darkMode'));
  };

  return {
    profile,
    isEditing,
    isLoading,
    isSaving,
    isUploadingAvatar,
    formError,
    editSessionKey,
    register,
    handleSubmit,
    clearErrors,
    errors,
    startEditing,
    handleCancel,
    handleProfileSubmit,
    handleAvatarSelected,
    handleLogout,
    toggleNotifications,
    toggleDarkMode,
  };
}
