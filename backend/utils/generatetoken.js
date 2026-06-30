const jwt = require('jsonwebtoken');

const generatedtoken = (userid)=>{
    return jwt.sign({id : userid},process.env.JWT_SECRET,{expiresIn: "7d"});
}

module.exports = generatedtoken;