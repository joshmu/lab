export default {
  "*.{ts,tsx,js,mjs}": ["oxfmt --write", "oxlint --fix -c .oxlintrc.json"],
  "*.{json,css}": ["oxfmt --write"],
  "*.md": ["markdownlint-cli2"],
};
