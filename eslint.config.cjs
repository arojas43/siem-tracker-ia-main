// eslint-disable-next-line no-undef
const eslintPluginImport = require('eslint-plugin-import');
const eslintPluginReact = require('eslint-plugin-react');
const eslintPluginReactHooks = require('eslint-plugin-react-hooks');
const eslintPluginSonarjs = require('eslint-plugin-sonarjs');
const eslintPluginTS = require('@typescript-eslint/eslint-plugin');
const eslintParserTS = require('@typescript-eslint/parser');
const eslintPluginReactRefresh = require('eslint-plugin-react-refresh');

module.exports = [
    {
        ignores: ['**/*.css', '**/*.scss', '**/*.cjs', 'dist/**', 'node_modules/**'], // Correct way to ignore files in Flat Config
    },
    {
        files: ['src/**/*.{ts,tsx}'], // Specify which files to lint
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: eslintParserTS,
            globals: {
                window: 'readonly',
                document: 'readonly',
                process: 'readonly',
            },
        },
        plugins: {
            import: eslintPluginImport,
            react: eslintPluginReact,
            'react-hooks': eslintPluginReactHooks,
            sonarjs: eslintPluginSonarjs,
            '@typescript-eslint': eslintPluginTS,
            'react-refresh': eslintPluginReactRefresh,
        },
        rules: {
            // ESLint Core Rules
            yoda: 2,
            eqeqeq: 2,
            'no-alert': 2,
            'no-undef-init': 2,
            'no-param-reassign': 2,
            'no-else-return': 'error',
            complexity: ['error', { max: 10 }],

            // TypeScript Rules
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

            // Import Plugin Rules
            'import/first': 2,
            'import/export': 2,
            'import/no-duplicates': 2,
            'import/no-unresolved': 0,
            'import/no-absolute-path': 2,
            'import/no-useless-path-segments': 2,
            'import/no-extraneous-dependencies': 2,
            'import/no-cycle': [2, { ignoreExternal: true }],
            'import/newline-after-import': ['error', { count: 1 }],

            // Disabled for performance reasons (handled by TypeScript)
            'import/named': 0,
            'import/default': 0,
            'import/namespace': 0,
            'import/no-named-as-default-member': 0,

            // SonarJS Rules
            'sonarjs/no-redundant-jump': 0,
            'sonarjs/elseif-without-else': 0,
            'sonarjs/max-switch-cases': ['error', 5],

            // React Rules
            'react/prop-types': 0,
            'react/jsx-uses-react': 0,
            'react/react-in-jsx-scope': 0,
            'react/self-closing-comp': ['error', { component: true, html: true }],

            // React Refresh Plugin
            'react-refresh/only-export-components': 'warn',

            // React Hooks
            'react-hooks/exhaustive-deps': 'error',

            // Other Rules
            'jsx-quotes': 'off',
            'no-console': 'warn',
        },
    },
    // Overrides (e.g., for package-lock.json)
    {
        files: ['package-lock.json'],
        rules: {
            'sonarjs/no-duplicate-string': 0,
        },
    },
];
