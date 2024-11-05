import { Link, useNavigate } from "react-router-dom";
import { LoginProps, Invite } from "../../types";
import styles from "./Navbar.module.css";
import { Bell } from "react-bootstrap-icons";
import { useEffect, useRef, useState } from "react";
import { Image } from "react-bootstrap";

function Navbar({ isLoggedIn, setIsLoggedIn }: LoginProps) {
  const [bellClicked, setBellClicked] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Invite[]>([]);
  const [profilePicture, setProfilePicture] = useState<string>("");
  // No need to set all keys to false, since if key doesn't exist,
  // it returns undefined. !undefined == True. And is set that way
  const [expandedNotfications, setExpandedNotifications] = useState<
    Record<string, boolean>
  >({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setBellClicked(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setBellClicked]);
  async function handleLogout() {
    await fetch("http://localhost:3000/api/logout", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        setIsLoggedIn(false);
        localStorage.removeItem("userId");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
  const navigate = useNavigate();
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
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        // TODO: Show feedback invite was accepted
        if (accept) {
          navigate("/competition/" + competitionId);
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  useEffect(() => {
    fetch("http://localhost:3000/api/invites", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong while grabbing invites!");
        }
        return response.json();
      })
      .then((data) => {
        setNotifications(data);
      })
      .catch((error) => {
        console.log(error.message);
      });

    fetch("http://localhost:3000/api/profile/me", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Something went wrong while grabbing profile picture"
          );
        }
        return response.json();
      })
      .then((data) => {
        setProfilePicture(data.url);
      });
  }, []);

  return (
    <div className={styles.navbar}>
      <Link to="/">Home</Link>
      <Link to="/competition">Competitions</Link>
      {isLoggedIn ? (
        <div ref={dropdownRef} className={styles.logoutNotif}>
          <Bell
            onClick={() => {
              setBellClicked(!bellClicked);
              setExpandedNotifications({});
            }}
            className={styles.bell}
          />
          {notifications.length > 0 && (
            <span className={styles.notificationCount}>
              {notifications.length}
            </span>
          )}
          {bellClicked && (
            <ul className={styles.notificationBar}>
              {notifications.length !== 0 ? (
                <>
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
                </>
              ) : (
                <li className={styles.notification}>No notifications!</li>
              )}
            </ul>
          )}
          <Link to={`/profile/${localStorage.getItem("userId")}`}>
            <Image className={styles.profilePicture} src={profilePicture} />
          </Link>

          <a onClick={handleLogout}>Logout</a>
        </div>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </div>
  );
}

export default Navbar;
