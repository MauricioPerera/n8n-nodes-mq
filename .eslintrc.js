module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['eslint-plugin-n8n-nodes-base'],
  extends: ['plugin:n8n-nodes-base/community'],
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
  rules: {
    'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
    'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
  },
};
