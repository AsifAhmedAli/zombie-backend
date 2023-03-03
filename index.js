var express = require("express");
var app = express();

app.get("/", function (req, res) {
  var sql = require("mssql");

  // config for your database
  var config = {
    user: "sa",
    password: "HelloWorld@23*",
    server: "20.51.247.152",
    database: "RJAAEPC_PartMaster",
    trustServerCertificate: true,
  };

  // connect to your database
  sql.connect(config, function (err) {
    if (err) console.log(err);

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(
      "SELECT * from tblPart where PartNumber = '0-01156-300-0'",
      function (err, recordset) {
        if (err) console.log(err);

        // send records as a response
        res.send(recordset);
      }
    );
  });
});

var server = app.listen(5001, function () {
  console.log("Server is running..");
});
