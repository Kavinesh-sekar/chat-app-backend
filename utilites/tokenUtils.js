const jwt = require('jsonwebtoken');

exports.generateAccessToken = (id) =>{
return jwt.sign({id},process.env.JWT_ACCESS_SECRET,{
    expiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN,
});
};

exports.generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    });
  };

  exports.verifyAccessToken = (token) => {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  };

  exports.verifyRefreshToken = (token) => {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  };