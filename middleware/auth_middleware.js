const jwt = require('../libs/jwt');


// ตรวจว่ามี token และ token ยังใช้ได้ (ไม่มี / ไม่ถูกต้อง / หมดอายุ -> 401)
const authMiddleware = (req, res, next) =>{
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) return res.status(401).json({ isError: true, data: "", errorMessage: 'No token provided' });

    jwt.verify(token)
    .then(decoded => {
        req.user = decoded;
        next();
    }).catch(err => {
        return res.status(401).json({ isError: true, data: "", errorMessage: 'Invalid or expired token' });
    });

}

// ตรวจ role ของผู้ใช้ ต้องใช้หลัง authMiddleware (role ไม่ตรง -> 403)
// ตัวอย่าง: app.get("/admin/skill", authMiddleware, requireRole("admin"), handler)
const requireRole = (...roles) => (req, res, next) =>{
    const roleName = (req.user && req.user.role_name || '').toLowerCase();

    if (!roles.map(r => r.toLowerCase()).includes(roleName)) {
        return res.status(403).json({ isError: true, data: "", errorMessage: 'ไม่มีสิทธิ์เข้าถึง' });
    }
    next();
}

module.exports = {
    authMiddleware,
    requireRole
}
