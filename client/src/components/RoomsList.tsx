import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import NewRoomPopup from "./NewRoomPopup";

function RoomsList() {
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/room", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);
  return (
    <div>
      <Button onClick={() => setTrigger(true)}>New Room</Button>
      <NewRoomPopup trigger={trigger} setTrigger={setTrigger} />
    </div>
  );
}

export default RoomsList;
