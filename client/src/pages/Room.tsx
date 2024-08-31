import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Room() {
  const { id } = useParams();
  const [error, setError] = useState<string>("");
  useEffect(() => {
    fetch("http://localhost:3000/api/room/" + id, {
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 404) {
          throw new Error("Room not found");
        } else if (response.status === 401) {
          throw new Error("No permissions for this room");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err.message);
        setError(err.message);
      });
  });

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>{id}</div>;
}

export default Room;
