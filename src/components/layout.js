import * as React from 'react'
import styled from "@emotion/styled"

const Wrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  max-width: 880px;
  padding: 40px;
  @media (max-width: 599px) {
    padding: 30px;
  }
`

const Layout = ({children}) => {
    return(
        <Wrapper>
        <title>ricardo's piece of the internet</title>
        <main>{children}</main>
        </Wrapper>
    )
}

export default Layout