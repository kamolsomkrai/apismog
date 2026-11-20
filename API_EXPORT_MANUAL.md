# คู่มือการใช้งาน API ส่งออกข้อมูลภายนอก (External Data Export & Public API Manual)

เอกสารฉบับนี้อธิบายรายละเอียดการใช้งาน API สำหรับหน่วยงานภายนอกและระดับจังหวัดในเขตสุขภาพที่ 1 ซึ่งประกอบด้วย API ทั้งหมด **2 กลุ่มหลัก** ได้แก่:
1. **กลุ่มที่ 1: Health Region 1 Data Export API (`/api/region1_export/*`)** — ข้อมูลสรุปรายวันระดับจังหวัด (PM2.5, การเตรียมความพร้อม, สถานการณ์ฉุกเฉิน, ด้านการแพทย์) พร้อม Pagination และการกรองจังหวัด
2. **กลุ่มที่ 2: Public Dashboard API (`/api/public/*`)** — ข้อมูลสาธารณะสำหรับ Dashboard (ผู้ป่วยรายโรงพยาบาล, PM2.5 รายอำเภอ, รายการกิจกรรม, Cluster)

---

## 1. ข้อมูลทั่วไปในการเชื่อมต่อ

| รายการ | รายละเอียด |
| :--- | :--- |
| **Base URL** | `https://epinorth-api.ddc.moph.go.th` |
| **Swagger UI (เอกสารทดสอบ API)** | `https://epinorth-api.ddc.moph.go.th/api-docs` |
| **Health Check** | `GET /api/health` → `{ "status": "API is running." }` |
| **Authentication** | **ไม่ต้องยืนยันตัวตน (No Auth)** สำหรับทั้ง 2 กลุ่มนี้ |
| **Request Header (สำหรับ POST)** | `Content-Type: application/json` |
| **Rate Limit** | สูงสุด **1,000 requests / 15 นาที** ต่อ 1 IP (ตรวจสอบโควตาคงเหลือได้จาก Response Header `RateLimit-*`) |

### รหัสจังหวัดเขตสุขภาพที่ 1 (8 จังหวัด)

| รหัสจังหวัด (`provcode`) | ชื่อจังหวัด |
| :---: | :--- |
| `50` | เชียงใหม่ |
| `51` | ลำพูน |
| `52` | ลำปาง |
| `54` | แพร่ |
| `55` | น่าน |
| `56` | พะเยา |
| `57` | เชียงราย |
| `58` | แม่ฮ่องสอน |

---

## 2. กลุ่มที่ 1: Health Region 1 Data Export API (`/api/region1_export/*`)

ออกแบบมาสำหรับการดึงข้อมูลสรุปรายวันระดับจังหวัด (Daily Sync / Pull Method) ทั้ง 4 Endpoints ใช้เมธอด `POST` และรับพารามิเตอร์โครงสร้างเดียวกันทั้งหมด

### 2.1 พารามิเตอร์ร่วม (Common Request Body)

ทุกฟิลด์เป็น **Optional** (ส่งหรือไม่ส่งก็ได้)

| พารามิเตอร์ | ชนิดข้อมูล | ค่าเริ่มต้น (Default) | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| `start_date` | `string` (`YYYY-MM-DD`) | ย้อนหลัง 7 วันจากวันปัจจุบัน | วันที่เริ่มต้นของข้อมูล |
| `end_date` | `string` (`YYYY-MM-DD`) | วันปัจจุบัน | วันที่สิ้นสุดของข้อมูล |
| `page` | `integer` | `1` | หมายเลขหน้า (Pagination) |
| `limit` | `integer` | `50` | จำนวนรายการต่อหน้า |
| `provinces` หรือ `PROVINCES` | `string` \| `number` \| `string[]` | ทั้ง 8 จังหวัดเขต 1 | กรองเฉพาะจังหวัดที่ต้องการ (รองรับทั้งตัวพิมพ์เล็กและตัวพิมพ์ใหญ่) |

