// Real form delivery via Web3Forms (https://web3forms.com) — a mailto: link
// only opens a desktop mail client (which many visitors don't have), so it
// never actually sends. This POSTs the form straight to Web3Forms, which
// emails the submission to the configured inbox.
//
// The access key is a *public* submission key (safe in the frontend bundle),
// not a secret. Set VITE_WEB3FORMS_ACCESS_KEY in your .env — see .env.example.
const ACCESS_KEY =
  (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined) ?? "";

export const feedbackConfigured = ACCESS_KEY.length > 0;

export interface FeedbackFields {
  // Web3Forms special fields:
  subject?: string; // email subject line
  from_name?: string; // sender display name
  email?: string; // sets the Reply-To so you can reply directly
  // Any other keys are included as labelled rows in the email body.
  [key: string]: string | undefined;
}

interface Web3FormsResponse {
  success?: boolean;
  message?: string;
}

// Sends the feedback. Resolves on success; throws with a human-readable
// message on failure so the caller can surface it in the UI.
export async function sendFeedback(fields: FeedbackFields): Promise<void> {
  if (!feedbackConfigured) {
    throw new Error(
      "Messaging isn't configured yet (VITE_WEB3FORMS_ACCESS_KEY is missing).",
    );
  }

  let res: Response;
  try {
    res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ access_key: ACCESS_KEY, ...fields }),
    });
  } catch {
    throw new Error("Network error — check your connection and try again.");
  }

  const data = (await res.json().catch(() => ({}))) as Web3FormsResponse;
  if (!res.ok || !data.success) {
    throw new Error(data.message ?? `Couldn't send (error ${res.status}).`);
  }
}
