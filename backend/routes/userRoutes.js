const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const nodemailer = require('nodemailer');



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    cb(null, uuidv4() + fileExtension); // Assign unique ID
  },
});

// Initialize multer for handling file uploads
const upload = multer({ storage });


const emailRecipients = {
  pothole: "adithyakrishnapn@gmail.com",
  streetlight: "naveenkumaranr2016@gmail.com",
  graffiti: "sridharganesan2005@gmail.com",
  trash: "perezaderine@gmail.com",
  sidewalk: "dragoncorexgamer@gmail.com",
  other: "hastechofficial@gmail.com",
};


const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other service
  auth: {
    user: process.env.EMAIL_USER,  // Your email address (environment variable)
    pass: process.env.EMAIL_PASS,  // Your email password (environment variable)
  }
});


const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Reference to the User model
      required: true, // Ensures every report is associated with a user
    },
    issueCategory: {
      type: String,
      required: true, // Category is required
    },
    issueDescription: {
      type: String,
      required: true, // Description is required
    },
    voiceDescription: {
      type: String, // Transcription of the voice description
    },
    location: {
      type: String,
      required: true, // Location is required
    },
    images: [String], // Array to store image file paths
    audio: String, // Path or URL to the audio file
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Report = mongoose.model('Report', reportSchema);


// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Route to register a new user
router.post("/save-user", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to fetch a user by email
// Login route
router.post("/fetch-user", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // This is incorrect - you're not comparing with the hashed password
    // const isMatch = password === user.password;
    
    // Fix: Use bcrypt to compare the provided password with the hashed one
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get("/fetch-user/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email }, { password: 0 }); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Report Route to handle submission

// Report Route to handle submission
router.post('/report', upload.fields([{ name: 'images', maxCount: 5 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
  try {
    const { userId, issueCategory, issueDescription, voiceDescription, location } = req.body;

    // Handle uploaded files (audio and images)
    const imageFiles = req.files.images || [];
    const audioFile = req.files.audio ? req.files.audio[0] : null;

    // Save report data to the database
    const newReport = new Report({
      userId, // Include userId here
      issueCategory,
      issueDescription,
      voiceDescription,
      location,
      images: imageFiles.map((file) => file.filename), // Store the file names in DB
      audio: audioFile ? audioFile.filename : null, // Store audio filename
    });

    await newReport.save();

    // Send an email to the relevant recipient based on the issue category
    const recipientEmail = emailRecipients[issueCategory];

    if (!recipientEmail) {
      return res.status(400).json({ message: "Invalid issue category" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,  // Sender's email
      to: recipientEmail,  // Recipient's email
      subject: `New Issue Reported: ${issueCategory}`,
      text: `
        A new issue has been reported:

        - Category: ${issueCategory}
        - Description: ${issueDescription}
        - Voice Description: ${voiceDescription}
        - Location: ${location}

        User ID: ${userId}
      `,
      html: `
        <p>A new issue has been reported:</p>
        <ul>
          <li><strong>Category:</strong> ${issueCategory}</li>
          <li><strong>Description:</strong> ${issueDescription}</li>
          <li><strong>Voice Description:</strong> ${voiceDescription}</li>
          <li><strong>Location:</strong> ${location}</li>
          <li><strong>User ID:</strong> ${userId}</li>
        </ul>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Report submitted successfully!', reportId: newReport._id });
  } catch (error) {
    console.error("Error saving report:", error);
    res.status(500).json({ message: "Error saving report. Please try again." });
  }
});



// Route to get all reports (for the view reports page)
router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find({}, { username: 0 }); // Exclude username from the response
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).send("Server Error");
  }
});

// Route to get a specific report (for the report details page)
router.get("/report/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id, { username: 0 }); // Exclude username from the response
    if (!report) {
      return res.status(404).send("Report not found");
    }
    res.json(report);
  } catch (error) {
    console.error("Error fetching report details:", error);
    res.status(500).send("Server Error");
  }
});

// Route to delete a report
router.delete("/reports/:reportId", async (req, res) => {
  const { reportId } = req.params;
  const { userId } = req.body; // Get userId from request body

  try {
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.userId !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this report" });
    }

    // Also, report.remove() is deprecated, use this instead:
    await Report.findByIdAndDelete(reportId);
    
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Error deleting report. Please try again." });
  }
});



router.get('/user-reports/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const reports = await Report.find({ userId: userId }); // Assuming `user` is the field in Report model
    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Route to get unique report locations
router.get('/report-locations', async (req, res) => {
  try {
    // Group by location and count reports
    const locationCounts = await Report.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
          // Store a reference to the first document for each location
          // This helps retain the original location string format
          originalDoc: { $first: "$$ROOT" }
        }
      },
      {
        $project: {
          location: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // Now we need to geocode these locations
    const geocodedLocations = [];
    
    for (const loc of locationCounts) {
      try {
        // Use a geocoding service to convert location strings to coordinates
        // For this example, I'll add a helper function - you'll need to implement this
        // using a service like Google Maps Geocoding API or similar
        const coordinates = await geocodeLocation(loc.location);
        
        if (coordinates) {
          geocodedLocations.push({
            location: loc.location,
            lat: coordinates.lat,
            lng: coordinates.lng,
            reports: loc.count
          });
        }
      } catch (geocodeError) {
        console.error(`Error geocoding location "${loc.location}":`, geocodeError);
      }
    }
    
    res.status(200).json(geocodedLocations);
  } catch (error) {
    console.error("Error fetching report locations:", error);
    res.status(500).json({ message: "Error fetching report locations." });
  }
});

// Helper function to geocode a location string to coordinates
// You'll need to implement this using a geocoding service
async function geocodeLocation(locationString) {
  // This is a placeholder - implement with your preferred geocoding service
  // For example with node-geocoder or directly with Google Maps Geocoding API
  
  try {
    // Example implementation with node-geocoder
    // First install with: npm install node-geocoder
    
    const NodeGeocoder = require('node-geocoder');
    
    const options = {
      provider: 'google', // or 'openstreetmap', etc.
      apiKey: process.env.GOOGLE_MAPS_API_KEY, // for Google Maps Geocoding API
      formatter: null
    };
    
    const geocoder = NodeGeocoder(options);
    const results = await geocoder.geocode(locationString);
    
    if (results && results.length > 0) {
      return {
        lat: results[0].latitude,
        lng: results[0].longitude
      };
    }
    return null;
  } catch (error) {
    console.error(`Geocoding error for "${locationString}":`, error);
    return null;
  }
}



module.exports = router;
