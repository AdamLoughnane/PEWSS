import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../site-header";
import styles from "../home.module.css";
import privacyStyles from "./privacy.module.css";
import { CONTACT_EMAIL } from "../../lib/applications";

export const metadata: Metadata = {
  title: "Website Privacy — PEWSS 2027",
  description: "How PEWSS uses website analytics and handles applications.",
};

export default function PrivacyPage() {
  return (
    <div className={`${styles.home} ${styles.applicationPage}`}>
      <a href="#privacy" className="skip-link">Skip to content</a>
      <SiteHeader light />
      <main id="privacy" className={`${styles.applicationIntro} ${privacyStyles.notice}`}>
        <p className={styles.eyebrow}>Phenomenology East and West Summer School</p>
        <h1>Website privacy</h1>
        <h2>Understanding visits to the website</h2>
        <p>We use Vercel Web Analytics to understand visitor numbers, pages viewed, referring websites, approximate countries, and device and browser types. These are statistical estimates, not visitors’ names or precise locations.</p>
        <p>We also count clicks on application, faculty, practical information and contact links, and when an application is started or successfully submitted. Links shared on Instagram, Bluesky and Facebook, and QR codes on our posters, may include a source label so we can understand which publicity brings people to the site.</p>
        <p>This analytics setup does not use tracking cookies or save attribution in your browser’s storage. A source label is held in memory while you navigate the site. Vercel uses a daily-changing request-derived identifier to estimate visitors; it does not use it to track you across days or websites.</p>
        <p>Application answers, photographs, email addresses and application references are not sent as analytics events. URL query values and fragments are removed from the page addresses we send. Private administrator and login pages are excluded from analytics.</p>
        <p>Read more about <a href="https://vercel.com/docs/analytics/privacy-policy">Vercel Web Analytics privacy</a>.</p>
        <h2>Your application</h2>
        <p>Information and any photograph submitted through the application form are sent to the organising team and stored in its private application dashboard to review your application and contact you about the Summer School. Submitting an application does not create a public profile or subscribe you to a mailing list. Photographs will not be published without separate permission.</p>
        <h2>Contact</h2>
        <p>For questions about your information, contact the organising team at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
        <Link href="/" className={`${styles.button} ${styles.darkButton}`}>Back to the Summer School <span aria-hidden="true">→</span></Link>
      </main>
    </div>
  );
}
