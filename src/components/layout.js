import * as React from 'react'
import { Global, css } from "@emotion/react"
import { Link } from "gatsby"
import tw from 'twin.macro'

import reset from '../utils/reset'

const GlobalStyle = () => {
  return(
    <Global
    styles={css`
      :root {
      width: 100%;
      margin: 0 auto;
      max-width: 880px;
      padding: 40px;
      }
      @media (max-width: 768px) {
        padding: 30px;
      } 
      a {
        color: red;
      }
      ::selection {
        color: white;
        background: red;
      }
      ${reset}
    `}
  />
  )
}

const Header = () => {
  return(
    <header css={css(tw`py-4 md:py-8 lg:py-12`)}>
        <title>ricardo's piece of the internet</title>
        <Link css={css(`
          :hover {
            color: red;
          }
        `,
          tw`lg:text-lg text-current`
        )} to="/">ricardo's piece of the internet</Link>
    </header>
  )
}

const Layout = ({children}) => {
    return(
      <>
        <GlobalStyle/>
        <Header/>
        <main>{children}</main>
      </>
    )
}

export default Layout