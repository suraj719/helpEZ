const https = require('https');

function Msg91(authKey, senderId, route) {
  if (!authKey || !senderId || !route) {
    throw new Error('MSG91 credentials not provided.');
  }

  this.authKey = authKey;
  this.senderId = senderId;
  this.route = route;

  this.sendWithVariables = function(smsData, callback) {
    callback = callback || function() {};

    try {
      validateSmsData(smsData);

      const postData = JSON.stringify(smsData);

      const options = {
        hostname: 'control.msg91.com',
        port: 443,
        path: '/api/v5/flow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
          'Authorization': 'Bearer ' + this.authKey
        }
      };

      makeHttpRequest(options, postData, function(err, data) {
        callback(err, data);
      });
    } catch (error) {
      callback(error);
    }
  };

  function validateSmsData(smsData) {
    if (!smsData.template_id || !smsData.short_url || !smsData.recipients) {
      throw new Error('MSG91: Insufficient data provided.');
    }

    if (!Array.isArray(smsData.recipients) || smsData.recipients.length === 0) {
      throw new Error('MSG91: Recipients should be a non-empty array.');
    }
  }

  function makeHttpRequest(options, postData, callback) {
    const req = https.request(options, function(res) {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        callback(null, data);
      });
    });

    req.on('error', function(e) {
      callback(e);
    });

    req.write(postData);
    req.end();
  }
}

module.exports = Msg91;
