import * as React from "react";
import { css } from "@emotion/react";
import { Link } from "gatsby";
import tw from "twin.macro";

import DarkModeToggle from "./darkmodetoggle";

const Header = () => {
  return (
    <header css={css(tw`max-w-screen-lg m-auto pt-7 p-6`)}>
      <nav css={css(tw`flex justify-between`)}>
        <div css={css(tw`h-full hover:opacity-70`)}>
          <Link
            css={css(
              { fontFamily: "DM Serif Display" },
              tw`text-4xl text-current lowercase block leading-5 hidden md:flex`
            )}
            to="/"
          >
            Ricardo
            <br />
            &nbsp;Herrera
          </Link>
          <Link
            css={css(
              { fontFamily: "DM Serif Display" },
              tw`text-4xl text-current lowercase block leading-5 md:hidden`
            )}
            to="/"
          >
            RH
          </Link>
        </div>
        <DarkModeToggle />
      </nav>
    </header>
  );
};

export default Header;
