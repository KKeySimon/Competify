import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Alert, Form, Button } from "react-bootstrap";
import styles from "./SignUp.module.css";

interface SignUpError {
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
  apiError: string;
}

interface SignUpProps {
  isLoggedIn: boolean;
}

function SignUp({
  isLoggedIn,
  isDarkMode,
}: SignUpProps & { isDarkMode: boolean }) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<SignUpError>({
    username: "",
    password: "",
    email: "",
    confirmPassword: "",
    apiError: "",
  });
  const [email, setEmail] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const validateForm = () => {
    const newErrors: SignUpError = {
      username: "",
      password: "",
      confirmPassword: "",
      apiError: "",
      email: "",
    };
    if (!username) {
      newErrors.username = "Username is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    if (!email) {
      newErrors.email = "Email is required";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  async function handleSignUp(e: React.FormEvent) {
    // prevents default behavior from occuring, which in form's case is redirecting to action URL in form
    e.preventDefault();

    const formErrors = validateForm();

    if (Object.values(formErrors).some((error) => error !== "")) {
      setErrors(formErrors);
      return;
    }
    setErrors({
      username: "",
      password: "",
      email: "",
      confirmPassword: "",
      apiError: "",
    });
    const userData = { username, password, email };
    console.log(password);

    await fetch(`${import.meta.env.VITE_SERVER_URL}/api/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        if (response.status === 409) {
          return response.json().then((data) => {
            throw new Error(data.message);
          });
        }
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message);
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      })
      .catch((error) => {
        setErrors({ ...errors, apiError: error.message });
        console.log(error.message);
      });
  }

  return (
    <div className={styles.background}>
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
          <h2 className={styles.signup}>Sign Up</h2>
          {errors.apiError && <Alert variant="danger">{errors.apiError}</Alert>}
          {success && (
            <Alert variant="success">
              Successful signup! Redirecting to login page...
            </Alert>
          )}

          <Form onSubmit={handleSignUp} data-bs-theme={isDarkMode && "dark"}>
            <div className="form-floating mt-3">
              <input
                type="email"
                className="form-control"
                id="floatingEmail"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => {
                  setErrors({ ...errors, email: "" });
                  setEmail(e.target.value);
                }}
              />
              <label htmlFor="floatingEmail">Email address</label>
            </div>
            {/* Username Input */}
            <div className="form-floating mt-3">
              <input
                type="text"
                className="form-control"
                id="floatingUsername"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => {
                  setErrors({ ...errors, username: "" });
                  setUsername(e.target.value);
                }}
              />
              <label htmlFor="floatingUsername">Username</label>
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
            {/* Confirm Password Input */}
            <div className="form-floating mt-3">
              <input
                type="password"
                className="form-control"
                id="floatingConfirmPassword"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setErrors({ ...errors, confirmPassword: "" });
                  setConfirmPassword(e.target.value);
                }}
              />
              <label htmlFor="floatingConfirmPassword">Confirm Password</label>
            </div>

            <div className={styles.loginSignupBtn}>
              <Button variant="primary" type="submit">
                Sign Up
              </Button>
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
              <Link to="/login">
                <Button variant="primary">Log in</Button>
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
