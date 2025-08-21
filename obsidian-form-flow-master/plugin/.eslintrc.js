module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true
	},
	extends: [
		"eslint:recommended"
	],
	globals: {
		app: "readonly"
	},
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: "module"
	},
	rules: {
		indent: ["error", "tab", { ObjectExpression: "off" }],
		"no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
	}
};