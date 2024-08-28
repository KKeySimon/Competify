import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import NewRoomPopup from "./NewRoomPopup";
import { Room } from "../../types";

function RoomsList() {
  const [trigger, setTrigger] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

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
          <li key={room.roomId}>{room.roomName}</li>
        ))}
      </ul>
    </div>
  );
}

export default RoomsList;
