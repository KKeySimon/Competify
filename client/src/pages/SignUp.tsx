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

function SignUp({ isLoggedIn }: SignUpProps) {
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

    await fetch("http://localhost:4000/api/sign-up", {
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
      <div className={styles.container}>
        <h1 className={styles.logo}>Competify</h1>
        <div className={styles.forms}>
          <h1 className={styles.signup}>Sign Up</h1>
          {errors.apiError && <Alert variant="danger">{errors.apiError}</Alert>}
          {success && (
            <Alert variant="success">
              Successful signup! Redirecting to login page...
            </Alert>
          )}

          <Form onSubmit={handleSignUp}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setErrors({ ...errors, email: "" });
                  setEmail(e.target.value);
                }}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicUsername">
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

            <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setErrors({ ...errors, confirmPassword: "" });
                  setConfirmPassword(e.target.value);
                }}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>

            <div className={styles.loginSignupBtn}>
              <Button variant="primary" type="submit">
                Sign Up
              </Button>
              <Link to="/login">Already have an account? Log in</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
