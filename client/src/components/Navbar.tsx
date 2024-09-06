import { Link } from "react-router-dom";
import { LoginProps, Invite } from "../../types";
import styles from "./Navbar.module.css";
import { Bell } from "react-bootstrap-icons";
import { useEffect, useState } from "react";

function Navbar({ isLoggedIn, setIsLoggedIn }: LoginProps) {
  const [bellClicked, setBellClicked] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Invite[]>([]);
  // No need to set all keys to false, since if key doesn't exist,
  // it returns undefined. !undefined == True. And is set that way
  const [expandedNotfications, setExpandedNotifications] = useState<
    Record<string, boolean>
  >({});
  async function handleLogout() {
    await fetch("http://localhost:3000/api/logout", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        setIsLoggedIn(false);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
  async function handleInvite(
    inviterId: number,
    competitionId: number,
    accept: boolean
  ) {
    const method = accept ? "POST" : "DELETE";
    await fetch("http://localhost:3000/api/invites/handle", {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        inviter_id: inviterId,
        competition_id: competitionId,
      }),
    });
  }

  useEffect(() => {
    fetch("http://localhost:3000/api/invites", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        return response.json();
      })
      .then((data) => {
        setNotifications(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  });

  return (
    <div className={styles.navbar}>
      <Link to="/">Home</Link>
      <Link to="/competition">Competitions</Link>
      {isLoggedIn ? (
        <div className={styles.logoutNotif}>
          <Bell onClick={() => setBellClicked(!bellClicked)} />
          {bellClicked && (
            <ul className={styles.notificationBar}>
              {notifications.map((notification) => {
                const key =
                  notification.inviteeId + ";" + notification.competitionId;
                const isExpanded = expandedNotfications[key];
                return (
                  <li
                    key={key}
                    className={styles.notification}
                    onClick={() =>
                      setExpandedNotifications((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                      }))
                    }
                  >
                    {isExpanded ? (
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvite(
                              notification.inviterId,
                              notification.competitionId,
                              true
                            );
                          }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvite(
                              notification.inviterId,
                              notification.competitionId,
                              false
                            );
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      notification.inviterName +
                      " sent you an invite to room " +
                      notification.competitionName
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <a onClick={handleLogout}>Logout</a>
        </div>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </div>
  );
}

export default Navbar;
