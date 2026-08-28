/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        command: {
          bg: '#F8FAFC',        // Canvas Off-white
          surface: '#FFFFFF',   // Primary Surface Pure White
          secondary: '#F1F5F9', // Secondary Surface Subtle Gray
          border: '#E2E8F0',    // Subtle Border Gray
          hover: '#F8FAFC',
        },
        op: {
          blue: '#2563EB',      // Royal Blue Primary Brand
          teal: '#0F9D8A',      // Teal AI Perception
          amber: '#D99000',     // Amber Warning
          coral: '#E05260',     // Coral Critical
          green: '#159A68',     // Green Verified / Healthy
          indigo: '#6366F1',    // Indigo Prediction Accent
          textPrimary: '#172033',
          textSecondary: '#526174',
          textMuted: '#8290A3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(15, 23, 42, 0.06)',
        subtle: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
