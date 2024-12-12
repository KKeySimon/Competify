import { useEffect, useState } from "react";
import { Image } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import SubmissionPopup from "../components/SubmissionPopup";
import { ICompetition, Submission, Vote } from "../../types";
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

  interface EventResponse {
    event: Event;
    submissions: Submission[];
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
  const navigate = useNavigate();
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
  const [hasVoted, setHasVoted] = useState<Record<number, boolean>>({});

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
          const submissionsData: EventResponse =
            await submissionsResponse.json();
          console.log(submissionsData);
          setSubmissions(submissionsData.submissions);

          const voteResponse = await fetch(
            `http://localhost:3000/api/competition/${id}/events/${eventsData.id}/votes`,
            {
              credentials: "include",
            }
          );
          if (!voteResponse.ok) {
            throw new Error("Error retrieving user's votes!");
          }
          const voteData: Vote[] = await voteResponse.json();
          console.log(voteData);
          setHasVoted((prevHasVoted) => {
            const updatedVotes = { ...prevHasVoted };
            voteData.forEach((vote) => {
              updatedVotes[vote.submission_id] = true;
            });
            return updatedVotes;
          });
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
        console.log(parsedData);
        setPreviousEvents(parsedData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllEvents();
  }, [id]);

  const handleUpvote = async (submissionId: number) => {
    const voted = hasVoted[submissionId];

    try {
      const response = await fetch(
        `http://localhost:3000/api/competition/${id}/events/${upcoming?.id}/submissions/${submissionId}/vote/submit`,
        {
          method: voted ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            submissionId,
            competitionId: id,
            eventId: upcoming?.id,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((submission) =>
          submission.id === submissionId
            ? {
                ...submission,
                vote_count: submission.vote_count + (voted ? -1 : 1),
              }
            : submission
        )
      );
      setHasVoted((prev) => ({
        ...prev,
        [submissionId]: !voted,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.window}>
      {competition && (
        <div className={styles.container}>
          <div className={styles.contents}>
            <div className={styles.header}>
              <h1>{competition.name}</h1>
              <button
                className={styles.gear}
                onClick={() => setPopupTrigger(true)}
              >
                ⚙️
              </button>
              {popupTrigger && (
                <NewCompetitionPopup
                  trigger={popupTrigger}
                  setTrigger={setPopupTrigger}
                  competitionData={competition}
                />
              )}
            </div>
            <div className={styles.description}>
              <h6>Description</h6>
              <p>
                {competition.description
                  ? competition.description
                  : "No description"}
              </p>
            </div>

            {upcoming ? (
              <div className={styles.leaderboard}>
                <div className={styles.deadline}>
                  <p className={styles.countdown}>
                    Upcoming Deadline:
                    <span className={styles.timeUnit}>
                      {timeLeft && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <div>{new Date(upcoming.date).toLocaleString()}</div>
                          <div>
                            {timeLeft.days}
                            <span className={styles.label}>days</span>
                            {timeLeft.hours}
                            <span className={styles.label}>hours</span>
                            {timeLeft.minutes}
                            <span className={styles.label}>minutes</span>
                            {timeLeft.seconds}
                            <span className={styles.label}>seconds</span>
                          </div>
                        </div>
                      )}
                    </span>
                  </p>
                </div>
                <button
                  className={styles.submitButton}
                  onClick={() => setTrigger(true)}
                >
                  Create/Update Submission
                </button>
                <SubmissionPopup
                  trigger={trigger}
                  setTrigger={setTrigger}
                  isNumerical={competition.is_numerical}
                  eventId={upcoming?.id}
                  handleSubmitSubmission={handleSubmitSubmission}
                />
                <h4>Leaderboard</h4>
                <ul>
                  {upcoming.is_numerical
                    ? submissions
                        .sort((a, b) => {
                          if (upcoming.priority === "HIGHEST") {
                            return b.content_number - a.content_number; // Sort descending
                          } else {
                            return a.content_number - b.content_number; // Sort ascending
                          }
                        })
                        .map((sortedSubmission, index) => {
                          let rankColor;
                          switch (index) {
                            case 0:
                              rankColor = styles.gold;
                              break;
                            case 1:
                              rankColor = styles.silver;
                              break;
                            case 2:
                              rankColor = styles.bronze;
                              break;
                            default:
                              rankColor = styles.defaultRank;
                          }
                          return (
                            <li
                              key={sortedSubmission.id}
                              className={`${styles.submission} ${styles.separator}`}
                            >
                              <div className={styles.submissionHeader}>
                                <span
                                  className={`${styles.rankNumber} ${rankColor}`}
                                >
                                  {index + 1}
                                </span>
                                <div className={styles.created}>
                                  <img
                                    src={
                                      sortedSubmission.belongs_to
                                        .profile_picture_url
                                    }
                                  />
                                  <div>
                                    <h5>
                                      {sortedSubmission.belongs_to.username}
                                    </h5>
                                    <h6>
                                      Created:{" "}
                                      {new Date(
                                        sortedSubmission.created_at
                                      ).toLocaleString()}
                                    </h6>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <span className={styles.submissionBadge}>
                                  1️⃣ Numeric Submission
                                </span>
                                <p>{sortedSubmission.content_number}</p>
                              </div>
                            </li>
                          );
                        })
                    : submissions.map((textSubmission, index) => {
                        let rankColor;
                        switch (index) {
                          case 0:
                            rankColor = styles.gold;
                            break;
                          case 1:
                            rankColor = styles.silver;
                            break;
                          case 2:
                            rankColor = styles.bronze;
                            break;
                          default:
                            rankColor = styles.defaultRank;
                        }
                        return (
                          <li
                            key={textSubmission.id}
                            className={`${styles.submission} ${styles.separator}`}
                          >
                            <div className={styles.submissionHeader}>
                              <span
                                className={`${styles.rankNumber} ${rankColor}`}
                              >
                                {index + 1}
                              </span>
                              <div className={styles.created}>
                                <img
                                  src={
                                    textSubmission.belongs_to
                                      .profile_picture_url
                                  }
                                />
                                <div>
                                  <h5>{textSubmission.belongs_to.username}</h5>
                                  <h6>
                                    Created:{" "}
                                    {new Date(
                                      textSubmission.created_at
                                    ).toLocaleString()}
                                  </h6>
                                </div>
                              </div>
                              <button
                                onClick={() => handleUpvote(textSubmission.id)}
                                className={`${styles.thumbsUp} ${
                                  hasVoted[textSubmission.id]
                                    ? styles.highlighted
                                    : styles.regular
                                }`}
                              >
                                <span>👍 {textSubmission.vote_count}</span>
                              </button>
                            </div>
                            <div>
                              {textSubmission.submission_type === "TEXT" && (
                                <>
                                  <span className={styles.submissionBadge}>
                                    📰 Text Submission
                                  </span>
                                  <p>{textSubmission.content}</p>
                                </>
                              )}
                              {textSubmission.submission_type === "URL" && (
                                <>
                                  <span className={styles.submissionBadge}>
                                    🔗 URL Submission
                                  </span>
                                  <a
                                    href={textSubmission.content}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {textSubmission.content}
                                  </a>
                                </>
                              )}
                              {textSubmission.submission_type ===
                                "IMAGE_URL" && (
                                <>
                                  <span className={styles.submissionBadge}>
                                    🖼️ Image Submission
                                  </span>
                                  <img
                                    src={textSubmission.content}
                                    alt="Submitted content"
                                    className={styles.imageContent}
                                  />
                                </>
                              )}
                            </div>
                          </li>
                        );
                      })}
                </ul>
              </div>
            ) : (
              <div className={styles.competitionOver}>
                Competition Over! Contact the competition creator if you believe
                this is incorrect.
              </div>
            )}

            <div className={styles.previousEvents}>
              <h3>Previous Competitions</h3>
              {previousEvents.length > 0 ? (
                <div className={styles.eventList}>
                  {previousEvents.map((event) => (
                    <button
                      className={styles.eventButton}
                      onClick={() => {
                        navigate(`/competition/${id}/events/${event.id}`);
                      }}
                    >
                      <div key={event.id} className={styles.eventCard}>
                        <div className={styles.eventHeader}>
                          <h4>{event.date.toLocaleDateString()}</h4>
                          <span>
                            Winner:{" "}
                            {event.winner ? (
                              <strong className={styles.winnerName}>
                                {event.winner.username}
                              </strong>
                            ) : (
                              <span>No winner</span>
                            )}
                          </span>
                        </div>
                        <ul className={styles.submissionsList}>
                          {event.submissions
                            .slice(0, 3)
                            .map((submission, index) => {
                              let rankColor;
                              switch (index) {
                                case 0:
                                  rankColor = styles.gold;
                                  break;
                                case 1:
                                  rankColor = styles.silver;
                                  break;
                                case 2:
                                  rankColor = styles.bronze;
                                  break;
                                default:
                                  rankColor = styles.defaultRank;
                              }
                              return (
                                <li
                                  key={submission.id}
                                  className={styles.submissionItem}
                                >
                                  <span
                                    className={`${styles.rankNumber} ${rankColor}`}
                                  >
                                    {index + 1}
                                  </span>
                                  <div className={styles.submissionInfo}>
                                    <Image
                                      className={styles.profilePicture}
                                      src={
                                        submission.belongs_to
                                          .profile_picture_url
                                      }
                                    />
                                    <span>
                                      {submission.belongs_to.username}
                                    </span>
                                  </div>
                                  <div className={styles.submissionContent}>
                                    {submission.submission_type === "TEXT" && (
                                      <p>{submission.content}</p>
                                    )}
                                    {submission.submission_type === "URL" && (
                                      <a
                                        href={submission.content}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {submission.content}
                                      </a>
                                    )}
                                    {submission.submission_type ===
                                      "IMAGE_URL" && (
                                      <img
                                        src={submission.content}
                                        alt="Submitted content"
                                        className={styles.imageContent}
                                      />
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p>No previous competitions available.</p>
              )}
            </div>
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
                        {competition.created_by.username ===
                          uic.user.username && (
                          <span
                            role="img"
                            aria-label="crown"
                            style={{ marginLeft: "5px" }}
                          >
                            👑
                          </span>
                        )}
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
                      {competition.created_by.username ===
                        uic.user.username && (
                        <span
                          role="img"
                          aria-label="crown"
                          style={{ marginLeft: "5px" }}
                        >
                          👑
                        </span>
                      )}
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
