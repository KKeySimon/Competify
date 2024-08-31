import { Room } from "../../types";
import styles from "./RoomCard.module.css";

function RoomCard({ userId, joinedAt, roomId, roomName, createdBy }: Room) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>{roomName}</h2>
        <h2>Created By: {createdBy}</h2>
      </div>
      <div>
        <h4>Joined At: {joinedAt}</h4>
      </div>
    </div>
  );
}

export default RoomCard;