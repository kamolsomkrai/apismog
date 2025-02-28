// helpers/cleadCID.js
const cleadCID = (value) => {
  if (typeof value === "string") {
    if (
      value ===
      "2727d0ded95451fb564bac5cfe3c1e87e7b18243a1a54ea2aa3553b7b67a9634"
    ) {
      return null;
    }
    if (value === "0") {
      return null;
    }
    if (value === "0000000000000") return null;
  }
  return value;
};

module.exports = cleadCID;
