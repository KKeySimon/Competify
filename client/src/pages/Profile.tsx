import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { useParams } from "react-router-dom";

function Profile() {
  const { id } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null
  );
  const [isSelf, setIsSelf] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/profile/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Error fetching profile");
        }
        const data = await response.json();
        setProfilePictureUrl(data.url);
        setIsSelf(data.isSelf);
        setUsername(data.username);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, [id]);
  return (
    <div>
      {profilePictureUrl && (
        <div>
          <h1>{username}</h1>
          <img
            src={profilePictureUrl}
            alt="Profile"
            style={{ maxWidth: "300px", maxHeight: "300px" }}
          />
        </div>
      )}
      {isSelf && (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Upload a new profile picture! (2MB Limit)</Form.Label>
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
      )}
    </div>
  );
}

export default Profile;
