// helpers/cleanDiagcode.js
const cleanDiagcode = (value) => {
  if (typeof value === "string") {
    return value
      .replace(/[^\w.-]/g, "") // ลบอักขระพิเศษ (ยกเว้น A-Z, 0-9, _, ., -)
      .replace(/\./g, "") // ลบจุด (.) ทุกตัว
      .toUpperCase(); // แปลงเป็นตัวพิมพ์ใหญ่
  }
  return value;
};

module.exports = cleanDiagcode;
