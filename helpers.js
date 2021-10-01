// given a email, will look through users object to see if that email already exists
const findUserByEmail = (email, database) => {
  for (const userID in database) {
    const idOfUser = database[userID];
    if (idOfUser.email === email) {
      return idOfUser;
    }
  }
  return null;
};

module.exports = { findUserByEmail };