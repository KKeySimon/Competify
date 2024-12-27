import styles from "./HomePage.module.css";
import Typed from "typed.js";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "react-bootstrap-icons";

function HomePage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const el = useRef(null);
  const navigate = useNavigate();

  const tutorialRef = useRef<HTMLDivElement>(null);

  const scrollToTutorial = () => {
    if (tutorialRef.current) {
      tutorialRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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
              <a onClick={scrollToTutorial} className={styles.scrollLink}>
                First time using Competify?
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
          <div ref={tutorialRef} className={styles.tutorialContainer}>
            <h1 className={styles.title}>How to Use Competify</h1>
            <ol className={styles.tutorialList}>
              <li>
                <strong>Sign Up or Log In:</strong>
                <p>
                  Create your account using either email or Discord. For access
                  to exclusive Discord features, such as submitting entries or
                  viewing results directly on Discord, sign up with Discord or
                  link your Discord account via the profile page after creating
                  a Competify account.
                </p>
              </li>
              <li>
                <strong>Join or Create Competitions:</strong>
                <p>
                  Explore existing competitions or start your own. When creating
                  a competition, provide a name and description, invite
                  registered users, set a start time (must be in the future),
                  and decide if it should be a recurring event.
                </p>
                <p>
                  - Numerical Competitions: Submit a number, and winners will be
                  determined automatically based on the set priority (e.g.,
                  highest or lowest value wins).
                </p>
                <p>
                  - Non-Numerical Competitions: Submit entries for others to
                  vote on. Votes are tallied, and the submission with the most
                  votes wins!
                </p>
              </li>
              <li>
                <strong>Submit Entries and Vote:</strong>
                <p>
                  Check out what other users submitted and make sure to submit
                  as well before the deadline! (Don't forget to vote if the
                  competition is non-numerical)
                </p>
              </li>
              <li>
                <strong>Check Your Profile:</strong>
                <p>
                  Track your achievements by viewing the number of competitions
                  you've won, review past submissions, and personalize your
                  profile to reflect your journey.
                </p>
              </li>
              <li>
                <strong>Stay Engaged:</strong>
                <p>
                  Participate regularly in competitions to develop strong
                  habits, reach your goals, and push your limits.
                </p>
              </li>
            </ol>
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
