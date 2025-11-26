// eslint-rules/no-relative-imports.js
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce using @/ path aliases instead of relative imports",
    },
    messages: {
      useAlias: "Use '@/...' instead of relative import '{{path}}'",
    },
  },
  create(context) {
    function checkImport(node) {
      const importPath = node.source?.value || node.arguments?.[0]?.value;
      
      // Only flag ../ imports, allow ./ imports
      if (importPath && importPath.startsWith('../')) {
        context.report({
          node: node.source || node.arguments[0],
          messageId: "useAlias",
          data: { path: importPath },
        });
      }
    }

    return {
      ImportDeclaration: checkImport,
      CallExpression(node) {
        if (node.callee.type === 'Import' || node.callee.name === 'require') {
          checkImport(node);
        }
      },
    };
  },
};

