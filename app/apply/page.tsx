import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../site-header";
import styles from "../home.module.css";
import { ApplicationForm } from "./application-form";
import { applicationsEnabled } from "../../lib/applications";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply — (non)Self and Space · PEWSS 2027",
  description: "Apply to (non)Self and Space, the Phenomenology East and West Summer School. Explore selfhood and space at University College Cork, 26–29 May 2027.",
};

export default function ApplyPage() {
  const enabled = applicationsEnabled({
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.APPLICATION_FROM_EMAIL,
    open: process.env.APPLICATIONS_OPEN,
  });
  return (
    <div className={`${styles.home} ${styles.applicationPage}`}>
      <a href="#application" className="skip-link">Skip to content</a>
      <SiteHeader light />
      <main id="application" className={styles.applicationIntro}>
        <p className={styles.eyebrow}><span className={styles.themeName}>(non)Self and Space</span> · 26–29 May 2027</p>
        <h1>Join us at PEWSS 2027—apply today.</h1>
        <p>The inaugural Phenomenology East and West Summer School welcomes MA and PhD students, early-career researchers, and practitioners to University College Cork to explore selfhood, non-self, and space across Western and Asian philosophical traditions.</p>
        <ApplicationForm enabled={enabled} stored={process.env.APPLICATION_STORAGE_ENABLED === "true"} />
        <Link href="/#programme" className={`${styles.button} ${styles.darkButton}`}>Explore the Summer School <span aria-hidden="true">→</span></Link>
      </main>
    </div>
  );
}
