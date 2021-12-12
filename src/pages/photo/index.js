import * as React from "react";
import { graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Masonry from "react-masonry-component";
import { css } from "@emotion/react";
import Layout from "../../components/layout";

const masonryOptions = {
  transitionDuration: 0,
  itemSelector: ".grid-item",
  gutter: ".gutter-sizer",
  percentPosition: true,
};

const PhotoPage = ({ data }) => {
  return (
    <Layout title="photo" maxWidth={1280}>
      <Masonry
        css={css`
          @media screen and (min-width: 1500px) {
            width: 1280px;
            margin: auto;
          }
        `}
        options={masonryOptions}
      >
        <div
          className="gutter-sizer"
          css={css`
            width: 2%;
          `}
        />
        {data.allFile.nodes.map((node) => (
          <GatsbyImage
            css={css`
              @media screen and (min-width: 250px) {
                width: 100%;
              }
              @media screen and (min-width: 768px) {
                width: 49%;
              }
              @media screen and (min-width: 1024px) {
                width: 32%;
              }
              @media screen and (min-width: 1280px) {
                width: 23.5%;
              }
              margin-bottom: 2%;
            `}
            className="grid-item"
            image={getImage(node)}
          />
        ))}
      </Masonry>
    </Layout>
  );
};

export const query = graphql`
  query {
    allFile(filter: { sourceInstanceName: { eq: "photo" } }) {
      nodes {
        childImageSharp {
          gatsbyImageData(
            width: 1024
            quality: 100
            outputPixelDensities: 2
            placeholder: NONE
          )
        }
      }
    }
  }
`;

export default PhotoPage;
