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
        console.log(data);
        setRooms(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);
  return (
    <div>
      <h1>Rooms</h1>
      <Button onClick={() => setTrigger(true)}>New Room</Button>
      <NewRoomPopup trigger={trigger} setTrigger={setTrigger} />
      <ul className={styles.list}>
        {rooms.map((room) => (
          <Link className={styles.link} to={room.roomId.toString()}>
            <RoomCard
              key={room.roomId}
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
