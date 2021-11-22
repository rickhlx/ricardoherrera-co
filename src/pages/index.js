import { css, keyframes } from "@emotion/react";
import * as React from "react";
import tw from "twin.macro";
import Layout from "../components/layout";
import Bio from "./bio.mdx";

const rotate = keyframes`
  0%{
    transform:rotate(0deg);
  }
  100%{
    transform:rotate(360deg);
  }
`;

const IndexPage = () => (
  <Layout>
    <div css={css(tw`flex flex-col md:flex-row`)}>
      <div css={css(tw`flex order-first md:order-last m-auto md:m-0`)}>
        <svg
          css={css`
            animation: ${rotate} 45s linear infinite;
            height: 16rem;
          `}
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#98D2EB"
            d="M46.9,-62.4C61,-54.3,72.7,-40.9,79.8,-24.6C86.9,-8.4,89.2,10.7,82.5,25.5C75.9,40.3,60.2,50.8,44.9,58.4C29.7,66,14.8,70.8,-2.2,73.8C-19.2,76.8,-38.4,78.1,-52.2,70C-66,61.8,-74.3,44.3,-79,26.5C-83.7,8.6,-84.8,-9.7,-79.3,-25.4C-73.7,-41.1,-61.4,-54.4,-47.1,-62.4C-32.7,-70.4,-16.4,-73.2,0,-73.2C16.4,-73.2,32.8,-70.5,46.9,-62.4Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
      <div>
        <p
          css={css(
            tw`font-bold text-3xl w-3/4 tracking-tighter text-center md:text-left m-auto md:m-0 pb-7`
          )}
        >
          Hello world, Ricardo here! I love automation and building things that
          look nice.
        </p>
        <Bio />
      </div>
    </div>
  </Layout>
);

export default IndexPage;
