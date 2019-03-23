'use strict';
const qs = require('qs')
const express = require('express');
const app = express();
const { WebClient } = require('@slack/client');

const makeBanner = require('./makeBanner.js');

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN;

const web = new WebClient(token);

function parseTime(timeString) {	
	if (timeString == '') return null;
	
	var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i);	
	if (time == null) return null;
	
	var hours = parseInt(time[1],10);	 
	if (hours == 12 && !time[4]) {
		  hours = 0;
	}
	else {
		hours += (hours < 12 && time[4])? 12 : 0;
	}	
	var d = new Date();    	    	
	d.setHours(hours);
	d.setMinutes(parseInt(time[3],10) || 0);
	d.setSeconds(0, 0);	 
	return d;
}

function formatDate(date) {
	return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' })
}

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

		let time;
        let emojis = [];
        let messageParts = [];
        for (var i = 0; i < args.length; i++) {
			const argInput = args[i];
            if (argInput[0] === ':') {
				emojis.push(argInput);
			} else if (parseTime(argInput)) {
				const parsedTime = parseTime(argInput);
				time = formatDate(parsedTime);
            } else {
                messageParts.push(argInput);
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
            const message = makeBanner({ str: escapedString, userName, emojis, time });
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
