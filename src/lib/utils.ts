import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts a user-friendly error message from API error responses
 * Handles different error response formats from FastAPI/Pydantic validation errors
 */
export function extractErrorMessage(error: any, defaultMessage: string = "An error occurred"): string {
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail;
    
    // If detail is an array of validation errors, extract messages
    if (Array.isArray(detail)) {
      const errorMessages = detail.map((errorItem: any) => {
        if (typeof errorItem === 'object' && errorItem.msg) {
          return errorItem.msg;
        }
        return String(errorItem);
      });
      return errorMessages.join(', ');
    } else if (typeof detail === 'string') {
      return detail;
    } else {
      return String(detail);
    }
  } else if (error?.message) {
    return error.message;
  }
  
  return defaultMessage;
}
