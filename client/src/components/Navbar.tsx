import { Link } from "react-router-dom";
import { LoginProps } from "../../types";

function Navbar({ isLoggedIn, setIsLoggedIn }: LoginProps) {
  async function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

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
    <div>
      {isLoggedIn ? (
        <li>
          <button onClick={handleLogout}>Logout</button>
        </li>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </div>
  );
}

export default Navbar;
