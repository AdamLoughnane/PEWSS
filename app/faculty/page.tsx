import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../site-header";
import styles from "../home.module.css";

export const metadata: Metadata = {
  title: "Faculty — PEWSS 2027",
  description: "Faculty announcements coming soon for (non)Self and Space, the Phenomenology East and West Summer School at University College Cork, 26–29 May 2027.",
};

export default function FacultyPage() {
  return (
    <div className={`${styles.home} ${styles.applicationPage}`}>
      <a href="#faculty" className="skip-link">Skip to content</a>
      <SiteHeader light />
      <main id="faculty" className={styles.applicationIntro}>
        <p className={styles.eyebrow}><span className={styles.themeName}>(non)Self and Space</span> · 26–29 May 2027</p>
        <h1>Faculty</h1>
        <p>Faculty announcements coming soon</p>
        <Link href="/" className={`${styles.button} ${styles.darkButton}`}>Back to the Summer School <span aria-hidden="true">→</span></Link>
      </main>
    </div>
  );
}
