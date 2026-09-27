import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../site-header";
import styles from "../home.module.css";

export const metadata: Metadata = {
  title: "Login — PEWSS",
  description: "Student and faculty access to the Phenomenology East and West Summer School. Portals coming soon.",
};

export default function LoginPage() {
  return (
    <div className={`${styles.home} ${styles.applicationPage}`}>
      <a href="#login" className="skip-link">Skip to content</a>
      <SiteHeader light />
      <main id="login" className={styles.applicationIntro}>
        <p className={styles.eyebrow}>The PEWSS community</p>
        <h1>Your Summer School,<br />in one place.</h1>
        <p>Student and faculty portals are coming soon. This is where you will sign in to access your Summer School resources.</p>
        <div className={styles.loginOptions}>
          <section className={styles.loginOption} aria-labelledby="student-login-title">
            <h2 id="student-login-title">Students</h2>
            <p>Your programme, readings, workshop group, and paper feedback—all together.</p>
            <p className={styles.portalStatus} id="student-login-status">Coming soon</p>
            <button type="button" className={styles.button} disabled aria-describedby="student-login-status">Student login</button>
          </section>
          <section className={styles.loginOption} aria-labelledby="faculty-login-title">
            <h2 id="faculty-login-title">Faculty</h2>
            <p>Your sessions, teaching resources, assigned papers, and feedback tasks.</p>
            <p className={styles.portalStatus} id="faculty-login-status">Coming soon</p>
            <button type="button" className={styles.button} disabled aria-describedby="faculty-login-status">Faculty login</button>
          </section>
        </div>
        <p>Login is not available yet. Access details will be shared when the portals are ready.</p>
        <Link href="/" className={`${styles.button} ${styles.darkButton}`}>Back to the Summer School <span aria-hidden="true">→</span></Link>
      </main>
    </div>
  );
}
