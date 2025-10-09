module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Ban mock/faker imports to prevent fake data
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["*faker*", "*@faker-js*", "*mock*", "*fixture*", "*chance*"],
            "message": "Mock/faker imports are banned. Use real sandbox data from Stripe/Plaid/QBO only."
          }
        ],
        "paths": [
          {
            "name": "faker",
            "message": "Faker is banned. Use real sandbox data from Stripe/Plaid/QBO only."
          },
          {
            "name": "@faker-js/faker",
            "message": "Faker is banned. Use real sandbox data from Stripe/Plaid/QBO only."
          }
        ]
      }
    ]
  },
  ignorePatterns: ["node_modules/", ".next/", "out/", "dist/", "__mocks__/"]
}
