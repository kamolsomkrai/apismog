// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByUsername, findHospitalByCode } = require("../models/userModel");
const { registerSchema, loginSchema } = require("../validation/authValidation");

const register = async (req, res) => {
  const { username, password, hospcode, hospname } = req.body;

  if (!username || !password || !hospcode || !hospname) {
    return res.status(400).json({
      message: "Username, password, hospcode และ hospname จำเป็นต้องมี.",
    });
  }

  if (hospcode.toUpperCase() === 'UNKNOWN') {
    return res.status(400).json({ message: "Invalid hospital code." });
  }

  try {
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const hospital = await findHospitalByCode(hospcode);
    if (!hospital) {
        return res.status(400).json({ message: "Hospital code not found." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await createUser(
      username,
      hashedPassword,
      hospcode,
      hospname,
      hospital.provcode,
      hospital.provname
    );
    res.status(201).json({ message: "User registered successfully.", userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username และ password จำเป็นต้องมี." });
  }

  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // ตรวจสอบและเติมข้อมูลที่ขาดหายไป
    let { hospcode, provcode, distcode } = user;

    // ถ้า distcode ไม่มี ให้ดึงจาก chospital อีกครั้ง
    if (!distcode && hospcode) {
      const hospital = await findHospitalByCode(hospcode);
      if (hospital) {
        provcode = provcode || hospital.provcode;
        distcode = `${hospital.provcode}${hospital.distcode}`;
      }
    }

    // Validate ว่าข้อมูลครบถ้วนก่อนสร้าง Token
    if (!hospcode || !provcode || !distcode) {
      console.warn(`User ${username} has incomplete location data:`, { hospcode, provcode, distcode });
      return res.status(403).json({ 
        message: "ข้อมูลผู้ใช้ไม่สมบูรณ์ กรุณาติดต่อผู้ดูแลระบบ",
        details: { hospcode: !!hospcode, provcode: !!provcode, distcode: !!distcode }
      });
    }

    console.log(`User ${username} logged in with:`, { hospcode, provcode, distcode });

    // สร้าง JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        hospcode: hospcode,
        hospname: user.hospname,
        provcode: provcode,
        distcode: distcode,
        ssj_ok: user.ssj_ok,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // ตั้งค่า token ใน HTTP-Only Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 วัน
    });

    res.json({ message: "Login successful.", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getToken = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username และ password จำเป็นต้องมี." });
  }

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // ตรวจสอบและเติมข้อมูลที่ขาดหายไป
    let { hospcode, provcode, distcode } = user;

    if (!distcode && hospcode) {
      const hospital = await findHospitalByCode(hospcode);
      if (hospital) {
        provcode = provcode || hospital.provcode;
        distcode = `${hospital.provcode}${hospital.distcode}`;
      }
    }

    // Validate ว่าข้อมูลครบถ้วนก่อนสร้าง Token
    if (!hospcode || !provcode || !distcode) {
      return res.status(403).json({ 
        message: "ข้อมูลผู้ใช้ไม่สมบูรณ์ กรุณาติดต่อผู้ดูแลระบบ"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        hospcode: hospcode,
        hospname: user.hospname,
        provcode: provcode,
        distcode: distcode,
        ssj_ok: user.ssj_ok,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("getToken error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const logout = async (req, res) => {
  try {
    // ลบคุกกี้ที่เกี่ยวข้อง
    res.clearCookie("token");
    res.json({ message: "Logout successful." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
};

const getUser = async (req, res) => {
  const { id, hospcode, hospname, provcode, distcode, ssj_ok } = req.user;
  res.json({ id, hospcode, hospname, provcode, distcode, ssj_ok });
};

module.exports = {
  register,
  login,
  getToken,
  logout,
  getUser,
};
