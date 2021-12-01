import * as React from "react";
import { Global, css } from "@emotion/react";
import tw from "twin.macro";
import Color from "color";

import { colors, themeColors } from "../utils/colors";
import reset from "../utils/reset";
import SEO from "./seo";
import Header from "./header";
import { Instagram, Twitter, GitHub } from "./social";

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
      <Twitter hoverColor={themeColors.primary} />
      <Instagram hoverColor={themeColors.primary} />
      <GitHub hoverColor={themeColors.primary} />
    </div>
  </footer>
);

const Layout = ({ title, template, description, children }) => (
  <>
    <SEO title={title} template={template} description={description} />
    <GlobalStyle />
    <Header />
    <Container>
      {children}
      <Footer />
    </Container>
  </>
);

export default Layout;
