const labels = [
  ["Application reference", "reference"],
  ["Full name", "name"],
  ["Email address", "email"],
  ["Institution or professional affiliation", "institution"],
  ["Programme / career stage", "careerStage"],
  ["Country", "country"],
  ["Research interests", "researchInterests"],
  ["Short biography", "biography"],
  ["Statement of interest", "statement"],
  ["Website", "website"],
  ["ORCID iD", "orcid"],
  ["Interested in ECTS credit", "ects"],
  ["Profile photograph", "photoDescription"],
  ["Privacy acknowledgement", "privacyDescription"],
] as const;
// Parse the exact labelled format sent by the PEWSS form. The administrator reviews it before import.
export function parseApplicationEmail(text: string) {
  if (text.length > 30000)
    throw new Error(
      "Please paste only the application email, without the email thread.",
    );
  const normal = text.replaceAll("\r\n", "\n");
  const matches = labels.map(([label, key]) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const found = [...normal.matchAll(new RegExp(`^${escaped}\\s*\\n`, "gm"))];
    if (found.length !== 1)
      throw new Error(
        `Could not identify ${label}. Copy the full original PEWSS application email.`,
      );
    return {
      key,
      start: found[0].index!,
      content: found[0].index! + found[0][0].length,
    };
  });
  const result: Record<string, string> = {};
  matches.forEach((match, i) => {
    if (i && match.start <= matches[i - 1].start)
      throw new Error("The application fields are not in the expected order.");
    result[match.key] = normal
      .slice(match.content, matches[i + 1]?.start ?? normal.length)
      .trim();
  });
  if (!/^PEWSS-2027-[a-f0-9-]{36}$/i.test(result.reference))
    throw new Error("The application reference is missing or invalid.");
  for (const key of ["institution", "website", "orcid"])
    if (result[key] === "Not provided") result[key] = "";
  if (
    !result.privacyDescription.startsWith(
      "Acknowledged: send this application to Adam Loughnane for application review and related contact",
    )
  )
    throw new Error("The original privacy acknowledgement is missing.");
  return result;
}
