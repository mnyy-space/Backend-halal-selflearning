const pool = require('../libs/dp_pool');
const crypto = require('crypto');

module.exports = {
    getAllUsers: async () => {
        let connect;
        let response;
        try {
            connect = await pool.getConnection();
            const sql = `
                SELECT 
                    uc.user_id,
                    uc.username,
                    uc.full_name,
                    uc.email,
                    uc.role_id,
                    COALESCE(ur.role_name, 'user') AS role_name,
                    DATE_FORMAT(uc.create_date, '%Y-%m-%d %H:%i:%s') AS create_date,
                    COALESCE(
                        GROUP_CONCAT(DISTINCT s.session_name ORDER BY h.create_date DESC SEPARATOR ', '),
                        GROUP_CONCAT(DISTINCT sk.skill_name ORDER BY h.create_date DESC SEPARATOR ', ')
                    ) AS learning_content
                FROM user_accounts uc
                LEFT JOIN user_role ur ON uc.role_id = ur.role_id
                LEFT JOIN history h ON uc.user_id = h.user_id
                LEFT JOIN sessionswithexercise swe ON h.session_with_exercise_id = swe.session_with_exercise_id
                LEFT JOIN \`sessions\` s ON swe.session_id = s.session_id
                LEFT JOIN skills sk ON s.skill_id = sk.skill_id
                GROUP BY uc.user_id
                ORDER BY uc.user_id ASC
            `;
            const result = await connect.query(sql);
            response = {
                isError: false,
                data: result,
                errorMessage: ""
            };
        } catch (error) {
            response = {
                isError: true,
                data: null,
                errorMessage: error.message
            };
        } finally {
            if (connect) connect.release();
            return response;
        }
    },

    getUserById: async (userId) => {
        let connect;
        let response;
        try {
            connect = await pool.getConnection();
            const sql = `
                SELECT 
                    uc.user_id,
                    uc.username,
                    uc.full_name,
                    uc.email,
                    uc.role_id,
                    COALESCE(ur.role_name, 'user') AS role_name,
                    DATE_FORMAT(uc.create_date, '%Y-%m-%d %H:%i:%s') AS create_date
                FROM user_accounts uc
                LEFT JOIN user_role ur ON uc.role_id = ur.role_id
                WHERE uc.user_id = ?
            `;
            const result = await connect.query(sql, [userId]);
            if (result.length === 0) {
                response = {
                    isError: true,
                    data: null,
                    errorMessage: "User not found"
                };
            } else {
                response = {
                    isError: false,
                    data: result[0],
                    errorMessage: ""
                };
            }
        } catch (error) {
            response = {
                isError: true,
                data: null,
                errorMessage: error.message
            };
        } finally {
            if (connect) connect.release();
            return response;
        }
    },

    createUser: async (username, password, fullName, email, roleId) => {
        let connect;
        let response;
        try {
            connect = await pool.getConnection();
            const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
            const sql = `
                INSERT INTO user_accounts (username, password, full_name, email, role_id)
                VALUES (?, ?, ?, ?, ?)
            `;
            const result = await connect.query(sql, [
                username,
                passwordHash,
                fullName || 'anonymous',
                email || 'anonymous@example.com',
                roleId || 1
            ]);
            response = {
                isError: false,
                data: {
                    user_id: Number(result.insertId),
                    username,
                    full_name: fullName,
                    email,
                    role_id: roleId || 1
                },
                errorMessage: ""
            };
        } catch (error) {
            response = {
                isError: true,
                data: null,
                errorMessage: error.code === 'ER_DUP_ENTRY' ? "Username นี้มีอยู่ในระบบแล้ว" : error.message
            };
        } finally {
            if (connect) connect.release();
            return response;
        }
    },

    updateUser: async (userId, fullName, email, roleId, password) => {
        let connect;
        let response;
        try {
            connect = await pool.getConnection();
            let sql;
            let params;
            if (password && password.trim() !== '') {
                const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
                sql = `
                    UPDATE user_accounts 
                    SET full_name = ?, email = ?, role_id = ?, password = ?
                    WHERE user_id = ?
                `;
                params = [fullName, email, roleId, passwordHash, userId];
            } else {
                sql = `
                    UPDATE user_accounts 
                    SET full_name = ?, email = ?, role_id = ?
                    WHERE user_id = ?
                `;
                params = [fullName, email, roleId, userId];
            }
            const result = await connect.query(sql, params);
            if (result.affectedRows === 0) {
                response = {
                    isError: true,
                    data: null,
                    errorMessage: "User not found or no changes made"
                };
            } else {
                response = {
                    isError: false,
                    data: { user_id: userId, full_name: fullName, email, role_id: roleId },
                    errorMessage: ""
                };
            }
        } catch (error) {
            response = {
                isError: true,
                data: null,
                errorMessage: error.message
            };
        } finally {
            if (connect) connect.release();
            return response;
        }
    },

    deleteUser: async (userId) => {
        let connect;
        let response;
        try {
            connect = await pool.getConnection();
            const sql = "DELETE FROM user_accounts WHERE user_id = ?";
            const result = await connect.query(sql, [userId]);
            if (result.affectedRows === 0) {
                response = {
                    isError: true,
                    data: null,
                    errorMessage: "User not found"
                };
            } else {
                response = {
                    isError: false,
                    data: { user_id: userId },
                    errorMessage: ""
                };
            }
        } catch (error) {
            response = {
                isError: true,
                data: null,
                errorMessage: error.message
            };
        } finally {
            if (connect) connect.release();
            return response;
        }
    }
};
