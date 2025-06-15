const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'registrations.json');

app.use(cors());
app.use(bodyParser.json());

// Ensure JSON file exists
function loadRegistrations() {
  try {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return content.trim() === '' ? [] : JSON.parse(content);
  } catch (err) {
    console.error("❌ Error reading/parsing JSON:", err);
    return [];
  }
}

function saveRegistrations(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Handle POST /register
app.post('/register', (req, res) => {
  const { name, email, phone, dob, gender, address, city, state, country, voucher } = req.body;

  console.log(`📥 Registration received from: ${name} (${email}) at ${new Date().toLocaleString()}`);

  if (!name || !email || !voucher) {
    return res.status(400).json({ message: 'Name, Email, and Voucher are required.' });
  }

  const registrations = loadRegistrations();
  const duplicate = registrations.find(r => r.voucher === voucher);

  if (duplicate) {
    console.log(`⚠️ Duplicate voucher: ${voucher}`);
    return res.status(409).json({ message: '❌ This voucher has already been used.' });
  }

  registrations.push({
    name, email, phone, dob, gender, address, city, state, country, voucher,
    registeredAt: new Date().toISOString()
  });

  saveRegistrations(registrations);

  console.log(`✅ Registered successfully: ${name} - Voucher: ${voucher}`);
  res.status(200).json({ message: '✅ Registration successful' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
