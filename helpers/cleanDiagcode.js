// helpers/cleanDiagcode.js
const cleanDiagcode = (value) => {
  if (typeof value === 'string') {
      return value.trim().toUpperCase();
  }
  return value;
};

module.exports = cleanDiagcode;
