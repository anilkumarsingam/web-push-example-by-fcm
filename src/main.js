'use strict';

import * as firebase from 'firebase';

const getFirebaseMessagingObject = () => {
	// Initialize Firebase
	const firebaseConfig = {
		apiKey: 'AIzaSyDlzR2nKazl7n27q1wVLK6Vz5UsPogj8h4',
		authDomain: 'notify-dev-956b4.firebaseapp.com',
		databaseURL: 'https://notify-dev-956b4.firebaseio.com',
		projectId: 'notify-dev-956b4',
		storageBucket: '',
		messagingSenderId: '216621603635',
		appId: '1:216621603635:web:726ee37710f4ebda9c3c46',
		measurementId: 'G-RTXYEYYE5D'
	};

	firebase.initializeApp(firebaseConfig);

	return firebase.messaging();
};

const register = (messaging) => {
	const mobile = prompt('Please enter your mobile number.');
	console.log(mobile);
	if (!navigator.serviceWorker || !messaging) {
		return;
	}

	navigator.serviceWorker.register('./firebase-messaging-sw.js').then(() => {
		return navigator.serviceWorker.ready;
	}).catch((error) => {
		console.error(error);
	}).then((registration) => {
		messaging.useServiceWorker(registration);

		messaging.requestPermission().then(() => {
			console.log('Notification permission granted.');

			messaging.getToken().then((token) => {
				console.log(token);

				const options = {
					method  : 'POST',
					headers : new Headers({ 'Content-Type' : 'application/json' }),
					body    : JSON.stringify({'mobile':mobile,'token': token })
				};

				fetch('/api/webpush/register', options).then((res) => {
					console.dir(res);
				}).catch((error) => {
					console.error(error);
				});
			}).catch((error) => {
				console.error(error);
			});

		}).catch((error) => {
			console.log('Unable to get permission to notify.', error);
		});
	});
};

register(getFirebaseMessagingObject());
