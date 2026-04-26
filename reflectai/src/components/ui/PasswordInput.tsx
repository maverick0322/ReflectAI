"use client";

import { useState, forwardRef } from "react";
import Input from "./Input";
import { EyeIcon } from "@/components/icons/EyeIcon";
import { EyeOffIcon } from "@/components/icons/EyeOffIcon";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ placeholder, error, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const eyeButton = (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-reflect-dark/50 hover:text-reflect-dark/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-reflect-dark/40 focus-visible:ring-offset-2 focus-visible:rounded-sm"
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    );

    return (
      <Input 
        ref={ref}
        type={showPassword ? "text" : "password"} 
        placeholder={placeholder} 
        error={error}
        rightElement={eyeButton} 
        className={`[&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${className || ""}`}
        {...props} 
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;