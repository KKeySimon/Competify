import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Event, EventResponse, Submission } from "../../types";
import styles from "./EventPage.module.css";

function EventPage({ isDarkMode }: { isDarkMode: boolean }) {
  const { competitionId, eventId } = useParams();
  const [eventData, setEventData] = useState<Event | null>(null);
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventResponse = await fetch(
          `${
            import.meta.env.VITE_SERVER_URL
          }/api/competition/${competitionId}/events/${eventId}`,
          { credentials: "include" }
        );

        if (eventResponse.status === 404) {
          throw new Error("Event not found");
        } else if (eventResponse.status === 401) {
          throw new Error("No permissions");
        }

        const eventData: EventResponse = await eventResponse.json();
        setEventData(eventData.event);
        setSubmissions(eventData.submissions);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [competitionId, eventId]);

  if (loading) {
    return (
      <div className={`${styles.loading} ${isDarkMode ? styles.darkMode : ""}`}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.error} ${isDarkMode ? styles.darkMode : ""}`}>
        Error: {error}
      </div>
    );
  }

  if (!eventData) {
    return <div>No event data available</div>;
  }

  return (
    <div className={`${styles.eventPage} ${isDarkMode ? styles.darkMode : ""}`}>
      <h1 className={isDarkMode ? styles.darkMode : ""}>
        {eventData.belongs_to.name}'s{" "}
        {new Date(eventData.date).toLocaleDateString()} Event
      </h1>
      <div
        className={`${styles.eventDetails} ${
          isDarkMode ? styles.darkMode : ""
        }`}
      >
        <h2>Event Details</h2>
        <p>
          <strong>Date:</strong> {new Date(eventData.date).toLocaleString()}
        </p>
        <p>
          <strong>Competition:</strong> {eventData.belongs_to.name}
        </p>
        <p>
          <strong>Priority:</strong> {eventData.priority}
        </p>
        <p>
          <strong>Numerical:</strong> {eventData.is_numerical ? "Yes" : "No"}
        </p>
        <p>
          <strong>Upcoming:</strong> {eventData.upcoming ? "Yes" : "No"}
        </p>
        <p>
          <strong>Winner:</strong>{" "}
          {eventData.winner ? eventData.winner.username : "No Winner"}
        </p>
      </div>

      {submissions && submissions.length > 0 ? (
        <div
          className={`${styles.submissions} ${
            isDarkMode ? styles.darkMode : ""
          }`}
        >
          <h2>Submissions</h2>
          <ul>
            {submissions.map((submission) => (
              <li
                key={submission.id}
                className={isDarkMode ? styles.darkMode : ""}
              >
                <p>
                  <strong>Submitted by:</strong>{" "}
                  {submission.belongs_to.username}
                </p>
                <p>
                  <strong>Content:</strong>{" "}
                  {eventData.is_numerical
                    ? submission.content_number
                    : submission.content}
                </p>
                <p>
                  <strong>Votes:</strong> {submission.vote_count}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No submissions available.</p>
      )}
    </div>
  );
}

export default EventPage;
