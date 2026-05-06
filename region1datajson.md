# เอกสารโครงสร้างข้อมูลและการเชื่อมต่อระบบติดตาม PM2.5 (Data Structure & Integration Documentation)

เอกสารฉบับนี้จัดทำขึ้นเพื่อให้ทีมพัฒนาของ **เขตสุขภาพที่ 1** เข้าใจโครงสร้างข้อมูลของระบบติดตาม PM2.5 และสามารถวางแผนการเชื่อมโยงข้อมูล (Data Integration) ได้อย่างถูกต้อง โดยระบบปัจจุบันจัดเก็บข้อมูลในระดับ **รายจังหวัด (Provincial Based)** เป็นรายวัน

## 1. ภาพรวมโครงสร้างข้อมูล (Data Overview)

ระบบจัดเก็บข้อมูลแบ่งออกเป็น 5 ส่วนหลัก โดยแต่ละส่วนจะอ้างอิง province_id (รหัสจังหวัด) และ report_date (วันที่รายงาน) เป็น Key หลัก:

1.  **ข้อมูลฝุ่น PM2.5 (`pm25_data`)**: ค่าเฉลี่ยฝุ่นรายวัน
2.  **การเตรียมความพร้อม (`preparation_reports`)**: สถานะการดำเนินงานตาม 4 มาตรการ (10 กิจกรรม)
3.  **สถานการณ์ฉุกเฉิน (`emergency_reports`)**: สถานะศูนย์ PHEOC และการดูแลกลุ่มเสี่ยง
4.  **ด้านการแพทย์ (`health_reports`)**: สถิติผู้ป่วยและการแจกจ่ายอุปกรณ์
5.  **ผลกระทบต่อสุขภาพ (`firefighter_impacts`)**: รายชื่อผู้ได้รับผลกระทบ (รายบุคคล)

---

## 2. โครงสร้างฐานข้อมูล (Database Schema / DDL)

ด้านล่างคือคำสั่ง SQL สำหรับสร้างตารางที่ใช้ในการรับข้อมูล (DDL)

### 2.1 ตารางข้อมูลฝุ่น (PM2.5 Data)
sql
CREATE TABLE pm25_data (
  id int(11) NOT NULL AUTO_INCREMENT,
  date date NOT NULL COMMENT 'วันที่รายงาน (YYYY-MM-DD)',
  province_id int(11) NOT NULL COMMENT 'รหัสจังหวัด',
  pm25_value decimal(10,2) NOT NULL COMMENT 'ค่าฝุ่น PM2.5 (ug/m3)',
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY date_province (`date`,`province_id`)
);

### 2.2 ตารางการเตรียมความพร้อม (Preparation Reports)
sql
CREATE TABLE preparation_reports (
  id int(11) NOT NULL AUTO_INCREMENT,
  province_id int(11) NOT NULL,
  report_date date NOT NULL,
  report_data longtext COMMENT 'เก็บข้อมูล JSON status/detail ของแต่ละกิจกรรม (ดูโครงสร้าง JSON ด้านล่าง)',
  updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY province_date (`province_id`,`report_date`)
);
**โครงสร้าง JSON ในฟิลด์ `report_data`:**
json
{
  "1.1": {
    "status": "done",           // status: "done" (ทำแล้ว) หรือ "not_done" (ยังไม่ทำ)
    "detail": "รายละเอียดการดำเนินงาน..."
  },
  "1.2": { ... },
  ... จนถึง "4.2"
}

### 2.3 ตารางสถานการณ์ฉุกเฉิน (Emergency Reports)
sql
CREATE TABLE emergency_reports (
  id int(11) NOT NULL AUTO_INCREMENT,
  province_id int(11) NOT NULL,
  report_date date NOT NULL,
  eoc_status enum('not_opened','opened','closed') NOT NULL DEFAULT 'not_opened' COMMENT 'สถานะ PHEOC',
  vulnerable_groups_target int(11) DEFAULT 0 COMMENT 'เป้าหมายกลุ่มเสี่ยง (คน)',
  vulnerable_groups_cared int(11) DEFAULT 0 COMMENT 'ดูแลกลุ่มเสี่ยงแล้ว (คน)',
  clean_room_usage int(11) DEFAULT 0 COMMENT 'จำนวนห้องปลอดฝุ่นที่เปิดใช้ (ห้อง)',
  PRIMARY KEY (`id`),
  UNIQUE KEY province_date (`province_id`,`report_date`)
);

