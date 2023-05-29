module.exports = {
  siteMetadata: {
    siteUrl: "https://ricardoherrera.co",
    title: "ricardo herrera",
    description: "The portfolio website of Ricardo Herrera",
    keywords: ["blog", "portfolio", "sre", "devops", "photography", "photo"],
    author: "Ricardo Herrera",
  },
  plugins: [
    "gatsby-plugin-image",
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 800,
            },
          },
        ],
      },
    },
    "gatsby-plugin-mdx-embed",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "ricardo herrera",
        short_name: "Portfolio of Ricardo Herrera",
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
