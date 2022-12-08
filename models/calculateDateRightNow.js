const { Timestamp } = require('firebase/firestore');

module.exports = () => {
  // Compute date and split into DD, MM, YYYY
  const d = new Date();
  // Format the date data to be parsed by fb and return
  const dateFormatted = Timestamp.fromDate(new Date(d));
  return dateFormatted;
};
