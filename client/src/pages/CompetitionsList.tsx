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

function CompetitionsList({
  isLoggedIn,
  isDarkMode,
}: CompetitionsListProps & { isDarkMode: boolean }) {
  const [trigger, setTrigger] = useState(false);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [sortCriteria, setSortCriteria] = useState<string>("joinedAt");
  const [isAscending, setIsAscending] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/competition`, {
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

  const sortedCompetitions = [...competitions].sort((a, b) => {
    let comparison = 0;

    switch (sortCriteria) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "joinedAt":
        comparison =
          new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        break;
      case "createdAt":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "upcoming":
        const aUpcomingDate =
          a.upcoming && a.upcoming.length > 0 ? new Date(a.upcoming[0]) : null;
        const bUpcomingDate =
          b.upcoming && b.upcoming.length > 0 ? new Date(b.upcoming[0]) : null;

        if (aUpcomingDate && bUpcomingDate) {
          comparison = aUpcomingDate.getTime() - bUpcomingDate.getTime();
        } else if (aUpcomingDate) {
          comparison = -1;
        } else if (bUpcomingDate) {
          comparison = 1;
        } else {
          comparison = 0;
        }
        break;
      case "participantCount":
        comparison = a.participantCount - b.participantCount; // Add this line
        break;
      default:
        break;
    }

    return isAscending ? comparison : -comparison;
  });

  const handleSort = (criteria: string) => {
    if (sortCriteria === criteria) {
      setIsAscending(!isAscending);
    } else {
      setSortCriteria(criteria);
      setIsAscending(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Competition</h1>
        <Button onClick={() => setTrigger(true)}>New Competition</Button>
      </div>
      <NewCompetitionPopup
        trigger={trigger}
        setTrigger={setTrigger}
        isDarkMode={isDarkMode}
      />
      <div className={styles.sortButtons}>
        <Button
          className={sortCriteria === "name" ? styles.selected : ""}
          onClick={() => handleSort("name")}
        >
          Sort by Name {sortCriteria === "name" && (isAscending ? "↑" : "↓")}
        </Button>
        <Button
          className={sortCriteria === "joinedAt" ? styles.selected : ""}
          onClick={() => handleSort("joinedAt")}
        >
          Sort by Join Date{" "}
          {sortCriteria === "joinedAt" && (isAscending ? "↑" : "↓")}
        </Button>
        <Button
          className={sortCriteria === "createdAt" ? styles.selected : ""}
          onClick={() => handleSort("createdAt")}
        >
          Sort by Creation Date{" "}
          {sortCriteria === "createdAt" && (isAscending ? "↑" : "↓")}
        </Button>
        <Button
          className={sortCriteria === "upcoming" ? styles.selected : ""}
          onClick={() => handleSort("upcoming")}
        >
          Sort by Upcoming{" "}
          {sortCriteria === "upcoming" && (isAscending ? "↑" : "↓")}
        </Button>
        <Button
          className={sortCriteria === "participantCount" ? styles.selected : ""}
          onClick={() => handleSort("participantCount")}
        >
          Sort by Participant Count{" "}
          {sortCriteria === "participantCount" && (isAscending ? "↑" : "↓")}
        </Button>
      </div>
      <ul className={styles.list}>
        {sortedCompetitions.map((competition) => (
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
              profilePictureUrl={competition.profilePictureUrl}
              createdAt={competition.createdAt}
              upcoming={competition.upcoming}
              participantCount={competition.participantCount}
              isDarkMode={isDarkMode}
            />
          </Link>
        ))}
      </ul>
    </div>
  );
}

export default CompetitionsList;
