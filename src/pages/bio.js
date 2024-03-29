import { css } from "@emotion/react";
import * as React from "react";
import tw from "twin.macro";
import Layout from "../components/layout";
import Bio from "../components/bio.mdx";
import Avatar from "../components/avatar";

const IndexPage = () => (
  <Layout title="bio">
    <div css={css(tw`flex flex-col lg:flex-row items-center justify-between`)}>
      <Avatar />
      <div>
        <p
          css={css(
            tw`font-bold text-3xl w-3/4 tracking-tighter text-center lg:text-left m-auto lg:m-0 pb-7`
          )}
        >
          Hello world, Ricardo here! I love automation and building things that
          look nice.
        </p>
        <hr css={css(tw`w-12 h-1 bg-current hidden lg:block`)} />
        <Bio />
      </div>
    </div>
  </Layout>
);

export default IndexPage;
