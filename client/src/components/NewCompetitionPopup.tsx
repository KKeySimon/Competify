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
import { PopupProps, Priority, Policy, ICompetition } from "../../types";
import { PlusSquare } from "react-bootstrap-icons";

interface newCompetitionError {
  name: string;
  apiError: string;
  emails: string;
  startDate: string;
  endDate: string;
}

interface NewCompetitionPopupProps extends PopupProps {
  competitionData?: ICompetition;
}

function NewCompetitionPopup({
  trigger,
  setTrigger,
  competitionData,
}: NewCompetitionPopupProps) {
  const [errors, setErrors] = useState<newCompetitionError>({
    name: "",
    apiError: "",
    emails: "",
    startDate: "",
    endDate: "",
  });
  const [success, setSuccess] = useState<boolean>(false);
  const [name, setName] = useState(competitionData?.name || "");
  const [invites, setInvites] = useState<string[]>(
    competitionData?.invites || []
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    competitionData?.start_time
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    competitionData?.end_time
  );
  const [repeat, setRepeat] = useState(
    (competitionData?.repeats_every ?? 0) > 0 || false
  );
  const [repeatEvery, setRepeatEvery] = useState<number>(
    competitionData?.repeats_every || 0
  );
  const [repeatInterval, setRepeatInterval] = useState<string>(
    competitionData?.frequency || "daily"
  );
  const [isNumerical, setIsNumerical] = useState<boolean>(
    competitionData?.is_numerical || true
  );
  const [priority, setPriority] = useState<string>(
    competitionData?.priority || Priority.HIGHEST
  );
  const [policy, setPolicy] = useState<string>(
    competitionData?.policy || Policy.FLAT
  );
  const [inviteInput, setInviteInput] = useState<string>("");
  const [startDateFocus, setStartDateFocus] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>(
    competitionData?.start_time
      ? convertTo24Hour(
          new Date(competitionData.start_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        )
      : "00:00"
  );
  const [endDateFocus, setEndDateFocus] = useState<boolean>(false);
  const [endTime, setEndTime] = useState<string>(
    competitionData?.end_time
      ? convertTo24Hour(
          new Date(competitionData.end_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        )
      : "00:00"
  );

  // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  function convertTo24Hour(time: string) {
    const [timePart, modifier] = time.split(" "); // Split into "7:25" and "PM"
    // eslint-disable-next-line prefer-const
    let [hours, minutes] = timePart.split(":").map(Number); // Split "7:25" into hours and minutes

    if (modifier === "PM" && hours < 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }
  const formatDateTime = (date: Date | undefined, time: string) => {
    if (!date || !time) return "";
    time = convertTo24Hour(time);
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

    const jsonCompetitionData = {
      name,
      invites,
      startDate: new Date(startDate!),
      repeat,
      repeatEvery,
      repeatInterval,
      endDate,
      priority,
      policy,
      is_numerical: isNumerical,
    };

    await fetch(
      competitionData
        ? `http://localhost:3000/api/competition/${competitionData.id}`
        : "http://localhost:3000/api/competition/new",
      {
        method: competitionData ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonCompetitionData),
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(
            `Error ${response.status}: ${response.statusText}. ${errorMessage}`
          );
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
          if (competitionData) {
            window.location.reload();
          } else {
            navigate("/competition/" + data.id);
          }
        }, 2000);
      })
      .catch((error) => {
        console.log(error.message);
        setErrors({ ...errors, apiError: error.message });
      });
  }

  const handleInvite = () => {
    if (
      invites.indexOf(inviteInput) < 0 &&
      inviteInput.length !== 0 &&
      validateEmail(inviteInput)
    ) {
      setInvites([...invites, inviteInput]);
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
  };
  return trigger ? (
    <div className={styles.overlay} onClick={() => setTrigger(false)}>
      <div
        className={styles.container}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <CloseButton onClick={() => setTrigger(false)} />
          <h1 className={styles.prompt}>
            {competitionData
              ? "Update Competition"
              : "Create a New Competition"}
          </h1>
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
            <Form.Group controlId="formInvitePeople">
              <Form.Label>Invite People</Form.Label>
              <div className={styles.inviteContainer}>
                <Form.Control
                  type="email"
                  placeholder="Invite emails"
                  value={inviteInput}
                  onChange={(e) => {
                    setInviteInput(e.target.value);
                    setErrors({ ...errors, emails: "" });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleInvite();
                    }
                  }}
                  isInvalid={!!errors.emails}
                />
                <PlusSquare
                  onClick={(e) => {
                    e.preventDefault();
                    handleInvite();
                  }}
                  className={styles.plusButton}
                >
                  Invite
                </PlusSquare>
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.emails}
              </Form.Control.Feedback>
              <ListGroup>
                {invites.map((invite) => (
                  <div className={styles.inviteeContainer} key={invite}>
                    <ListGroupItem className={styles.listGroupItem}>
                      {invite}
                    </ListGroupItem>
                    <CloseButton
                      className={styles.closeButton}
                      onClick={() =>
                        setInvites(invites.filter((i) => i !== invite))
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
            <Form.Group className="mb-3" controlId="formInterval">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value={Priority.HIGHEST}>Highest</option>
                <option value={Priority.LOWEST}>Lowest</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formInterval">
              <Form.Label>Policy</Form.Label>
              <Form.Select
                value={policy}
                onChange={(e) => setPolicy(e.target.value)}
              >
                <option value={Policy.FLAT}>Flat</option>
                <option value={Policy.FLAT_CHANGE}>Flat Change</option>
                <option value={Policy.PERCENTAGE_CHANGE}>
                  Percentage Change
                </option>
              </Form.Select>
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
                label="Numerical"
                checked={isNumerical}
                onChange={() => setIsNumerical(!isNumerical)}
              />
            </Form.Group>

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
                {competitionData ? "Update Competition" : "Create Competition"}
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
