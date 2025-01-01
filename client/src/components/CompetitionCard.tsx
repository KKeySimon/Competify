import { Competition } from "../../types";
import styles from "./CompetitionCard.module.css";

function CompetitionCard({
  joinedAt,
  name,
  createdBy,
  profilePictureUrl,
  createdAt,
  upcoming,
  participantCount,
  isDarkMode,
  viewPublic,
}: Competition & { isDarkMode: boolean; viewPublic: boolean }) {
  const joinDate = new Date(joinedAt);
  const localJoinDate = joinDate.toLocaleDateString();
  const localCreateDate = new Date(createdAt).toLocaleDateString();
  const upcomingDate =
    upcoming && upcoming.length > 0 ? new Date(upcoming[0]) : null;
  const localUpcomingDate = upcomingDate
    ? upcomingDate.toLocaleDateString()
    : "No upcoming events";

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
          <img src={profilePictureUrl} alt={`${createdBy}'s profile`} />
        </div>
      </div>
      <div className={styles.joinCreateTag}>
        {!viewPublic && <h4>Joined At:</h4>}
        <h4>Created At:</h4>
        <h4>Participants:</h4>
        <h4>Upcoming:</h4>
      </div>
      <div className={styles.joinCreateDate}>
        {!viewPublic && <h4>{localJoinDate}</h4>}
        <h4>{localCreateDate}</h4>
        <h4>{participantCount}</h4>
        <h4>{localUpcomingDate}</h4>
      </div>
    </div>
  );
}

export default CompetitionCard;
