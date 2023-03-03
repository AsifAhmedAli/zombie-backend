const conn = require("../conn/conn");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


//new registration doctor-controller

const new_doctor = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if the email is already registered
    conn.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (error, results) => {
        if (error) {
          return res.status(500).send({ error });
        }
        if (results.length > 0) {
          return res.status(400).send({ error: "Email already registered" });
        }
      }
    );

    const status1 = 0;
    const verified1 = 0;
    const insertQuery = `INSERT INTO users (name, email, password, status1, verified1) VALUES (?, ?, ?, ?, ?)`;
    await conn.query(insertQuery, [name, email, password, status1, verified1]);

    const token = crypto.randomBytes(20).toString("hex");
    const updateQuery = `UPDATE users SET token = ? WHERE email = ?`;
    await conn.query(updateQuery, [token, email]);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification",
      text: `Hello ${name}, Thank you for registering as a doctor. Please click on the link below to verify your email address.`,
      html: `<p>Hello ${name},</p> <p>Thank you for registering as a doctor.</p> <p>Please click on the link below to verify your email address:</p>
        <a href='${process.env.SITE_URL}/verify/${token}'>${process.env.SITE_URL}/verify/${token}</a>`,
      // html: `Please click this link to verify your email: <a href="http://localhost:3000/verify/${token}">Verify Email</a>`
    };
    await transporter.sendMail(mailOptions);

    res.json({
      message:
        "User registered successfully. Please check your email for verification link.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }

  // var name1 = req.body.name;
  // var email1 = req.body.email;
  // var pass1 = req.body.pass;
  // var dbname = process.env.dbname;
  // let sql = "CALL " + dbname + ".get_user_with_email(?)";

  // conn.query(sql, [email1], (error, results, fields) => {
  //   if (error) {
  //     return console.error(error.message);
  //   } else {
  //     console.log(results[0]);
  //   }
  // });

  //   let sql = "CALL " + dbname + ".set_doctor_registration(?, ?, ?)";

  //   conn.query(sql, [name1, email1, pass1], (error, results, fields) => {
  //     if (error) {
  //       return console.error(error.message);
  //     } else {
  //       return res.send({ msg: "success" });
  //     }
  //   });
};

// verify Email
const verify_email = async (req, res) => {
  try {
    const { token } = req.params;
    const selectQuery = `SELECT * FROM users WHERE token = ?`;
    const results = await conn.query(selectQuery, [token]);

    if (!results) {
      res.status(400).json({ message: "Invalid verification link" });
    } else {
      const updateQuery = `UPDATE users SET verified1 = 1, token = NULL WHERE token = ?`;
      await conn.query(updateQuery, [token]);
      res.status(200).json({ message: "Email verified successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

//  Login Controler for Doctor

const doctor_login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkUserQuery = `SELECT * FROM users WHERE email = '${email}'`;
    conn.query(checkUserQuery, (error, results) => {
      if (error) throw error;
      if (results.length === 0) {
        return res.status(400).json({ message: "You are not registered, Please register first" });
      }
      const user = results[0];
      if (!user) {
        return res
          .status(400)
          .json({ message: "You are not registered, Please Register first" });
      }
      if (user.password !== password) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      if (user.status1 === 0) {
        return res.status(400).json({
          message:
            "You are not verfied by admin. please wait untill admin approved you or contact with administration",
        });
      }
      if (user.verified1 === 0) {
        return res.status(400).json({
          message:
            "Please verify your email, go to your registered email and click on verification link",
        });
      }
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email
      };
      const token =  jwt.sign(
        payload,
        process.env.jwtSecret,
        { expiresIn: 360000 },
        (err, token) => {
            if (err) throw err;
            res.cookie("token", token, { httpOnly: true });
            res.status(200).json({ message: "User logged in successfully",user });
        }
    );
      
    });

    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Logout for Doctor

const doctor_logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//new registration of patients controller

const new_patient = (req, res) => {
  
  const {
    name,
    date_of_birth,
    email,
    password,
    medical_condition,
    low_threshold,
    high_threshold,
    device_barcode,
    notes,
  } = req.body;

 
  const doctorId = req.body.doctorId || req.user.id;; 
  const doctorName = req.user.name;; 
  const insertPatientQuery = `INSERT INTO patients (name, email, password,doctor_id,doctor_name) VALUES (?,?,?,?,?)`;
  conn.query(
    insertPatientQuery,
    [
      name,
      email,
      password,
      doctorId,
      doctorName
    ],
    (error, results) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }

      const patientId = results.insertId;
      const insertPatientDeviceQuery = `INSERT INTO patient_devices (patient_id, device_barcode) VALUES (?,?)`;
      conn.query(
        insertPatientDeviceQuery,
        [patientId, device_barcode],
        (error, results) => {
          if (error) {
            return res.status(500).json({
              success: false,
              message: error.message,
            });
          }
        }
      );

      // insert patient-doctor relationship into patient_doctor table

      const doctorId = req.body.doctorId || req.user.id; // get doctorId from the request body
      const doctorName =  req.user.name; // get doctorName from the request body

      conn.query(
        "INSERT INTO patient_doctor (patient_id, doctor_id,doctor_name) VALUES (?,?,?)",
        [patientId, doctorId,doctorName]
      );
 

      const insertPatientNotesQuery = `INSERT INTO patient_notes (patient_id, note) VALUES (?,?)`;
      conn.query(
        insertPatientNotesQuery,
        [patientId, notes],
        (error, results) => {
          if (error) {
            return res.status(500).json({
              success: false,
              message: error.message,
            });
          }
        }
      );

      const insertPatientDetailsQuery = `INSERT INTO patient_details (patient_id, date_of_birth, medical_condition, low_threshold, high_threshold) VALUES (?,?,?,?,?)`;
      conn.query(
        insertPatientDetailsQuery,
        [patientId, date_of_birth, medical_condition, low_threshold, high_threshold],
        (error, results) => {
          if (error) {
            return res.status(500).json({
              success: false,
              message: error.message,
            });
          }
        }
      );
      // const emailToken = crypto.randomBytes(20).toString("hex");
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.P_EMAIL,
          pass: process.env.P_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.P_EMAIL,
        to: email,
        subject: "Your Login Credentials",
        text: `Your login email: ${email} and password: ${password}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({
            success: false,
            message: error.message,
          });
        }
      });

      return res.status(200).json({
        success: true,
        message: "Patient registered successfully",
      });
    }
  );
};


//  Edit Patient

const edit_patient = async (req,res)=>{



  // const patientId = req.params.id;
  // const { name, date_of_birth, medical_condition, low_threshold, high_threshold } = req.body;
  

  try {
    const { name } = req.body;
    const patientId = req.params.id;

     conn.query("UPDATE patients SET name = ? WHERE id = ?", [name, patientId]);

    // update patient_details table if data exists
    if (req.body.low_threshold || req.body.high_threshold || req.body.low_threshold || req.body.high_threshold) {
      const date_of_birth = req.body.date_of_birth || null;
      const medical_condition = req.body.medical_condition || null;
      const low_threshold = req.body.low_threshold || null;
      const high_threshold = req.body.high_threshold || null;
      

      await conn.query("UPDATE patient_details SET date_of_birth = ? , medical_condition = ?, low_threshold = ?, high_threshold = ? WHERE patient_id = ?", [date_of_birth, medical_condition,low_threshold, high_threshold, patientId]);
    }

    // update patient_devices table if data exists
    if (req.body.device_barcode || req.body.device_id) {
      const device_barcode = req.body.device_barcode || null;
      // const device_id = req.body.device_id || null;
     

      await conn.query("UPDATE patient_devices SET device_barcode = ? WHERE patient_id = ?", [device_barcode, patientId]);
    }

    // update patient_notes table if data exists
    if (req.body.notes) {
      const notes = req.body.notes || null;

      await conn.query("UPDATE patient_notes SET note = ? WHERE patient_id = ?", [notes, patientId]);
    }

    return res.json({ message: "Patient data updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({error:error.message});
  }

}


// delete patients

const delete_patient = async (req, res)=>{
  // const patientId = req.params.id;
  // const userId = req.user.id

  const patientId = req.params.id;

  // Check if the user is authorized to delete this patient
  const userId = req.user.id;

  const userRole = req.user.role;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized Access" });
  }

  // Delete the patient from the patients table
  conn.query("DELETE FROM patients WHERE id = ?", [patientId], (error) => {
    if (error) {
      return res.status(500).json({ error });
    }

    // Delete the patient's devices from the patient_devices table
    conn.query(
      "DELETE FROM patient_devices WHERE patient_id = ?",
      [patientId],
      (error) => {
        if (error) {
          return res.status(500).json({ error });
        }

        // Delete the patient's notes from the patient_notes table
        conn.query(
          "DELETE FROM patient_notes WHERE patient_id = ?",
          [patientId],
          (error) => {
            if (error) {
              return res.status(500).json({ error });
            }

            // Delete the patient's details from the patient_details table
            conn.query(
              "DELETE FROM patient_details WHERE patient_id = ?",
              [patientId],
              (error) => {
                if (error) {
                  return res.status(500).json({ error });
                }

                // Delete the patient from the patient_doctor table
                conn.query(
                  "DELETE FROM patient_doctor WHERE patient_id = ?",
                  [patientId],
                  (error) => {
                    if (error) {
                      return res.status(500).json({ error });
                    }

                    // Return success response
                    res.json({ message: "Patient Deleted Successfully" });
                    console.log(patientId)
                  }
                );
              }
            );
          }
        );
      }
    );
  });
  
}

//  Get All The Patients of one Doctor

const all_patients_of_one_doctor = async  (req, res)=>{

  // Get the doctor ID from the request
   const doctor_id = req.user.id;
  // const id = req.params.id;

  // Pagination variables
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;


  const query = `
    SELECT patients.*,doctor_name, patient_devices.*, patient_notes.*
    FROM patients
    LEFT JOIN patient_devices ON patients.id = patient_devices.patient_id
    LEFT JOIN patient_notes ON patients.id = patient_notes.patient_id
    WHERE patients.doctor_id = ?
    LIMIT ? OFFSET ?
  `;

  const getTotalQuery = `
  SELECT COUNT(*) as total
  FROM patients
  WHERE doctor_id = ?
`;

  


  conn.query(getTotalQuery, [doctor_id], (error, results, fields) => {
    const totalPatients = results[0].total;
    conn.query(query, [doctor_id, limit, offset], (error, results) => {
      if (error) {
        res.status(500).json({ error:error.message });
      } else {
        res.status(200).json({
           totalPatients,
           patients: results

           });
      }
    });

  });

}



//update_pass

const update_pass_func = (req, res) => {

  userId = req.user.id
  // Check if user is logged in and the user id from request body matches the logged in user's id
  if (!userId) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  const { newPassword, confirmPassword } = req.body;

  // Validate input
  if (!newPassword || !confirmPassword) {
    return res.status(400).send({ message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).send({ message: "New password and confirm password do not match" });
  }

  // Check if old password is correct
  conn.query(
    "SELECT * FROM users WHERE id = ?",
    [userId],
    (error, results) => {
      if (error) {
        return res.status(500).send({ message: error.message });
      }


      // Update password in the database

      // const hashedPassword = bcrypt.hashSync(newPassword, 8);

      conn.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [newPassword, userId],
        (error, results) => {
          if (error) {
            return res.status(500).send({ message: error.message });
          }

          res.status(200).send({ message: "Password updated successfully" });
        }
      );
    }
  );


  // var currentpass = req.body.current_pass;
  // var updated_pass = req.body.updated_pass;
  // var update_pass1 = req.body.update_pass1;
  // var user_id = req.body.user_id;
  // var dbname = process.env.dbname;
  // let sql = "CALL " + dbname + ".get_user(?)";

  // conn.query(sql, [user_id], (error, results, fields) => {
  //   if (error) {
  //     return console.error(error.message);
  //   } else {
  //     if (currentpass == results[0][0].password) {
  //       if (updated_pass != update_pass1) {
  //         return res.send({ msg: "passwords not same" });
  //       }
  //       if (updated_pass == update_pass1) {
  //         //   return res.send({ msg: "success" });
  //         let sql = "CALL " + dbname + ".update_passworda(?, ?)";

  //         conn.query(sql, [updated_pass, user_id], (error, results, fields) => {
  //           if (error) {
  //             return console.error(error.message);
  //           } else {
  //             return res.send({ msg: "success" });
  //           }
  //         });
  //       }
  //     } else {
  //       return res.send({ msg: "incorrect current pasword" });
  //     }
  //   }
  // });
};


//update user name

const update_name = (req, res) => {

  const userId = req.user.id
  const { newName }  = req.body;
  // console.log(userId)
  

if (!userId) {
return res.status(401).send({ error: "Unauthorized" });
}
if(!newName){
  return res.status(400).json("Name Required")
}

// console.log(newName)

conn.query(
"UPDATE users SET name = ? WHERE id = ?",
[newName, userId],
(error, results) => {
if (error) {
return res.status(500).send({ error });
}
return res.status(200).json({ message: "Name updated successfully" });
}
);



  // var new_name = req.body.name;
  // var user_id = req.body.user_id;
  // var dbname = process.env.dbname;
  // let sql = "CALL " + dbname + ".update_name(?, ?)";

  // conn.query(sql, [new_name, user_id], (error, results, fields) => {
  //   if (error) {
  //     return console.error(error.message);
  //   } else {
  //     return res.send({ msg: "success" });
  //   }
  // });
};


//  login for Patients

const patient_login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkUserQuery = `SELECT * FROM patients WHERE email = '${email}'`;
    conn.query(checkUserQuery, (error, results) => {
      if (error) throw error;
      if (results.length === 0) {
        return res.status(400).json({ message: "You are not registered" });
      }
      const user = results[0];
      if (!user) {
        return res
          .status(400)
          .json({ message: "You are not registered, Please Register first" });
      }
      if (user.password !== password) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      
      // const payload = {
      //   id: user.id,
      //   name: user.name,
      //   email: user.email
      // };
      const token = jwt.sign({ id: user.id,name: user.name, }, process.env.jwtSecret, {
        expiresIn: "8h",
      });
      res.cookie("token", token, { httpOnly: true });
      res.status(200).json({ message: "Login successful", user });
    });

  
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};




// function new_patient(req, res) {
//   if (typeof req.body.device_barcode !== "undefined") {
//     var device_barcode = req.body.device_barcode;
//   } else {
//     var device_barcode = "not set";
//   }
//   if (typeof req.body.hth !== "undefined") {
//     var hth = req.body.hth;
//   } else {
//     var hth = "not set";
//   }
//   if (typeof req.body.lth !== "undefined") {
//     var lth = req.body.lth;
//   } else {
//     var lth = "not set";
//   }

//   if (typeof req.body.mc !== "undefined") {
//     var mc = req.body.mc;
//   } else {
//     var mc = "not set";
//   }

//   if (typeof req.body.notes !== "undefined") {
//     var notes = req.body.notes;
//   } else {
//     var notes = "not set";
//   }

//   if (typeof req.body.dob !== "undefined") {
//     var dob = req.body.dob;
//   } else {
//     var dob = "not set";
//   }
//   var name1 = req.body.name;
//   var email1 = req.body.email;
//   var pass1 = req.body.pass;
//   //   var dob = req.body.dob;
//   //   var device_barcode = req.body.device_barcode;
//   //   var hth = req.body.hth;
//   //   var lth = req.body.lth;
//   //   var mc = req.body.mc;
//   //   var notes = req.body.notes;
//   var dbname = process.env.dbname;
//   let sql = "CALL " + dbname + ".set_patient_registration(?, ?, ?)";

//   conn.query(sql, [name1, email1, pass1], (error, results, fields) => {
//     if (error) {
//       return console.error(error.message);
//     } else {
//       // return res.send({ msg: "success" });
//       let sql1 = "CALL " + dbname + ".get_latest_patient()";

//       conn.query(sql1, (error, results1, fields) => {
//         if (error) {
//           return console.error(error.message);
//         } else {
//           lastest_patient = results1[0][0].newpatient;
//           // return res.send({ msg: "success" });
//           let sql2 = "CALL " + dbname + ".set_patient_details(?, ?, ?, ?, ?)";

//           conn.query(
//             sql2,
//             [lastest_patient, dob, hth, lth, mc],
//             (error, results, fields) => {
//               if (error) {
//                 return console.error(error.message);
//               } else {
//                 // return res.send({ msg: "success" });
//                 let sql3 = "CALL " + dbname + ".set_patient_notes(?, ?)";

//                 conn.query(
//                   sql3,
//                   [notes, lastest_patient],
//                   (error, results, fields) => {
//                     if (error) {
//                       return console.error(error.message);
//                     } else {
//                       //   return res.send({ msg: "success" });
//                       let sql4 =
//                         "CALL " + dbname + ".set_patient_devices(?, ?)";

//                       conn.query(
//                         sql4,
//                         [lastest_patient, device_barcode],
//                         (error, results, fields) => {
//                           if (error) {
//                             return console.error(error.message);
//                           } else {
//                             return res.send({ msg: "success" });
//                           }
//                         }
//                       );
//                     }
//                   }
//                 );
//               }
//             }
//           );
//         }
//       });
//     }
//   });
//   //   console.log(
//   //     device_barcode +
//   //       "\n" +
//   //       hth +
//   //       "\n" +
//   //       lth +
//   //       "\n" +
//   //       mc +
//   //       "\n" +
//   //       notes +
//   //       "\n" +
//   //       name1 +
//   //       "\n" +
//   //       email1 +
//   //       "\n" +
//   //       pass1 +
//   //       "\n" +
//   //       dob
//   //   );
//   return 0;
// }





// Logout for Patient

const patient_logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//all patients of one doctor
// const all_patients_of_one_doctor = (req, res) => {
//   var d_id1 = req.query.d_id;
//   //   console.log(d_id1);
//   var dbname = process.env.dbname;
//   let sql = "CALL " + dbname + ".all_patients_of_one_doctor(?)";

//   conn.query(sql, [d_id1], (error, results, fields) => {
//     if (error) {
//       return console.error(error.message);
//     } else {
//       //   console.log(results);
//       //   return res.results;
//       return res.send({ msg: results[0] });
//     }
//   });
// };
// function all_msgs(con, err) {
//   if (err) throw err;
//   con.query("SELECT * FROM msgs", function (err, result, fields) {
//     if (err) throw err;
//     console.log(result);
//   });
// }
module.exports = {
  new_patient,
  new_doctor,
  all_patients_of_one_doctor,
  update_pass_func,
  update_name,
  verify_email,
  doctor_login,
  doctor_logout,
  all_patients_of_one_doctor,
  patient_login,
  edit_patient,
  delete_patient,
  patient_logout
};
