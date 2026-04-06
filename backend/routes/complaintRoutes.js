const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");

router.post("/", async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Body is empty" });
    }

    const newComplaint = new Complaint(req.body);
    const savedComplaint = await newComplaint.save();

    res.status(201).json(savedComplaint);
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

module.exports = router;
