import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/valid-v-slot': ['error', { allowModifiers: true }], // allow vuetify slot modifier
    'vue/html-self-closing': ['error', { html: { void: 'any' } }], // not conflict with prettier
    '@typescript-eslint/no-explicit-any': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "CallExpression[callee.name='$fetch'] Literal[value=/^\\/api\\/.*private/]",
        message:
          'Use privateApi.request(...) instead of direct $fetch calls to private API modules.',
      },
      {
        selector:
          "CallExpression[callee.name='$fetch'] > TemplateLiteral:first-child > TemplateElement[value.raw=/\\/api\\/.*private/]",
        message:
          'Use privateApi.request(...) instead of direct $fetch calls to private API modules.',
      },
    ],
  },
})
