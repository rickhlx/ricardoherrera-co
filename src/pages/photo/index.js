import * as React from "react";
import { graphql } from "gatsby";
import { GatsbyImage, getImage, getSrc } from "gatsby-plugin-image";
import Masonry from "react-masonry-component";
import { css } from "@emotion/react";
import SimpleReactLightbox, { SRLWrapper } from "simple-react-lightbox";
import Layout from "../../components/layout";

const masonryOptions = {
  transitionDuration: 0,
  itemSelector: ".grid-item",
  gutter: ".gutter-sizer",
  percentPosition: true,
};

const lightboxOptions = {
  settings: {
    autoplaySpeed: 0,
    overlayColor: "rgba(255, 255, 255, 0.9)",
    disablePanzoom: true,
  },
  buttons: {
    showDownloadButton: false,
    showFullscreenButton: false,
  },
  caption: {
    showCaption: false,
  },
  thumbnails: {
    showThumbnails: false,
  },
};

const PhotoPage = ({ data }) => {
  return (
    <Layout title="photo" maxWidth={1280}>
      <SimpleReactLightbox>
        <SRLWrapper options={lightboxOptions}>
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
            {data.small.nodes.map((node, index) => (
              <a href={getSrc(data.full.nodes[index])}>
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
              </a>
            ))}
          </Masonry>
        </SRLWrapper>
      </SimpleReactLightbox>
    </Layout>
  );
};

export const query = graphql`
  query {
    small: allFile(filter: { sourceInstanceName: { eq: "photo" } }) {
      nodes {
        childImageSharp {
          gatsbyImageData(
            width: 400
            quality: 100
            outputPixelDensities: 2
            placeholder: NONE
          )
        }
      }
    }
    full: allFile(filter: { sourceInstanceName: { eq: "photo" } }) {
      nodes {
        childImageSharp {
          gatsbyImageData(
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
