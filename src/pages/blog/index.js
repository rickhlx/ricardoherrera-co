import * as React from "react";
import { Link, graphql } from "gatsby";
import { css } from "@emotion/react";
import tw from "twin.macro";
import Layout from "../../components/layout";

const BlogPage = ({ data }) => {
  return (
    <Layout title="blog">
      {data.allMdx.nodes.map((node) => (
        <article key={node.id} css={css(tw`py-10`)}>
          <h1>
            <Link
              css={css(tw`text-current hover:opacity-70`)}
              to={`/blog/${node.slug}`}
            >
              {node.frontmatter.title}
            </Link>
          </h1>
          <p>{node.excerpt}</p>
          <Link to={`/blog/${node.slug}`}>Read Article</Link>
        </article>
      ))}
    </Layout>
  );
};

export const query = graphql`
  query {
    allMdx(sort: { fields: frontmatter___date, order: DESC }) {
      nodes {
        frontmatter {
          title
        }
        id
        slug
        excerpt
      }
    }
  }
`;

export default BlogPage;
