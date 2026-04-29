import { createContext, useContext } from "react";

const ValidationContext = createContext<{ shouldShowErrors: boolean }>({ shouldShowErrors: false });

export const useValidationContext = () => useContext(ValidationContext);

export const ValidationContextProvider = ValidationContext.Provider;
