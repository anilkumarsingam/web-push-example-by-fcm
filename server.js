'use strict';

const express    = require('express');
const https      = require('https');
const bodyParser = require('body-parser');
const app        = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
app.use(express.static('public'));

const port = process.env.PORT || 8888;

app.listen(port, () => {
	console.log(`Listening on port ${port} ...`);
});

const bodies = [];

app.post('/api/webpush/register', (req, res) => {
	const body = req.body;

	bodies.push(body);

	let params = body;
	params['appid'] = 'com.justdial.dev';
	params['platform'] = 'mobile_web';
	params['name'] = 'web_user';

	let request = require('request');
	request({
			'url':'http://localhost:5000/api/registerUser',
			'method':'POST',
			'headers': {
				'content-type': 'application/json',
			},
			'json':params
		},function (error, response, body) {
		console.log('error:', error);
		console.log('statusCode:', response && response.statusCode);
		console.log('body:', body);
		});

	res.status(200).set('Content-Type', 'application/json').send(JSON.stringify(body));
});

app.post('/api/webpush/subscribe', (req, res) => {
	const notification = {
		title : req.body['text-title'],
	body  : req.body['text-body'],
	icon  : req.body['url-icon']
	};

	const data =  {
		url : req.body['url-link']
	};

	Promise.all(bodies.map((body) => {
		return new Promise((resolve, reject) => {
			const options = {
				method  : 'POST',
				host    : 'fcm.googleapis.com',
				path    : '/fcm/send',
				headers : {
					'Content-Type'  : 'application/json',
					'Authorization' : 'key=`Your Server Key`'
				}
			};

			const to = body.token;

			const content_available = true;

			https.request(options, (response) => {
				const data = [];

				response.on('data',  (chunk) => data.push(chunk));
				response.on('end',   ()      => resolve(JSON.parse(Buffer.concat(data).toString())));
				response.on('error', (error) => reject(error));
			}).end(JSON.stringify({ notification, data, to, content_available }));
		});
	})).then((result) => {
		res.status(200).set('Content-Type', 'application/json').send(JSON.stringify(result));
	}).catch((error) => {
		res.status(500).set('Content-Type', 'application/json').send(JSON.stringify(error));
	});
});
