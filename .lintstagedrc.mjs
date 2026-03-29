export default {
  "*.{ts,tsx}": ["oxlint -c .oxlintrc.json", "oxfmt --check"],
  "*.{json,css}": ["oxfmt --check"],
};
