const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);



exports.addUserEvent = functions.database.ref('/events/{event_id}').onCreate(event => {
  const event_id = event.params.event_id;

  const fromUserID = admin.database().ref(`/events/${event_id}/user/uid`).once('value');
  console.log('fromUserID'+fromUserID);
  return Promise.all([fromUserID]).then(result => {
  	const user_uid = result[0].val();
  	console.log('user_uid'+user_uid);
  	admin.database().ref(`/users/${user_uid}/events_created`).update({[event_id]: true});
  });
});

exports.addUserFollowerCount = functions.database.ref('/user_followers/{follower_id}').onCreate(event => {
  const follower_id = event.params.follower_id;
  console.log('follower_id = '+follower_id);
  const following_obj = admin.database().ref(`/user_followers/${follower_id}`).once('value')

  return Promise.all([following_obj]).then(result => {
  	const following_id = result[0].val();
  	following_id.then(function(data) {
  		var key = data.key;
  		console.log('following_id'+key);
  	});
  	
  	// admin.database().ref(`/users/${user_uid}/follower_count`).update({[event_id]: true});
  });
});
