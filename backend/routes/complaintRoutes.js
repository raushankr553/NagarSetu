const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const multer = require("multer");

// Configure multer for memory storage (to convert to base64)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Convert buffer to base64
const bufferToBase64 = (buffer, mimetype) => {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
};

router.post("/", upload.single('image'), async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);
    console.log("FILE RECEIVED:", req.file ? "Yes" : "No");

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Body is empty" });
    }

    // Prepare complaint data
    const complaintData = {
      ...req.body,
    };

    // Attach user if available
    if (req.user?.id) {
      complaintData.user = req.user.id;
    }

    // Handle image upload
    if (req.file) {
      const base64Image = bufferToBase64(req.file.buffer, req.file.mimetype);
      complaintData.image = base64Image;
      console.log("Image converted to base64, size:", base64Image.length);
    }

    const newComplaint = new Complaint(complaintData);
    const savedComplaint = await newComplaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully!",
      complaint: savedComplaint
    });
  } catch (error) {
    console.log("SAVE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new route for stats
router.get("/stats", async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const totalInProgress = await Complaint.countDocuments({ status: "In Progress" });
    const totalResolved = await Complaint.countDocuments({ status: "Resolved" });
    const totalWithPhotos = await Complaint.countDocuments({ image: { $exists: true, $ne: null, $ne: "" } });

    res.json({
      totalReported: totalComplaints,
      totalInProgress,
      totalResolved,
      totalWithPhotos,
      totalRewards: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
