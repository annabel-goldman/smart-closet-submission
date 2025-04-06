import React, { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import AuthenticationGuard from "./components/authentication-guard";
import Home from "./pages/Home";
import Closet from "./pages/Closet";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/closet"
        element={<AuthenticationGuard component={Closet} />}
      />
    </Routes>
  );
}

export default App;
