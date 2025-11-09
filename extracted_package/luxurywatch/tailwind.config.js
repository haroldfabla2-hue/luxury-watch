/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'xs': '640px',
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
			},
		},
		extend: {
			colors: {
				// Material-inspired luxury colors
				gold: {
					50: '#FDF8E8',
					100: '#F4E4B5',
					500: '#B8860B',
					700: '#9A7209',
					900: '#6B5006',
				},
				titanium: {
					50: '#F0F3F5',
					100: '#E3E6E8',
					500: '#8B9AA6',
					700: '#6B7A86',
					900: '#3A4550',
				},
				ceramic: {
					50: '#F5F5F5',
					500: '#2C2F33',
					700: '#1F2125',
					900: '#1A1D20',
				},
				neutral: {
					50: '#FAFAF8',
					100: '#F5F4F0',
					200: '#E8E6E0',
					500: '#9B9A94',
					700: '#4A4A45',
					900: '#1C1C19',
				},
				// Semantic colors
				success: '#5A7A5F',
				warning: '#9A7209',
				error: '#8B4A4A',
				info: '#6B7A86',
			},
			fontFamily: {
				headline: ['Playfair Display', 'Georgia', 'serif'],
				body: ['Lato', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
			},
			fontSize: {
				'display': ['96px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'h1': ['72px', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
				'h2': ['56px', { lineHeight: '1.2', letterSpacing: '0' }],
				'h3': ['40px', { lineHeight: '1.3', letterSpacing: '0' }],
				'h4': ['32px', { lineHeight: '1.3', letterSpacing: '0.01em' }],
				'body-large': ['24px', { lineHeight: '1.7', letterSpacing: '0' }],
				'body': ['18px', { lineHeight: '1.6', letterSpacing: '0.01em' }],
				'body-small': ['16px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
				'caption': ['14px', { lineHeight: '1.4', letterSpacing: '0.03em' }],
				'label-caps': ['12px', { lineHeight: '1.3', letterSpacing: '0.12em' }],
			},
			spacing: {
				'xs': '8px',
				'sm': '16px',
				'md': '24px',
				'lg': '32px',
				'xl': '48px',
				'2xl': '64px',
				'3xl': '96px',
				'4xl': '128px',
				'5xl': '160px',
			},
			borderRadius: {
				'sm': '8px',
				'md': '12px',
				'lg': '16px',
				'full': '9999px',
			},
			boxShadow: {
				'card': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
				'card-hover': '0 12px 24px rgba(0, 0, 0, 0.12), 0 6px 12px rgba(0, 0, 0, 0.06)',
				'modal': '0 24px 48px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.08)',
				'gold': '0 8px 16px rgba(184, 134, 11, 0.2), 0 4px 8px rgba(184, 134, 11, 0.12)',
			},
			transitionDuration: {
				'fast': '300ms',
				'standard': '400ms',
				'luxury': '500ms',
				'slow': '600ms',
			},
			transitionTimingFunction: {
				'luxury': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'standard': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
			},
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'scroll-indicator': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.3' },
				},
			},
			animation: {
				'fade-in': 'fade-in 500ms ease-out',
				'scroll-indicator': 'scroll-indicator 2s ease-in-out infinite',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
