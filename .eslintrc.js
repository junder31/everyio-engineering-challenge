module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
        'plugin:prettier/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
        es6: true,
    },
    ignorePatterns: [
        '.eslintrc.js',
        'dist/',
        'node_modules/',
        'coverage/',
        'logs/',
        '**/*.test.ts',
    ],
    rules: {
        // TypeScript specific rules
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-var-requires': 'error',

        // General ESLint rules
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
        'template-curly-spacing': 'error',
        'prefer-arrow-callback': 'error',
        'arrow-spacing': 'error',
        'no-duplicate-imports': 'error',

        // Prettier integration
        'prettier/prettier': 'error',

        // Allow any types in specific cases
        '@typescript-eslint/no-explicit-any': [
            'warn',
            {
                ignoreRestArgs: true,
            },
        ],

        // Allow empty functions for interfaces
        '@typescript-eslint/no-empty-function': [
            'error',
            {
                allow: ['arrowFunctions', 'functions', 'methods'],
            },
        ],

        // Consistent type imports
        '@typescript-eslint/consistent-type-imports': [
            'error',
            {
                prefer: 'type-imports',
                disallowTypeAnnotations: false,
            },
        ],

        // Require return types on exported functions
        '@typescript-eslint/explicit-module-boundary-types': [
            'error',
            {
                allowArgumentsExplicitlyTypedAsAny: true,
                allowDirectConstAssertionInArrowFunctions: true,
                allowHigherOrderFunctions: true,
                allowTypedFunctionExpressions: true,
            },
        ],
    },
    overrides: [
        {
            files: ['**/*.test.ts', '**/*.spec.ts', '**/*_tests.ts'],
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended',
                'prettier',
                'plugin:prettier/recommended',
            ],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/consistent-type-imports': 'off',
            },
        },
        {
            files: ['src/migrations/**/*.js', 'src/seeders/**/*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
                '@typescript-eslint/explicit-module-boundary-types': 'off',
            },
        },
    ],
};
