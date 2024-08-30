import { useEffect } from "react";
import { useParams } from "react-router-dom";

function Room() {
  const { id } = useParams();
  useEffect(() => {
    fetch("http://localhost:3000/api/room/" + id, { credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Bruh");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log("ASDASDSA");
        console.error(err.message);
      });
  });

  return <div>{id}</div>;
}

export default Room;
