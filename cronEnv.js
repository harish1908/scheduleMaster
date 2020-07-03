var cron = require("node-cron")
var mongo = require('./mongoEnv.js')
var scheduledURLExecution = mongo.scheduledURLExecution;
var db = mongo.mongoDbConnection;
var request = require('request');
var redis = require('./redisEnv');

//Time Configuration for Redis
var timeForDbtoList = '*/15 * * * *';
var timeForDbtoIntermediateList = '* * * * *';


//cron which will run in 15 minute interval
function dbToListCron() {
    cron.schedule(timeForDbtoList, () => {
        db.collection("scheduledURLExecution").find({ "executionTime": { $gt: new Date().getTime() / 60000, $lt: (new Date().getTime() / 60000) + 15 } }).toArray(function (err, result) {
            if (err) 
                //// mechanism for sending the result through mail or slack

            result.forEach(data => {
                redis.addItemToRedis(ele.executionTime.toString(), data);
            })
        });
    });
}


//Function that runs Cron evey minute
function dbToIntermediateListCron() {
    cron.schedule(timeForDbtoIntermediateList, () => {
        var currentTime = Math.floor(new Date().getTime() / 60000);
        redis.executeURL(currentTime);
    });
}

module.exports = {
    dbToIntermediateListCron : dbToIntermediateListCron,
    dbToListCron : dbToListCron,
}
