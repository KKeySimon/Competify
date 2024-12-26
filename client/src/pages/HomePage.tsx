import styles from "./HomePage.module.css";
import Typed from "typed.js";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "react-bootstrap-icons";

function HomePage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const el = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        "Competitive Challenges",
        "Engaging Competitions",
        "Habit-Building Activities",
        "Teamwork & Growth",
        "Welcome to Competify",
      ],
      smartBackspace: true,
      typeSpeed: 100,
      backSpeed: 100,
      preStringTyped: () => {
        const cursor = document.querySelector(".typed-cursor") as HTMLElement;
        if (cursor) {
          cursor.style.fontSize = "1.2em";
          cursor.style.opacity = "1";
        }
      },
    });

    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.destroy();
    };
  }, []);

  return (
    <>
      <div className={styles.background}>
        <div className={styles.content}>
          <div className={styles.introBlock}>
            <div className={styles.introText}>
              <div className={styles.titleTyping}>
                <span ref={el} />
              </div>
              <a>
                Competify is designed to foster habit-building and motivate
                individuals to push their limits through engaging, friendly
                competitions.
              </a>
              <button
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onClick={(_) =>
                  navigate(isLoggedIn ? "/competition" : "/sign-up")
                }
                className={styles.registerButton}
              >
                {isLoggedIn ? "Start Competing!" : "Register"}
              </button>
            </div>
            <Trophy size={150} />
          </div>
          <div className={styles.featureContainer}>
            <h1 className={styles.title}>Features</h1>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <div className={styles.icon}>🔥</div>
                <div>
                  <strong>Engaging Competitions:</strong>
                  <p>
                    Create, join, and manage competitions tailored to your
                    interests.
                  </p>
                </div>
              </li>
              <li className={styles.listItem}>
                <div className={styles.icon}>🔼</div>
                <div>
                  <strong>Track Progress:</strong>
                  <p>Submit achievements and view dynamic standings.</p>
                </div>
              </li>
              <li className={styles.listItem}>
                <div className={styles.icon}>🎯</div>
                <div>
                  <strong>Build Habits:</strong>
                  <p>
                    Participate in regular challenges to develop consistent
                    habits.
                  </p>
                </div>
              </li>
              <li className={styles.listItem}>
                <div className={styles.icon}>🔐</div>
                <div>
                  <strong>Customizable Challenges:</strong>
                  <p>Set your own rules, deadlines, and metrics.</p>
                </div>
              </li>
              <li className={styles.listItem}>
                <div className={styles.icon}>🎡</div>
                <div>
                  <strong>Social Interaction:</strong>
                  <p>
                    Invite friends, collaborate, and compete as a community.
                  </p>
                </div>
              </li>
              <li className={styles.listItem}>
                <div className={styles.icon}>🌟</div>
                <div>
                  <strong>Cross-Platform Compatibility:</strong>
                  <p>
                    Log in seamlessly using Discord or a traditional email
                    account.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.footer}>
          <a
            href="https://github.com/KKeySimon/Competify"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
              alt="GitHub Logo"
              className={styles.footerIcon}
            />
          </a>
        </div>
      </div>
    </>
  );
}
export default HomePage;