#### รูปแบบการส่ง `provinces` / `PROVINCES` ที่รองรับ
- **ไม่ส่งมาเลย** (หรือส่ง `""`, `null`, `[]`) → คืนข้อมูลครบทั้ง 8 จังหวัด (เข้ากันได้กับระบบเดิม 100%)
- **จังหวัดเดียว (String หรือ Number)**: `"provinces": "54"` หรือ `"PROVINCES": 54`
- **หลายจังหวัด (Array)**: `"provinces": ["54", "56"]`
- **หลายจังหวัดคั่นด้วยจุลภาค (Comma-separated String)**: `"PROVINCES": "54,56"`
- **กรณีส่งรหัสจังหวัดที่ไม่อยู่ใน 8 จังหวัดเขต 1 หรือส่งชนิดข้อมูลไม่ถูกต้อง** → ระบบจะตอบกลับ `400 Bad Request`

### 2.2 โครงสร้าง Response มาตรฐาน

**กรณีสำเร็จ (`200 OK`):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 31,
    "current_page": 1,
    "per_page": 50,
    "last_page": 1
  }
}
```

**กรณีรหัสจังหวัดไม่ถูกต้อง (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Invalid province code(s): 99. Allowed Region 1 provinces: 50, 51, 52, 54, 55, 56, 57, 58"
}
```

**กรณีเกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์ (`500 Internal Server Error`):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

### 2.3 รายละเอียดแต่ละ Endpoint ในกลุ่มที่ 1

#### 1) ดึงข้อมูลค่าฝุ่น PM2.5 รายวันระดับจังหวัด
- **Endpoint:** `POST /api/region1_export/pm25`
- **คำอธิบาย:** ค่าเฉลี่ยของค่าฝุ่น PM2.5 สูงสุด (`pm25_max`) รายวัน แยกรายจังหวัด เรียงตามวันที่ล่าสุดลงไป

**Request ตัวอย่าง (กรองเฉพาะจังหวัดแพร่ `54`):**
```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "provinces": ["54"],
  "page": 1,
  "limit": 50
}
```

**Response ตัวอย่าง (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "province_id": 54,
      "date": "2026-01-31",
      "pm25_value": 42.35
    }
  ],
  "pagination": {
    "total": 31,
    "current_page": 1,
    "per_page": 50,
    "last_page": 1
  }
}
```

| ฟิลด์ใน `data[]` | ชนิดข้อมูล | คำอธิบาย |
| :--- | :--- | :--- |
| `province_id` | `integer` | รหัสจังหวัด (เช่น `54` = แพร่, `56` = พะเยา) |
| `date` | `string` | วันที่เก็บข้อมูล (`YYYY-MM-DD`) |
| `pm25_value` | `number` | ค่าเฉลี่ย PM2.5 ประจำวันของจังหวัด (ทศนิยม 2 ตำแหน่ง, หน่วย µg/m³) |

---

#### 2) ดึงข้อมูลการเตรียมความพร้อม (Preparation Reports - มาตรการที่ 1)
- **Endpoint:** `POST /api/region1_export/preparation`
- **คำอธิบาย:** รายงานกิจกรรมการเตรียมความพร้อมจากตาราง `measure1` จัดกลุ่มตามจังหวัดและวันที่รายงาน (`activity_date`)

**Request ตัวอย่าง:**
```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "PROVINCES": "54",
  "page": 1,
  "limit": 50
}
```

**Response ตัวอย่าง (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "province_id": 54,
      "report_date": "2026-01-20",
      "report_data": {
        "1": [
          {
            "status": "done",
            "detail": "จัดประชุมเตรียมความพร้อมรับสถานการณ์ฝุ่น PM2.5"
          }
        ],
        "2": [
          {
            "status": "done",
            "detail": "มีการดำเนินการ"
          }
        ]
      }
    }
  ],
  "pagination": {
    "total": 1,
    "current_page": 1,
    "per_page": 50,
    "last_page": 1
  }
}
```

