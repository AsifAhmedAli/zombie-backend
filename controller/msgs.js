const conn = require("../conn/conn");

const moment = require("moment");

const io = require("socket.io")();

//set_new_message
const set_new_message = (req, res) => {

  // // Get the sender_id, sender_name, receiver_id, and message from the request body
  // const senderId = req.user.id;
  // const senderName = req.user.name;
  // const receiverId = req.body.receiverId;
  // const message = req.body.message;

  // // Insert the message into the messages table in the database
  // conn.query(
  //   "INSERT INTO messages (sender_id, sender_name, receiver_id, message) VALUES (?,?,?,?)",
  //   [senderId, senderName, receiverId, message],
  //   (error, results) => {
  //     if (error) {
  //       return res.status(500).json({ error });
  //     }
  //     // Emit the message to the receiver using Socket.io
  //     io.to(receiverId).emit("newMessage", {
  //       senderId,
  //       senderName,
  //       message
  //     });
  //     return res.status(200).json({ message: "Message sent successfully" });
  //   }
  // );
  
  let message = req.body.message;
  let sender_id = req.user.id;
  let sender_name = req.user.name;
  let receiver_id = req.body.receiver_id;
  let receiver_name = req.body.receiver_name
  var file = req.file;
  // let receiver_name = req.body.receiver_name;



// First, check if there is an existing conversation between the sender and receiver
conn.query('SELECT * FROM conversations WHERE (patient_id = ? AND user_id = ?) OR (patient_id = ? AND user_id = ?) LIMIT 1',
[receiver_id, sender_id, sender_id, receiver_id],
function(err, result) {
  if (err) throw err;

  // If there is no existing conversation, create a new one
  if (result.length == 0) {
    conn.query('INSERT INTO conversations (patient_id, user_id) VALUES (?, ?)',
      [receiver_id, sender_id],
      function(err, result) {
        if (err) throw err;
     

        // Insert the message into the messages table with the new conversation ID
        conn.query('INSERT INTO messages (conversation_id,sender_id,sender_name, receiver_id,receiver_name, message, timestamp) VALUES (?, ?, ?, ?, ?,?,?)',
          [
          result.insertId,
          sender_id,
          sender_name,
          receiver_id,
          receiver_name,
          message,
          moment().format("YYYY-MM-DD HH:mm:ss"),   
          ],
          function(err, result) {
            if (err) throw err;
            // If files were uploaded, insert the attachments into the attachments table with the new message ID
            if (req.files) {
              const message_id = result.insertId;
              req.files.forEach(function(file) {
                conn.query(
                              "INSERT INTO message_attachments (message_id, file_name, file_path, created_at) VALUES (?, ?, ?, ?)",
                              [
                                message_id,
                                file.originalname,
                                file.path.substr(7),
                                moment().format("YYYY-MM-DD HH:mm:ss"),
                              ],
                  function(err, result) {
                    if (err) throw err;
                  });
              });
            }

            res.status(200).json({ success: true, message: 'Message sent successfully.' });
          });
      });
  } else {
    const conversation_id = result[0].id;
    // If there is an existing conversation, insert the message into the messages table with the existing conversation ID
    conn.query('INSERT INTO messages (conversation_id,sender_id,sender_name, receiver_id,receiver_name, message, timestamp) VALUES (?, ?, ?, ?, ?,?,?)',
      [conversation_id,
      sender_id,
          sender_name,
          receiver_id,
          receiver_name,
          message,
          moment().format("YYYY-MM-DD HH:mm:ss"), 
          ],
      function(err, result) {
        if (err) throw err;
        // If files were uploaded, insert the attachments into the attachments table with the new message ID
        if (req.files) {
          const message_id = result.insertId;
          req.files.forEach(function(file) {
            conn.query(
                          "INSERT INTO message_attachments (message_id, file_name, file_path, created_at) VALUES (?, ?, ?, ?)",
                          [
                            message_id,
                            file.originalname,
                            file.path.substr(7),
                            moment().format("YYYY-MM-DD HH:mm:ss"),
                          ],
              function(err, result) {
                if (err) throw err;
              });
          });
        }


        res.status(200).json({ success: true, message: 'Message sent successfully.' });
      });
  }
});








  

  // let message = req.body.message;
  // let sender_id = req.user.id;
  // let sender_name = req.user.name;
  // let receiver_id = req.body.receiver_id;
  // let receiver_name = req.body.receiver_name
  // // let receiver_name = req.body.receiver_name;

    
  //     // Insert the message into the messages table
  //     conn.query(
  //       "INSERT INTO messages (sender_id,sender_name, receiver_id,receiver_name, message, timestamp) VALUES (?, ?, ?, ?,?,?)",
  //       [
  //         sender_id,
  //         sender_name,
  //         receiver_id,
  //         receiver_name,
  //         message,
  //         moment().format("YYYY-MM-DD HH:mm:ss"),
  //       ],
  //       (error, results) => {
  //         if (error) {
  //           return res.status(500).json({ error: error });
  //         }

  //         // Get the id of the inserted message
  //         const message_id = results.insertId;

  //         // Insert the attachments into the message_attachments table
  //         req.files.forEach((file) => {
  //           conn.query(
  //             "INSERT INTO message_attachments (message_id, file_name, file_path, created_at) VALUES (?, ?, ?, ?)",
  //             [
  //               message_id,
  //               file.originalname,
  //               file.path.substr(7),
  //               moment().format("YYYY-MM-DD HH:mm:ss"),
  //             ],
  //             (error, results) => {
  //               if (error) {
  //                 return res.status(500).json({ error: error });
  //               }
  //             }
  //           );
  //         });

  //         // Emit the message and attachments to the receiver using socket.io
  //         io.to(receiver_id).emit("new message", {
  //           message_id: message_id,
  //           sender_id: sender_id,
  //           sender_name: sender_name,
  //           receiver_id: receiver_id,
  //           receiver_name: receiver_name,
  //           message: message,
  //           attachments: req.files,
  //           created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
  //         });

  //         res.status(200).json({ message: "Message sent successfully" });
  //       }
  //     );


  // var from = req.body.from;
  // var to = req.body.to;
  // var msg = req.body.msg;
  // var dbname = process.env.dbname;
  // let sql3 = "CALL " + dbname + ".set_message(?, ?, ?)";
  // conn.query(sql3, [from, to, msg], (error, results, fields) => {
  //   if (error) {
  //     return console.error(error.message);
  //   } else {
  //     return res.send({ msg: "success" });
  //   }
  // });
};
const edit_message = (req, res) => {
  const message_id = req.params.id;
  const userId = req.user.id;
  const { message } = req.body;

  conn.query(
    'UPDATE messages SET message = ? WHERE id = ? AND sender_id = ?',
    [message, message_id, userId],
    (err, result) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(400).send({ message: 'Message not found or unauthorized' });
      }
      // Emit the updated message to all connected clients
      io.emit('update message', { id: message_id, message });
      return res.send({ message: 'Message updated successfully' });
    }
  );
}

