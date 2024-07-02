const express = require('express');
const bodyParser = require('body-parser');
const Msg91 = require('./msg91'); // Assuming msg91.js file is in the same directory
const app = express();
const cors = require('cors');
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize Msg91 with your credentials
const msg91 = new Msg91('425582AYgJrio073668438dcP1', 'Rohith45', '4'); // Replace with your Msg91 credentials

// Endpoint to send SMS with variables
app.post('/send-sms', (req, res) => {
  const { template_id, short_url, realTimeResponse, recipients } = req.body;

  try {
    const smsData = {
      template_id,
      short_url,
      realTimeResponse,
      recipients
    };

    msg91.sendWithVariables(smsData, function(err, response) {
      if (err) {
        console.error('Error sending SMS:', err);
        res.status(500).send('Failed to send SMS.');
      } else {
        console.log('SMS sent successfully:', response);
        res.status(200).send('SMS sent successfully.');
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
