import styles from "./HomePage.module.css";
import Typed from "typed.js";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "react-bootstrap-icons";

function HomePage() {
  const el = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        "Competitive",
        "Challenges",
        "Competitions",
        "Champions",
        "Competify",
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
              onClick={(_) => navigate("/sign-up")}
              className={styles.registerButton}
            >
              Register
            </button>
          </div>
          <Trophy size={150} />
        </div>
        {/* <div>
          <h3>Competify Features</h3>
          <a>Invite friends!</a>
          <a>Vote on who made the most progress!</a>
          <a>Find like-minded individuals and motivate each other!</a>
        </div> */}
      </div>
    </>
  );
}
export default HomePage;
