import * as React from "react";
import { Global, css } from "@emotion/react";
import Color from "color";

import { colors, themeColors } from "../utils/colors";
import reset from "../utils/reset";
import SEO from "./seo";
import Header from "./header";
import Footer from "./footer";

const GlobalStyle = () => (
  <Global
    styles={css`
      body {
        background-color: ${colors.white};
        color: ${colors.black};
        #dark-mode-toggle {
          background-color: ${Color(colors.white).darken(0.08).hex()};
          @media (hover: hover) {
            &:hover {
              color: ${colors.black};
              background: ${themeColors.primary};
            }
          }
        }
        #avatar-blob {
          color: ${Color(themeColors.secondary).lighten(0.75).hex()};
        }
        a {
          color: ${themeColors.secondary};
        }
      }
      .light-mode {
        transition: background-color 0.3s ease;
      }
      .dark-mode {
        background-color: ${colors.black};
        color: ${colors.white};
        #dark-mode-toggle {
          background-color: ${Color(colors.black).lighten(0.75).hex()};
        }
        #avatar-blob {
          color: ${Color(themeColors.secondary).darken(0.55).hex()};
        }
      }
      ${reset}
    `}
  />
);

const Container = ({ children, maxWidth }) => (
  <div
    css={css`
      width: 100%;
      max-width: ${maxWidth || "880px"};
      padding: 20px;
      margin: 0 auto;
    `}
  >
    {children}
  </div>
);

const Layout = ({ title, template, description, children, maxWidth }) => (
  <>
    <SEO title={title} template={template} description={description} />
    <GlobalStyle />
    <Header />
    <Container maxWidth={maxWidth}>{children}</Container>
    <Footer />
  </>
);

export default Layout;