| ฟิลด์ใน `data[]` | ชนิดข้อมูล | คำอธิบาย |
| :--- | :--- | :--- |
| `province_id` | `integer` | รหัสจังหวัด |
| `report_date` | `string` | วันที่ดำเนินกิจกรรม (`YYYY-MM-DD`) |
| `report_data` | `object` | ออบเจกต์ที่ key คือรหัสหมวดกิจกรรม (`activity_catalog`) และ value เป็น array ของ `{ status, detail }` |

---

#### 3) ดึงข้อมูลสถานการณ์ฉุกเฉิน (Emergency Reports)
- **Endpoint:** `POST /api/region1_export/emergency`
- **คำอธิบาย:** สรุปสถานะการเปิดศูนย์ PHEOC, เป้าหมายและจำนวนการดูแลกลุ่มเปราะบางรวม (มาตรการที่ 2) และจำนวนการใช้บริการห้องปลอดฝุ่นรวม (มาตรการที่ 3) รายวันตามวันที่อัปเดต (`DATE(activity.updated_at)`)

**Request ตัวอย่าง:**
```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "provinces": ["54", "56"],
  "page": 1,
  "limit": 50
}
```

**Response ตัวอย่าง (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "province_id": "54",
      "report_date": "2026-01-25",
      "eoc_status": "opened",
      "vulnerable_groups_target": 1250,
      "vulnerable_groups_cared": 980,
      "clean_room_usage": 145
    }
  ],
  "pagination": {
    "total": 12,
    "current_page": 1,
    "per_page": 50,
    "last_page": 1
  }
}
```

| ฟิลด์ใน `data[]` | ชนิดข้อมูล | คำอธิบาย |
| :--- | :--- | :--- |
| `province_id` | `string` | รหัสจังหวัด |
| `report_date` | `string` | วันที่รายงาน (`YYYY-MM-DD`) |
| `eoc_status` | `string` | สถานะศูนย์ PHEOC (`"opened"` หรือ `"not_opened"`) |
| `vulnerable_groups_target` | `number` | เป้าหมายกลุ่มเปราะบางรวมทั้งหมด (เด็กเล็ก + ผู้สูงอายุ + หญิงตั้งครรภ์ + ผู้ป่วยติดเตียง + โรคหัวใจ + COPD) |
| `vulnerable_groups_cared` | `number` | จำนวนกลุ่มเปราะบางที่ได้รับการดูแลรวมทั้งหมด |
| `clean_room_usage` | `number` | จำนวนผู้ใช้บริการห้องปลอดฝุ่นรวมทุกประเภท |

---

#### 4) ดึงข้อมูลด้านการแพทย์และกลุ่มเปราะบางรายกลุ่ม (Health Reports)
- **Endpoint:** `POST /api/region1_export/health`
- **คำอธิบาย:** สรุปเป้าหมายและจำนวนผู้ได้รับการดูแลแยกตามกลุ่มเสี่ยง (เด็กเล็ก, หญิงตั้งครรภ์, ผู้สูงอายุ) และจำนวนผู้ใช้บริการห้องปลอดฝุ่นรายวัน

**Request ตัวอย่าง:**
```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "provinces": "54",
  "page": 1,
  "limit": 50
}
```

**Response ตัวอย่าง (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "province_id": "54",
      "report_date": "2026-01-25",
      "target_small_child": 300,
      "care_small_child": 250,
      "target_pregnant": 80,
      "care_pregnant": 75,
      "target_elderly": 600,
      "care_elderly": 490,
      "clean_room_users": 145
    }
  ],
  "pagination": {
    "total": 12,
    "current_page": 1,
    "per_page": 50,
    "last_page": 1
  }
}
```

