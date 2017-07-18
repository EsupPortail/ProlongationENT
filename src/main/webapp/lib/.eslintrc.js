module.exports = {
    "env": {
        "browser": true
    },
    "extends": "eslint:recommended",
    "parserOptions": { "ecmaVersion": 3 },
    "globals": {
        "pE": true, "args": true, "h": true, "loadBandeauJs": true,
    },
    "rules": {
        "no-empty": 0,
        "no-unused-vars": 0,
        "no-console": 0,
        "linebreak-style": [
            "error",
            "unix"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
