import * as React from "react";
import { css } from "@emotion/react";
import { Link } from "gatsby";
import tw from "twin.macro";

const Header = () => {
  return (
    <header css={css(tw`max-w-screen-xl m-auto pt-7 p-6`)}>
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
        <div css={css(tw`flex items-center gap-4`)}>
          <Link css={css(tw`text-current text-xl hover:opacity-70`)} to="/bio">
            bio
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
