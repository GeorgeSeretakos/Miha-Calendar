// /lib/notifyOrganizerAndFirm.js
import { Resend } from "resend";

/**
 * Notify the firm (platform owner) and the organizer (studio) that a booking
 * has been confirmed and inserted into Google Calendar.
 *
 * - Uses env FIRM_NOTIFICATIONS_EMAIL for firm.
 * - Accepts explicit organizerEmail, or falls back to studio.{notificationEmail|ownerEmail|email}.
 * - Dedupe recipients and skip if none found.
 *
 * @param {Object} params
 * @param {Object} params.studio
 * @param {Object} params.booking
 * @param {string} params.timezone
 * @param {string} params.eventId
 * @param {string} [params.iCalUID]
 * @param {string} [params.organizerEmail]  // explicit organizer email to use
 * @param {string} [params.firmEmail=process.env.FIRM_NOTIFICATIONS_EMAIL]
 * @param {string} [params.from=process.env.RESEND_FROM || process.env.NOTIFY_FROM || "Bookings <no-reply@yourdomain.com>"]
 * @param {Resend} [params.resend]
 * @param {boolean} [params.throwOnError=false]
 * @returns {Promise<{ok:boolean,to:string[],messageIds?:string[],error?:string}>}
 */
export async function notifyOrganizerAndFirm({
                                               studio,
                                               booking,
                                               timezone,
                                               eventId,
                                               iCalUID,
                                               organizerEmail, // <-- explicit organizer email
                                               firmEmail = process.env.FIRM_NOTIFICATIONS_EMAIL,
                                               from = process.env.RESEND_FROM || process.env.NOTIFY_FROM || "Bookings <no-reply@yourdomain.com>",
                                               resend,
                                               throwOnError = false,
                                             }) {
  try {
    const resendClient = resend || new Resend(process.env.RESEND_API_KEY);
    if (!resendClient) throw new Error("Resend client not available.");
    if (!studio) throw new Error("Missing studio.");
    if (!booking) throw new Error("Missing booking.");
    if (!eventId) throw new Error("Missing eventId.");

    const resolvedOrganizerEmail =
      organizerEmail ||
      studio.notificationEmail ||
      studio.ownerEmail ||
      studio.email ||
      null;

    // Build recipient list (dedupe + truthy)
    const to = Array.from(
      new Set(
        [firmEmail, resolvedOrganizerEmail]
          .map((e) => (typeof e === "string" ? e.trim() : ""))
          .filter(Boolean)
      )
    );

    if (to.length === 0) {
      // Nothing to notify—treat as a no-op success
      return { ok: true, to: [], messageIds: [] };
    }

    const when = new Date(booking.startISO).toLocaleString("el-GR", {
      timeZone: timezone || studio.timezone || "Europe/Athens",
      dateStyle: "full",
      timeStyle: "short",
    });

    const subject = `Miha Bodytec Greece Bookings – ${studio.name} (${when})`;

    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif">
        <h2 style="margin:0 0 8px">Νέο επιβεβαιωμένο ραντεβού</h2>
        <p style="margin:0 12px 12px 0"><strong>${escapeHtml(studio.name || "")}</strong></p>

        <p style="margin:0 0 6px"><strong>Πότε:</strong> ${escapeHtml(when)} (${escapeHtml(timezone || studio.timezone || "Europe/Athens")})</p>
        <p style="margin:0 0 6px"><strong>Πελάτης:</strong> ${escapeHtml(`${booking.firstName} ${booking.lastName}`.trim())}</p>
        <p style="margin:0 0 6px"><strong>Email:</strong> ${escapeHtml(booking.email)}</p>
        <p style="margin:0 0 12px"><strong>Τηλέφωνο:</strong> ${escapeHtml(booking.phone || "")}</p>
        ${booking.message ? `<p style="margin:0 0 12px"><strong>Μήνυμα:</strong> ${escapeHtml(booking.message)}</p>` : ""}

        <hr style="border:none;border-top:1px solid #eee;margin:12px 0" />
        <p style="margin:0 0 6px;color:#555">Google Event ID: ${escapeHtml(eventId)}</p>
        ${iCalUID ? `<p style="margin:0;color:#555">iCalUID: ${escapeHtml(iCalUID)}</p>` : ""}
        ${booking.id ? `<p style="margin:6px 0 0;color:#555">Booking ID: ${escapeHtml(String(booking.id))}</p>` : ""}
      </div>
    `;

    const text = [
      "Νέο επιβεβαιωμένο ραντεβού",
      studio?.name ? `• Στούντιο: ${studio.name}` : null,
      `• Πότε: ${when} (${timezone || studio.timezone || "Europe/Athens"})`,
      `• Πελάτης: ${booking.firstName} ${booking.lastName}`,
      `• Email: ${booking.email}`,
      `• Τηλέφωνο: ${booking.phone || ""}`,
      booking.message ? `• Μήνυμα: ${booking.message}` : null,
      `• Google Event ID: ${eventId}`,
      iCalUID ? `• iCalUID: ${iCalUID}` : null,
      booking.id ? `• Booking ID: ${booking.id}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const { data, error } = await resendClient.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      if (throwOnError) throw error;
      console.error("notifyOrganizerAndFirm error:", error);
      return { ok: false, to, error: String(error) };
    }

    const messageIds = Array.isArray(data?.ids) ? data.ids : data?.id ? [data.id] : [];
    return { ok: true, to, messageIds };
  } catch (err) {
    if (throwOnError) throw err;
    console.error("notifyOrganizerAndFirm error:", err);
    return { ok: false, to: [], error: String(err?.message || err) };
  }
}

// Simple HTML escaper for message body
function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
