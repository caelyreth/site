import { defineConfig } from 'oxfmt'

export default defineConfig({
  printWidth: 76,
  semi: false,
  singleQuote: true,
  sortImports: true,
  quoteProps: 'consistent',
  sortPackageJson: true,
  svelte: true,
  jsdoc: {
    commentLineStrategy: 'multiline',
    preferCodeFences: true,
    separateReturnsFromParam: true,
  },
})
