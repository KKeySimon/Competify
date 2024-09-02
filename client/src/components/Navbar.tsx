import { Link } from "react-router-dom";
import { LoginProps } from "../../types";
import styles from "./Navbar.module.css";

function Navbar({ isLoggedIn, setIsLoggedIn }: LoginProps) {
  async function handleLogout() {
    await fetch("http://localhost:3000/api/logout", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        setIsLoggedIn(false);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  return (
    <div className={styles.navbar}>
      <Link to="/">Home</Link>
      <Link to="/competition">Competitions</Link>
      {isLoggedIn ? (
        <a onClick={handleLogout}>Logout</a>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </div>
  );
}

export default Navbar;
