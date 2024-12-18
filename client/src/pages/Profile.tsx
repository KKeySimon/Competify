import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { useParams } from "react-router-dom";
import styles from "./Profile.module.css";
import { Submission } from "../../types";

function Profile() {
  const { id } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null
  );
  const [isSelf, setIsSelf] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]); // To hold the submissions data
  const [wins, setWins] = useState<number>(0);
  const [authType, setAuthType] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    fetch(`${import.meta.env.VITE_SERVER_URL}/api/profile/upload`, {
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
          `${import.meta.env.VITE_SERVER_URL}/api/profile/${id}`,
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
        setSubmissions(data.submissions);
        setWins(data.wins);
        setAuthType(data.authType);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, [id]);

  return (
    <div className={styles.profilePage}>
      {profilePictureUrl && (
        <div className={styles.profileContainer}>
          <div className={styles.profileInfo}>
            <img
              src={profilePictureUrl}
              alt="Profile"
              className={styles.profilePicture}
            />
            <h1 className={styles.username}>
              {username}
              {authType && authType !== "EMAIL" && (
                <span className={styles.authType}>@{authType}</span>
              )}
            </h1>
            <div className={styles.winsBox}>
              <span className={styles.trophyEmoji}>🏆</span>
              <span className={styles.winsNumber}>{wins}</span>
            </div>
          </div>
        </div>
      )}

      {isSelf && (
        <Form onSubmit={handleSubmit} className={styles.uploadForm}>
          <Form.Group controlId="formFile" className={styles.formGroup}>
            <Form.Label>Upload a new profile picture</Form.Label>
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
            <Button
              variant="primary"
              type="submit"
              className={styles.submitButton}
            >
              Upload
            </Button>
          </Form.Group>
        </Form>
      )}
      <div className={styles.submissionsContainer}>
        <h2 className={styles.submissionsTitle}>
          Submissions ({submissions.length})
        </h2>
        {submissions.length > 0 ? (
          <ul className={styles.submissionsList}>
            {submissions.map((submission, index) => (
              <li key={index} className={styles.submissionItem}>
                <div className={styles.submissionContent}>
                  <p>
                    <strong>Content:</strong>{" "}
                    {submission.content || "No content"}
                  </p>
                  <p>
                    <strong>Submission Type:</strong>{" "}
                    {submission.submission_type || "N/A"}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(submission.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No submissions available.</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
