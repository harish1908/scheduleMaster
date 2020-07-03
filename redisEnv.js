var redis = require("redis");
var mongo = require('./mongoEnv');
var request = require('request');


//Create Mongo DB instance
const db = mongo.mongoDbConnection;
var scheduledURLExecution = mongo.scheduledURLExecution;


//Redis Client Creation
var redisClient = redis.createClient(6379);


//Function for connecting redis
redisClient.on('connect', function () {
    console.log('reddis connected');
});


//Function for pushing the item in redis
function addItemToRedis(time, data) {
    redisClient.lpush(time.toString(), JSON.stringify(data), (err, res) => {
        //// mechanism for sending the result through mail or slack
    });
}

//Function for executing the URL
function executeURL(currentTime){
    redisClient.llen(currentTime.toString(), (err, res) => {
        if (res != 0) {
            redisClient.lrange(currentTime.toString(), 0, res - 1, (err, result) => {
                result.forEach(data => {
                    data = JSON.parse(data);
                    data.method = data.verb;

                    request(data, (err, resp, body) => {
                        var response = err == null ? body:err;
                        db.collection('scheduledURLExecution').updateOne({ executionTime: data.executionTime, url: data.url, emailId : data.emailId}, { $set: { "response": JSON.stringify(response), modifiedDate: Date.now, modifiedBy: "Cron" } }, function (err, result) {
                        //// mechanism for sending the result through mail or slack
                    })
                    });
                })
    
            })
        }
    })
}

module.exports = {
    executeURL : executeURL,
    addItemToRedis : addItemToRedis,
}
