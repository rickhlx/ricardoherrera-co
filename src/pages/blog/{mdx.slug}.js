import * as React from "react";
import { graphql } from "gatsby";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { css } from "@emotion/react";
import tw from "twin.macro";
import Layout from "../../components/layout";

const BlogPost = ({ data }) => {
  return (
    <Layout>
      <h1 css={css(tw`text-center text-5xl py-8`)}>
        {data.mdx.frontmatter.title}
      </h1>
      <MDXRenderer>{data.mdx.body}</MDXRenderer>
    </Layout>
  );
};

export const query = graphql`
  query ($id: String) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        date(formatString: "MMMM D, YYYY")
      }
      body
    }
  }
`;

export default BlogPost;
