import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // useEffect & isLoggedIn state is moved from NavBar to App as other components will eventually
  // need to use whether user is logged in. Shouldn't tighty couple the 2 together
  useEffect(() => {
    // If login status not in local storage make API call
    fetch("http://localhost:3000/api", { credentials: "include" })
      .then((response) => {
        if (response.status >= 400) {
          throw new Error("Unauthorized");
        } else if (response.status === 200) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
        return response.json();
      })
      .then((response) => console.log(response))
      .catch((error) => console.log(error));
  }, []);

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            }
          />
          <Route path="/sign-up" element={<SignUp isLoggedIn={isLoggedIn} />} />
        </Routes>
      </div>
    </>
  );
}
export default App;
