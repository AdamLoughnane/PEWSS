import type { Metadata } from "next";
import Link from "next/link";
import site from "../home.module.css";
import styles from "./admin.module.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Administration — PEWSS",
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${site.home} ${styles.shell}`}>
      <a href="#admin-content" className="skip-link">
        Skip to content
      </a>
      <header className={`${site.header} ${site.lightHeader}`}>
        <Link href="/" className={site.brand}>
          <span>PEWSS</span>
          <span className={site.brandDescription}>
            Phenomenology
            <br />
            East and West
            <br />
            Summer School
          </span>
        </Link>
        <span className={styles.subtitle}>Private administration</span>
      </header>
      <main id="admin-content" className={styles.main}>
        {children}
      </main>
    </div>
  );
}
