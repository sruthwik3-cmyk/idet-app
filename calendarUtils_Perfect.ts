/**
 * Generates a Google Calendar template URL for a document expiry event.
 */
export const generateCalendarUrl = (docName: string, expiryDateStr: string, priority: string) => {
    // Format dates as YYYYMMDDT000000Z
    // Using UTC to avoid timezone shifts for daily events
    const date = new Date(expiryDateStr);
    const datePart = date.toISOString().split('T')[0].replace(/-/g, "");

    const startDate = `${datePart}T090000Z`; // 9 AM UTC
    const endDate = `${datePart}T100000Z`;   // 10 AM UTC

    const details = `Priority: ${priority}\n\nThis document is scheduled to expire. Please review and initiate renewal if necessary.\n\nSent via IDET Document Manager.`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Expiry: ${docName}`)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&sf=true&output=xml`;
};
