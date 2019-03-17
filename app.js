'use strict';
const express = require('express');
const app = express();
const { WebClient } = require('@slack/client');


const makeBanner = require('./makeBanner.js');

// [START hello_world]
// Say hello!
app.post("/", function(req, res, next) {
    // Get event payload
    let payload = req.body;
    // Respond to this event with HTTP 200 status
    res.send('PUT request to homepage');
});

app.get("/", function (req, res, next) {
    // An access token (from your Slack app or custom integration - xoxp, xoxb)
    const token = process.env.SLACK_TOKEN;

    const web = new WebClient(token);

    // This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
    const conversationId = '#slack-test';
    
    (async () => {
      // See: https://api.slack.com/methods/chat.postMessage
      const res = await web.chat.postMessage({ channel: conversationId, text: makeBanner('yo', ':alert:') });

      // `res` contains information about the posted message
      console.log('Message sent: ', res.ts);
    })();
   
    res.send(200);
});

if (module === require.main) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;
