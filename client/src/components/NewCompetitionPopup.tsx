import {
  CloseButton,
  Form,
  Button,
  Alert,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
import styles from "./NewCompetitionPopup.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PopupProps {
  trigger: boolean;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}

interface newCompetitionError {
  name: string;
  apiError: string;
  emails: string;
}

function NewCompetitionPopup({ trigger, setTrigger }: PopupProps) {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<newCompetitionError>({
    name: "",
    apiError: "",
    emails: "",
  });
  const [success, setSuccess] = useState<boolean>(false);
  const [inviteInput, setInviteInput] = useState<string>("");
  const [inviteList, setInviteList] = useState<string[]>([]);
  // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: newCompetitionError = {
      name: "",
      apiError: "",
      emails: "",
    };
    if (!name) {
      newErrors.name = "Name is required";
    }
    return newErrors;
  };
  async function handleCreateCompetition(e: React.FormEvent) {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.values(formErrors).some((error) => error !== "")) {
      setErrors(formErrors);
      return;
    }
    setErrors({ name: "", apiError: "", emails: "" });
    const competitionData = { name, inviteList };
    await fetch("http://localhost:3000/api/competition/new", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(competitionData),
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
          setTrigger(false);
          setSuccess(false);
          setName("");
          // TODO Add navgation
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
          <h1 className={styles.prompt}>Create a New Competition</h1>
          {errors.apiError && <Alert variant="danger">{errors.apiError}</Alert>}
          {success && (
            <Alert variant="success">
              Competition successfully created! Redirecting to new
              competition...
            </Alert>
          )}
          <Form onSubmit={handleCreateCompetition}>
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
            <Form.Group className="mb-3" controlId="formInvitePeople">
              <Form.Label>Invite People</Form.Label>
              <Form.Control
                type="email"
                placeholder="Invite emails"
                value={inviteInput}
                onChange={(e) => {
                  setInviteInput(e.target.value);
                  setErrors({ ...errors, emails: "" });
                }}
                isInvalid={!!errors.emails}
              />
              <Button
                variant="primary"
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    inviteList.indexOf(inviteInput) < 0 &&
                    inviteInput.length !== 0 &&
                    validateEmail(inviteInput)
                  ) {
                    setInviteList([...inviteList, inviteInput]);
                  } else {
                    if (inviteInput.length !== 0) {
                      if (!validateEmail(inviteInput)) {
                        setErrors({
                          ...errors,
                          emails: "Not a valid email address!",
                        });
                      }
                    }
                  }
                  setInviteInput("");
                }}
              >
                Invite
              </Button>
              <Form.Control.Feedback type="invalid">
                {errors.emails}
              </Form.Control.Feedback>
            </Form.Group>
            <ListGroup>
              {inviteList.map((invite) => (
                <div key={invite}>
                  <ListGroupItem>{invite}</ListGroupItem>
                  <CloseButton
                    onClick={() =>
                      setInviteList(inviteList.filter((i) => i !== invite))
                    }
                  />
                </div>
              ))}
            </ListGroup>
            <div
              className={styles.createCompetitionBtn}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button variant="primary" type="submit">
                Create Competition
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

export default NewCompetitionPopup;
