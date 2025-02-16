const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

// Initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json"); // Ensure this file exists

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();

app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request body

// Route to handle saving user streaming preferences
app.post("/save_preferences", async (req, res) => {
  try {
    const { userID, streamingServices } = req.body;

    if (!userID || !streamingServices) {
      return res.status(400).json({ error: "Missing userID or streamingServices" });
    }

    await db.collection("users").doc(userID).set({
      userID,
      streamingServices,
    });

    res.status(200).json({ message: "Preferences saved successfully!" });
  } catch (error) {
    console.error("Error saving preferences:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
