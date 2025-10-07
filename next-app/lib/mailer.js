import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// tiny html template (you can swap for React Email later)
function confirmTemplate({ studioName, whenText, confirmUrl }) {
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto;line-height:1.5">
      <h2 style="margin:0 0 8px">Επιβεβαίωση Ραντεβού</h2>
      <p style="margin:0 0 16px">
        Studio: <strong>${studioName}</strong><br/>
        Ημερομηνία/Ώρα: <strong>${whenText}</strong>
      </p>
      <p style="margin:0 0 16px">Πάτησε το κουμπί για να επιβεβαιώσεις το ραντεβού σου:</p>
      <p>
        <a href="${confirmUrl}" 
           style="display:inline-block;padding:12px 18px;border-radius:8px;text-decoration:none;
                  background:#111;color:#fff;font-weight:600">
          Επιβεβαίωση Ραντεβού
        </a>
      </p>
      <p style="margin:16px 0 0;font-size:12px;color:#666">
        Ο σύνδεσμος λήγει σε 5 λεπτά. Αν δεν ζήτησες εσύ αυτό το email, αγνόησέ το.
      </p>
    </div>
  `;
}

export async function sendBookingConfirmationEmail({
to,
studioName,
whenText,
confirmUrl,
replyTo,           // optional
from = process.env.RESEND_FROM || "Bookings <book@mihabodytecgreece.gr>",
}) {
  return resend.emails.send({
    from,
    to,
    subject: `Επιβεβαίωση ραντεβού — ${studioName} — ${whenText}`,
    html: confirmTemplate({ studioName, whenText, confirmUrl }),
    ...(replyTo ? { reply_to: replyTo } : {}),
  });
}
