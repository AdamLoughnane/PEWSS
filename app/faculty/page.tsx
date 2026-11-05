import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "../site-header";
import styles from "../home.module.css";
import facultyStyles from "./faculty.module.css";
import { faculty } from "./faculty";

export const metadata: Metadata = {
  title: "Faculty — PEWSS 2027",
  description: "Meet the faculty of (non)Self and Space: Felix Ó Murchadha, Scott Marratto, Yukiko Kuwayama, Jason Dockstader, Alessandro Salice, and Adam Loughnane. Cork, 26–29 May 2027.",
};

export default function FacultyPage() {
  return (
    <div className={`${styles.home} ${styles.applicationPage}`}>
      <a href="#faculty" className="skip-link">Skip to content</a>
      <SiteHeader light />
      <main id="faculty" className={`${styles.container} ${facultyStyles.main}`}>
        <header className={facultyStyles.intro}>
          <p className={styles.eyebrow}><span className={styles.themeName}>(non)Self and Space</span> · 26–29 May 2027</p>
          <h1>Faculty</h1>
          <p className={facultyStyles.lead}>A meeting of perspectives.</p>
          <p className={facultyStyles.description}>Meet the scholars joining us in Cork to explore selfhood, non-self, and space through European phenomenology and Asian philosophical traditions.</p>
          <p className={facultyStyles.updates}>More faculty announcements coming soon. Check back for updates.</p>
        </header>

        <section className={facultyStyles.grid} aria-label="2027 faculty profiles">
          {faculty.map((member) => (
            <article key={member.id} className={facultyStyles.profile} aria-labelledby={`${member.id}-name`}>
              <figure className={facultyStyles.portrait}>
                <div className={facultyStyles.imageFrame}>
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 560px) 112px, 170px"
                    style={{ objectPosition: member.imagePosition }}
                  />
                </div>
                <figcaption><a href={member.photoSource}>{member.photoCredit}</a></figcaption>
              </figure>
              <div className={facultyStyles.heading}>
                <h2 id={`${member.id}-name`}>{member.name}</h2>
                <p className={facultyStyles.affiliation}>{member.affiliation}</p>
              </div>
              <p className={facultyStyles.bio}>{member.bio}</p>
              <a className={facultyStyles.profileLink} href={member.profileUrl} aria-label={`Academic profile: ${member.name}`}>
                Academic profile <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </section>

        <div className={facultyStyles.closing}>
          <div>
            <p className={styles.eyebrow}>Four days of philosophical exchange</p>
            <h2>Join the conversation in Cork.</h2>
            <p>26–29 May 2027 · University College Cork, Ireland</p>
          </div>
          <Link href="/apply" className={`${styles.button} ${styles.goldButton}`}>Apply to PEWSS 2027 <span aria-hidden="true">→</span></Link>
        </div>
      </main>
      <footer className={`${styles.footer} ${facultyStyles.footer}`}>
        <div className={styles.container}>
          <Link href="/" className={styles.footerBrand}>PEWSS<span>Phenomenology East and West Summer School</span></Link>
          <nav aria-label="Footer navigation">
            <Link href="/">Summer School</Link>
            <Link href="/apply">Apply</Link>
            <a href="mailto:adam.loughnane@ucc.ie">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
