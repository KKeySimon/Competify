import { CloseButton, Form, Button } from "react-bootstrap";
import { PopupProps } from "../../types";
import { useState } from "react";
import { useParams } from "react-router-dom";

interface SubmissionPopupProps extends PopupProps {
  isNumerical: boolean;
  eventId: number;
}

function SubmissionPopup({
  trigger,
  setTrigger,
  isNumerical,
  eventId,
}: SubmissionPopupProps) {
  const { id } = useParams();
  const [submission, setSubmission] = useState<string | number>("");

  // TODO: NOT COMPELTED
  async function handleCreateSubmission(e: React.FormEvent) {
    e.preventDefault();

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
        body: JSON.stringify({ content: submission }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Submission Error!");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  return trigger ? (
    <div>
      <CloseButton onClick={() => setTrigger(false)} />
      <h1>Create a submission</h1>
      <Form onSubmit={handleCreateSubmission}>
        <Form.Group className="mb-3" controlId="formSubmission">
          <Form.Label>Enter Progress</Form.Label>
          <Form.Control
            type={isNumerical ? "number" : "text"}
            onChange={(e) => {
              setSubmission(e.target.value);
            }}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Create Submission
        </Button>
      </Form>
    </div>
  ) : (
    ""
  );
}

export default SubmissionPopup;
