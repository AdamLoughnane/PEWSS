import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../site-header";
import styles from "../home.module.css";

export const metadata: Metadata = {
  title: "Apply — PEWSS 2027",
  description: "Application information for the Phenomenology East and West Summer School, 26–29 May 2027 at University College Cork.",
};

export default function ApplyPage() {
  return (
    <div className={`${styles.home} ${styles.applicationPage}`}>
      <a href="#application" className="skip-link">Skip to content</a>
      <SiteHeader light />
      <main id="application" className={styles.applicationIntro}>
        <p className={styles.eyebrow}>Space and Technē · 26–29 May 2027</p>
        <h1>Be part of<br />the conversation.</h1>
        <div className={styles.applicationStatus}><span className={styles.statusDot} aria-hidden="true" />Applications opening soon</div>
        <p className="mt-7">The inaugural Phenomenology East and West Summer School welcomes MA and PhD students, early-career researchers, and practitioners to University College Cork.</p>
        <p>Application dates, fees, and the application form will be published here. Applications are not yet being collected.</p>
        <section className={styles.applicationDetails} aria-labelledby="prepare-title">
          <h2 id="prepare-title">What you can prepare</h2>
          <ul><li>A short biography and your institutional or professional affiliation.</li><li>A brief account of your research interests or creative practice.</li><li>A statement of what you would like to explore at the Summer School.</li><li>Whether you would like to pursue graduate ECTS credit.</li></ul>
        </section>
        <Link href="/#programme" className={`${styles.button} ${styles.darkButton}`}>Explore the Summer School <span aria-hidden="true">→</span></Link>
      </main>
    </div>
  );
}
