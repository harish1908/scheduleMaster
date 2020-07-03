var mongoose = require('mongoose');
const { promises } = require('fs');

var url = "mongodb://localhost:27017/project"

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
const mongoDbConnection = mongoose.connection;

//on successfull connection with database
mongoDbConnection.once('open', function (callback) {
    console.log("Mongo DB Connected Successfully.");
});

var dbSchema = new mongoose.Schema({
    id: {
        type: Object,
        auto: 1,
        unique : true
    },

    emailId: {
        type: String,
        required: true,
    },

    url: {
        type: String,
        required: true,
    },

    form: {
        type: String
    },

    method: {
        type: String,
        required: true,
        uppercase: true
    },

    header: {
        type: String
    },

    response: {
        type: String
    },


    createdBy: {
        type: String
    },

    createTime:
    {
        type: Date,
    },

    modifiedBy: {
        type: String
    },

    modifiedTime:
    {
        type: Date,
    },

    executionTime:
    {
        type: Date
    },
});

//Function for Inserting Item
function insertItemToDB(data,response) {
    return new Promise(function(resolve,reject){
        mongoDbConnection.collection('scheduledURLExecution').insertOne(data, function (err, succes) {
            if (err)
                reject (err);
            else
                resolve(response);
        })
    });
}

module.exports = {
    scheduledURLExecution: mongoose.model('scheduledURLExecution', dbSchema),
    mongoDbConnection: mongoDbConnection,
    insertItemToDB:insertItemToDB
}