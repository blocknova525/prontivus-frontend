/**
 * Prontivus Branding Configuration
 * Centralized branding settings for the frontend
 */

export const BRANDING = {
  // Brand Identity
  name: "Prontivus",
  slogan: "Cuidado inteligente",
  description: "Sistema Médico Completo de Gestão de Clínicas e Consultórios",
  
  // Visual Identity
  colors: {
    primary: "#2563eb",      // Blue
    secondary: "#059669",    // Green  
    accent: "#dc2626",       // Red
    background: "#f8fafc",   // Light gray
    surface: "#ffffff",      // White
    text: "#1e293b",         // Dark gray
    textSecondary: "#64748b", // Medium gray
  },
  
  // Typography
  fonts: {
    primary: "Inter, system-ui, sans-serif",
    secondary: "Poppins, system-ui, sans-serif",
  },
  
  // Assets
  assets: {
    logo: "/Logo/Prontivus Horizontal.png",
    logoTransparent: "/Logo/Logotipo em Fundo Transparente.png",
    logoMonochrome: "/Logo/Logotipo monocromia.png",
    logoGradient: "/Logo/Logo Degradê Azul.png",
    sublogo: "/Logo/Sublogo PNG Transparente.png",
    sublogoGradient: "/Logo/Sublogo Degradê.png",
    favicon: "/favicon.ico",
  },
  
  // Contact Information
  contact: {
    owner: "Dr. Nivaldo Francisco Alves Filho",
    email: "contato@prontivus.com",
    phone: "+55 (11) 99999-9999",
    website: "https://prontivus.com.br",
  },
  
  // Default Login Credentials (for development)
  defaultUsers: {
    admin: {
      email: "admin@prontivus.com",
      password: "admin123",
      role: "admin"
    },
    doctor: {
      email: "doctor@prontivus.com", 
      password: "doctor123",
      role: "doctor"
    },
    secretary: {
      email: "secretary@prontivus.com",
      password: "secretary123", 
      role: "secretary"
    },
    patient: {
      email: "patient@prontivus.com",
      password: "patient123",
      role: "patient"
    }
  }
} as const;

// CSS Custom Properties for dynamic theming
export const CSS_VARIABLES = {
  "--color-primary": BRANDING.colors.primary,
  "--color-secondary": BRANDING.colors.secondary,
  "--color-accent": BRANDING.colors.accent,
  "--color-background": BRANDING.colors.background,
  "--color-surface": BRANDING.colors.surface,
  "--color-text": BRANDING.colors.text,
  "--color-text-secondary": BRANDING.colors.textSecondary,
  "--font-primary": BRANDING.fonts.primary,
  "--font-secondary": BRANDING.fonts.secondary,
} as const;

export default BRANDING;
