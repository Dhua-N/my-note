import type { Config } from 'tailwindcss'

export default <Config>{
  content: ['./app.vue'],
  darkMode: 'class', 
  plugins: [
    require('@tailwindcss/typography'),
  ],
}