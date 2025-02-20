// test_decryption.js

const crypto = require("crypto");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const decryptData = (encryptedBase64) => {
  try {
    console.log("Encrypted Data Received (Base64):", encryptedBase64);
    const encryptedData = Buffer.from(encryptedBase64, "base64");
    console.log("Encrypted Data (Buffer):", encryptedData);
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.ENCRYPTION_KEY, "utf-8"),
      Buffer.from(process.env.ENCRYPTION_IV, "utf-8")
    );
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    console.log("Decrypted Compressed Data:", decrypted.toString());
    return decrypted;
  } catch (error) {
    console.error("Decryption Error:", error);
    throw new Error("Decryption failed.");
  }
};

// ตัวอย่างข้อมูลที่เข้ารหัสจาก PHP
const encryptedBase64 = "lNkU5O5cgn4EQOUvx3TGGPHjq45Oj8dlmzNo+p51S6w="; // แทนที่ด้วยข้อมูลที่เข้ารหัสจาก PHP

try {
  const decrypted = decryptData(encryptedBase64);
  console.log("Final Decrypted Data:", decrypted);
} catch (error) {
  console.error(error.message);
}
