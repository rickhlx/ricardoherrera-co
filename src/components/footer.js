import * as React from "react";
import { css } from "@emotion/react";
import tw from "twin.macro";

import { themeColors } from "../utils/colors";
import { Instagram, Twitter } from "./social";

const Footer = () => (
  <footer
    css={css(tw`max-w-screen-xl m-auto flex justify-between items-center p-6`)}
  >
    <div
      css={css({
        fontSize: "90%",
        opacity: 0.7,
      })}
    >
      Ricardo Herrera © 2023
    </div>
    <div css={css(tw`flex gap-2`)}>
      <Twitter hoverColor={themeColors.primary} />
      <Instagram hoverColor={themeColors.primary} />
    </div>
  </footer>
);

export default Footer;
