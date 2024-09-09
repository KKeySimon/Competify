import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import SubmissionPopup from "../components/SubmissionPopup";

function Competition() {
  interface Competition {
    id: number;
    name: string;
    start_time: Date;
    end_time: Date | undefined;
    days_of_week: number | undefined;
    repeats_every: number;
    frequency: string | undefined;
    user_id: number;
    created_at: string;
    updated_at: string;
    is_numerical: boolean;
  }

  interface Event {
    competition_id: number;
    id: number;
    date: Date;
    upcoming: boolean;
    winner_id: number | undefined;
  }

  const { id } = useParams();
  const [competition, setCompetition] = useState<Competition | undefined>(
    undefined
  );
  const [upcoming, setUpcoming] = useState<Event | undefined>();
  const [error, setError] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [trigger, setTrigger] = useState<boolean>(false);
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
        const parsedCompetition = {
          ...competitionData,
          start_time: new Date(competitionData.start_time),
          end_time: competitionData.end_time
            ? new Date(competitionData.end_time)
            : undefined,
        };

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
        const eventsData = await eventsResponse.json();
        const parsedEvents = {
          ...eventsData,
          date: new Date(eventsData.date),
        };
        setUpcoming(parsedEvents);
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
          setError(err.message);
        } else {
          console.log("An unknown error occurred");
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
          setTimeLeft(
            `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds remaining`
          );
        }
      }
    }, 1000);

    return () => clearInterval(interval);
    // This must be added to dependency array as without it, interval
    // has no access to state for some reason, I'm guessing it snapshots the
    // state and keeps using it. So even with a reference to upcoming, we need
    // to add this dependency array so the interval is set after competition is fetched
  }, [upcoming]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {competition && (
        <div>
          <h1>{competition.name}</h1>
          {upcoming && (
            <div>
              <p>Upcoming Deadline: {timeLeft}</p>
              <Button onClick={() => setTrigger(true)}>
                Create Submission
              </Button>
              <SubmissionPopup
                trigger={trigger}
                setTrigger={setTrigger}
                isNumerical={competition.is_numerical}
                eventId={upcoming?.id}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Competition;
