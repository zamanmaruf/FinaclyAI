module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Ban mock/faker imports to prevent fake data
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["*faker*", "*mock*", "*fixture*"],
            "message": "Mock/faker imports are banned. Use real data from APIs only."
          }
        ]
      }
    ]
  },
  ignorePatterns: ["node_modules/", ".next/", "out/", "dist/"]
}
