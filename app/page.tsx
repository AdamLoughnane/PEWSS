import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "./site-header";
import styles from "./home.module.css";

const rhythm = [
  { icon: "people", title: "Student presentations", text: "Bring your questions.", detail: "Share your research with faculty and fellow participants, and explore how your questions contribute to the dialogue on selfhood and space." },
  { icon: "sun", title: "Lectures", text: "New perspectives, shared.", detail: "Explore philosophical and phenomenological approaches to selfhood and space with international scholars working across Western and Asian traditions." },
  { icon: "book", title: "Close-reading groups", text: "Read closely. Think together.", detail: "Work through philosophical texts in small, intensive groups, examining different conceptions of selfhood, non-self, and space." },
  { icon: "relations", title: "Dialogue across traditions", text: "Rethink self and world.", detail: "Consider what different conceptions of non-self open up for our understanding of embodiment, perception, movement, and dwelling." },
] as const;

function FormatIcon({ type }: { type: (typeof rhythm)[number]["icon"] }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {type === "book" && <><path d="M32 16C23 10 14 11 7 13v37c9-3 17-2 25 3 8-5 16-6 25-3V13c-7-2-16-3-25 3Z" /><path d="M32 16v37M12 17v27c6-1 12 0 16 2M52 17v27c-6-1-12 0-16 2" /></>}
      {type === "people" && <><circle cx="32" cy="15" r="7" /><circle cx="13" cy="23" r="5" /><circle cx="51" cy="23" r="5" /><path d="M20 53V42c0-8 5-13 12-13s12 5 12 13v11ZM15 34C7 33 3 38 3 45v6h10M49 34c8-1 12 4 12 11v6H51" /></>}
      {type === "sun" && <>{Array.from({ length: 20 }, (_, i) => <path key={i} d="M32 5v10" transform={`rotate(${i * 18} 32 32)`} />)}<circle cx="32" cy="32" r="10" /></>}
      {type === "relations" && <><circle cx="24" cy="32" r="18" /><circle cx="40" cy="32" r="18" /><path d="M6 32h52" /></>}
    </svg>
  );
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  return (
    <>
      <a href="#about" className="skip-link">Skip to content</a>
      <main id="home" className={styles.home}>
        <section id="hero" className={styles.hero} aria-labelledby="school-title">
          <div className={styles.heroArtwork} aria-hidden="true"><Image src="/pewss-hero.jpg" alt="" fill sizes="(max-aspect-ratio: 3/2) 150vh, 100vw" loading="eager" fetchPriority="high" className={styles.heroImage} /></div>
          <div className={styles.heroShade} />
          <SiteHeader />
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>An encounter between traditions</p>
            <h1 id="school-title">Phenomenology<br />East and West</h1>
            <div className={styles.heroTheme}>
              <p>Summer School 2027</p>
              <h2>(non)Self and Space</h2>
            </div>
            <p className={styles.heroDate}><span>26–29 May 2027</span><span className={styles.dateDivider} aria-hidden="true" /><span>University College Cork, Ireland</span></p>
            <div className={styles.actions}>
              <Link href="/apply" className={`${styles.button} ${styles.goldButton}`}>Apply <span aria-hidden="true">→</span></Link>
              <a href="#about" className={`${styles.button} ${styles.outlineButton}`}>Learn more <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <a href="#about" className={styles.scrollCue}><span>Explore the summer school</span><span aria-hidden="true">↓</span></a>
        </section>

        <div className={styles.panels}>
          <section id="about" className={`${styles.section} ${styles.introduction}`} aria-labelledby="question-title">
            <div className={styles.container}>
              <div className={styles.sectionLabel}><span>01 / The encounter</span><span>Cork, Ireland · May 2027</span></div>
              <div className={styles.introGrid}>
                <h2 id="question-title">What if the self is constituted through its relations with others, things, places, and worlds?</h2>
                <div className={styles.introCopy}>
                  <p>The Phenomenology East and West Summer School brings Western phenomenology into dialogue with Asian philosophical traditions to rethink the relationship between self and space.</p>
                  <p>Over four days of student presentations, lectures, and intensive close-reading groups, participants will explore how these traditions challenge fixed notions of selfhood and space—and what other ways of seeing, inhabiting, and understanding might emerge.</p>
                </div>
              </div>
            </div>
            <div className={styles.formatStrip}>
              <div className={`${styles.container} ${styles.formatGrid}`}>
                {rhythm.map((item) => <a href="#programme" className={styles.formatItem} key={item.icon}><FormatIcon type={item.icon} /><h3>{item.title}</h3><p>{item.text}</p></a>)}
              </div>
            </div>
          </section>

          <section id="theme" className={`${styles.section} ${styles.stonePanel}`} aria-labelledby="theme-title">
            <div className={`${styles.container} ${styles.themeGrid}`}>
              <div className={styles.themeCopy}>
                <p className={styles.eyebrow}>02 / The 2027 theme</p>
                <h2 id="theme-title">(non)Self and Space</h2>
                <p>For over a century, Western phenomenology has sought alternatives to the conception of the self as a subject contained within, and set apart from, the space it inhabits.</p>
                <p>This inquiry has increasingly developed through dialogue with Asian scholars and much older philosophical traditions, many of which begin from radically different understandings of selfhood, space, and the relation between them.</p>
                <details className={styles.disclosure}>
                  <summary>Explore the theme <span aria-hidden="true">+</span></summary>
                  <div className={styles.disclosureBody}>
                    <p>The Summer School continues and deepens this dialogue, exploring how philosophical and phenomenological traditions East and West have challenged reified notions of selfhood and space. What happens when the self is understood not as something contained <em>in</em> space, but as constituted through its relations with others, things, places, and worlds?</p>
                    <p>How might different conceptions of non-self transform our understanding of embodiment, perception, movement, and dwelling? Bringing these traditions into conversation, we ask what alternative ways of seeing, inhabiting, and understanding might emerge when we rethink the boundaries between self and world.</p>
                  </div>
                </details>
              </div>
              <figure className={styles.themeFigure}>
                <div className={styles.themeImageFrame}><Image src="/pewss-hero.jpg" alt="Classical arches and imagined architectural spaces intersect with digital wireframes in the Summer School artwork." fill sizes="(max-width: 760px) 135vw, 75vw" className={styles.themeImage} /></div>
                <figcaption><span>Self / Space / World</span><span>PEWSS 2027</span></figcaption>
              </figure>
            </div>
          </section>

          <section className={`${styles.section} ${styles.factsSection}`} aria-label="The Summer School at a glance">
            <div className={`${styles.container} ${styles.factsGrid}`}>
              <article><h3>International specialists</h3><p>Scholars in phenomenology and Asian philosophical traditions, bringing different approaches to selfhood and space into conversation.</p></article>
              <article><h3>Small groups</h3><p>Intensive close reading and discussion with faculty and peers, exploring how texts reshape our understanding of self and world.</p></article>
              <article><h3>Graduate credit</h3><p>A graduate ECTS credit opportunity for eligible participants. Requirements and conditions will be published here.</p><a href="#credit">About ECTS <span aria-hidden="true">↗</span></a></article>
              <article><h3>For whom</h3><p>MA and PhD students, early-career researchers, and practitioners whose work engages selfhood, non-self, space, and embodied experience.</p></article>
            </div>
          </section>

          <section id="programme" className={`${styles.section} ${styles.programmeSection}`} aria-labelledby="programme-title">
            <div className={styles.container}>
              <div className={styles.programmeHeading}><div><p className={styles.eyebrow}>03 / A rhythm of exchange</p><h2 id="programme-title">Four days of shared inquiry.</h2></div><p className={styles.status}>Full programme forthcoming</p></div>
              <div className={styles.programmeGrid}>
                {rhythm.map((item, index) => <article key={item.icon}><span className={styles.programmeNumber}>0{index + 1}</span><h3>{item.title}</h3><p>{item.detail}</p></article>)}
              </div>
              <p className={styles.programmeNote}>Student presentations, lectures, and intensive close-reading groups will shape our four days together. The full timetable, sessions, and locations will be announced as the programme develops.</p>
            </div>
          </section>

          <section className={`${styles.section} ${styles.stonePanel}`} aria-label="Essay competition and faculty">
            <div className={`${styles.container} ${styles.editorialGrid}`}>
              <article id="essay-prize">
                <p className={styles.eyebrow}>04 / Essay competition</p>
                <h2>From Summer School<br />to publication</h2>
                <p>The best student essay will be selected for publication in the <em>Journal of Aesthetics and Phenomenology</em>, offering an opportunity to develop your work for an international audience.</p>
                <details className={styles.disclosure}><summary>About the essay prize <span aria-hidden="true">+</span></summary><div className={styles.disclosureBody}><p>Competition eligibility, submission requirements, judging details, and deadlines will be published before entries open. Entry to the prize will be separate from submitting work for graduate credit.</p></div></details>
              </article>
              <article id="faculty">
                <p className={styles.eyebrow}>05 / Faculty</p>
                <h2>A meeting of<br />perspectives</h2>
                <p>We are bringing together international scholars working across Western phenomenology and Asian philosophical traditions, with shared questions about selfhood, non-self, and space.</p>
                <p>Meet the people who will lead the conversations: photographs, biographies, and session details will appear here as the faculty is announced.</p>
                <p className={styles.status}><span className={styles.statusDot} aria-hidden="true" />Faculty announcements coming soon</p>
              </article>
            </div>
          </section>

          <section id="cork" className={`${styles.section} ${styles.corkSection}`} aria-labelledby="cork-title">
            <div className={`${styles.container} ${styles.corkGrid}`}>
              <figure><div className={styles.corkImageFrame}><Image src="/ucc-campus.webp" alt="The stone clock tower and leafy quadrangle of University College Cork." fill sizes="(max-width: 760px) 90vw, 45vw" /></div><figcaption>University College Cork · <a href="https://www.ucc.ie/en/discover/visit/">Photograph: UCC</a></figcaption></figure>
              <div><p className={styles.eyebrow}>06 / University College Cork</p><h2 id="cork-title">A place to think.<br />A place to encounter.</h2><p>Join us in Cork, on Ireland’s south coast, where a setting for philosophical exchange meets a rich cultural landscape.</p><p>Encounters with others and with the places we inhabit bring questions of self and world into everyday experience. The city and campus offer a setting in which to think together about perception, movement, and dwelling.</p><a href="https://www.ucc.ie/en/discover/visit/" className={`${styles.button} ${styles.darkButton}`}>Explore UCC & Cork <Arrow /></a></div>
            </div>
          </section>

          <section id="credit" className={`${styles.section} ${styles.creditSection}`} aria-labelledby="credit-title">
            <div className={`${styles.container} ${styles.creditGrid}`}>
              <div><p className={styles.eyebrow}>07 / Taking part</p><h2 id="credit-title">Bring your questions.<br />Find new directions.</h2></div>
              <div className={styles.creditDetails}>
                <details open className={styles.faq}><summary>Who is the Summer School for?<span aria-hidden="true">+</span></summary><p>MA and PhD students, early-career researchers, artists, architects, performers, and other practitioners whose work engages selfhood, non-self, space, or embodied experience. The school welcomes an interdisciplinary conversation across philosophical traditions.</p></details>
                <details className={styles.faq}><summary>Can I receive graduate credit?<span aria-hidden="true">+</span></summary><p>Graduate ECTS credit is planned for eligible participants. The credit allocation, assessment, attendance requirements, and recognition arrangements will be published before applications open.</p></details>
                <details className={styles.faq}><summary>What will I need to apply?<span aria-hidden="true">+</span></summary><p>A short biography, your research interests, and a statement explaining how your questions connect with selfhood and space and what you would like to explore through the Summer School’s dialogue between traditions. Full application guidance, fees, and deadlines are forthcoming.</p><Link href="/apply">Application information <Arrow /></Link></details>
              </div>
            </div>
          </section>

          <section className={styles.closing} aria-labelledby="join-title">
            <div className={styles.container}><p className={styles.eyebrow}>Phenomenology East and West · 2027</p><h2 id="join-title">Join us in Cork.</h2><p className={styles.closingDate}>26–29 May 2027 · (non)Self and Space</p><Link href="/apply" className={`${styles.button} ${styles.goldButton}`}>Application information <span aria-hidden="true">→</span></Link><p className={styles.closingNote}>Applications opening soon</p></div>
          </section>
          <footer className={styles.footer}><div className={styles.container}><a href="#home" className={styles.footerBrand}>PEWSS<span>Phenomenology East and West Summer School</span></a><nav aria-label="Footer"><a href="#about">About</a><a href="#programme">Programme</a><a href="#faculty">Faculty</a><Link href="/apply">Apply</Link><a href="#home">Back to top ↑</a></nav><p>University College Cork, Ireland · 26–29 May 2027</p></div></footer>
        </div>
      </main>
    </>
  );
}
