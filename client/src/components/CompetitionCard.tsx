import { Competition } from "../../types";
import styles from "./CompetitionCard.module.css";

function CompetitionCard({
  userId,
  joinedAt,
  competitionId,
  name,
  createdBy,
}: Competition) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>{name}</h2>
        <h2>Created By: {createdBy}</h2>
      </div>
      <div>
        <h4>Joined At: {joinedAt}</h4>
      </div>
    </div>
  );
}

export default CompetitionCard;
