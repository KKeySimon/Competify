import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import NewRoomPopup from "../components/NewRoomPopup";
import RoomCard from "../components/RoomCard";
import { Room } from "../../types";
import { useNavigate, Link } from "react-router-dom";
import styles from "./RoomsList.module.css";

interface RoomsListProps {
  isLoggedIn: boolean;
}

function RoomsList({ isLoggedIn }: RoomsListProps) {
  const [trigger, setTrigger] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetch("http://localhost:3000/api/room", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        return response.json();
      })
      .then((data) => {
        setRooms(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Rooms</h1>
        <Button onClick={() => setTrigger(true)}>New Room</Button>
      </div>
      <NewRoomPopup trigger={trigger} setTrigger={setTrigger} />
      <ul className={styles.list}>
        {rooms.map((room) => (
          <Link
            key={room.roomId}
            className={styles.link}
            to={room.roomId.toString()}
          >
            <RoomCard
              userId={room.userId}
              joinedAt={room.joinedAt}
              roomId={room.roomId}
              roomName={room.roomName}
              createdBy={room.createdBy}
            />
          </Link>
        ))}
      </ul>
    </div>
  );
}

export default RoomsList;
