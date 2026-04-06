const Complaint = require("../models/Complaint");

exports.createComplaint = async (req, res) => {
    try {
        const complaint = new Complaint({
            user: req.user.id,
            category: req.body.category,
            description: req.body.description,
            location: req.body.location,
        });

        await complaint.save();
        res.json(complaint);
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.getComplaints = async (req, res) => {
    try {
        let complaints;

        if (req.user.role === "citizen") {
            complaints = await Complaint.find({ user: req.user.id });
        } else {
            complaints = await Complaint.find().populate("user", "name email");
        }

        res.json(complaints);
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint)
            return res.status(404).json({ msg: "Not found" });

        complaint.status = req.body.status;

        if (req.body.status === "Resolved") {
            complaint.rewardPaid = true;
        }

        await complaint.save();
        res.json(complaint);
    } catch (err) {
        res.status(500).json(err);
    }
};
