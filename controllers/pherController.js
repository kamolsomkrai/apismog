import {
  getPher,
  updatepher,
  getInjuryRti,
  getRiskVehicle,
  getRiskRti,
  getRiskRoad,
} from "../models/pherModel.js";
const getPatientInjuryDead = async (req, res) => {
  const { hospname } = req.user;
  const { id } = req.params;
  const { start_date, end_date } = req.body;

  try {
    if (hospname !== "rabadadmin") {
      return res.status(404).json({ message: "ไม่มีสิทธิเข้าถึงข้อมูล" });
    }

    const data = await getPher(start_date, end_date);
    res.json(data);
  } catch (err) {
    console.error("ไม่สามารถดึงข้อมูลได้:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deletePatientInjuryDead = async (req, res) => {
  const { hospname } = req.user;
  const { guid } = req.body;

  try {
    if (hospname !== "rabadadmin") {
      return res.status(404).json({ message: "ไม่มีสิทธิเข้าถึงข้อมูล" });
    }

    const data = await updatepher(guid, hospname);
    res.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (err) {
    console.error("ไม่สามารถลบข้อมูลได้:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getInjuryRtiController = async (req, res) => {
  const { hospname } = req.user;
  const { start_date, end_date } = req.body;

  try {
    if (hospname !== "rabadadmin") {
      return res.status(404).json({ message: "ไม่มีสิทธิเข้าถึงข้อมูล" });
    }

    const data = await getInjuryRti(start_date, end_date);
    res.json(data);
  } catch (err) {
    console.error("ไม่สามารถดึงข้อมูลได้:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getRiskVehicleController = async (req, res) => {
  const { hospname } = req.user;
  const { start_date, end_date } = req.body;

  try {
    if (hospname !== "rabadadmin") {
      return res.status(404).json({ message: "ไม่มีสิทธิเข้าถึงข้อมูล" });
    }

    const data = await getRiskVehicle(start_date, end_date);
    res.json(data);
  } catch (err) {
    console.error("ไม่สามารถดึงข้อมูลได้:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getRiskRtiController = async (req, res) => {
  const { hospname } = req.user;
  const { start_date, end_date } = req.body;

  try {
    if (hospname !== "rabadadmin") {
      return res.status(404).json({ message: "ไม่มีสิทธิเข้าถึงข้อมูล" });
    }

    const data = await getRiskRti(start_date, end_date);
    res.json(data);
  } catch (err) {
    console.error("ไม่สามารถดึงข้อมูลได้:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getRiskRoadController = async (req, res) => {
  const { hospname } = req.user;
  const { start_date, end_date } = req.body;

  try {
    if (hospname !== "rabadadmin") {
      return res.status(404).json({ message: "ไม่มีสิทธิเข้าถึงข้อมูล" });
    }

    const data = await getRiskRoad(start_date, end_date);
    res.json(data);
  } catch (err) {
    console.error("ไม่สามารถดึงข้อมูลได้:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getPatientInjuryDead,
  deletePatientInjuryDead,
  getInjuryRtiController,
  getRiskVehicleController,
  getRiskRtiController,
  getRiskRoadController,
};
