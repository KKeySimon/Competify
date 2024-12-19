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
import { PopupProps, Priority, ICompetition } from "../../types";

interface newCompetitionError {
  name: string;
  apiError: string;
  usernames: string;
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
  isDarkMode,
}: NewCompetitionPopupProps & { isDarkMode: boolean }) {
  const [errors, setErrors] = useState<newCompetitionError>({
    name: "",
    apiError: "",
    usernames: "",
    startDate: "",
    endDate: "",
  });
  const [success, setSuccess] = useState<boolean>(false);
  const [name, setName] = useState(competitionData?.name || "");
  const [description, setDescription] = useState(
    competitionData?.description || ""
  );
  const [invites, setInvites] = useState<
    { username: string; authType: string }[]
  >([]);
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
    competitionData?.is_numerical ?? true
  );
  const [priority, setPriority] = useState<string>(
    competitionData?.priority || Priority.HIGHEST
  );
  const [authType, setAuthType] = useState<string>("EMAIL");
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
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function convertTo24Hour(time: string) {
    const [timePart, modifier] = time.split(" ");
    // eslint-disable-next-line prefer-const
    let [hours, minutes] = timePart.split(":").map(Number);

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
        return "Days";
      default:
        return "";
    }
  };

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: newCompetitionError = {
      name: "",
      apiError: "",
      usernames: "",
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

  const handleDeleteCompetition = async (competitionId: number) => {
    try {
      if (
        !window.confirm(
          "Are you sure you want to delete this competition? This action CANNOT BE UNDONE"
        )
      ) {
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/competition/${competitionId}`,
        {
          credentials: "include",
          method: "DELETE",
        }
      );

      if (response.status === 200) {
        setDeleteSuccess("Competition deleted successfully!");
        setDeleteError(null);
        setTimeout(() => {
          navigate("/competition");
        }, 2000);
      } else {
        const errorMessage = await response.text();
        throw new Error(`Failed to delete competition: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error deleting competition:", error);
      setDeleteError("Failed to delete competition. Please try again.");
      setDeleteSuccess(null);
    }
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
      usernames: "",
      startDate: "",
      endDate: "",
    });

    const finalInvites = [...invites];
    const currInviteInput = { username: inviteInput, authType: authType };
    if (inviteInput && !finalInvites.includes(currInviteInput)) {
      finalInvites.push(currInviteInput);
    }

    const jsonCompetitionData = {
      name,
      invites: finalInvites,
      startDate: new Date(startDate!),
      repeat,
      repeatEvery,
      repeatInterval,
      endDate,
      priority,
      description,
      is_numerical: isNumerical,
    };

    await fetch(
      competitionData
        ? `${import.meta.env.VITE_SERVER_URL}/api/competition/${
            competitionData.id
          }`
        : `${import.meta.env.VITE_SERVER_URL}/api/competition/new`,
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
    if (!inviteInput.trim()) {
      setErrors({
        ...errors,
        usernames: "Username cannot be empty!",
      });
      return;
    }

    const isDuplicate = invites.some(
      (invite) =>
        invite.username === inviteInput.trim() && invite.authType === authType
    );

    if (isDuplicate) {
      setErrors({
        ...errors,
        usernames:
          "This user with the selected account type is already invited!",
      });
      return;
    }

    setInvites((prev) => [...prev, { username: inviteInput.trim(), authType }]);
    setInviteInput("");
    setErrors({ ...errors, usernames: "" });
  };

  return trigger ? (
    <div
      className={`${styles.overlay} ${isDarkMode ? styles.darkMode : ""}`}
      onClick={() => setTrigger(false)}
    >
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
          <CloseButton
            color={isDarkMode ? "white" : "black"}
            onClick={() => setTrigger(false)}
          />
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
          {deleteSuccess && <Alert variant="success">{deleteSuccess}</Alert>}
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          <Form
            onSubmit={handleCreateCompetition}
            data-bs-theme={isDarkMode && "dark"}
          >
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
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </Form.Group>
            <Form.Group controlId="formInvitePeople">
              <Form.Label>Invite Usernames</Form.Label>
              <div className={styles.inviteContainer}>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={inviteInput}
                  onChange={(e) => {
                    setInviteInput(e.target.value);
                    setErrors({ ...errors, usernames: "" });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleInvite();
                    }
                  }}
                  isInvalid={!!errors.usernames}
                />
                <Form.Select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value)}
                  className={styles.authTypeSelect}
                >
                  <option value="EMAIL">Competify</option>
                  <option value="DISCORD">Discord</option>
                </Form.Select>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    handleInvite();
                  }}
                  className={styles.plusButton}
                >
                  ➕
                </div>
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.usernames}
              </Form.Control.Feedback>
              <ListGroup>
                {invites.map((invite) => (
                  <div
                    className={styles.inviteeContainer}
                    key={`${invite.username}-${invite.authType}`}
                  >
                    <ListGroupItem className={styles.listGroupItem}>
                      {invite.username}
                      {invite.authType === "DISCORD" && (
                        <span className={styles.authType}>@DISCORD</span>
                      )}
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
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Numerical"
                checked={isNumerical}
                onChange={() => setIsNumerical(!isNumerical)}
              />
            </Form.Group>
            {isNumerical && (
              <>
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
              </>
            )}

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
              {competitionData && (
                <a
                  className={styles.deleteCompetitionLink}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCompetition(competitionData.id);
                  }}
                >
                  Delete Competition
                </a>
              )}
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
