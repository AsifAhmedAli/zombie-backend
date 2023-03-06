// var express = require("express");
// var app = express();

// app.get("/", function (req, res) {
//   var sql = require("mssql");

//   // config for your database
//   var config = {
//     user: "sa",
//     password: "HelloWorld@23*",
//     server: "20.51.247.152",
//     database: "RJAAEPC_PartMaster",
//     trustServerCertificate: true,
//   };

//   // connect to your database
//   sql.connect(config, function (err) {
//     if (err) console.log(err);

//     // create Request object
//     var request = new sql.Request();

//     // query to the database and get the records
//     request.query(
//       "SELECT * from tblPart where PartNumber = '0-01156-300-0'",
//       function (err, recordset) {
//         if (err) console.log(err);

//         // send records as a response
//         res.send(recordset);
//       }
//     );
//   });
// });

// var server = app.listen(5001, function () {
//   console.log("Server is running..");
// });

// var express = require("express");
// var app = express();
// var sql = require("mssql");
// const cors = require("cors");



// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(cors({
//   origin:"*"
// }));

// // config for your database
// var config = {
//   user: "sa",
//   password: "HelloWorld@23*",
//   server: "20.51.247.152",
//   database: "RJAAEPC_PartMaster",
//   trustServerCertificate: true,
// };

// // API endpoint for search
// app.get('/search', async (req, res) => {
//   try {
//     // Get search query parameters

//     // const vin = req.query.vin;
//     // const partNumber = req.query.partNumber;
//     // const partDescription = req.query.partDescription;
//     const { searchParam } = req.query;

//     // // Create SQL query string with optional WHERE clauses
//     // let query = `SELECT * FROM tblPart`;

//     // if (vin) {
//     //   query += ` WHERE VIN LIKE '%${vin}%'`;
//     // }
//     // if (partNumber) {
//     //   if (vin) {
//     //     query += ` AND PartNumber LIKE '%${partNumber}%'`;
//     //   } else {
//     //     query += ` WHERE PartNumber LIKE '%${partNumber}%'`;
//     //   }
//     // }
//     // if (partDescription) {
//     //   if (vin || partNumber) {
//     //     query += ` AND PartDescription LIKE '%${partDescription}%'`;
//     //   } else {
//     //     query += ` WHERE PartDescription LIKE '%${partDescription}%'`;
//     //   }
//     // }
//      // Define SQL query for search
//      const query = `
//      SELECT * FROM tblPart
//      WHERE
//          ID LIKE '%${searchParam}%' OR
//          HondaCode LIKE '%${searchParam}%' OR
//          PartNumber LIKE '%${searchParam}%' OR
//          PartDescription LIKE '%${searchParam}%'
//  `;

//     // Connect to the database and execute the query
//     const pool = await sql.connect(config);
//     const result = await pool.request().query(query);

//     // Return the search results
//     res.json(result.recordset);

//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server error');
//   }
// });

// var server = app.listen(5001, function () {
//   console.log("Server is running..");
// });




var express = require("express");
var app = express();
var sql = require("mssql");
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "*"
}));

// config for your database
var config = {
  user: "sa",
  password: "HelloWorld@23*",
  server: "20.51.247.152",
  database: "RJAAEPC_PartMaster",
  trustServerCertificate: true,
  options: {
    requestTimeout: 60000 // 60 seconds
  }
};

// API endpoint for search
app.get('/search', async (req, res) => {
  try {
    const { searchParam, partNumber, partDescription } = req.query;

    let whereClause = "";
    let params = [];

    if (searchParam) {
      whereClause = `
        WHERE ID LIKE @param OR
              HondaCode LIKE @param OR
              PartNumber LIKE @param OR
              PartDescription LIKE @param
      `;
      params.push({ name: 'param', value: `%${searchParam}%` });
    }

    if (partNumber) {
      whereClause += (whereClause === "" ? "WHERE" : "AND") + `
        PartNumber LIKE @partNumber
      `;
      params.push({ name: 'partNumber', value: `%${partNumber}%` });
    }

    if (partDescription) {
      whereClause += (whereClause === "" ? "WHERE" : "AND") + `
        PartDescription LIKE @partDescription
      `;
      params.push({ name: 'partDescription', value: `%${partDescription}%` });
    }

    const query = `
      SELECT * FROM tblPart
      ${whereClause}
    `;

    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('param', sql.NVarChar, `%${searchParam}%`)
      .input('partNumber', sql.NVarChar, `%${partNumber}%`)
      .input('partDescription', sql.NVarChar, `%${partDescription}%`)
      .query(query);

    res.status(200).json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// API endpoint for product details with ID
app.get('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT * FROM tblPart
      WHERE ID = @id
    `;

    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(query);

    if (result.recordset.length === 0) {
      res.status(404).send('Product not found');
    } else {
      res.status(200).json(result.recordset[0]);
    }

  } catch (err) {
    // console.error(err);
    res.status(500).json({error:err.message});
  }
});




var server = app.listen(5001, function () {
  console.log("Server is running..");
});


