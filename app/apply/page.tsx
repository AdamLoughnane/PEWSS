import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../site-header";
import styles from "../home.module.css";

export const metadata: Metadata = {
  title: "Apply — (non)Self and Space · PEWSS 2027",
  description: "Apply to (non)Self and Space, the Phenomenology East and West Summer School. Explore selfhood and space at University College Cork, 26–29 May 2027.",
};

export default function ApplyPage() {
  return (
    <div className={`${styles.home} ${styles.applicationPage}`}>
      <a href="#application" className="skip-link">Skip to content</a>
      <SiteHeader light />
      <main id="application" className={styles.applicationIntro}>
        <p className={styles.eyebrow}><span className={styles.themeName}>(non)Self and Space</span> · 26–29 May 2027</p>
        <h1>Be part of<br />the conversation.</h1>
        <div className={styles.applicationStatus}><span className={styles.statusDot} aria-hidden="true" />Applications opening soon</div>
        <p className="mt-7">The inaugural Phenomenology East and West Summer School welcomes MA and PhD students, early-career researchers, and practitioners to University College Cork to explore selfhood, non-self, and space across Western and Asian philosophical traditions.</p>
        <p>Application dates, fees, and the application form will be published here. Applications are not yet being collected.</p>
        <section className={styles.applicationDetails} aria-labelledby="prepare-title">
          <h2 id="prepare-title">What you can prepare</h2>
          <ul><li>A short biography and your institutional or professional affiliation.</li><li>A brief account of your research interests or creative practice.</li><li>A statement connecting your questions with selfhood and space, and what you would like to explore through presentations, lectures, and close-reading groups.</li><li>Whether you would like to pursue graduate ECTS credit.</li></ul>
        </section>
        <Link href="/#programme" className={`${styles.button} ${styles.darkButton}`}>Explore the Summer School <span aria-hidden="true">→</span></Link>
      </main>
    </div>
  );
}
