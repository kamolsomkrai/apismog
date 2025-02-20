// controllers/frontendController.js
const { getSuppliesList, getSummary } = require("../models/frontendModel");
// Mapping provcode to province names
const provinceMap = {
  50: "เชียงใหม่",
  51: "ลำพูน",
  52: "ลำปาง",
  53: "แพร่",
  54: "น่าน",
  55: "พะเยา",
  56: "เชียงราย",
  57: "แม่ฮ่องสอน",
};

const getSupplyList = async (req, res) => {
  const { search = "" } = req.query;
  try {
    const supplylist = await getSuppliesList(search);
    res.json(supplylist);
  } catch (error) {
    console.error("Error fetching supplieslist:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getSummarys = async (req, res) => {
  try {
    // ดึงข้อมูลจาก supplies_list
    const suppliesList = await getSuppliesList();

    // ดึงข้อมูลจาก supplies รวมจำนวนโดย grouped by name และ provcode
    const supplies = await getSummary();

    // สร้าง summary object
    const summary = {};

    suppliesList.forEach((supply) => {
      summary[supply.supplyname] = {
        category: supply.category,
      };
      // Initialize province quantities to 0
      Object.values(provinceMap).forEach((province) => {
        summary[supply.supplyname][province] = 0;
      });
    });

    // เติมข้อมูลจำนวนจาก supplies
    supplies.forEach((supply) => {
      const provinceName = provinceMap[supply.provcode];
      if (provinceName && summary[supply.supplyname]) {
        summary[supply.supplyname][provinceName] = supply.total_quantity;
      }
    });

    // แปลง summary object เป็น array สำหรับการแสดงผลใน frontend
    const summaryArray = Object.entries(summary).map(([supplyname, data]) => ({
      supplyname,
      category: data.category,
      ...Object.fromEntries(
        Object.entries(data).filter(([key]) => key !== "category")
      ),
    }));

    // กำหนดลำดับของจังหวัด
    const provinces = [
      "เชียงใหม่",
      "ลำพูน",
      "ลำปาง",
      "แพร่",
      "น่าน",
      "พะเยา",
      "เชียงราย",
      "แม่ฮ่องสอน",
    ];

    // จัดลำดับจังหวัดในแต่ละแถว
    const finalSummary = summaryArray.map((row) => {
      const orderedRow = {
        supplyname: row.supplyname,
        category: row.category,
      };
      provinces.forEach((province) => {
        orderedRow[province] = row[province] || 0;
      });
      return orderedRow;
    });

    res.status(200).json({ provinces, supplies: finalSummary });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getSupplyList, getSummarys };
