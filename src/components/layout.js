import * as React from 'react'
import { Global, css } from "@emotion/react"

import reset from '../utils/reset'
import SEO from './seo'
import Header from './header'

const GlobalStyle = () => {
  return(
    <Global
    styles={css`
      html {
        background: deeppink;
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

const Container = (props) => {
  return(
    <div
    css={css`
      background: white;
      min-height: 100vh;
      min-width: 100vw;
    `}
    >
      <div css={css`
      width: 100%;
      max-width: 880px;
      padding: 20px;
      margin: 0 auto; 
      `}>
      {props.children}
      </div>
    </div>
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
        <Container>
        <Header/>
        <>{children}</>
        <Footer/>
        </Container>
      </>
    )
}

export default Layout