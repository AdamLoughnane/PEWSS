import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../site-header";
import shared from "../home.module.css";
import styles from "./practical.module.css";
import { CONTACT_EMAIL } from "../../lib/applications";

export const metadata: Metadata = {
  title: "Practical Information — PEWSS 2027",
  description: "Plan your visit to PEWSS 2027 at University College Cork, 26–29 May. Fees are €150 without ECTS credit or €250 for participants seeking credit, including teaching, refreshments, meals, reception and excursions.",
};

const contact = `mailto:${CONTACT_EMAIL}`;

export default function PracticalInformationPage() {
  return (
    <div className={`${shared.home} ${shared.applicationPage}`}>
      <a href="#practical-information" className="skip-link">Skip to content</a>
      <SiteHeader light />
      <main id="practical-information" className={styles.main}>
        <header className={styles.intro}>
          <p className={shared.eyebrow}><span className={shared.themeName}>(non)Self and Space</span> · PEWSS 2027</p>
          <h1>Practical Information</h1>
          <p>Plan your time in Cork. Here you’ll find participation fees, what’s included, and the practical details for joining the Phenomenology East and West Summer School.</p>
        </header>

        <section className={styles.overview} aria-labelledby="at-a-glance">
          <h2 id="at-a-glance" className={shared.eyebrow}>At a glance</h2>
          <dl>
            <div><dt>When</dt><dd>26–29 May 2027</dd></div>
            <div><dt>Where</dt><dd>University College Cork<span>Cork, Ireland</span></dd></div>
            <div><dt>Participation fee</dt><dd>€150 / €250<span>Without / with ECTS credit</span></dd></div>
          </dl>
          <p>Both fees include teaching, refreshments, meals, reception and excursions.</p>
        </section>

        <nav className={styles.jumpLinks} aria-label="Practical information sections">
          <a href="#fees">Fees</a><a href="#accommodation">Accommodation</a><a href="#travel">Travel</a><a href="#ects">ECTS credit</a><a href="#contact">Contact</a>
        </nav>

        <section id="fees" className={styles.fees} aria-labelledby="fees-title">
          <div className={styles.sectionHeading}><span className={styles.number} aria-hidden="true">01</span><h2 id="fees-title">Fees &amp; what’s included</h2></div>
          <div className={styles.feeOptions}>
            <article><h3>Without ECTS credit</h3><p className={styles.price}>€150<span>per participant</span></p><p>For participants attending the Summer School without seeking academic credit.</p></article>
            <article><h3>Seeking ECTS credit</h3><p className={styles.price}>€250<span>per participant</span></p><p>For participants seeking graduate ECTS credit. Credit requirements will be confirmed separately.</p></article>
          </div>
          <div className={styles.included}><h3>Included in both fees</h3><ul><li>Teaching</li><li>Refreshments</li><li>Meals</li><li>Reception</li><li>Excursions</li></ul></div>
          <p className={styles.note}>Accommodation and travel are separate from the participation fee. Details of meals, the reception and excursions will be shared with the programme.</p>
        </section>

        <section id="accommodation" className={styles.row} aria-labelledby="accommodation-title">
          <div className={styles.sectionHeading}><span className={styles.number} aria-hidden="true">02</span><h2 id="accommodation-title">Accommodation</h2></div>
          <div className={styles.copy}><p className={styles.status}>Details coming soon</p><p>We will update this page soon with information on UCC-discounted student accommodation, including booking details and availability.</p></div>
        </section>

        <section id="travel" className={styles.row} aria-labelledby="travel-title">
          <div className={styles.sectionHeading}><span className={styles.number} aria-hidden="true">03</span><h2 id="travel-title">Getting to Cork &amp; UCC</h2></div>
          <div className={styles.copy}>
            <p>The Summer School takes place at University College Cork, Ireland, from 26–29 May 2027. Teaching rooms, registration details, and arrival and departure times will be confirmed with the full programme.</p>
            <p>Use the university’s visitor information for campus directions and maps, and Cork Airport’s transport guide to plan your onward journey.</p>
            <ul className={styles.resources}>
              <li><a href="https://www.ucc.ie/en/discover/visit/getting-here/">Getting to UCC <span aria-hidden="true">↗</span></a></li>
              <li><a href="https://www.ucc.ie/en/visitorservices/plan/">Plan your campus visit &amp; find maps <span aria-hidden="true">↗</span></a></li>
              <li><a href="https://www.corkairport.com/to-from-the-airport">Transport to and from Cork Airport <span aria-hidden="true">↗</span></a></li>
            </ul>
          </div>
        </section>

        <section id="ects" className={styles.row} aria-labelledby="ects-title">
          <div className={styles.sectionHeading}><span className={styles.number} aria-hidden="true">04</span><h2 id="ects-title">ECTS credit</h2></div>
          <div className={styles.copy}><p>The participation fee for those seeking graduate ECTS credit is €250. Please indicate your interest in credit on the application form.</p><p>The number of credits, eligibility, attendance and assessment requirements, and recognition arrangements will be confirmed here.</p></div>
        </section>

        <section className={styles.row} aria-labelledby="payment-title">
          <div className={styles.sectionHeading}><span className={styles.number} aria-hidden="true">05</span><h2 id="payment-title">Payment &amp; cancellations</h2></div>
          <div className={styles.copy}><p>Payment instructions and deadlines, together with the cancellation and refund policy, will be announced here.</p><p>The application form does not collect payment. For questions about fees or payment arrangements, please <a href={contact}>contact the organising team</a>.</p></div>
        </section>

        <section className={styles.row} aria-labelledby="funding-title">
          <div className={styles.sectionHeading}><span className={styles.number} aria-hidden="true">06</span><h2 id="funding-title">Funding &amp; bursaries</h2></div>
          <div className={styles.copy}><p className={styles.status}>To be announced</p><p>Information about funding and bursaries will be published here when confirmed.</p></div>
        </section>

        <section className={styles.row} aria-labelledby="access-title">
          <div className={styles.sectionHeading}><span className={styles.number} aria-hidden="true">07</span><h2 id="access-title">Accessibility &amp; dietary requirements</h2></div>
          <div className={styles.copy}><p>Please contact the organising team privately to discuss accessibility requirements or dietary needs. Sharing these details in your application statement is not necessary.</p><p>Venue-specific access information and arrangements for meals and excursions will be added as plans are confirmed.</p></div>
        </section>

        <section className={styles.row} aria-labelledby="letters-title">
          <div className={styles.sectionHeading}><span className={styles.number} aria-hidden="true">08</span><h2 id="letters-title">Invitation letters</h2></div>
          <div className={styles.copy}><p>If you need an invitation letter for a visa application or institutional travel arrangements, please contact the organising team after your place has been confirmed to discuss the documentation you need.</p></div>
        </section>

        <section id="contact" className={styles.contact} aria-labelledby="contact-title">
          <p className={shared.eyebrow}>Planning your visit</p><h2 id="contact-title">A practical question?</h2>
          <p>Contact the organizing team at <a href={contact}>{CONTACT_EMAIL}</a>.</p>
          <Link href="/apply" className={`${shared.button} ${shared.goldButton}`}>Apply to PEWSS 2027 <span aria-hidden="true">→</span></Link>
        </section>
      </main>
      <footer className={shared.footer}><div className={shared.container}><Link href="/" className={shared.footerBrand}>PEWSS<span>Phenomenology East and West Summer School</span></Link><nav aria-label="Footer"><Link href="/#programme">Programme</Link><Link href="/faculty">Faculty</Link><Link href="/apply">Apply</Link><a href="#practical-information">Back to top ↑</a></nav><p>University College Cork, Ireland · 26–29 May 2027</p></div></footer>
    </div>
  );
}
