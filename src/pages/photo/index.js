import * as React from "react";
import { graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Masonry from "react-masonry-css";
import Layout from "../../components/layout";

const breakpointColumnsObj = {
  default: 4,
  1024: 3,
  768: 2,
  500: 1,
};

const PhotoPage = ({ data }) => {
  return (
    <Layout title="photo" maxWidth={1280}>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {data.allFile.nodes.map((node) => (
          <GatsbyImage image={getImage(node)} />
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
