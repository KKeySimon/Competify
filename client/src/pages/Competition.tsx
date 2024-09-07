import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
  }

  const { id } = useParams();
  const [competition, setCompetition] = useState<Competition | undefined>(
    undefined
  );
  const [error, setError] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  useEffect(() => {
    fetch("http://localhost:3000/api/competition/" + id, {
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 404) {
          throw new Error("Competition not found");
        } else if (response.status === 401) {
          throw new Error("No permissions for this competition");
        }
        return response.json();
      })
      .then((data) => {
        const parsedCompetition = {
          ...data,
          start_time: new Date(data.start_time),
          end_time: data.end_time ? new Date(data.end_time) : undefined,
        };
        setCompetition(parsedCompetition);
      })
      .catch((err) => {
        console.log(err.message);
        setError(err.message);
      });
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (competition) {
        const now = new Date();
        const timeDiff = competition.start_time.getTime() - now.getTime();

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
    // state and keeps using it. So even with a reference to competition, we need
    // to add this dependency array so the interval is set after competition is fetched
  }, [competition]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {competition && (
        <div>
          <h1>{competition.name}</h1>
          <p>Upcoming Deadline: {timeLeft}</p>
        </div>
      )}
    </div>
  );
}

export default Competition;
