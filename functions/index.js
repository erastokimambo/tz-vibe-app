const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");

admin.initializeApp();

// Configuration (To be securely set in Firebase env: firebase functions:config:set twilio.sid="..." twilio.token="..." twilio.phone="...")
const TWILIO_SID = process.env.TWILIO_SID || "dummy_sid";
const TWILIO_TOKEN = process.env.TWILIO_TOKEN || "dummy_token";
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

const BEEM_API_KEY = process.env.BEEM_API_KEY || "dummy_beem_key";
const BEEM_SECRET_KEY = process.env.BEEM_SECRET_KEY || "dummy_beem_secret";

const twilioClient = twilio(TWILIO_SID, TWILIO_TOKEN);

exports.onBookingCreated = functions.firestore
  .document("bookings/{bookingId}")
  .onCreate(async (snap, context) => {
    const booking = snap.data();
    const vendorId = booking.vendorId;

    if (!vendorId) return null;

    // Fetch vendor details
    const vendorDoc = await admin.firestore().collection("businesses").doc(vendorId).get();
    if (!vendorDoc.exists) {
      console.log(`Vendor ${vendorId} not found.`);
      return null;
    }

    const vendorObj = vendorDoc.data();
    const vendorPhone = vendorObj.phone; // Assuming vendor object has a phone field
    const vendorName = vendorObj.name || "Vendor";

    const pax = booking.pax || 1;
    const time = `${booking.bookingDate || "Today"} at ${booking.bookingTime || "your time"}`;
    const userName = booking.userName || "Guest";

    const whatsappMessage = `Habari ${vendorName}! Una booking mpya kutoka kwa ${userName}. Watu: ${pax}, Muda: ${time}. Ingia kwenye TzVibe app kukubali au kukataa.`;

    if (vendorPhone) {
      // 1. Send Twilio WhatsApp
      try {
        const toWhatsApp = vendorPhone.startsWith("+") ? `whatsapp:${vendorPhone}` : `whatsapp:+255${vendorPhone.replace(/^0/, "")}`;
        await twilioClient.messages.create({
          body: whatsappMessage,
          from: TWILIO_WHATSAPP_NUMBER,
          to: toWhatsApp
        });
        console.log(`WhatsApp sent to vendor ${vendorPhone}`);
      } catch (err) {
        console.error("Failed to send Twilio WhatsApp:", err);
      }

      // 2. Fallback Beem SMS (Assuming High Priority/Premium flag if needed, keeping simple here)
      const smsMessage = `TzVibe: Booking mpya. ${userName}, Watu: ${pax}, Muda: ${time}.`;
      try {
        const destPhone = vendorPhone.startsWith("+") ? vendorPhone.substring(1) : `255${vendorPhone.replace(/^0/, "")}`;
        const beemRes = await fetch("https://apisms.beem.africa/v1/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + Buffer.from(`${BEEM_API_KEY}:${BEEM_SECRET_KEY}`).toString("base64")
          },
          body: JSON.stringify({
            source_addr: "TzVibe",
            schedule_time: "",
            encoding: "0",
            message: smsMessage,
            recipients: [{ recipient_id: 1, dest_addr: destPhone }]
          })
        });
        const beemData = await beemRes.json();
        console.log("Beem SMS response:", beemData);
      } catch (err) {
        console.error("Failed to send Beem SMS:", err);
      }
    }
    
    return null;
  });

exports.onBookingStatusChanged = functions.firestore
  .document("bookings/{bookingId}")
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    // Check if status changed to 'confirmed'
    if (newValue.status === "confirmed" && previousValue.status !== "confirmed") {
      const userId = newValue.userId;
      const businessName = newValue.businessName || "the venue";
      const bookingTime = newValue.bookingTime || "your reserved time";

      // Get user's FCM token
      const userDoc = await admin.firestore().collection("users").doc(userId).get();
      if (!userDoc.exists) {
        console.log(`User ${userId} does not exist.`);
        return null;
      }

      const fcmToken = userDoc.data().fcmToken;
      if (!fcmToken) {
        console.log(`User ${userId} does not have an FCM token.`);
        return null;
      }

      const message = {
        notification: {
          title: "Booking Confirmed! 🎉",
          body: `Your table at ${businessName} is confirmed! See you at ${bookingTime}.`
        },
        token: fcmToken
      };

      try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }

      // Also send WhatsApp confirmation to User
      const userPhone = newValue.userPhone;
      if (userPhone && userPhone.length > 5) {
        try {
          const toWhatsApp = userPhone.startsWith("+") ? `whatsapp:${userPhone}` : `whatsapp:+255${userPhone.replace(/^0/, "")}`;
          await twilioClient.messages.create({
            body: `Your vibe is set! Your booking at ${businessName} has been confirmed. Enjoy your night!`,
            from: TWILIO_WHATSAPP_NUMBER,
            to: toWhatsApp
          });
          console.log(`WhatsApp confirmation sent to user ${userPhone}`);
        } catch (err) {
          console.error("Failed to send WhatsApp confirmation to user:", err);
        }
      }
    }
    return null;
  });
