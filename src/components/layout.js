import * as React from 'react'
import { Global, css } from "@emotion/react"

import reset from '../utils/reset'
import SEO from './seo'
import Header from './header'

const GlobalStyle = () => {
  return(
    <Global
    styles={css`
      :root {
      width: 100%;
      margin: 0 auto;
      max-width: 880px;
      padding: 20px;
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