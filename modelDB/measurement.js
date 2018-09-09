/**
 * Created by EkaterinaAcc on 29-Oct-16.
 */

var sql = require("./mysqlModel.js");
var settings = require("../settings.js");
var replication = require("./replication.js")

module.exports.postMeasurement = async function(req,  callback){
    var ExperimentID = req.body.ExperimentID;
    var UserLoginID = req.body.UserLoginID;
    var SubjectID = req.body.SubjectID;
    var MeasurementDate = new Date(req.body.MeasurementDate * 1);
    var Latitude = req.body.Latitude;
    var Longitude = req.body.Longitude;
    var Address = req.body.Address;
    var query = "INSERT INTO "+ settings.tableNames.measurement +" (ExperimentID, UserLoginID, SubjectID, MeasurementDate, Latitude, Longitude, Address) VALUES (?, ?, ?, ?, ?, ?, ?)";
    var data = [ExperimentID, UserLoginID, SubjectID, MeasurementDate, Latitude, Longitude, Address];
    
    try {

        var measurement = await createMeasurement(query, data);
        var measurementReplication = await createReplication(measurement);
        measurementReplication.ExperimentID = ExperimentID;
        measurementReplication.UserLoginID = UserLoginID;
        measurementReplication.SubjectID = SubjectID;
        measurementReplication.MeasurementDate = MeasurementDate;
        measurementReplication.Latitude = Latitude;
        measurementReplication.Longitude = Longitude;
        measurementReplication.Address = Address;
        callback(null, measurementReplication);
    } catch (err) {

        callback(err);
    }    
};

function createMeasurement(query, data) {
    return new Promise((resolve, reject) => {
        sql.exacuteQueryWithArgs(query, data, function(err, res){
            if(err){
                reject(err);
            }else{
                resolve(res.insertId)
            }
        })
    })
}

function createReplication(measurement) {
    return new Promise((resolve, reject) => {
        var request = {
            body: {
                MeasurementID: measurement
            }
        };
        replication.postReplication(request, function(err, result) {
            if (!err) {
                var res = {
                    MeasurementID: measurement,
                    ReplicationID: result.ID
                }
                resolve(res);
            } else {
                reject(err);
            }
        });
    })
}

module.exports.updateMeasurement = async function(req, callback){
    var ID = req.params.measurementID;
    var args;

     try {
        var measurement = await readMeasurement(ID);
        console.log('GOt measurement')
        if (measurement && measurement[0].ID) {
            var ExperimentID = measurement[0].ExperimentID ? measurement[0].ExperimentID : res[0].ExperimentID;
            var UserLoginID = measurement[0].UserLoginID ? measurement[0].UserLoginID : res[0].UserLoginID;
            var SubjectID = measurement[0].SubjectID ? measurement[0].SubjectID : res[0].SubjectID;
            var MeasurementDate = measurement[0].MeasurementDate ? measurement[0].MeasurementDate : res[0].MeasurementDate;
            var Latitude = measurement[0].Latitude ? measurement[0].Latitude : res[0].Latitude;
            var Longitude = measurement[0].Longitude ? measurement[0].Longitude : res[0].Longitude;
            var Address = measurement[0].Address ? measurement[0].Address : res[0].Address;
            var Active = false;

            query = "UPDATE " + settings.tableNames.measurement + " SET ExperimentID = ?, UserLoginID = ?, SubjectID = ?, MeasurementDate = ?, Latitude = ?, Longitude = ?, Address = ?, Active = ? WHERE ID = ?;";
            args = [
                ExperimentID,
                UserLoginID,
                SubjectID,
                MeasurementDate,
                Latitude,
                Longitude,
                Address,
                Active,
                ID
            ];
            console.log("ARGS", args);
            var stoped = await stopMeasurement(query, args);
            console.log("stoped", stoped)

        } else {
            callback("Item doesn't exist");
        }
    } catch (err) {
        callback(err)
    }
   /* sql.exacuteQueryWithArgs(query, args, function(err, res){
        if(err){
            callback(err);
        }else{
            

           
            
        }
    });*/
};

function stopMeasurement(query, data) {
    return new Promise((resolve, reject) => {
        sql.exacuteQueryWithArgs(query, data, function(err, result){
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        });
    });
}

function readMeasurement(ID) {
    return new Promise((resolve, reject) => {
        var query = "SELECT * FROM " + settings.tableNames.measurement + " WHERE ID = ?;"
        var arg = [ID];
        sql.exacuteQueryWithArgs(query, arg, function(err, res){
            if(!err){
                resolve(res);
            }else{
                reject(err);
            }
        })

    });
}

module.exports.getAllMeasurements = function(callback){
    var query = "SELECT * from " + settings.tableNames.measurement + " ORDER BY MeasurementDate DESC;";
    sql.exacuteQuery(query, function(err, res){
        if(!err){
            callback(null, res)
        }else{
            callback(err);
        }
    })
};

module.exports.getOneMeasurement = async function(ID, callback){
    try {
        var measurement = await readMeasurement(ID);
        callback(null, measurement);
    } catch (err) {
        callback(err);
    }
};
module.exports.deleteMeasurement = function(ID, callback){
    var query = "DELETE FROM " + settings.tableNames.measurement + " WHERE ID = ?;"
    var arg = [ID];
    sql.exacuteQueryWithArgs(query, arg, function(err, res){
        if(!err){
            callback(null, res)
        }else{
            callback(err);
        }
    })

};