// File: server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = './registrations.json';

// Helper: load registrations from file
function loadRegistrations() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

// Helper: save registrations to file
function saveRegistrations(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.post('/register', (req, res) => {
  const {
    name, email, phone, dob, gender,
    address, city, state, country, voucher
  } = req.body;

  if (!voucher || !name || !email || !phone) {
    return res.status(400).json({ error: 'Required fields missing.' });
  }

  const registrations = loadRegistrations();

  // Check if voucher already used
  const alreadyUsed = registrations.some(entry => entry.voucher === voucher);
  if (alreadyUsed) {
    return res.status(409).json({ error: 'This voucher has already been used.' });
  }

  const newEntry = {
    name, email, phone, dob, gender,
    address, city, state, country, voucher,
    timestamp: new Date().toISOString()
  };

  registrations.push(newEntry);
  saveRegistrations(registrations);

  return res.status(200).json({ message: 'Registration successful.' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
