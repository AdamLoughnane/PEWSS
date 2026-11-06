"use client";
import styles from "./admin.module.css";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section className={styles.panel}>
      <h1 className={styles.title}>Unable to load this page</h1>
      <p>Your application records have not been changed. Please try again.</p>
      <button className={styles.button} onClick={reset}>
        Try again
      </button>
    </section>
  );
}
