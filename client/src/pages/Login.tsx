import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginProps } from "../../types";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Alert } from "react-bootstrap";
import styles from "./Login.module.css";
interface LoginError {
  email: string;
  password: string;
  apiError: string;
}

function Login({
  isLoggedIn,
  setIsLoggedIn,
  isDarkMode,
}: LoginProps & { isDarkMode: boolean }) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<LoginError>({
    email: "",
    password: "",
    apiError: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) {
      if (error === "email_exists") {
        setErrors((prevErrors) => ({
          ...prevErrors,
          apiError:
            "An account with this email already exists. Please log in using your email. If you wish to log in with discord, log in and link the accounts under profile!",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          apiError: "An unknown discord login error has occured",
        }));
      }
    }
  }, [location.search]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const validateForm = () => {
    const newErrors: LoginError = { email: "", password: "", apiError: "" };
    if (!email) {
      newErrors.email = "Email is required";
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
    setErrors({ email: "", password: "", apiError: "" });
    const userData = { username: email, password };

    await fetch(`${import.meta.env.VITE_SERVER_URL}/api/login`, {
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
      .then(() => {
        setIsLoggedIn(true);
      })
      .catch((error) => {
        setErrors({ ...errors, apiError: error.message });
        console.log(error.message);
      });
  }

  return (
    <div className={`${styles.background}`}>
      <div
        className={`${styles.container} ${isDarkMode ? styles.darkMode : ""}`}
      >
        {isDarkMode ? (
          <img
            src="/logoDarkMode.svg"
            alt="Competify"
            className={`${styles.logo}`}
          />
        ) : (
          <img src="/logo.svg" alt="Competify" className={`${styles.logo}`} />
        )}
        <div className={styles.forms}>
          <h2 className={styles.login}>Login</h2>
          {errors.apiError && <Alert variant="danger">{errors.apiError}</Alert>}
          <Form onSubmit={handleLogin} data-bs-theme={isDarkMode ? "dark" : ""}>
            {/* Email Input */}
            <div className="form-floating">
              <input
                type="email"
                className="form-control"
                id="floatingInput"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => {
                  setErrors({ ...errors, email: "" });
                  setEmail(e.target.value);
                }}
              />
              <label htmlFor="floatingInput">Email address</label>
            </div>
            {/* Password Input */}
            <div className="form-floating mt-3">
              <input
                type="password"
                className="form-control"
                id="floatingPassword"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => {
                  setErrors({ ...errors, password: "" });
                  setPassword(e.target.value);
                }}
              />
              <label htmlFor="floatingPassword">Password</label>
            </div>
            <div className={styles.loginSignupBtn}>
              {/* Login Button */}
              <Button variant="primary" type="submit">
                Login
              </Button>
              {/* Discord Login Button */}
              <a
                href={`${import.meta.env.VITE_SERVER_URL}/api/login/discord`}
                className={styles.discordButton}
              >
                <button type="button" className={styles.discord}>
                  <img
                    src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg"
                    alt="Discord Logo"
                    className={styles.discordLogo}
                  />
                  <span className={styles.discordText}>Login with Discord</span>
                </button>
              </a>

              {/* Sign Up Link */}
              <Link to="/sign-up">
                <Button variant="primary">Sign Up</Button>
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Login;
