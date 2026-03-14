const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

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
    }
    return null;
  });
