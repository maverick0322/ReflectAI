"use client";

import { useState, useRef, useEffect } from "react";
import CameraIcon from "@/components/icons/CameraIcon";

interface ProfileAvatarProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  onPhotoSelected: (file: File) => void;
}

export default function ProfileAvatar({ firstName, lastName, avatarUrl, onPhotoSelected }: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);


  const getInitials = (n: string, a: string) => {
    return (n.charAt(0) + (a ? a.charAt(0) : "")).toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación Local (Frontend)
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Solo se permiten formatos JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      setError("La imagen debe pesar menos de 2MB.");
      return;
    }

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onPhotoSelected(file); 
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
          aria-label="Cambiar foto de perfil"
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-200 to-orange-300 flex items-center justify-center text-3xl font-bold text-orange-600 shadow-inner cursor-pointer hover:opacity-90 transition-opacity overflow-hidden focus:outline-none focus:ring-4 focus:ring-orange-300/50"
        >
          {preview ? (
            <img src={preview} alt="Perfil" className="w-full h-full object-cover" />
          ) : (
            getInitials(firstName, lastName)
          )}
        </button>
        
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()} 
          className="absolute bottom-0 right-0 p-2 bg-orange-400 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <CameraIcon className="w-4 h-4" />
        </button>
      </div>
      {error && <span className="text-[10px] text-red-500 font-medium">{error}</span>}
    </div>
  );
}