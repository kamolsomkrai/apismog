const crypto = require("crypto");
const SALT = "btJIqHmRJZcJyflD"; // กำหนดค่า salt ที่ใช้ในการ hash

const cleanCID = (value) => {
  if (typeof value === "string") {
    // ถ้า CID มีความยาว 13 ให้ hash ด้วย sha256 พร้อม salt
    if (value.length === 13) {
      const hash = crypto.createHash("sha256");
      hash.update(SALT + value);
      value = hash.digest("hex");
    }
  }
  return value;
};

module.exports = cleanCID;
