// See https://tailwindcss.com/docs/customizing-colors#using-css-variables
function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`
    }
    return `rgb(var(${variable}) / ${opacityValue})`
  }
}

module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        "letter-correct": {
          100: withOpacityValue("--letter-correct-100"),
          200: withOpacityValue("--letter-correct-200"),
          300: withOpacityValue("--letter-correct-300"),
        },
        "letter-present": {
          100: withOpacityValue("--letter-present-100"),
          200: withOpacityValue("--letter-present-200"),
          300: withOpacityValue("--letter-present-300"),
        },
      },
      keyframes: {
        pop: {
          'from': { transform: 'scale(0.8)', opacity: 0 },
          '60%': { transform: 'scale(1.1)', opacity: 1 },
        },
        shake: {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-4px)' },
          '40%, 60%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        pop: 'pop 100ms',
        shake: 'shake 600ms',
      },
    },
  },
  plugins: [],
}
