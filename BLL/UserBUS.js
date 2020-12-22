
const userDAO = require('../DAL/UserDAO');

module.exports.addNewUser = async (req, res) => {
    try
    {
        let user = {
            id: req.body.id,
            name: req.body.name,
            photo: req.body.photo,
            email: req.body.email
        }
        let rs = await userDAO.addNewUser(user);
        console.log(rs);
        if(rs)
        {
            // true for user not exist in database
            res.status(201).send({mess: "OK"});
        }
        else
        {
            res.status(200).send({mess: "OK"});
        }
    }
    catch(e)
    {
        res.status(500).send({mess: "Server Error"});
    }
   
};