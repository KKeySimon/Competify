import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // If login status not in local storage make API call
    fetch("http://localhost:3000/api", { credentials: "include" })
      .then((response) => {
        if (response.status >= 400) {
          throw new Error("server error");
        } else if (response.status === 200) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
        return response.json();
      })
      .then((response) => console.log(response))
      .catch((error) => console.log(error));
  }, []);

  async function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    await fetch("http://localhost:3000/api/logout", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        setLoggedIn(false);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  return (
    <div>
      {loggedIn ? (
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