| ฟิลด์ใน `data[]` | ชนิดข้อมูล | คำอธิบาย |
| :--- | :--- | :--- |
| `province_id` | `string` | รหัสจังหวัด |
| `report_date` | `string` | วันที่รายงาน (`YYYY-MM-DD`) |
| `target_small_child` / `care_small_child` | `number` | เป้าหมาย / ได้รับการดูแล: กลุ่มเด็กเล็ก |
| `target_pregnant` / `care_pregnant` | `number` | เป้าหมาย / ได้รับการดูแล: กลุ่มหญิงตั้งครรภ์ |
| `target_elderly` / `care_elderly` | `number` | เป้าหมาย / ได้รับการดูแล: กลุ่มผู้สูงอายุ |
| `clean_room_users` | `number` | จำนวนผู้ใช้บริการห้องปลอดฝุ่นรวมทุกประเภท |

---

## 3. กลุ่มที่ 2: Public Dashboard API (`/api/public/*`)

กลุ่มนี้คืนค่าเป็น **JSON Array ของรายการข้อมูลโดยตรง** (ไม่มี wrapper `{ success, data, pagination }`) และเหมาะสำหรับการนำไปแสดงผลบน Dashboard

### 1) ข้อมูลผู้ป่วยรายโรคแยกตามโรงพยาบาล
- **Endpoint:** `POST /api/public/diseasebyhospital`
- **แหล่งข้อมูล:** ตาราง `summary_disease_hospital`

**Request Body (ทุกฟิลด์เป็น Optional):**

| พารามิเตอร์ | ชนิดข้อมูล | คำอธิบาย |
| :--- | :--- | :--- |
| `province` | `string` | กรองตามจังหวัด (ตรงกับค่าในคอลัมน์ `province` ของฐานข้อมูล เช่น `"แพร่"` หรือ `"พะเยา"`) |
| `start_date` | `string` (ISO 8601 เช่น `YYYY-MM-DD`) | วันที่เริ่มต้น (`service_date >= start_date`) |
| `end_date` | `string` (ISO 8601 เช่น `YYYY-MM-DD`) | วันที่สิ้นสุด (`service_date <= end_date`) |
| `search` | `string` | ค้นหาบางส่วนของชื่อกลุ่มโรค (`groupname LIKE '%search%'`) |

**Request ตัวอย่าง:**
```json
{
  "province": "แพร่",
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "search": "ทางเดินหายใจ"
}
```

**Response ตัวอย่าง (`200 OK`):**
```json
[
  {
    "disease_name": "โรคระบบทางเดินหายใจ",
    "service_date": "2026-01-15",
    "province": "แพร่",
    "hospital_name": "โรงพยาบาลแพร่",
    "patient_count": 45
  }
]
```

> **หมายเหตุ:** หากรูปแบบ `start_date` หรือ `end_date` ไม่ใช่ ISO 8601 ระบบจะตอบกลับ `400 Bad Request` พร้อม `{ "errors": [...] }`

---

### 2) ข้อมูล PM2.5 รายอำเภอ (พร้อมรหัสอำเภอ)
- **Endpoint:** `POST /api/public/pm25`
- **แหล่งข้อมูล:** ตาราง `pm25_dang` เชื่อมกับ `district_th`

**Request Body (ทุกฟิลด์เป็น Optional):**

| พารามิเตอร์ | ชนิดข้อมูล | คำอธิบาย |
| :--- | :--- | :--- |
| `province` | `string` | กรองตามจังหวัด (ตรงกับค่าในคอลัมน์ `province` ของตาราง `pm25_dang`) |
| `start_date` | `string` (ISO 8601) | วันที่เริ่มต้น (`collect_date`) |
| `end_date` | `string` (ISO 8601) | วันที่สิ้นสุด (`collect_date`) |
| `search` | `string` | กรองตามฟิลด์ `event_valid` |

**Request ตัวอย่าง:**
```json
{
  "province": "แพร่",
  "start_date": "2026-01-01",
  "end_date": "2026-01-07"
}
```

**Response ตัวอย่าง (`200 OK`):**
```json
[
  {
    "province": "แพร่",
    "amphur": "เมืองแพร่",
    "collect_date": "2026-01-07T00:00:00.000Z",
    "pm25_max": 48.2,
    "distcode": "5401"
  }
]
```
*(ผลลัพธ์จะคืนทุกคอลัมน์ของตาราง `pm25_dang` พร้อมคอลัมน์ `distcode` จาก `district_th`)*

