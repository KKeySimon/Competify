import { useEffect } from "react";

function RoomsList() {
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
  return <h1>This is Rooms list :)</h1>;
}

export default RoomsList;
