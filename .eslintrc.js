module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier', 'plugin:compat/recommended'],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  globals: {
    APP_TYPE: true,
    SERVER_URL: true,
  },
  rules: {
    'linebreak-style': 0,
    'no-void': 0,
    'no-unused-vars': 0,// annoying
    'no-unused-expressions': 0,// annoying as HELL
    'prefer-template': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.jsx'] }],
    'react/jsx-wrap-multilines': 0,
    'react/prop-types': 0,
    'react/forbid-prop-types': 0,
    'react/jsx-one-expression-per-line': 0,
    'import/prefer-default-export': 0,
    'import/no-unresolved': [2, { ignore: ['^@/', '^umi/'] }],
    'import/no-extraneous-dependencies': [2, { optionalDependencies: true }],
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'react/jsx-tag-spacing': 0,
    'spaced-comment': 0,
  },
  settings: {
    polyfills: ['fetch', 'promises', 'url'],
  },
};
