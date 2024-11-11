import { useState } from "react";
import styles from "./NotificationsPopup.module.css";
import { Invite } from "../../types";
import { useNavigate } from "react-router-dom";

interface notificationPopupProps {
  notifications: Invite[];
  bellClicked: boolean;
  removeNotification: (key: string) => void;
}
const NotificationsPopup = ({
  notifications,
  bellClicked,
  removeNotification,
}: notificationPopupProps) => {
  const navigate = useNavigate();

  async function handleInvite(
    inviterId: number,
    competitionId: number,
    accept: boolean,
    key: string
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
          throw new Error("Error " + response.status.toString());
        }

        if (accept) {
          showFeedback(key, "Invite accepted! Redirecting...");
          setTimeout(() => {
            setNotificationKey(null);
            navigate("/competition/" + competitionId);
            removeNotification(key);
          }, 3000);
        } else {
          removeNotification(key);
        }
      })
      .catch((error) => {
        showFeedback(key, error.message);
        console.log(error.message);
      });
  }

  const [expandedNotifications, setExpandedNotifications] = useState<
    Record<string, boolean>
  >({});
  const [notificationKey, setNotificationKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const showFeedback = (key: string, message: string) => {
    setNotificationKey(key);
    setMessage(message);
  };

  return (
    <div className={`${styles.popup} ${bellClicked ? styles.visible : ""}`}>
      <ul>
        <h3>Notifications</h3>

        {notifications.map((notification) => {
          const key = notification.inviteeId + ";" + notification.competitionId;
          const isExpanded = expandedNotifications[key];

          return (
            <>
              <li
                key={key}
                className={styles.notificationList}
                onClick={() =>
                  setExpandedNotifications((prev) => ({
                    ...prev,
                    [key]: !prev[key],
                  }))
                }
              >
                <div>
                  {isExpanded ? (
                    <div className={styles.notification}>
                      <div>
                        {`${notification.inviterName} sent you an invite to room ${notification.competitionName}`}
                      </div>
                      <div className={styles.buttonContainer}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvite(
                              notification.inviterId,
                              notification.competitionId,
                              true,
                              key
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
                              false,
                              key
                            );
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ) : (
                    `${notification.inviterName} sent you an invite to room ${notification.competitionName}`
                  )}
                </div>
                {notificationKey === key && (
                  <div className={styles.feedback}>{message}</div>
                )}
              </li>
            </>
          );
        })}
      </ul>
    </div>
  );
};

export default NotificationsPopup;
