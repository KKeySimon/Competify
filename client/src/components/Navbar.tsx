import { Link, useLocation } from "react-router-dom";
import { Invite, NavbarProps } from "../../types";
import styles from "./Navbar.module.css";
import { Bell, Sun, Moon } from "react-bootstrap-icons";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationsPopup from "./NotificationsPopup";

function Navbar({
  isLoggedIn,
  setIsLoggedIn,
  isDarkMode,
  toggleDarkMode,
}: NavbarProps) {
  const [bellClicked, setBellClicked] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Invite[]>([]);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);
  // No need to set all keys to false, since if key doesn't exist,
  // it returns undefined. !undefined == True. And is set that way

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
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
    await fetch(`${import.meta.env.VITE_SERVER_URL}/api/logout`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        setIsLoggedIn(false);
        navigate("/");
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetch(`${import.meta.env.VITE_SERVER_URL}/api/invites`, {
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

      fetch(`${import.meta.env.VITE_SERVER_URL}/api/profile/me`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Something went wrong while grabbing personal profile"
            );
          }
          return response.json();
        })
        .then((data) => {
          setProfilePicture(data.url);
          setUserId(data.id);
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }, [isLoggedIn]);

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
    <div className={`${styles.navbar} ${isDarkMode ? styles.darkMode : ""}`}>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Link
          to="/"
          className={`${location.pathname === "/" ? styles.active : ""} ${
            isDarkMode ? styles.darkMode : ""
          }`}
        >
          Home
        </Link>
        <Link
          to="/competition"
          className={`${
            location.pathname === "/competition" ? styles.active : ""
          } ${isDarkMode ? styles.darkMode : ""}`}
        >
          Competitions
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <button
          onClick={toggleDarkMode}
          style={{ backgroundColor: "transparent", border: "none" }}
        >
          {!isDarkMode ? <Sun /> : <Moon style={{ color: "white" }} />}
        </button>
        <div>
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
                isDarkMode={isDarkMode}
              />

              <button
                onClick={() => {
                  navigate(`/profile/${userId}`);
                }}
                className={styles.profileButton}
              >
                <img
                  className={styles.profilePicture}
                  src={profilePicture}
                  alt="Profile"
                />
              </button>

              <a onClick={handleLogout}>Logout</a>
            </div>
          ) : (
            <a onClick={() => navigate("/login")}>Login</a>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
