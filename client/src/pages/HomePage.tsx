import styles from "./HomePage.module.css";
import Typed from "typed.js";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HomePage({
  isLoggedIn,
  isDarkMode,
}: {
  isLoggedIn: boolean;
  isDarkMode: boolean;
}) {
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
    <div>
      <div className={styles.background}>
        <div className={styles.content}>
          <div className={styles.introBlock}>
            <div className={styles.introText}>
              <section className="hero">
                <div className="container">
                  <div
                    className={`${styles.titleTyping} ${
                      isDarkMode ? styles.darkMode : ""
                    }`}
                  >
                    <span ref={el} />
                  </div>
                  <p className="lead">
                    Competify is designed to foster habit-building and motivate
                    individuals through engaging, friendly competitions.
                  </p>
                  <a
                    className={styles.discordLink}
                    href="https://discord.com/oauth2/authorize?client_id=1318987396582215690&scope=bot%20applications.commands&permissions=8"
                  >
                    Add the Competify Discord bot for easy tracking and
                    submissions!
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
              </section>
            </div>
            {isDarkMode ? (
              <img
                src="/logoDarkMode.svg"
                alt="Competify"
                className={`${styles.logo}`}
              />
            ) : (
              <img
                src="/logo.svg"
                alt="Competify"
                className={`${styles.logo}`}
              />
            )}
          </div>
          <section
            className={`py-5 ${styles.featureContainer} ${
              isDarkMode ? styles.darkMode : ""
            }`}
          >
            <div className="container">
              <h2 className="text-center mb-4">Features</h2>
              <div className="row g-4">
                <div className="col-md-4 text-center">
                  <h4>🔥 Engaging Competitions</h4>
                  <p>
                    Create, join, and manage competitions tailored to your
                    interests.
                  </p>
                </div>
                <div className="col-md-4 text-center">
                  <h4>🔼 Track Progress</h4>
                  <p>Submit achievements and view dynamic standings.</p>
                </div>
                <div className="col-md-4 text-center">
                  <h4>🎯 Build Habits</h4>
                  <p>
                    Participate in regular challenges to develop consistent
                    habits.
                  </p>
                </div>
              </div>
              <div className="row g-4 mt-4">
                <div className="col-md-4 text-center">
                  <h4>🔐 Customizable Challenges</h4>
                  <p>Set your own rules, deadlines, and metrics.</p>
                </div>
                <div className="col-md-4 text-center">
                  <h4>🎡 Social Interaction</h4>
                  <p>
                    Invite friends, collaborate, and compete as a community.
                  </p>
                </div>
                <div className="col-md-4 text-center">
                  <h4>🌟 Cross-Platform Compatibility</h4>
                  <p>Log in seamlessly using Discord or email.</p>
                </div>
              </div>
            </div>
          </section>
          <div
            className={`${styles.tutorialContainer} ${
              isDarkMode ? styles.darkMode : ""
            }`}
          >
            <section className="py-4">
              <h2 className="text-center mb-4">How to Use Competify</h2>
              <div className="row">
                <div className="col-md-6">
                  <h5>1. Sign Up or Log In</h5>
                  <p>
                    Create your account using either email or Discord. For
                    access to exclusive Discord features, link your Discord
                    account after creating a Competify account.
                  </p>
                </div>
                <div className="col-md-6">
                  <h5>2. Join or Create Competitions</h5>
                  <p>
                    Explore existing competitions or start your own. Set rules,
                    invite users, and track progress seamlessly.
                  </p>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-md-6">
                  <h5>3. Submit Entries and Vote</h5>
                  <p>
                    Submit your achievements and, in non-numerical competitions,
                    vote for your favorites.
                  </p>
                </div>
                <div className="col-md-6">
                  <h5>4. Track Your Achievements</h5>
                  <p>
                    Check your profile to view past submissions, track your
                    wins, and celebrate your milestones!
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
        <div
          className={`${styles.footer} ${isDarkMode ? styles.darkMode : ""}`}
        >
          <a
            href="https://github.com/KKeySimon/Competify"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginRight: "20px" }}
            className={styles.footerLink}
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
              alt="GitHub Logo"
              className={styles.footerIcon}
            />
          </a>
          Contact Me on Discord @kkey
        </div>
      </div>
    </div>
  );
}
export default HomePage;
