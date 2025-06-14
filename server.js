const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'registrations.json');

app.use(cors()); // Allow requests from any origin
app.use(bodyParser.json()); // Parse incoming JSON bodies

// Helper: Load existing registrations or create an empty JSON file
function loadRegistrations() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    }

    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return content.trim() === '' ? [] : JSON.parse(content);
  } catch (err) {
    console.error("❌ Error reading or parsing registrations.json:", err);
    return [];
  }
}


// Helper: Save updated registrations to the file
function saveRegistrations(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// POST endpoint to handle registration
app.post('/register', (req, res) => {
  const {
    name,
    email,
    phone,
    dob,
    gender,
    address,
    city,
    state,
    country,
    voucher
  } = req.body;

  // Basic validation
  if (!voucher || !name || !email) {
    return res.status(400).json({ message: 'Name, Email, and Voucher are required.' });
  }

  const registrations = loadRegistrations();

  // Check if voucher is already used
  const alreadyUsed = registrations.find(entry => entry.voucher === voucher);
  if (alreadyUsed) {
    return res.status(409).json({ message: '❌ This voucher has already been used.' });
  }

  // Create and save new registration
  const newEntry = {
    name,
    email,
    phone,
    dob,
    gender,
    address,
    city,
    state,
    country,
    voucher,
    registeredAt: new Date().toISOString()
  };

  registrations.push(newEntry);
  saveRegistrations(registrations);

  // Respond success
  res.status(200).json({ message: '✅ Registration successful' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () =>{
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
