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
  @media (max-width: 599px) {
    padding: 30px;
  }
`
const Header = () => {
  return(
    <header css={css(tw``)}>
        <Link to="/">ricardo's piece of the internet</Link>
    </header>
  )
}

const Layout = ({children}) => {
    return(
        <Wrapper>
        <Global
          styles={css`
            ${reset}
          `}
        />
        <Header/>
        <title>ricardo's piece of the internet</title>
        <main>{children}</main>
        </Wrapper>
    )
}

export default Layout