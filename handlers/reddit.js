const request = require('request');

const rPrefix = "https://www.reddit.com";
let r = null;
let debugP = null;
const rSuffix = "/.json?limit=";
let postStatus = null;

exports.setPostStatus = function(newPostStatus) {
	postStatus = newPostStatus;
};

exports.getPostStatus = function() {
	return postStatus;
};

exports.setSubreddit = function(subreddit) {
	if (subreddit.indexOf("/") == 0 && subreddit.charAt(subreddit.length - 1) != "/") {
		r = subreddit;
		console.log("Subreddit set to " + subreddit);
	}
	else {
		throw Error("Subreddit should start with, but not end with, a / character. Example: /r/me_irl");
	}
};

exports.getSubreddit = function() {
	return r;
};

exports.setPostToDebug = function(postId) {
	debugP = postId;
};

exports.getPostToDebug = function() {
	return debugP;
}

exports.retrieveRedditPosts = function(amount) {
	return new Promise(function(resolve, reject) {
		request({
			url: rPrefix + r + rSuffix + parseInt(amount),
			json: true
		}, function(err, response, body) {
			if (!err && response.statusCode === 200) {
				resolve(body['data']['children']);
			}
			else {
				reject(err);
			}
		});
	});
};

exports.getPostFromPermalink = function(permalink) {
	return new Promise(function(resolve, reject) {
		permalink = permalink.split("?")[0] + ".json";
		console.log("Fetching Reddit post from URL " + permalink);
		request({
			url: permalink,
			json: true
		}, function(err, response, body) {
			if (!err && response.statusCode === 200) {
				console.log("Reddit post fetched:");
				console.log(body[0]["data"]["children"][0]);
				resolve(body[0]["data"]["children"][0]);
			}
			else {
				reject(err);
			}
		});
	});
};

exports.getPostToDo = function() {
	return new Promise(function(resolve, reject) {
		if (debugP != null) {
			
			var debugUrl = rPrefix + "/comments/" + debugP + "/.json";
			console.log("[DEBUGGING MODE] Fetching Reddit post from URL " + debugUrl);
			request({
				url: debugUrl,
				json: true
			}, function(err, response, body) {
				if (!err && response.statusCode === 200) {
					console.log("Reddit post fetched:");
					console.log(body[0]["data"]["children"][0]);
					resolve(body[0]["data"]["children"][0]);
				}
				else {
					reject(err);
				}
			});
		}
		else {
			module.exports.retrieveRedditPosts(40).then(function(redditPosts) {
				let post = null;
				for (let i = 0; i < redditPosts.length; i++) {
					
					post = redditPosts[i];
					if (postStatus.postNotDone(post['data']['id'])) {
						
						if (post['data']['over_18'] == false && post['data']['stickied'] == false) {
							
							break;
						}
					}
				}
			
				
				if (postStatus.postNotDone(post['data']['id'])) {
					resolve(post);
				}
				else {
					reject("(all posts are done)");
				}
			}).catch(function(err) {
				reject(err);
			});
		}
	});
};