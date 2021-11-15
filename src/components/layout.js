import * as React from 'react'
import { Global, css } from "@emotion/react"
import tw from 'twin.macro'

import reset from '../utils/reset'
import SEO from './seo'
import Header from './header'
import { Instagram, Twitter, GitHub } from './social'

const GlobalStyle = () => {
  return(
    <Global
    styles={css`
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
      <div css={css`
      width: 100%;
      max-width: 880px;
      padding: 20px;
      margin: 0 auto; 
      `}>
      {props.children}
    </div>
  )
}

const Footer = () => {
  return(
    <footer css={css(tw`flex justify-between items-center`)}>
      <div
        css={css({
          fontSize: '90%',
          opacity: 0.7,
        })}
      >
        Ricardo Herrera © 2021
      </div>
      <div css={css(tw`flex gap-0.5`)}>
        <Twitter/>
        <Instagram/>
        <GitHub/>
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