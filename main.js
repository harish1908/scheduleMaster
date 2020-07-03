var express = require("express");
const bodyparser = require("body-parser");
const app = express();

var mongo = require('./mongoEnv.js');
var scheduledURLExecution = mongo.scheduledURLExecution;
var db = mongo.mongoDbConnection;
var request = require('request');

var cron = require ('./cronEnv');

cron.dbToIntermediateListCron();
cron.dbToListCron();

var redis = require('./redisEnv');


//port number
const port = process.env.PORT || 5000;

app.use(bodyparser.json());
app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));

//app listening to the port
app.listen(port, () => {
    console.log("server on")
});

//getting the current time
var timenow = new Date().getTime() / 60000;
timenow = Math.floor(timenow);



//api to post the data in db
app.post('/executeURL', function (req, res) {

    var time = req.body.time;
    var date = req.body.date;
    executionDateTime = date + " " + time;
    var dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    var timeRegex = /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/gm;

    if (!date.match(dateRegex) || !time.match(timeRegex))
        res.send(" input the correct format date yyyy-mm-dd && time hh:mm:ss");
    else {
        var executionDate = new Date(executionDateTime)
        var executionTime = Math.floor(executionDate.getTime() / 60000);
        
        var data = {
            emailId: req.body.emailId,
            url: req.body.url,
            verb: req.body.verb,
            form: req.body.body,
            header: req.body.header,
            executionTime: executionTime,
            response: null,
            createdTime: Date.now,
            createdBy: req.body.emailId,
        }
        var currentTime = Math.floor(new Date().getTime() / 60000);

        if (executionTime - currentTime <= 1) {
            data.method= data.verb;
            request(data, (err, resp, body) => {
                var respBody = body;
                err == null ? data.response = JSON.stringify(resp) : data.response = JSON.stringify(err),body =err;

                mongo.insertItemToDB(data,respBody).then((result) => {
                    res.send(result);
                }).catch((error) => {
                    res.send(error);
                })
            });
        }
        else {
            if ((executionTime - currentTime >= 1) && (executionTime - currentTime <=15)) 
                redis.addItemToRedis(executionTime.toString(),data);
            
            mongo.insertItemToDB(data).then((result) => {
                res.send("Successfully added !!");
            }).catch((error) => {
                res.send(error);
            });

        }

    }
})




