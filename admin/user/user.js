const userAdminModel = require('../../models/user_admin');

const handleGetAllUsers = async (req, res) => {
    try {
        const result = await userAdminModel.getAllUsers();
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleGetUserById = async (req, res) => {
    try {
        const { user_id } = req.params;
        const result = await userAdminModel.getUserById(user_id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleCreateUser = async (req, res) => {
    try {
        const { username, password, full_name, email, role_id } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                isError: true,
                data: null,
                errorMessage: "username และ password จำเป็นต้องกรอก"
            });
        }
        const result = await userAdminModel.createUser(
            username.trim(),
            password,
            full_name ? full_name.trim() : '',
            email ? email.trim() : '',
            role_id || 1
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleUpdateUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { full_name, email, role_id, password } = req.body;
        if (!user_id) {
            return res.status(400).json({
                isError: true,
                data: null,
                errorMessage: "user_id is required"
            });
        }
        const result = await userAdminModel.updateUser(
            user_id,
            full_name ? full_name.trim() : '',
            email ? email.trim() : '',
            role_id || 1,
            password
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

const handleDeleteUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) {
            return res.status(400).json({
                isError: true,
                data: null,
                errorMessage: "user_id is required"
            });
        }
        // ป้องกันไม่ให้ลบ admin หลัก
        const checkUser = await userAdminModel.getUserById(user_id);
        if (checkUser && checkUser.data && checkUser.data.username === 'admin') {
            return res.status(400).json({
                isError: true,
                data: null,
                errorMessage: "ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (admin) ได้"
            });
        }
        const result = await userAdminModel.deleteUser(user_id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ isError: true, data: null, errorMessage: error.message });
    }
};

module.exports = {
    handleGetAllUsers,
    handleGetUserById,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser
};
