const config = {
  printWidth: 120,
  plugins: ["prettier-plugin-organize-imports"],
  overrides: [
    {
      files: "*.ts",
      options: {
        singleQuote: true,
      },
    },
  ],
};

module.exports = config;
