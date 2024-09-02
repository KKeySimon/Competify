import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import NewCompetitionPopup from "../components/NewCompetitionPopup";
import CompetitionCard from "../components/CompetitionCard";
import { Competition } from "../../types";
import { useNavigate, Link } from "react-router-dom";
import styles from "./CompetitionsList.module.css";

interface CompetitionsListProps {
  isLoggedIn: boolean;
}

function CompetitionsList({ isLoggedIn }: CompetitionsListProps) {
  const [trigger, setTrigger] = useState(false);
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetch("http://localhost:3000/api/competition", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        return response.json();
      })
      .then((data) => {
        setCompetitions(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Competition</h1>
        <Button onClick={() => setTrigger(true)}>New Competition</Button>
      </div>
      <NewCompetitionPopup trigger={trigger} setTrigger={setTrigger} />
      <ul className={styles.list}>
        {competitions.map((competition) => (
          <Link
            key={competition.competitionId}
            className={styles.link}
            to={competition.competitionId.toString()}
          >
            <CompetitionCard
              userId={competition.userId}
              joinedAt={competition.joinedAt}
              competitionId={competition.competitionId}
              name={competition.name}
              createdBy={competition.createdBy}
            />
          </Link>
        ))}
      </ul>
    </div>
  );
}

export default CompetitionsList;
