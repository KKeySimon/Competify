import { Competition } from "../../types";
import styles from "./CompetitionCard.module.css";

function CompetitionCard({
  joinedAt,
  name,
  createdBy,
  profilePictureUrl,
  createdAt,
  isDarkMode,
}: Competition & { isDarkMode: boolean }) {
  const joinDate = new Date(joinedAt);
  const localJoinDate = joinDate.toLocaleDateString();
  const localCreateDate = new Date(createdAt).toLocaleDateString();

  return (
    <div
      className={`${styles.card} ${
        isDarkMode ? styles.darkCard : styles.lightCard
      }`}
    >
      <div className={styles.header}>
        <h3>{name}</h3>
        <div className={styles.createdBy}>
          <h4>{createdBy}</h4>
          <img src={profilePictureUrl} />
        </div>
      </div>
      <div className={styles.joinCreateTag}>
        <h4>Joined At:</h4>
        <h4>Created At:</h4>
      </div>
      <div className={styles.joinCreateDate}>
        <h4>{localJoinDate}</h4>
        <h4>{localCreateDate}</h4>
      </div>
    </div>
  );
}

export default CompetitionCard;
