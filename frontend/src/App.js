import React from "react";
// We use Route in order to define the different routes of our application
import { Route, Routes } from "react-router-dom";

// We import all the components we need in our app
import Navbar from "./components/navbar";
import LandingPage from "./components/pages/landingPage";
import PortfolioPage from "./components/pages/portfolioPage";
import Login from "./components/pages/loginPage";
import Signup from "./components/pages/registerPage";
import BuyStock from "./components/pages/buyStockPage";
import { createContext, useState, useEffect } from "react";
import getUserInfo from "./utilities/decodeJwt";
import EditUser from "./components/pages/editUserPage";

export const UserContext = createContext();
//test change
//test again
const App = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  return (
    <>
      <Navbar />
      <UserContext.Provider value={user}>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route exact path="/portfolio" element={<PortfolioPage />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route path="/buyStock" element={<BuyStock />} />
          <Route exact path="/edituser" element={<EditUser />} />
        </Routes>
      </UserContext.Provider>
    </>
  );
};



export default App
