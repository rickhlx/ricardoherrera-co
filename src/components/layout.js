import * as React from "react";
import { Global, css } from "@emotion/react";
import tw from "twin.macro";

import reset from "../utils/reset";
import SEO from "./seo";
import Header from "./header";
import { Instagram, Twitter, GitHub } from "./social";

const GlobalStyle = () => (
  <Global
    styles={css`
      a {
        color: #258ebb;
      }
      body.light-mode {
        transition: background-color 0.3s ease;
        #dark-mode-toggle {
          background-color: #ebeef3;
        }
        #avatar-blob {
          color: #98d2eb;
        }
      }
      body.dark-mode {
        background-color: #1a202c;
        color: #f7fafc;
        #dark-mode-toggle {
          background-color: #262f41;
        }
        #avatar-blob {
          color: #22446d;
        }
      }
      ${reset}
    `}
  />
);

const Container = ({ children }) => (
  <div
    css={css`
      width: 100%;
      max-width: 880px;
      padding: 20px;
      margin: 0 auto;
    `}
  >
    {children}
  </div>
);

const Footer = () => (
  <footer css={css(tw`flex justify-between items-center`)}>
    <div
      css={css({
        fontSize: "90%",
        opacity: 0.7,
      })}
    >
      Ricardo Herrera © 2021
    </div>
    <div css={css(tw`flex gap-2`)}>
      <Twitter />
      <Instagram />
      <GitHub />
    </div>
  </footer>
);

const Layout = ({ children }) => (
  <>
    <SEO />
    <GlobalStyle />
    <Header />
    <Container>
      {children}
      <Footer />
    </Container>
  </>
);

export default Layout;
