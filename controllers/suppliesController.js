// controllers/suppliesController.js
const {
  getSupplies,
  getSupplyById,
  createSupply,
  updateSupply,
  deleteSupply,
  countSupplies,
  getSupplyData,
} = require("../models/supplyModel");

const getAllSupplies = async (req, res) => {
  const { hospcode } = req.user; // ดึง hospcode จากข้อมูลผู้ใช้ที่ผ่านการตรวจสอบสิทธิ์
  const { page = 1, limit = 10, search = "" } = req.query;
  const parsedLimit = parseInt(limit, 10);
  const parsedPage = parseInt(page, 10);
  const offset = (parsedPage - 1) * parsedLimit;

  try {
    const supplies = await getSupplies(hospcode, parsedLimit, offset, search);
    const total = await countSupplies(hospcode, search);
    res.json({
      page: parsedPage,
      limit: parsedLimit,
      total,
      data: supplies,
    });
  } catch (err) {
    console.error("Error fetching supplies:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getSupplyDatas = async (req, res) => {
  try {
    const { hospcode, supply_id } = req.body;
    const result = await getSupplyData(hospcode, supply_id);
    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ message: "ไม่พบข้อมูล" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSupply = async (req, res) => {
  const { hospcode } = req.user;
  const { id } = req.params;

  try {
    const supply = await getSupplyById(id, hospcode);
    if (!supply) {
      return res.status(404).json({ message: "Supply not found." });
    }
    res.json(supply);
  } catch (err) {
    console.error("Error fetching supply:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const createNewSupply = async (req, res) => {
  const { provcode } = req.user;
  const {
    supply_id,
    hospital_id,
    quantity_stock,
    quantity_add,
    quantity_minus,
    quantity_total,
  } = req.body;

  try {
    const insertedId = await createSupply(
      hospital_id,
      provcode,
      supply_id,
      quantity_stock,
      quantity_add,
      quantity_minus,
      quantity_total
    );
    const newSupply = await getSupplyById(insertedId, hospital_id);
    res.status(201).json(newSupply);
  } catch (err) {
    console.error("Error creating supply:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const updateExistingSupply = async (req, res) => {
  const { hospcode } = req.user;
  const { id } = req.params;
  const { quantity_stock, quantity_add, quantity_minus, quantity_total } =
    req.body;

  try {
    const existingSupply = await getSupplyById(id, hospcode);
    if (!existingSupply) {
      return res.status(404).json({ message: "Supply not found." });
    }

    await updateSupply(
      id,
      hospcode,
      quantity_stock,
      quantity_add,
      quantity_minus,
      quantity_total
    );
    const updatedSupply = await getSupplyById(id, hospcode);
    res.json(updatedSupply);
  } catch (err) {
    console.error("Error updating supply:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteExistingSupply = async (req, res) => {
  const { hospcode } = req.user;
  const { id } = req.params;

  try {
    const existingSupply = await getSupplyById(id, hospcode);
    if (!existingSupply) {
      return res.status(404).json({ message: "Supply not found." });
    }

    await deleteSupply(id, hospcode);
    res.json({ message: "Supply deleted successfully." });
  } catch (err) {
    console.error("Error deleting supply:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getAllSupplies,
  getSupply,
  createNewSupply,
  updateExistingSupply,
  deleteExistingSupply,
  getSupplyDatas,
};
