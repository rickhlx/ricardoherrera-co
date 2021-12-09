import { css, keyframes } from "@emotion/react";
import { StaticImage } from "gatsby-plugin-image";
import * as React from "react";
import tw from "twin.macro";

const rotate = keyframes`
  0%{
    transform:rotate(0deg);
  }
  100%{
    transform:rotate(360deg);
  }
`;

const Avatar = () => {
  return (
    <div css={css(tw`pb-6 relative lg:order-last`)}>
      <div
        css={css(
          tw`absolute w-full h-full top-0 flex items-center justify-center z-10`
        )}
      >
        <StaticImage
          css={css`
            border-radius: 50%;
            overflow: hidden;
            perspective: 0px;
          `}
          src="../images/me.jpg"
          placeholder="blurred"
          width={200}
          height={200}
          alt="ricardo"
          layout="constrained"
          loading="eager"
        />
      </div>
      <div css={css(tw`relative h-64`)}>
        <svg
          id="avatar-blob"
          css={css`
            animation: ${rotate} 45s linear infinite;
            height: 17rem;
            position: relative;
          `}
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M42.6,-73.9C55.9,-66.1,67.9,-56.1,76.5,-43.4C85.1,-30.7,90.5,-15.4,90.8,0.2C91.1,15.7,86.5,31.5,78.3,44.9C70,58.3,58.3,69.4,44.6,77.3C31,85.2,15.5,89.8,-0.4,90.5C-16.3,91.2,-32.6,87.9,-46.4,80.2C-60.2,72.4,-71.5,60.1,-79.4,46C-87.3,31.9,-91.8,15.9,-91.6,0.1C-91.4,-15.7,-86.6,-31.5,-78.9,-45.8C-71.1,-60.2,-60.4,-73.2,-46.8,-80.8C-33.2,-88.4,-16.6,-90.6,-1,-88.9C14.7,-87.2,29.3,-81.7,42.6,-73.9Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
    </div>
  );
};

export default Avatar;
