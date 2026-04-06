const express = require("express");
const router = express.Router();

router.post("/register", (req, res) => {
    res.send("Register route working");
});

router.post("/login", (req, res) => {
    res.send("Login route working");
});

module.exports = router;
