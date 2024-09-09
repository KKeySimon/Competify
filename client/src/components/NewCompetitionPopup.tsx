import {
  CloseButton,
  Form,
  Button,
  Alert,
  ListGroup,
  ListGroupItem,
  Modal,
} from "react-bootstrap";
import styles from "./NewCompetitionPopup.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DateTimePicker from "./DateTimePicker";
import "react-day-picker/style.css";
import { format } from "date-fns";
import { PopupProps } from "../../types";

interface newCompetitionError {
  name: string;
  apiError: string;
  emails: string;
  startDate: string;
  endDate: string;
}

function NewCompetitionPopup({ trigger, setTrigger }: PopupProps) {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<newCompetitionError>({
    name: "",
    apiError: "",
    emails: "",
    startDate: "",
    endDate: "",
  });
  const [success, setSuccess] = useState<boolean>(false);
  const [inviteInput, setInviteInput] = useState<string>("");
  const [inviteList, setInviteList] = useState<string[]>([]);
  const [startDateFocus, setStartDateFocus] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>("00:00");
  const [repeat, setRepeat] = useState(false);
  const [endDateFocus, setEndDateFocus] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<string>("00:00");
  const [repeatInterval, setRepeatInterval] = useState<string>("daily");
  const [repeatEvery, setRepeatEvery] = useState<number>(1);
  // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const formatDateTime = (date: Date | undefined, time: string) => {
    if (!date || !time) return "";

    const formattedDate = format(new Date(date), "MM/dd/yyyy");
    const formattedTime = format(new Date(`1970-01-01T${time}:00`), "hh:mm aa");

    return `${formattedDate} ${formattedTime}`;
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case "daily":
        return "Days";
      case "weekly":
        return "Weeks";
      case "monthly":
        return "Months";
      case "everyX":
        return "Days"; // Default to Days since it's the most common
      default:
        return "";
    }
  };

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: newCompetitionError = {
      name: "",
      apiError: "",
      emails: "",
      startDate: "",
      endDate: "",
    };
    if (!name) {
      newErrors.name = "Name is required";
    }
    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (repeat) {
      if (!endDate) {
        newErrors.endDate = "End date is required";
      } else if (startDate && endDate <= startDate) {
        newErrors.endDate = "End date needs to be after start date";
      }
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
    setErrors({
      name: "",
      apiError: "",
      emails: "",
      startDate: "",
      endDate: "",
    });
    const competitionData = {
      name,
      inviteList,
      startDate: new Date(startDate!),
      repeat,
      repeatEvery,
      repeatInterval,
      endDate,
    };

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
        console.log(data);
        setSuccess(true);
        setTimeout(() => {
          setTrigger(false);
          setSuccess(false);
          setName("");
          navigate("/competition/" + data.id);
        }, 2000);
      })
      .catch((error) => {
        console.log(error.message);
        setErrors({ ...errors, apiError: error.message });
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
            </Form.Group>
            <Form.Group className="mb-3" controlId="formStartTime">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="text"
                placeholder="MM/DD/YYYY HH:MM AM"
                value={formatDateTime(startDate, startTime)}
                onClick={() => setStartDateFocus(true)}
                readOnly
                isInvalid={!!errors.startDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors.startDate}
              </Form.Control.Feedback>
            </Form.Group>

            <Modal
              show={startDateFocus}
              onHide={() => setStartDateFocus(false)}
            >
              <Modal.Header closeButton>
                <Modal.Title>Select Date and Time</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <DateTimePicker
                  dateValue={startDate}
                  setDateValue={setStartDate}
                  timeValue={startTime}
                  setTimeValue={setStartTime}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setStartDateFocus(false)}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Repeat"
                checked={repeat}
                onChange={() => setRepeat(!repeat)}
              />
            </Form.Group>

            {repeat && (
              <>
                <Form.Group className="mb-3" controlId="formInterval">
                  <Form.Label>Repeat Interval</Form.Label>
                  <Form.Select
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Every X {getIntervalLabel(repeatInterval)}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={repeatEvery}
                    onChange={(e) => setRepeatEvery(parseInt(e.target.value))}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formEndTime">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="MM/DD/YYYY HH:MM AM"
                    value={formatDateTime(endDate, endTime)}
                    onClick={() => setEndDateFocus(true)}
                    readOnly
                    isInvalid={!!errors.endDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.endDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </>
            )}

            <Modal show={endDateFocus} onHide={() => setEndDateFocus(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Select Date and Time</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <DateTimePicker
                  dateValue={endDate}
                  setDateValue={setEndDate}
                  timeValue={endTime}
                  setTimeValue={setEndTime}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setEndDateFocus(false)}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

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
