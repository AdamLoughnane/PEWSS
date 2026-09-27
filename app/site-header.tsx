"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import styles from "./home.module.css";

const links = [
  ["About", "/#about"],
  ["2027: Space and Technē", "/#theme"],
  ["Programme", "/#programme"],
  ["Faculty", "/#faculty"],
] as const;

export function SiteHeader({ light = false }: { light?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <header className={`${styles.header} ${light ? styles.lightHeader : ""}`} onKeyDown={(event) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    }}>
      <Link href="/" className={styles.brand} aria-label="PEWSS home"><span>PEWSS</span><span className={styles.brandDescription}>Phenomenology<br />East and West<br />Summer School</span></Link>
      <nav className={styles.desktopNav} aria-label="Main navigation">{links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
      <div className={styles.headerActions}>
        <Link href="/apply" className={`${styles.button} ${styles.goldButton} ${styles.headerApply}`}>
          Apply <span aria-hidden="true">↗</span>
        </Link>
        <Link href="/login" className={`${styles.button} ${styles.headerApply} ${styles.headerLogin}`}>
          Login
        </Link>
        <button ref={menuButton} type="button" className={styles.menuButton} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
          <span>{menuOpen ? "Close" : "Menu"}</span>
          <span aria-hidden="true">{menuOpen ? "×" : "+"}</span>
        </button>
      </div>
      <nav id="mobile-navigation" className={styles.mobileNav} aria-label="Mobile navigation" hidden={!menuOpen}>{links.map(([label, href]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}<span aria-hidden="true">↗</span></a>)}</nav>
    </header>
  );
}
