import * as React from 'react'
import { css } from "@emotion/react"
import { Link, useStaticQuery, graphql } from "gatsby"
import tw from 'twin.macro'

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
      <header css={css(tw`py-4 md:py-8 lg:py-12`)}>
          <Link css={css(`
            :hover {
              color: red;
            }
          `,
            tw`lg:text-xl text-current`
          )} to="/">{data.site.siteMetadata.title}</Link>
      </header>
    )
  }

export default Header