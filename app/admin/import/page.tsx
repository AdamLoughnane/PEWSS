import { redirect } from "next/navigation";
import Link from "next/link";
import { administrator } from "../../../lib/admin/supabase";
import { ImportForm } from "./import-form";
import styles from "../admin.module.css";
export default async function ImportPage() {
  if (!(await administrator())) redirect("/admin");
  return (
    <>
      <Link className={styles.back} href="/admin">
        ← All applications
      </Link>
      <h1 className={styles.title}>Import an earlier application</h1>
      <p className={styles.subtitle}>
        Copy the full body of an original PEWSS application email. Review the
        extracted details before saving. Importing does not send an email or
        make a decision.
      </p>
      <ImportForm />
    </>
  );
}
