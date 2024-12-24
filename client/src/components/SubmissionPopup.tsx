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
      `${import.meta.env.VITE_SERVER_URL}/api/competition/ ` +
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
      .then(async (response) => {
        if (!response.ok) {
          // TODO : Update other errors to include this
          // TODO: errorMessage has not been tested yet.
          const errorMessage = await response.text();
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
          <div className={styles.inputTypeGroup}>
            <label className={styles.inputTypeLabel}>Select Input Type</label>
            <div className={styles.radioButtons}>
              <div
                className={`${styles.radioButton} ${
                  inputType === "text" ? styles.selected : ""
                }`}
                onClick={() => setInputType("text")}
              >
                <span className={styles.radioBox}>Text</span>
              </div>
              <div
                className={`${styles.radioButton} ${
                  inputType === "url" ? styles.selected : ""
                }`}
                onClick={() => setInputType("url")}
              >
                <span className={styles.radioBox}>URL</span>
              </div>
              <div
                className={`${styles.radioButton} ${
                  inputType === "image" ? styles.selected : ""
                }`}
                onClick={() => setInputType("image")}
              >
                <span className={styles.radioBox}>Image URL</span>
              </div>
            </div>
          </div>
        )}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="progressInput">
            Enter Progress
          </label>
          {isNumerical ? (
            <input
              id="progressInput"
              className={styles.inputControl}
              type="number"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setSubmission(value);
              }}
            />
          ) : (
            <textarea
              id="progressInput"
              className={styles.textAreaControl}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const value = e.target.value;
                setSubmission(value);
              }}
            />
          )}
        </div>

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
        <Button variant="primary" type="submit" className={styles.submitButton}>
          Submit
        </Button>
      </Form>
    </div>
  ) : (
    ""
  );
}

export default SubmissionPopup;
