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
    },
  },
  plugins: [],
}
