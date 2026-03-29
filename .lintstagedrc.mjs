export default {
  "*.{ts,tsx}": ["oxlint -c .oxlintrc.json", "prettier --check"],
  "*.{json,md,css}": ["prettier --check"],
};
