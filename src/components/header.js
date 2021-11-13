import * as React from 'react'
import { css } from "@emotion/react"
import { Link, useStaticQuery, graphql } from "gatsby"
import tw from 'twin.macro'
import { StaticImage } from 'gatsby-plugin-image'

const Header = () => {
    const data = useStaticQuery(graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `)

    return(
      <header css={css(tw`flex py-5 gap-2 md:py-8 lg:py-10 lg:gap-3`)}>
          <StaticImage css={css`
              border-radius: 50%;
              overflow: hidden;
              perspective: 0px;
              width: 60px;
              height: 60px;
              border: 2px black solid;
              @media (max-width: 1024px) {
                width: 50px;
                height: 50px;
              } 
              @media (max-width: 768px) {
                width: 40px;
                height: 40px;
              } 
            }`
            }
            src="../images/avatar.png"
          />
          <Link css={css(`
            :hover {
              color: red;
            }
          `,
            tw`text-sm md:text-base lg:text-lg text-current self-center`
          )} to="/">{data.site.siteMetadata.title}</Link>
      </header>
    )
  }

export default Header