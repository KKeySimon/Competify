import { Link, useLocation } from "react-router-dom";
import { LoginProps, Invite } from "../../types";
import styles from "./Navbar.module.css";
import { Bell } from "react-bootstrap-icons";
import { useEffect, useRef, useState } from "react";
import { Image } from "react-bootstrap";
import NotificationsPopup from "./NotificationsPopup";

function Navbar({ isLoggedIn, setIsLoggedIn }: LoginProps) {
  const [bellClicked, setBellClicked] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Invite[]>([]);
  const [profilePicture, setProfilePicture] = useState<string>("");
  // No need to set all keys to false, since if key doesn't exist,
  // it returns undefined. !undefined == True. And is set that way

  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();

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

  const removeNotification = (key: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => {
        const notificationKey =
          notification.inviteeId + ";" + notification.competitionId;
        return notificationKey !== key;
      })
    );
  };

  return (
    <div className={styles.navbar}>
      <Link to="/" className={location.pathname === "/" ? styles.active : ""}>
        Home
      </Link>
      <Link
        to="/competition"
        className={location.pathname === "/competition" ? styles.active : ""}
      >
        Competitions
      </Link>
      {isLoggedIn ? (
        <div ref={dropdownRef} className={styles.logoutNotif}>
          <Bell
            onClick={() => {
              setBellClicked(!bellClicked);
            }}
            className={styles.bell}
          />
          {notifications.length > 0 && (
            <span className={styles.notificationCount}>
              {notifications.length}
            </span>
          )}

          <NotificationsPopup
            notifications={notifications}
            bellClicked={bellClicked}
            removeNotification={removeNotification}
          />

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
