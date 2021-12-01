import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { Helmet } from "react-helmet";

const SEO = ({ title, description, template }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          author
          description
          keywords
          siteUrl
        }
      }
    }
  `);

  const metaDescription = description || data.site.siteMetadata.description;

  return (
    <Helmet
      title={title ? title.toLowerCase() : ""}
      titleTemplate={template ? `%s | ${data.site.siteMetadata.title}` : ""}
      defaultTitle={data.site.siteMetadata.title}
      meta={[
        {
          name: "description",
          content: metaDescription,
        },
        {
          name: "keywords",
          content: data.site.siteMetadata.keywords.join(","),
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
      ]}
    />
  );
};

SEO.defaultProps = {
  template: true,
};

export default SEO;
