import { CloseButton, Form, Button, Alert } from "react-bootstrap";
import { PopupProps, Submission } from "../../types";
import { useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./SubmissionPopup.module.css";

interface SubmissionPopupProps extends PopupProps {
  isNumerical: boolean;
  eventId: number;
  handleSubmitSubmission: (newSubmission: Submission) => void;
}

function SubmissionPopup({
  trigger,
  setTrigger,
  isNumerical,
  eventId,
  handleSubmitSubmission,
}: SubmissionPopupProps) {
  const { id } = useParams();
  const [submission, setSubmission] = useState<string | number>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [inputType, setInputType] = useState("text");
  // TODO: NOT COMPELTED
  async function handleCreateSubmission(e: React.FormEvent) {
    e.preventDefault();
    console.log(submission);

    await fetch(
      "http://localhost:3000/api/competition/" +
        id +
        "/events/" +
        eventId +
        "/submit",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: { submission, inputType } }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          // TODO : Update other errors to include this
          // TODO: errorMessage has not been tested yet.
          const errorMessage = response.text();
          const errorCode = response.status;
          throw new Error(
            `Submission Error! Code: ${errorCode}, Message: ${errorMessage}`
          );
        }
        setSuccess(true);
        setTimeout(() => {
          setTrigger(false);
          setSuccess(false);
          setSubmission("");
        }, 1000);
        return response.json();
      })
      .then((data: Submission) => {
        handleSubmitSubmission(data);
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSubmission(value);
  };

  return trigger ? (
    <div>
      <div className={styles.header}>
        <h3>Create a submission</h3>
        <CloseButton onClick={() => setTrigger(false)} />
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && (
        <Alert variant="success">Submission successfully added!</Alert>
      )}
      <Form onSubmit={handleCreateSubmission}>
        {!isNumerical && (
          <Form.Group className="mb-3">
            <Form.Label>Select Input Type</Form.Label>
            <div>
              <Form.Check
                type="radio"
                label="Text"
                name="inputType"
                value="text"
                checked={inputType === "text"}
                onChange={(e) => setInputType(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="URL"
                name="inputType"
                value="url"
                checked={inputType === "url"}
                onChange={(e) => setInputType(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Image URL"
                name="inputType"
                value="image"
                checked={inputType === "image"}
                onChange={(e) => setInputType(e.target.value)}
              />
            </div>
          </Form.Group>
        )}
        <Form.Group className="mb-3" controlId="formSubmission">
          <Form.Label>Enter Progress</Form.Label>
          <Form.Control
            type={isNumerical ? "number" : "text"}
            onChange={handleInputChange}
          />
        </Form.Group>

        {!isNumerical && inputType === "image" && (
          <div>
            <h5>Image Preview:</h5>
            <img
              src={submission as string}
              alt="Preview"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        )}
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  ) : (
    ""
  );
}

export default SubmissionPopup;
