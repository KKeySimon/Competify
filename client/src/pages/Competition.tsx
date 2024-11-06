import { useEffect, useState } from "react";
import { Button, Image } from "react-bootstrap";
import { useParams } from "react-router-dom";
import SubmissionPopup from "../components/SubmissionPopup";
import { ICompetition, Submission } from "../../types";
import { Gear } from "react-bootstrap-icons";
import NewCompetitionPopup from "../components/NewCompetitionPopup";
import styles from "./Competition.module.css";
import { formatDistanceToNow } from "date-fns";

function Competition() {
  interface Event {
    competition_id: number;
    id: number;
    date: Date;
    upcoming: boolean;
    winner_id: number | undefined;
    submissions: Submission[];
    priority: string;
    is_numerical: boolean;
  }

  interface PreviousEvent extends Event {
    winner: {
      username: string;
    };
  }

  interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }

  const { id } = useParams();
  const [competition, setCompetition] = useState<ICompetition | undefined>(
    undefined
  );
  const [upcoming, setUpcoming] = useState<Event | undefined>();
  const [error, setError] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [trigger, setTrigger] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [previousEvents, setPreviousEvents] = useState<PreviousEvent[]>([]);
  const [popupTrigger, setPopupTrigger] = useState(false);

  const handleSubmitSubmission = (newSubmission: Submission) => {
    setSubmissions((prevSubmissions) => {
      const existingIndex = prevSubmissions.findIndex(
        (submission) => submission.user_id === newSubmission.user_id
      );

      if (existingIndex !== -1) {
        const updatedSubmissions = [...prevSubmissions];
        updatedSubmissions[existingIndex] = newSubmission;
        return updatedSubmissions;
      } else {
        return [...prevSubmissions, newSubmission];
      }
    });
  };

  // API call to authenticate competition -> grab upcoming event's id
  // -> grab submissions surrounding upcoming event
  useEffect(() => {
    const fetchCompetitionData = async () => {
      try {
        const competitionResponse = await fetch(
          `http://localhost:3000/api/competition/${id}`,
          {
            credentials: "include",
          }
        );

        if (competitionResponse.status === 404) {
          throw new Error("Competition not found");
        } else if (competitionResponse.status === 401) {
          throw new Error("No permissions for this competition");
        }

        const competitionData = await competitionResponse.json();
        let parsedCompetition = undefined;

        parsedCompetition = {
          ...competitionData,
          start_time: new Date(competitionData.start_time),
          end_time: competitionData.end_time
            ? new Date(competitionData.end_time)
            : undefined,
        };

        console.log(parsedCompetition);
        setCompetition(parsedCompetition);

        const eventsResponse = await fetch(
          `http://localhost:3000/api/competition/${id}/events/upcoming`,
          {
            credentials: "include",
          }
        );
        if (!eventsResponse.ok) {
          throw new Error("Error getting upcoming event");
        }
        const eventsData: Event = await eventsResponse.json();
        if (eventsData) {
          const parsedEvents = {
            ...eventsData,
            date: new Date(eventsData.date),
          };
          setUpcoming(parsedEvents);

          const submissionsResponse = await fetch(
            `http://localhost:3000/api/competition/${id}/events/${eventsData.id}`,
            {
              credentials: "include",
            }
          );
          if (!submissionsResponse.ok) {
            throw new Error("Error getting submissions");
          }
          const submissionsData: Submission[] =
            await submissionsResponse.json();
          setSubmissions(submissionsData);
        }
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    fetchCompetitionData();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (upcoming) {
        const now = new Date();
        const timeDiff = upcoming.date.getTime() - now.getTime();

        if (timeDiff > 0) {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

          setTimeLeft({
            days,
            hours,
            minutes,
            seconds,
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
    // This must be added to dependency array as without it, interval
    // has no access to state for some reason, I'm guessing it snapshots the
    // state and keeps using it. So even with a reference to upcoming, we need
    // to add this dependency array so the interval is set after competition is fetched
  }, [upcoming]);

  // API call to grab all (previous) events for the competition
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/competition/${id}/events/`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          const errorMessage = response.text();
          const errorCode = response.status;
          throw new Error(
            `Grabbing Events Error! Code: ${errorCode}, Message: ${errorMessage}`
          );
        }
        const data: PreviousEvent[] = await response.json();
        const parsedData = data.map((event) => ({
          ...event,
          date: new Date(event.date),
        }));
        setPreviousEvents(parsedData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllEvents();
  }, [id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {competition && (
        <div className={styles.container}>
          <div>
            <div className={styles.header}>
              <h1>{competition.name}</h1>
              <Gear
                className={styles.gear}
                size={25}
                onClick={() => setPopupTrigger(true)}
              />
              {popupTrigger && (
                <NewCompetitionPopup
                  trigger={popupTrigger}
                  setTrigger={setPopupTrigger}
                  competitionData={competition}
                />
              )}
            </div>
            {upcoming ? (
              <div>
                <ul>
                  {submissions.map((submission) => (
                    <li key={submission.user_id}>
                      {upcoming.is_numerical
                        ? submissions
                            .sort((a, b) => {
                              if (upcoming.priority === "HIGHEST") {
                                return b.content_number - a.content_number; // Sort descending
                              } else {
                                return a.content_number - b.content_number; // Sort ascending
                              }
                            })
                            .map((submission) => (
                              <li key={submission.id}>
                                {submission.belongs_to.username}:{" "}
                                {submission.content_number}
                              </li>
                            ))
                        : submissions.map((submission) => (
                            <li key={submission.id}>
                              {submission.belongs_to.username}:{" "}
                              {submission.content}
                            </li>
                          ))}
                    </li>
                  ))}
                </ul>
                <div className={styles.deadline}>
                  <p className={styles.countdown}>
                    Upcoming Deadline:
                    <span className={styles.timeUnit}>
                      {timeLeft && (
                        <>
                          {timeLeft.days}
                          <span className={styles.label}>days</span>
                          {timeLeft.hours}
                          <span className={styles.label}>hours</span>
                          {timeLeft.minutes}
                          <span className={styles.label}>minutes</span>
                          {timeLeft.seconds}
                          <span className={styles.label}>seconds</span>
                        </>
                      )}
                    </span>
                  </p>
                </div>
                <Button onClick={() => setTrigger(true)}>
                  Create/Update Submission
                </Button>
                <SubmissionPopup
                  trigger={trigger}
                  setTrigger={setTrigger}
                  isNumerical={competition.is_numerical}
                  eventId={upcoming?.id}
                  handleSubmitSubmission={handleSubmitSubmission}
                />
              </div>
            ) : (
              <div>No more upcoming events!</div>
            )}

            <div>Previous Competition Winners</div>
            {previousEvents && (
              <div>
                <ul>
                  {previousEvents.map((event) => (
                    <li key={event.id}>
                      Date: {event.date.toLocaleDateString()}; Winner:{" "}
                      {event.winner ? event.winner.username : "None"}
                      <ul>
                        {event.submissions.map((submission) => (
                          <li key={submission.id}>
                            {submission.id}: {submission.content}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className={styles.participants}>
            <h3>Users</h3>
            <ul>
              {competition.users_in_competitions
                .filter((uic) =>
                  submissions.some(
                    (submission) => submission.user_id === uic.user.id
                  )
                ) // Users with submissions
                .map((uic) => {
                  const userSubmissions = submissions.filter(
                    (submission) => submission.user_id === uic.user.id
                  );
                  return (
                    <li key={uic.user.id}>
                      <span
                        style={{
                          color: "green", // Always green for users with submissions
                        }}
                      >
                        {uic.user.username}
                      </span>
                      <Image
                        className={styles.profilePicture}
                        src={uic.user.profile_picture_url}
                      />
                      <span>
                        {userSubmissions.map((submission) => (
                          <span key={submission.id}>
                            {` - Submitted ${formatDistanceToNow(
                              new Date(submission.created_at),
                              { addSuffix: true }
                            )}`}
                          </span>
                        ))}
                      </span>
                    </li>
                  );
                })}
              {competition.users_in_competitions
                .filter(
                  (uic) =>
                    !submissions.some(
                      (submission) => submission.user_id === uic.user.id
                    )
                )
                .map((uic) => (
                  <li key={uic.user.id}>
                    <span
                      style={{
                        color: "black",
                      }}
                    >
                      {uic.user.username}
                    </span>
                    <Image
                      className={styles.profilePicture}
                      src={uic.user.profile_picture_url}
                    />
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Competition;
