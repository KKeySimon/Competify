import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import PageNotFound from "./pages/PageNotFound";
import CompetitionsList from "./pages/CompetitionsList";
import Profile from "./pages/Profile";
import Competition from "./pages/Competition";
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import EventPage from "./pages/EventPage";
import JoinCompetition from "./pages/JoinCompetition";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedPreference = localStorage.getItem("darkMode");
    if (storedPreference) {
      setIsDarkMode(storedPreference === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  // useEffect & isLoggedIn state is moved from NavBar to App as other components will eventually
  // need to use whether user is logged in. Shouldn't tighty couple the 2 together
  useEffect(() => {
    // If login status not in local storage make API call
    fetch(`${import.meta.env.VITE_SERVER_URL}/api`, { credentials: "include" })
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
      .catch(() => {
        setIsLoggedIn(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // This is needed as without loading, i.e. isLoggedIn is initially set to false
  // App loads and instantly renders /competition before isLoggedIn is set to true and will redirect
  // to home and /competition will not finish loading
  if (loading) {
    return <div>Authenticating...</div>; // Optionally show a loading indicator
  }

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
          <Route
            path="/login"
            element={
              <Login
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                isDarkMode={isDarkMode}
              />
            }
          />
          <Route
            path="/sign-up"
            element={<SignUp isLoggedIn={isLoggedIn} isDarkMode={isDarkMode} />}
          />
          <Route
            path="/competition"
            element={
              <CompetitionsList
                isLoggedIn={isLoggedIn}
                isDarkMode={isDarkMode}
              />
            }
          />
          <Route
            path="/competition/:id"
            element={<Competition isDarkMode={isDarkMode} />}
          />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="*" element={<PageNotFound />} />
          <Route
            path="/competition/:competitionId/events/:eventId"
            element={<EventPage />}
          />
          <Route
            path="/join/:inviteToken"
            element={<JoinCompetition isLoggedIn={isLoggedIn} />}
          />
        </Routes>
      </div>
    </>
  );
}
export default App;
