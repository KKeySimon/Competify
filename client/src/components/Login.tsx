import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginProps } from "../../types";

function Login({ isLoggedIn, setIsLoggedIn }: LoginProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  async function handleLogin(e: React.FormEvent) {
    // prevents default behavior from occuring, which in form's case is redirecting to action URL in form
    e.preventDefault();

    const userData = { username, password };

    await fetch("http://localhost:3000/api/login", {
      method: "POST",
      // This must be included to send/receive session cookies to the browser (learned it the hard way...)
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        return response.json();
      })
      .then((data) => {
        setIsLoggedIn(true);
        console.log(data);
        console.log(data.message);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  return (
    <div>
      <h1>This is the Login page!</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default Login;
