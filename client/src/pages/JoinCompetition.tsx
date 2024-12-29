import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function JoinCompetition({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { inviteToken } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const joinCompetition = async () => {
      if (!isLoggedIn) {
        alert("Create an account or log in to join a competition!");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_SERVER_URL
          }/api/competition/join/${inviteToken}`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (response.ok) {
          alert("You have successfully joined the competition!");
          navigate("/competition");
        } else {
          const errorData = await response.json();
          alert(errorData.message);
          navigate("/competition");
        }
      } catch (error) {
        console.error("Error joining competition:", error);
        alert("An error occurred while joining the competition.");
        navigate("/competition");
      }
    };

    if (inviteToken) {
      joinCompetition();
    }
  }, [inviteToken, navigate]);

  return <div>Joining competition...</div>;
}

export default JoinCompetition;
