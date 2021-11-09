import * as React from 'react'
import styled from "@emotion/styled"
import { Global, css } from "@emotion/react"
import { Link } from "gatsby"
import tw from 'twin.macro'

import reset from '../utils/reset'

const Wrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  max-width: 880px;
  padding: 40px;
  @media (max-width: 768px) {
    padding: 30px;
  }
`
const Header = () => {
  return(
    <header css={css(tw`py-4 md:py-8 lg:py-12`)}>
        <title>ricardo's piece of the internet</title>
        <Link to="/">ricardo's piece of the internet</Link>
    </header>
  )
}

const Layout = ({children}) => {
    return(
      <>
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
        <Wrapper>
          <Header/>
          <main>{children}</main>
        </Wrapper>
      </>
    )
}

export default Layout