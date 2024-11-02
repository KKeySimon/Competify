import { useState } from "react";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";

function Profile() {
  const [file, setFile] = useState<File | null>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:3000/api/profile/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Default file input example</Form.Label>
          <Form.Control
            type="file"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const target = e.target;
              if (target.files && target.files.length > 0) {
                const selectedFile = target.files[0];
                const validImageTypes = ["image/jpeg", "image/png"];

                if (!validImageTypes.includes(selectedFile.type)) {
                  alert("Please select a valid image file (JPEG, PNG).");
                  return;
                }

                setFile(selectedFile);
              }
            }}
          />
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
}

export default Profile;
