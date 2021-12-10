import Typography from "typography";

export const fonts = {
  body: "Work Sans",
  header: "Work Sans",
};

const typography = new Typography({
  baseFontSize: "17px",
  baseLineHeight: 1.45,
  scaleRatio: 1.75,
  headerFontFamily: [fonts.header, "sans-serif"],
  bodyFontFamily: [fonts.body, "sans-serif"],
  headerWeight: "normal",
  googleFonts: [
    {
      name: "Work Sans",
      styles: ["400", "400i"],
    },
    {
      name: "DM Serif Display",
      styles: ["400", "400i"],
    },
  ],
});

if (process.env.NODE_ENV !== "production") {
  typography.injectStyles();
}

export default typography;
