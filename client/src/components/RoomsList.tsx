import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import NewRoomPopup from "./NewRoomPopup";
import RoomCard from "./RoomCard";
import { Room } from "../../types";
import { useNavigate } from "react-router-dom";

interface RoomsListProps {
  isLoggedIn: boolean;
}

function RoomsList({ isLoggedIn }: RoomsListProps) {
  const [trigger, setTrigger] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    console.log(isLoggedIn);
    if (!isLoggedIn) {
      navigate("/");
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
      <ul>
        {rooms.map((room) => (
          <RoomCard
            key={room.roomId}
            userId={room.userId}
            joinedAt={room.joinedAt}
            roomId={room.roomId}
            roomName={room.roomName}
            createdBy={room.createdBy}
          />
        ))}
      </ul>
    </div>
  );
}

export default RoomsList;
