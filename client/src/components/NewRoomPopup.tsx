import { CloseButton, Form, Button, Alert } from "react-bootstrap";
import styles from "./NewRoomPopup.module.css";
import { useState } from "react";

interface PopupProps {
  trigger: boolean;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}

interface newRoomError {
  name: string;
  apiError: string;
}

function NewRoomPopup({ trigger, setTrigger }: PopupProps) {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<newRoomError>({
    name: "",
    apiError: "",
  });
  const [success, setSuccess] = useState<boolean>(false);

  const validateForm = () => {
    const newErrors: newRoomError = { name: "", apiError: "" };
    if (!name) {
      newErrors.name = "Name is required";
    }
    return newErrors;
  };
  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.values(formErrors).some((error) => error !== "")) {
      setErrors(formErrors);
      return;
    }
    setErrors({ name: "", apiError: "" });
    const roomData = { name };
    await fetch("http://localhost:3000/api/room/new", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roomData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message);
        setSuccess(true);
        setTimeout(() => {
          // TODO: Should redirect to newly created room
          setTrigger(false);
          setSuccess(false);
          setName("");
        }, 2000);
      })
      .catch((error) => {
        setErrors({ ...errors, apiError: error.message });
        console.log(error.message);
      });
  }
  return trigger ? (
    <div className={styles.overlay} onClick={() => setTrigger(false)}>
      <div
        className={styles.container}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          className={styles.forms}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <CloseButton onClick={() => setTrigger(false)} />
          <h1 className={styles.prompt}>Create a New Room</h1>
          {errors.apiError && <Alert variant="danger">{errors.apiError}</Alert>}
          {success && (
            <Alert variant="success">
              Room successfully created! Redirecting to new room...
            </Alert>
          )}
          <Form onSubmit={handleCreateRoom}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => {
                  setErrors({ ...errors, name: "" });
                  setName(e.target.value);
                }}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <div
              className={styles.createRoomBtn}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button variant="primary" type="submit">
                Create Room
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  ) : (
    ""
  );
}

export default NewRoomPopup;
