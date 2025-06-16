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
app.use(express.static(__dirname)); // Serve static files like index.html

// 📥 Log each incoming request
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toLocaleString()} | ${req.ip} → ${req.method} ${req.originalUrl}`);
  next();
});

// 📂 Load registrations or create file
function loadRegistrations() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return content.trim() === '' ? [] : JSON.parse(content);
  } catch (err) {
    console.error("❌ Error reading/parsing registrations.json:", err);
    return [];
  }
}

// 💾 Save to registrations.json
function saveRegistrations(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 🌐 Serve the form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Handle form submission
app.post('/register', (req, res) => {
  const { name, email, phone, dob, gender, address, city, state, country, voucher } = req.body;

  if (!voucher || !name || !email) {
    return res.status(400).json({ message: 'Name, Email, and Voucher are required.' });
  }

  const registrations = loadRegistrations();

  const alreadyUsed = registrations.find(entry => entry.voucher === voucher);
  if (alreadyUsed) {
    return res.status(409).json({ message: '❌ This voucher has already been used.' });
  }

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

  res.status(200).json({ message: '✅ Registration successful' });
});

// 🟢 Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
