module.exports = {
  siteMetadata: {
    siteUrl: "https://ricardoherrera.co",
    title: "ricardo's piece of the internet",
    description: "The personal website of Ricardo Herrera",
    keywords: ["blog", "portfolio", "sre", "devops", "photography", "photo"],
    author: "Ricardo Herrera",
  },
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-mdx",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-use-dark-mode",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "ricardo's piece of the internet",
        short_name: "Blog of Ricardo Herrera",
        start_url: "/",
        theme_color: "#fcde9c",
        display: "standalone",
        icon: "src/images/avatar.jpg",
      },
    },
    "gatsby-plugin-emotion",
    {
      resolve: "gatsby-plugin-typography",
      options: {
        pathToConfigModule: "src/utils/typography",
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "blog",
        path: "./blog",
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "photo",
        path: "./photo",
      },
    },
  ],
};
