const poolRabad = require("../config/dbrabad");
const poolDb2 = require("../config/db2");

const PROVINCES = ['50', '51', '52', '54', '55', '56', '57', '58'];
const PROVINCES_STR = PROVINCES.map(p => `'${p}'`).join(',');

const paginateParams = (req) => {
    // Default last 7 days till today
    const defaultStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const defaultEnd = new Date().toISOString().split('T')[0];
    const start_date = req.body.start_date || defaultStart;
    const end_date = req.body.end_date || defaultEnd;
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 50;
    const offset = (page - 1) * limit;
    return { start_date, end_date, page, limit, offset };
};

const makeResponse = (rows, total, page, limit) => ({
    success: true,
    data: rows,
    pagination: {
        total: total,
        current_page: page,
        per_page: limit,
        last_page: Math.ceil(total / limit) || 1
    }
});

exports.getPm25 = async (req, res) => {
    try {
        const { start_date, end_date, page, limit, offset } = paginateParams(req);
        const countQuery = `
            SELECT COUNT(DISTINCT c.provcode, p.collect_date) as total
            FROM cchangwat c
            JOIN pm25_dang p ON (c.provcode = p.province OR c.provname = p.province)
            WHERE c.provcode IN (${PROVINCES_STR})
            AND p.collect_date BETWEEN ? AND ?
        `;
        const [countResult] = await poolRabad.query(countQuery, [start_date, end_date]);
        const total = countResult[0].total;

        const query = `
            SELECT
                CAST(c.provcode AS UNSIGNED) AS province_id,
                DATE_FORMAT(p.collect_date, '%Y-%m-%d') AS date,
                IFNULL(ROUND(AVG(p.pm25_max), 2), 0) AS pm25_value
            FROM cchangwat c
            JOIN pm25_dang p ON (c.provcode = p.province OR c.provname = p.province)
            WHERE c.provcode IN (${PROVINCES_STR})
            AND p.collect_date BETWEEN ? AND ?
            GROUP BY c.provcode, p.collect_date
            ORDER BY p.collect_date DESC, c.provcode ASC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await poolRabad.query(query, [start_date, end_date, limit, offset]);
        res.json(makeResponse(rows, total, page, limit));
    } catch (error) {
        console.error("Error fetching pm25_data:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getPreparation = async (req, res) => {
    try {
        const { start_date, end_date, page, limit, offset } = paginateParams(req);
        const query = `
            SELECT
                a.prov_code AS province_id,
                DATE_FORMAT(m.activity_date, '%Y-%m-%d') AS report_date,
                m.activity_catalog,
                m.activity_detail
            FROM measure1 m
            JOIN activity a ON m.activity_id = a.activity_id
            WHERE a.prov_code IN (${PROVINCES_STR})
            AND m.activity_date BETWEEN ? AND ?
            ORDER BY m.activity_date DESC, a.prov_code ASC
        `;
        const [rows] = await poolDb2.query(query, [start_date, end_date]);
        
        // Group by province and date in JS
        const groupedMap = new Map();
        rows.forEach(row => {
            const key = `${row.province_id}_${row.report_date}`;
            if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                    province_id: parseInt(row.province_id, 10),
                    report_date: row.report_date,
                    report_data: {}
                });
            }
            if (!groupedMap.get(key).report_data[row.activity_catalog]) {
                groupedMap.get(key).report_data[row.activity_catalog] = [];
            }
            groupedMap.get(key).report_data[row.activity_catalog].push({
                status: "done",
                detail: row.activity_detail || "มีการดำเนินการ"
            });
        });

        const list = Array.from(groupedMap.values());
        const total = list.length;
        const pagedData = list.slice(offset, offset + limit);

        res.json(makeResponse(pagedData, total, page, limit));
    } catch (error) {
        console.error("Error fetching preparation_reports:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getEmergency = async (req, res) => {
    try {
        const { start_date, end_date, page, limit, offset } = paginateParams(req);
        
        const countQuery = `
            SELECT COUNT(DISTINCT c.provcode, DATE(a.updated_at)) as total
            FROM cchangwat c
            JOIN activity a ON c.provcode = a.prov_code
            WHERE c.provcode IN (${PROVINCES_STR})
            AND DATE(a.updated_at) BETWEEN ? AND ?
        `;
        const [countResult] = await poolDb2.query(countQuery, [start_date, end_date]);
        const total = countResult[0].total;

        const query = `
            SELECT
                c.provcode AS province_id,
                DATE_FORMAT(DATE(a.updated_at), '%Y-%m-%d') AS report_date,
                IF(DATE(a.updated_at) BETWEEN MAX(m4.open_pheoc_date) AND IFNULL(MAX(m4.close_pheoc_date), '2099-12-31'), 'opened', 'not_opened') AS eoc_status,
                SUM(IFNULL(m2.risk_child_total, 0) + IFNULL(m2.risk_older_total, 0) + IFNULL(m2.risk_pregnant_total, 0) + IFNULL(m2.risk_bedridden_total, 0) + IFNULL(m2.risk_heart_total, 0) + IFNULL(m2.risk_copd_total, 0)) AS vulnerable_groups_target,
                SUM(IFNULL(m2.risk_child_take_care, 0) + IFNULL(m2.risk_older_take_care, 0) + IFNULL(m2.risk_pregnant_take_care, 0) + IFNULL(m2.risk_bedridden_take_care, 0) + IFNULL(m2.risk_heart_take_care, 0) + IFNULL(m2.risk_copd_take_care, 0)) AS vulnerable_groups_cared,
                SUM(IFNULL(m3.nursery_dust_free_service, 0) + IFNULL(m3.public_health_dust_free_service, 0) + IFNULL(m3.office_dust_free_service, 0) + IFNULL(m3.building_dust_free_service, 0) + IFNULL(m3.other_dust_free_service, 0)) AS clean_room_usage
            FROM cchangwat c
            JOIN activity a ON c.provcode = a.prov_code
            LEFT JOIN measure4 m4 ON a.activity_id = m4.activity_id
            LEFT JOIN measure2 m2 ON a.activity_id = m2.activity_id
            LEFT JOIN measure3 m3 ON a.activity_id = m3.activity_id
            WHERE c.provcode IN (${PROVINCES_STR})
            AND DATE(a.updated_at) BETWEEN ? AND ?
            GROUP BY c.provcode, DATE(a.updated_at)
            ORDER BY report_date DESC, c.provcode ASC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await poolDb2.query(query, [start_date, end_date, limit, offset]);
        res.json(makeResponse(rows, total, page, limit));
    } catch (error) {
        console.error("Error fetching emergency_reports:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getHealth = async (req, res) => {
    try {
        const { start_date, end_date, page, limit, offset } = paginateParams(req);
        
        const countQuery = `
            SELECT COUNT(DISTINCT c.provcode, DATE(a.updated_at)) as total
            FROM cchangwat c
            JOIN activity a ON c.provcode = a.prov_code
            WHERE c.provcode IN (${PROVINCES_STR})
            AND DATE(a.updated_at) BETWEEN ? AND ?
        `;
        const [countResult] = await poolDb2.query(countQuery, [start_date, end_date]);
        const total = countResult[0].total;

        const query = `
            SELECT
                c.provcode AS province_id,
                DATE_FORMAT(DATE(a.updated_at), '%Y-%m-%d') AS report_date,
                SUM(IFNULL(m2.risk_child_total, 0)) AS target_small_child,
                SUM(IFNULL(m2.risk_child_take_care, 0)) AS care_small_child,
                SUM(IFNULL(m2.risk_pregnant_total, 0)) AS target_pregnant,
                SUM(IFNULL(m2.risk_pregnant_take_care, 0)) AS care_pregnant,
                SUM(IFNULL(m2.risk_older_total, 0)) AS target_elderly,
                SUM(IFNULL(m2.risk_older_take_care, 0)) AS care_elderly,
                SUM(IFNULL(m3.nursery_dust_free_service, 0) + IFNULL(m3.public_health_dust_free_service, 0) + IFNULL(m3.office_dust_free_service, 0) + IFNULL(m3.building_dust_free_service, 0) + IFNULL(m3.other_dust_free_service, 0)) AS clean_room_users
            FROM cchangwat c
            JOIN activity a ON c.provcode = a.prov_code
            LEFT JOIN measure2 m2 ON a.activity_id = m2.activity_id
            LEFT JOIN measure3 m3 ON a.activity_id = m3.activity_id
            WHERE c.provcode IN (${PROVINCES_STR})
            AND DATE(a.updated_at) BETWEEN ? AND ?
            GROUP BY c.provcode, DATE(a.updated_at)
            ORDER BY report_date DESC, c.provcode ASC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await poolDb2.query(query, [start_date, end_date, limit, offset]);
        res.json(makeResponse(rows, total, page, limit));
    } catch (error) {
        console.error("Error fetching health_reports:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
