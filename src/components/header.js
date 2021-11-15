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
      <header css={css(tw`py-5 md:py-7 lg:py-9`)}>
          <Link css={css(`
            :hover {
              color: red;
            }
          `,
            tw`text-sm text-current lg:text-lg`
          )} to="/">
          <StaticImage loading="eager" css={css`
              border-radius: 50%;
              overflow: hidden;
              perspective: 0px;
              width: 60px;
              margin-right: 0.5rem;
              height: 60px;
              vertical-align: middle;
              border: 2px black solid;
              @media (max-width: 1024px) {
                width: 50px;
                height: 50px;
              } 
              @media (max-width: 768px) {
                width: 50px;
                height: 50px;
              } 
            }`
            }
            src="../images/avatar.png"
          />
          <span css={css(tw`hidden md:inline-flex`)}>{data.site.siteMetadata.title}</span>
            </Link>
      </header>
    )
  }

export default Header