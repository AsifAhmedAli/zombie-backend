const conn = require("../conn/conn");
const nodemailer = require("nodemailer");


function new_contact_form(req, res) {

  const {name,email,message} = req.body
 
  
  conn.query("INSERT INTO contact_queries (name, email, message) VALUES (?, ?, ?)", [name, email, message], function(error, results, fields){
    if (error) throw error;
    console.log("Data inserted into database successfully");
  });
  
  var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });
  
  var mailOptions = {
    from: process.env.EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: `Contact Query email from UDATUM`,
    html: `<b>Dear Admin,</b> <p>A user has submitted a query through the contact form on your website. Here are the details:</p><h5>Message</h5>${message}<h5>Name</h5>${name}<h5>Email<h5/>${email}`,
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  
  res.status(200).json("Thank you for contacting us! Our team will get back to you soon.");

  // var name1 = req.body.name;
  // var email1 = req.body.email;
  // var msg1 = req.body.msg;
  // var dbname = process.env.dbname;
  // let sql = "CALL " + dbname + ".set_contact_form(?, ?, ?)";

  // conn.query(sql, [name1, email1, msg1], (error, results, fields) => {
  //   if (error) {
  //     return console.error(error.message);
  //   } else {
  //     return res.send({ msg: "success" });
  //   }
  // });
}
module.exports = { new_contact_form };
// function add_data(con, err) {
//   if (err) throw err;
//   con.query("SELECT * FROM users", function (err, result, fields) {
//     if (err) throw err;
//     Object.keys(result).forEach(function (key) {
//       var row = result[key];
//       //   console.log(row.name);
//     });
//   });
// }
