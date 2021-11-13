import * as React from 'react'
import { Global, css } from "@emotion/react"
import { Link } from "gatsby"
import tw from 'twin.macro'
import { Helmet } from "react-helmet"

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

const SEO = () => {
  return(
    <Helmet
    title="ricardo's piece of the internet"
    titleTemplate="ricardo's piece of the internet"
  />   
  )
}

const Header = () => {
  return(
    <header css={css(tw`py-4 md:py-8 lg:py-12`)}>
        <Link css={css(`
          :hover {
            color: red;
          }
        `,
          tw`lg:text-xl text-current`
        )} to="/">ricardo's piece of the internet</Link>
    </header>
  )
}

const Footer = () => {
  return(
    <footer>
      <div
        css={css({
          fontSize: '90%',
          opacity: 0.7,
        })}
      >
        Ricardo Herrera © 2021
      </div>
    </footer>
  )
}

const Layout = ({children}) => {
    return(
      <>
        <SEO/>
        <GlobalStyle/>
        <Header/>
        <>{children}</>
        <Footer/>
      </>
    )
}

export default Layout