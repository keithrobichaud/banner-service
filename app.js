'use strict';
const qs = require('qs')
const express = require('express');
const app = express();
const { WebClient } = require('@slack/client');

const makeBanner = require('./makeBanner.js');

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN;

const web = new WebClient(token);

app.post("/", function(req, res, next) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        const payload = qs.parse(body);
        console.log(payload);
        const text = payload.text;
        console.log('text: ', text);
        const args = text.split(" ");
        
        let emojis = [];
        let messageParts = [];
        for (var i = 0; i < args.length; i++) {
            if (args[i][0] === ':') {
                emojis.push(args[i]);
            } else {
                messageParts.push(args[i]);
            }
        }
        
        const string = messageParts.join(" ");
        const escapedString = string.replace(/[^a-zA-Z ]/g, '');

        let conversationId = payload.channel_name;
        if (conversationId === 'directmessage') {
            conversationId = payload.channel_id;
        }

        (async () => {
            const userName = payload.user_name;
            // See: https://api.slack.com/methods/chat.postMessage
            const message = makeBanner(escapedString, userName, ...emojis);
            console.log(message);
            const result = await web.chat.postMessage({ channel: conversationId, text: message, as_user: false });

             // `res` contains information about the posted message
            console.log('Message sent: ', result.ts);
//             res.write(message);
        })();
    });

    res.sendStatus(200);
});

app.get("/", function (req, res, next) {
    res.send(200);
});

if (module === require.main) {
  // [START server]
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;
