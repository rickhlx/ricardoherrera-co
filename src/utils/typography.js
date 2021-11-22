import Typography from "typography";

export const fonts = {
  body: "Work Sans",
  header: "DM Serif Display",
};

const typography = new Typography({
  baseFontSize: "17px",
  baseLineHeight: 1.45,
  scaleRatio: 2,
  headerFontFamily: [fonts.header, "sans-serif"],
  bodyFontFamily: [fonts.body, "sans-serif"],
  headerWeight: "normal",
  googleFonts: [
    {
      name: fonts.header,
      styles: ["400", "400i"],
    },
    {
      name: fonts.body,
      styles: ["400", "400i"],
    },
  ],
});

if (process.env.NODE_ENV !== "production") {
  typography.injectStyles();
}

export default typography;
