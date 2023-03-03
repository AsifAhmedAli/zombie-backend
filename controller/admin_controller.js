const conn = require("../conn/conn");

exports.verifyUser = async (req, res) => {

    const user_id = req.params.id;
    try {
        const checkSql = "SELECT status1 FROM users WHERE id = ?";
        const result = await conn.query(checkSql, [user_id]);
        if (!result.length) {
            return res.status(400).json({ msg: "User not found" });
        }
        if (result.status1 === 1) {
            return res.status(400).json({ msg: "User already approved" });
        }
        const updateSql = "UPDATE users SET status1 = 1 WHERE id = ?";
        await conn.query(updateSql, [user_id]);
        res.status(200).json({ msg: "User approved successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({error:error.message});
    }



    //  const user_id = req.params.id;
    // try {
    //     const sql = "UPDATE users SET status1 = 1 WHERE id = ?";
    //     await conn.query(sql, [user_id]);
    //     res.status(200).json({ msg: "User approved successfully" });
        
    // } catch (error) {
    //     console.log(error);
    //     res.status(500).send({error:error.message});
    // }

    
//     try {
//         const { id } = req.params;
//         const sql = "SELECT * FROM users WHERE id = ?";
//         const user = await conn.query(sql, [id]);
//         // console.log(user)
//         if (!user) {
//             return res.status(400).json({ message: "User not found" });
//         }
//         if (user.status1 === 1) {
//             return res.status(400).json({ message: "User already verified" });
//         }
//         const updateSql = "UPDATE users SET status1 = 1, verified1 = 1 WHERE id = ?";
//         await conn.query(updateSql, [id]);
//         res.status(200).json({ message: "User verified successfully" });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({error:error.message});
//     }
};
