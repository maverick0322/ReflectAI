'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import CameraIcon from '@/shared/icons/CameraIcon';

interface ProfileAvatarProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  onPhotoSelected: (file: File) => void | Promise<void>;
}

const avatarButtonClassName = [
  'flex h-24 w-24 items-center justify-center overflow-hidden rounded-full',
  'bg-gradient-to-tr from-orange-200 to-orange-300 text-3xl font-bold',
  'text-orange-600 shadow-inner transition-opacity hover:opacity-90',
  'focus:outline-none focus:ring-4 focus:ring-orange-300/50',
].join(' ');

const cameraButtonClassName = [
  'absolute bottom-0 right-0 rounded-full bg-orange-400 p-2 text-white',
  'shadow-lg transition-transform hover:scale-110',
].join(' ');

function getInitials(name: string, surname: string) {
  return (name.charAt(0) + (surname ? surname.charAt(0) : '')).toUpperCase();
}

function getAvatarUploadErrorMessage(error: unknown) {
  if (error instanceof Error && error.name === 'AbortError') {
    return 'Upload was interrupted. Please try again.';
  }

  return 'Unable to save the photo. Please try again.';
}

export default function ProfileAvatar({
  firstName,
  lastName,
  avatarUrl,
  onPhotoSelected,
}: Readonly<ProfileAvatarProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WEBP files are allowed.');
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('The image must be smaller than 2MB.');
      input.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      setError(null);
      await onPhotoSelected(file);
      setPreview(objectUrl);
    } catch (uploadError: unknown) {
      URL.revokeObjectURL(objectUrl);
      setError(getAvatarUploadErrorMessage(uploadError));
    } finally {
      input.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
        />

        <button
          type="button"
          aria-label="Change profile photo"
          onClick={() => fileInputRef.current?.click()}
          className={avatarButtonClassName}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Profile"
              fill
              unoptimized
              sizes="96px"
              className="object-cover"
            />
          ) : (
            getInitials(firstName, lastName)
          )}
        </button>

        <button
          type="button"
          aria-label="Open file picker"
          onClick={() => fileInputRef.current?.click()}
          className={cameraButtonClassName}
        >
          <CameraIcon className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <span className="text-[10px] font-medium text-red-500">{error}</span>
      )}
    </div>
  );
}
