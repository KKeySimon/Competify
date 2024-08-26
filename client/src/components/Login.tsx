import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginProps } from "../../types";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Alert } from "react-bootstrap";
import styles from "./Login.module.css";

interface LoginError {
  username: string;
  password: string;
  apiError: string;
}

function Login({ isLoggedIn, setIsLoggedIn }: LoginProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<LoginError>({
    username: "",
    password: "",
    apiError: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const validateForm = () => {
    const newErrors: LoginError = { username: "", password: "", apiError: "" };
    if (!username) {
      newErrors.username = "Username is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  async function handleLogin(e: React.FormEvent) {
    // prevents default behavior from occuring, which in form's case is redirecting to action URL in form
    e.preventDefault();

    const formErrors = validateForm();

    if (Object.values(formErrors).some((error) => error !== "")) {
      setErrors(formErrors);
      return;
    }
    setErrors({ username: "", password: "", apiError: "" });
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
          if (response.status === 401) {
            throw new Error("Invalid Credentials");
          }
          throw new Error("Something went wrong!");
        }
        return response.json();
      })
      .then((data) => {
        setIsLoggedIn(true);
        console.log(data.message);
      })
      .catch((error) => {
        setErrors({ ...errors, apiError: error.message });
        console.log(error.message);
      });
  }

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <h1 className={styles.logo}>Competify</h1>
        <div className={styles.forms}>
          <h1 className={styles.login}>Login</h1>
          {errors.apiError && <Alert variant="danger">{errors.apiError}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setErrors({ ...errors, username: "" });
                  setUsername(e.target.value);
                }}
                isInvalid={!!errors.username}
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setErrors({ ...errors, password: "" });
                  setPassword(e.target.value);
                }}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
            <div className={styles.loginSignupBtn}>
              <Button variant="primary" type="submit">
                Login
              </Button>
              <Link to="/sign-up">Sign Up</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Login;