### 2.4 ตารางด้านการแพทย์ (Health Reports)
sql
CREATE TABLE health_reports (
  id int(11) NOT NULL AUTO_INCREMENT,
  province_id int(11) NOT NULL,
  report_date date NOT NULL,
  target_small_child int(11) DEFAULT 0 COMMENT 'เป้าหมาย: เด็กเล็ก (คน)',
  care_small_child int(11) DEFAULT 0 COMMENT 'ดูแลแล้ว: เด็กเล็ก (คน)',
  target_pregnant int(11) DEFAULT 0 COMMENT 'เป้าหมาย: หญิงตั้งครรภ์',
  care_pregnant int(11) DEFAULT 0 COMMENT 'ดูแลแล้ว: หญิงตั้งครรภ์',
  target_elderly int(11) DEFAULT 0 COMMENT 'เป้าหมาย: ผู้สูงอายุ',
  care_elderly int(11) DEFAULT 0 COMMENT 'ดูแลแล้ว: ผู้สูงอายุ',
  -- (มีฟิลด์กลุ่มโรคอื่นๆ เช่น heart, respiratory ในลักษณะเดียวกัน)
  clean_room_users int(11) DEFAULT 0 COMMENT 'ผู้ใช้บริการห้องปลอดฝุ่น (คน)',
  PRIMARY KEY (`id`),
  UNIQUE KEY province_date (`province_id`,`report_date`)
);

### 2.5 ตารางผู้ได้รับผลกระทบ (Health Impacts)
sql
CREATE TABLE firefighter_impacts (
  id int(11) NOT NULL AUTO_INCREMENT,
  province_id int(11) NOT NULL,
  report_date date NOT NULL,
  name varchar(255) DEFAULT NULL COMMENT 'ชื่อ-นามสกุล',
  status enum('injured','deceased') NOT NULL COMMENT 'สถานะ: บาดเจ็บ/เสียชีวิต',
  incident_details text DEFAULT NULL COMMENT 'รายละเอียดเหตุการณ์',
  PRIMARY KEY (`id`)
);

---

## 3. แนวทางการเชื่อมต่อข้อมูล (Integration Guidelines)

เนื่องจากเขตสุขภาพที่ 1 มีการเก็บข้อมูลในระดับที่ละเอียดกว่า (Node Based) ในขณะที่ระบบนี้เก็บข้อมูลระดับจังหวัด (Province Based) จึงมีทางเลือกในการเชื่อมต่อ ดึงข้อมูลผ่าน API (Pull Method)
หากเขตสุขภาพที่ 1 มี API ที่เปิดให้เข้าถึงได้ ทางเราสามารถเขียน Cron Job เพื่อไปดึงข้อมูลรายวันตามรอบเวลาที่กำหนด (เช่น ทุก 08:00 น.)
- **Requirement:** เขต 1 ต้องจัดเตรียม API Endpoint ที่ส่งคืนข้อมูล JSON ตามโครงสร้างระดับจังหวัด หรือระดับ Node ที่มีระบุ Province ID ชัดเจน

### ข้อแนะนำเพิ่มเติม
- ควรใช้ **Province ID** ตามมาตรฐานกระทรวงมหาดไทย/สาธารณสุข เพื่อให้ข้อมูลตรงกัน
- ข้อมูลควรส่งเป็นรายวัน (Daily Sync)
- หากส่งข้อมูลระดับ Node มาให้เราประมวลผลเอง โปรดแนบเอกสาร Mapping ของ Node -> Province มาด้วย