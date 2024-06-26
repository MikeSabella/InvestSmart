import React, { useEffect, useState } from "react";
import getUserInfo from '../utilities/decodeJwt';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import ReactNavbar from 'react-bootstrap/Navbar';


// Here, we display our Navbar
export default function Navbar() {
  // We are pulling in the user's info but not using it for now.
  // Warning disabled: 
  // eslint-disable-next-line
  const [user, setUser] = useState({})

  useEffect(() => {
    setUser(getUserInfo())
  }, [])
  
  // if (!user) return null   - for now, let's show the bar even not logged in.
  // we have an issue with getUserInfo() returning null after a few minutes
  // it seems.
  return (
    <ReactNavbar bg="primary" variant="dark" expand="lg">
      <Container>
      <ReactNavbar.Brand href="/" className="text-center cool-font" style={{ fontSize: '1.9rem' }}>InvestSmart</ReactNavbar.Brand>
        <ReactNavbar.Toggle aria-controls="basic-navbar-nav" />
        <ReactNavbar.Collapse id="basic-navbar-nav">
            <Nav className="text-center cool-font" style={{ fontSize: '1.9rem' }}>
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/portfolio">Portfolio</Nav.Link>
            <Nav.Link href="/buyStock">Buy Stock</Nav.Link>
            <Nav.Link href="/leaderboard">Leaderboard</Nav.Link>
          </Nav>
        </ReactNavbar.Collapse>
      </Container>
    </ReactNavbar>
  );
}