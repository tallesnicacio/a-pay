/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Laranja Vibrante (Comida/Apetitoso)
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // Cor principal
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Verde Sucesso
        success: {
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
        },
        // Vermelho Alerta
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          800: '#991B1B',
        },
        // Amarelo Atenção
        warning: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        // Cinzas mais quentes
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'primary': '0 10px 25px -5px rgb(249 115 22 / 0.3)',
        'success': '0 10px 25px -5px rgb(34 197 94 / 0.3)',
      },
      borderRadius: {
        'sm': '0.375rem',   // 6px
        'md': '0.5rem',     // 8px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
        '2xl': '1.5rem',    // 24px
        'full': '9999px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
        'gradient-card': 'linear-gradient(180deg, #FFFFFF 0%, #FAFAF9 100%)',
        'gradient-bg': 'linear-gradient(180deg, #FAFAF9 0%, #F5F5F4 100%)',
      },
    },
  },
  plugins: [],
}
