import { CloseButton, Form } from "react-bootstrap";
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
        "/event/" +
        eventId +
        "/submit"
    );
  }

  return trigger ? (
    <div>
      <CloseButton onClick={() => setTrigger(false)} />
      <h1>Create a submission</h1>
      <Form onSubmit={handleCreateSubmission}>
        <Form.Group className="mb-3" controlId="formSubmission">
          <Form.Label>Enter Progress</Form.Label>
          <Form.Control
            type={isNumerical ? "text" : "number"}
            onChange={(e) => {
              setSubmission(e.target.value);
            }}
          />
        </Form.Group>
      </Form>
    </div>
  ) : (
    ""
  );
}

export default SubmissionPopup;
