// eslint-rules/index.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const noRelativeImports = require("./no-relative-imports");

module.exports = {
  rules: {
    "no-relative-imports": noRelativeImports,
  },
};

