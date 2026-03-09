import type { Config } from 'tailwindcss';

import colors from 'tailwindcss/colors';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: colors.blue,
                surface: colors.slate,
                'bg-0': 'var(--bg-0)',
                'bg-000': 'var(--bg-000)',
                'bg-100': 'var(--bg-100)',
                'bg-200': 'var(--bg-200)',
                'bg-300': 'var(--bg-300)',
                'text-100': 'var(--text-100)',
                'text-200': 'var(--text-200)',
                'text-300': 'var(--text-300)',
                'text-400': 'var(--text-400)',
                'text-500': 'var(--text-500)',
                accent: 'var(--accent)',
                'accent-hover': 'var(--accent-hover)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;
