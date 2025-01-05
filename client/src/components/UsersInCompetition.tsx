import { formatDistanceToNow } from "date-fns";
import styles from "./UsersInCompetition.module.css";
import { useNavigate } from "react-router-dom";
import { ICompetition, Invite, Submission } from "../../types";
import { useEffect, useRef, useState } from "react";

function UsersInCompetition({
  competition,
  submissions,
  invites,
  userId,
}: {
  competition: ICompetition;
  submissions: Submission[];
  invites: Invite[];
  userId: number;
}) {
  const navigate = useNavigate();
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [selectedUser, setSelectedUser] = useState<null | {
    id: number;
    username: string;
  }>(null);
  const [users, setUsers] = useState(competition.users_in_competitions);

  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const openContextMenu = (
    event: React.MouseEvent,
    user: { id: number; username: string }
  ) => {
    event.preventDefault();
    setSelectedUser(user);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  };

  const closeContextMenu = () => {
    setSelectedUser(null);
    setContextMenuPosition(null);
  };

  const makeAdmin = async (userId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/competition/${
          competition.id
        }/admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId ? { ...user, is_admin: true } : user
          )
        );
      } else {
        const errorData = await response.json();
        console.error(errorData.message);
      }
    } catch (error) {
      console.error("Error making user admin:", error);
      alert("An error occurred while making the user an admin.");
    } finally {
      closeContextMenu();
    }
  };

  const deleteAdmin = async (userId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/competition/${
          competition.id
        }/admin`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId ? { ...user, is_admin: false } : user
          )
        );
      } else {
        const errorData = await response.json();
        console.error(errorData.message);
      }
    } catch (error) {
      console.error("Error removing admin status:", error);
      alert("An error occurred while removing admin status.");
    } finally {
      closeContextMenu();
    }
  };

  const kickUser = async (userId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/competition/${
          competition.id
        }/kick`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.user_id !== userId)
        );
      } else {
        const errorData = await response.json();
        console.error(errorData.message);
      }
    } catch (error) {
      console.error("Error kicking user:", error);
      alert("An error occurred while trying to kick the user.");
    } finally {
      closeContextMenu();
    }
  };

  const leaveCompetition = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/competition/${
          competition.id
        }/leave`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        alert("You have successfully left the competition!");
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.user_id !== userId)
        );
        navigate("/competition/");
      } else {
        const errorData = await response.json();
        console.error(errorData.message);
      }
    } catch (error) {
      console.error("Error leaving competition:", error);
      alert("An error occurred while leaving the competition.");
    } finally {
      closeContextMenu();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        closeContextMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.participants}>
      <h3>Users</h3>
      <ul>
        <div className={styles.userList}>
          {users
            .filter((uic) =>
              submissions.some(
                (submission) => submission.user_id === uic.user.id
              )
            ) // Users with submissions
            .map((uic) => {
              const userSubmissions = submissions.filter(
                (submission) => submission.user_id === uic.user.id
              );
              return (
                <div
                  onClick={(event) =>
                    openContextMenu(event, {
                      id: uic.user.id,
                      username: uic.user.username,
                    })
                  }
                  className={styles.userContainer}
                  key={uic.user.id}
                >
                  <li>
                    <span
                      style={{
                        color: "green", // Always green for users with submissions
                      }}
                    >
                      {uic.user.username}
                      {competition.created_by.username === uic.user.username ? (
                        <span
                          role="img"
                          aria-label="crown"
                          style={{ marginLeft: "5px" }}
                        >
                          👑
                        </span>
                      ) : uic.is_admin ? (
                        <span
                          role="img"
                          aria-label="admin-shield"
                          style={{ marginLeft: "5px" }}
                        >
                          🛡️
                        </span>
                      ) : null}
                    </span>
                    <img
                      className={styles.profilePicture}
                      src={uic.user.profile_picture_url}
                    />
                    <span>
                      {userSubmissions.map((submission) => (
                        <span key={submission.id}>
                          {submission.created_at === submission.updated_at
                            ? ` - Submitted ${formatDistanceToNow(
                                new Date(submission.created_at),
                                {
                                  addSuffix: true,
                                }
                              )}`
                            : ` - Updated ${formatDistanceToNow(
                                new Date(submission.updated_at),
                                {
                                  addSuffix: true,
                                }
                              )}`}
                        </span>
                      ))}
                    </span>
                  </li>
                </div>
              );
            })}
        </div>
        <div className={styles.userList}>
          {users
            .filter(
              (uic) =>
                !submissions.some(
                  (submission) => submission.user_id === uic.user.id
                )
            )
            .map((uic) => (
              <div
                onClick={(event) =>
                  openContextMenu(event, {
                    id: uic.user.id,
                    username: uic.user.username,
                  })
                }
                className={styles.userContainer}
                key={uic.user.id}
              >
                <li>
                  <span>
                    {uic.user.username}

                    {competition.created_by.username === uic.user.username ? (
                      <span
                        role="img"
                        aria-label="crown"
                        style={{ marginLeft: "5px" }}
                      >
                        👑
                      </span>
                    ) : uic.is_admin ? (
                      <span
                        role="img"
                        aria-label="admin-shield"
                        style={{ marginLeft: "5px" }}
                      >
                        🛡️
                      </span>
                    ) : null}
                  </span>
                  <img
                    className={styles.profilePicture}
                    src={uic.user.profile_picture_url}
                  />
                </li>
              </div>
            ))}
        </div>
      </ul>
      <h5 style={{ marginTop: "20px" }}>Pending Invites</h5>
      <ul>
        {invites.length > 0 ? (
          invites.map((invite) => (
            <li key={invite.invitee.id}>
              <span style={{ color: "black" }}>{invite.invitee.username}</span>
              <img
                className={styles.profilePicture}
                src={invite.invitee.profile_picture_url}
                alt={`${invite.invitee.username}'s profile`}
              />
            </li>
          ))
        ) : (
          <p>No pending invites</p>
        )}
      </ul>
      {contextMenuPosition && selectedUser && (
        <div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          <ul>
            <li onClick={() => navigate(`/profile/${selectedUser.id}`)}>
              View Profile
            </li>
            {competition.created_by.id === userId &&
              competition.created_by.username !== selectedUser.username &&
              (users.find((u) => u.user_id === selectedUser.id)?.is_admin ? (
                <li onClick={() => deleteAdmin(selectedUser.id)}>
                  Remove Admin
                </li>
              ) : (
                <li onClick={() => makeAdmin(selectedUser.id)}>Make Admin</li>
              ))}
            {(competition.created_by.id === userId ||
              users.find((u) => u.user_id === userId)?.is_admin) &&
              competition.created_by.username !== selectedUser.username && (
                <li onClick={() => kickUser(selectedUser.id)}>Kick User</li>
              )}
            {selectedUser.id === userId && (
              <li onClick={() => leaveCompetition()}>Leave Competition</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UsersInCompetition;