---

### 3) รายการกิจกรรมมาตรการที่ 1 ทั้งหมด
- **Endpoint:** `GET /api/public/activitylist`
- **พารามิเตอร์:** ไม่มี (ดึงข้อมูลทั้งหมด)

**Response ตัวอย่าง (`200 OK`):**
```json
[
  {
    "activity_id": 101,
    "activity_catalog": 1,
    "catalogname": "การสื่อสารความเสี่ยง",
    "activity_detail": "ประชาสัมพันธ์แนวทางป้องกันฝุ่น PM2.5",
    "hosp_code": "10726",
    "hospname": "โรงพยาบาลแพร่",
    "prov_code": "54",
    "provname": "แพร่",
    "dist_code": "5401",
    "updated_at": "2026-01-20T09:30:00.000Z",
    "uploads": [
      { "file_path": "/uploads/example.jpg" }
    ]
  }
]
```

---

### 4) ข้อมูลสรุป Cluster โรค
- **Endpoint:** `GET /api/public/cluster`
- **พารามิเตอร์:** ไม่มี (ดึงข้อมูลทั้งหมด)

**Response ตัวอย่าง (`200 OK`):**
```json
[
  {
    "yr": 2026,
    "mm": 1,
    "hospcode": "10726",
    "hosname": "โรงพยาบาลแพร่",
    "province": "แพร่",
    "amphur": "เมืองแพร่",
    "groupname": "กลุ่มโรคทางเดินหายใจ",
    "diagtype": "1",
    "patient_count": 120
  }
]
```

---

## 4. ตัวอย่างการเรียกใช้งาน (Code Examples)

### 4.1 ตัวอย่างด้วย `curl`

**ดึงข้อมูล PM2.5 เฉพาะจังหวัดแพร่ (`54`) จากกลุ่มที่ 1:**
```bash
curl -X POST "https://epinorth-api.ddc.moph.go.th/api/region1_export/pm25" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "provinces": ["54"],
    "page": 1,
    "limit": 50
  }'
```

**ดึงข้อมูลทั้ง 8 จังหวัด (แบบเดิม ไม่ส่ง `provinces`):**
```bash
curl -X POST "https://epinorth-api.ddc.moph.go.th/api/region1_export/emergency" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-01-01",
    "end_date": "2026-01-31"
  }'
```

**ดึงข้อมูลผู้ป่วยราย รพ. ของจังหวัดแพร่ จากกลุ่มที่ 2:**
```bash
curl -X POST "https://epinorth-api.ddc.moph.go.th/api/public/diseasebyhospital" \
  -H "Content-Type: application/json" \
  -d '{
    "province": "แพร่",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31"
  }'
```

---

### 4.2 ตัวอย่างด้วย JavaScript (`fetch`)

```javascript
async function fetchPhraeHealthReports(startDate, endDate, page = 1) {
  const response = await fetch("https://epinorth-api.ddc.moph.go.th/api/region1_export/health", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      start_date: startDate,
      end_date: endDate,
      provinces: ["54"], // รหัสจังหวัดแพร่
      page,
      limit: 50,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`HTTP ${response.status}: ${err.message}`);
  }

  return await response.json();
}
```

---

### 4.3 ตัวอย่างด้วย Python (`requests`)

```python
import requests

url = "https://epinorth-api.ddc.moph.go.th/api/region1_export/pm25"
payload = {
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "PROVINCES": ["54"],  # หรือ "54"
    "page": 1,
    "limit": 100,
}

res = requests.post(url, json=payload, timeout=30)
res.raise_for_status()
data = res.json()
print(f"Total records: {data['pagination']['total']}")
for row in data["data"]:
    print(row)
```

---

## 5. รหัสสถานะ HTTP และการแก้ไขปัญหาเบื้องต้น