// Delete a message

const delete_message = (req, res) => {

  const messageId = req.params.id;
  const userId = req.user.id;

  conn.query(
    'DELETE FROM messages WHERE id = ? AND sender_id = ?',
    [messageId, userId],
    (err, result) => {
      if (err) {
        return res.status(500).send({ message: 'Error deleting message' });
      }
      if (result.affectedRows === 0) {
        return res.status(400).send({ message: 'You can only delete your own message' });
      }
      // Emit the deleted message to all connected clients
      io.emit('delete message', messageId);
      return res.send({ message: 'Message deleted successfully' });
    }
  );

}


// Delete all chat
const delete_all_messages = async (req, res) => {
  const userId = req.user.id;

  conn.query(
    'DELETE FROM messages WHERE sender_id = ?',
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).send({ message: 'Error deleting messages' });
      }
      if (result.affectedRows === 0) {
        return res.status(400).send({ message: 'No messages found' });
      }
      // Emit the deleted messages to all connected clients
      io.emit('delete messages', userId);
      return res.send({ message: 'Messages deleted successfully' });
    }
  );
}
// getchat
// const getchat = (req, res) => {
//     var from = req.body.from;
//     var to = req.body.to;

// }
module.exports = { set_new_message,delete_message,delete_all_messages,edit_message };
