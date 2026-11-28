import Link from "next/link";
import styles from "./admin.module.css";

export function AdminNavigation({ current }: { current: "applications" | "analytics" }) {
  return <nav aria-label="Administration" className={styles.navigation}>
    <Link prefetch={false} href="/admin" aria-current={current === "applications" ? "page" : undefined}>Applications</Link>
    <Link prefetch={false} href="/admin/analytics" aria-current={current === "analytics" ? "page" : undefined}>Website analytics</Link>
  </nav>;
}
