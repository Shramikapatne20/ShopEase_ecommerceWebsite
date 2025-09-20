import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Home from "./Home";
import Admin from "./Admin";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Cart from "./Cart";
import Orders from "./Orders";
import EditProfile from "./EditProfile";

console.log({ Login, Signup, Home, Admin });


function App() {
  const isLoggedIn=!!localStorage.getItem("token");
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />   
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Home" element={isLoggedIn ? <Home />:<Login />} />
        <Route path="/Admin" element={isLoggedIn ? <Admin />:<Login />} />
        <Route path="/Cart" element={isLoggedIn ? <Cart />:<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword/>}></Route>
        <Route path="/reset-password/:token" element={<ResetPassword/>}></Route>
        <Route path="/Orders" element={isLoggedIn?<Orders />:<Login/>}></Route>
        <Route path="/EditProfile" element={isLoggedIn?<EditProfile />:<Login/>}></Route>
        
      </Routes>
    </Router>
  );
}

export default App;
