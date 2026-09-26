const pool = require('./libs/dp_pool');
const crypto = require('crypto');

async function createAdmin() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Connected to MariaDB successfully.");

        // 1. ตรวจสอบหรือสร้าง role_id = 2 (admin) ใน user_role
        const roleCheckSql = "SELECT * FROM user_role WHERE role_id = 2";
        const roleRows = await conn.query(roleCheckSql);
        if (roleRows.length === 0) {
            await conn.query("INSERT INTO user_role (role_id, role_name) VALUES (2, 'admin')");
            console.log("Created role_id = 2 ('admin') in user_role.");
        } else {
            console.log("role_id = 2 already exists:", roleRows[0]);
        }

        // 2. Hash รหัสผ่าน '1234' ด้วย SHA-256 (ตรงตามที่ระบบใช้ใน auth)
        const passwordPlain = "1234";
        const passwordHash = crypto.createHash('sha256').update(passwordPlain).digest('hex');
        console.log(`Password '1234' SHA-256 hash: ${passwordHash}`);

        // 3. ตรวจสอบว่ามี user 'admin' อยู่แล้วหรือไม่
        const userCheckSql = "SELECT * FROM user_accounts WHERE username = 'admin'";
        const userRows = await conn.query(userCheckSql);

        if (userRows.length === 0) {
            const insertSql = "INSERT INTO user_accounts (username, password, role_id) VALUES (?, ?, ?)";
            const result = await conn.query(insertSql, ['admin', passwordHash, 2]);
            console.log("Successfully created user 'admin' with role_id = 2!", result);
        } else {
            const updateSql = "UPDATE user_accounts SET password = ?, role_id = 2 WHERE username = 'admin'";
            const result = await conn.query(updateSql, [passwordHash]);
            console.log("User 'admin' already existed. Updated password to '1234' (SHA256) and role_id to 2!", result);
        }

        // 4. ตรวจสอบผลลัพธ์
        const verifySql = `
            SELECT uc.user_id, uc.username, uc.password, uc.role_id, ur.role_name 
            FROM user_accounts uc 
            LEFT JOIN user_role ur ON uc.role_id = ur.role_id 
            WHERE uc.username = 'admin'
        `;
        const verifyRows = await conn.query(verifySql);
        console.log("Current admin record in database:");
        console.log(verifyRows);

    } catch (err) {
        console.error("Error creating admin account:", err.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

createAdmin();