| HTTP Status | สาเหตุที่เป็นไปได้ | แนวทางแก้ไข |
| :---: | :--- | :--- |
| `200 OK` | สำเร็จ | อ่านข้อมูลจาก Response Body (`data` สำหรับกลุ่มที่ 1 หรือ Array โดยตรงสำหรับกลุ่มที่ 2) |
| `400 Bad Request` | ส่งรหัสจังหวัดนอกเขต 1 ใน `provinces`/`PROVINCES` หรือรูปแบบวันที่ไม่ถูกต้อง (กลุ่มที่ 2) | ตรวจสอบรหัสจังหวัดให้อยู่ใน `50, 51, 52, 54, 55, 56, 57, 58` และวันที่เป็น `YYYY-MM-DD` |
| `429 Too Many Requests` | เรียกเกิน 1,000 ครั้งภายใน 15 นาที | เว้นระยะการเรียกใช้ หรือปรับรอบ Cron Job ให้ดึงเป็นรายวัน/รายชั่วโมง |
| `500 Internal Server Error` | เกิดข้อผิดพลาดภายในระบบหรือฐานข้อมูล | ลองเรียกใหม่ภายหลัง หรือแจ้งผู้ดูแลระบบ |

---

## 6. การทดสอบใช้งานผ่าน Swagger UI (`/api-docs`)

ระบบมีหน้า **Swagger UI** สำหรับดูโครงสร้างพารามิเตอร์และทดลองยิง API ได้ทันทีผ่านเบราว์เซอร์โดยไม่ต้องติดตั้งเครื่องมือเพิ่มเติม

### 6.1 URL สำหรับเปิด Swagger UI

| สภาพแวดล้อม | URL |
| :--- | :--- |
| **Production** | `https://epinorth-api.ddc.moph.go.th/api-docs` |
| **Docker (`docker compose up`)** | `http://localhost:3006/api-docs` |
| **Local Development (`npm run dev` / `npm start`)** | `http://localhost:3000/api-docs` |

### 6.2 หมวดหมู่ API ที่แสดงใน Swagger UI
1. **`Region1Export`** (4 เส้น): `/api/region1_export/pm25`, `/preparation`, `/emergency`, `/health`
2. **`PublicDashboard`** (3 เส้น): `/api/public/diseasebyhospital`, `/pm25`, `/cluster`

### 6.3 ขั้นตอนการทดสอบ (Try it out)
1. เปิดหน้า `/api-docs` บนเบราว์เซอร์
2. ตรวจสอบช่อง **Servers** ด้านบนของหน้าเว็บ โดยค่าเริ่มต้นจะเป็น **`/ - Current Server (auto-match browser URL)`** ซึ่งจะยิงคำขอไปยังโดเมนเดียวกับที่เปิดหน้าเว็บอยู่โดยอัตโนมัติ (ไม่ติดปัญหา CORS)
3. คลิกเลือก Endpoint ที่ต้องการทดสอบ แล้วกดปุ่ม **Try it out**
4. แก้ไข JSON ในช่อง **Request body** ตามต้องการ (เช่น ระบุ `"provinces": ["54"]` สำหรับจังหวัดแพร่ หรือลบฟิลด์ `provinces` ออกเพื่อดึงทั้ง 8 จังหวัด)
5. กดปุ่ม **Execute** เพื่อส่งคำขอ และตรวจสอบผลลัพธ์ (HTTP Status Code, Response Body และคำสั่ง `curl` ตัวอย่าง) ด้านล่าง

> **หมายเหตุกรณีพบ `Failed to fetch (CORS)` บน Swagger UI:**
> ให้ตรวจสอบช่อง **Servers** ด้านบนว่าเลือกเป็น **`/ - Current Server`** อยู่หรือไม่ หากเลือกโดเมนอื่นที่ต่างจาก URL บนแถบที่อยู่ของเบราว์เซอร์ (เช่น เปิดผ่าน `localhost:3000` แต่เลือกยิงไปที่ `https://epinorth-api.ddc.moph.go.th`) เบราว์เซอร์จะบล็อกคำขอตามนโยบาย CORS ครับ

