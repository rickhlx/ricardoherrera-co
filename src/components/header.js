import * as React from "react";
import { css } from "@emotion/react";
import { Link } from "gatsby";
import tw from "twin.macro";

const Header = () => {
  return (
    <header css={css(tw`max-w-screen-lg m-auto pt-7 p-4`)}>
      <nav css={css(tw`flex justify-between`)}>
        <div css={css(tw`h-full`)}>
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
        <div
          css={css(`a{color: black};`, tw`flex gap-2 items-center uppercase`)}
        >
          {/* <Link to="/">Photo</Link>
          <Link to="/">Blog</Link>
          <Link to="/">About</Link> */}
        </div>
      </nav>
    </header>
  );
};

export default Header;
