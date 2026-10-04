//676767676767
//scubaaaaaaaaaaaaaaaaaaaaaaaaa

const port = 3000;
const host = "localhost";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { authMiddleware, requireRole } = require("./middleware/auth_middleware")

const { handleAuthenRequest, handleAccessRequest, handleGetLatestHistory } = require("./auth/auth");
const handleRegister = require('./register/register')
const showSkill = require('./skills/skill')
const handleGetSession = require('./session/session')
const getExerciseBysessionId = require('./exercise/exercise')
const { handleGetAllExercises, handleCreateExercise, handleUpdateExercise, handleChangeExerciseStatus } = require('./admin/exercise/exercise')
const { handleGetAllSkills, handleGetSkillById, handleCreateSkill, handleUpdateSkill, handleChangeSkillStatus, handleDeleteSkill } = require('./admin/skill/skill')
const { handleGetAllGoals, handleGetGoalById, handleCreateGoal, handleUpdateGoal, handleChangeGoalStatus, handleDeleteGoal } = require('./admin/goal/goal')
const { handleGetAllSessions, handleCreateSession, handleUpdateSession, handleDeleteSession } = require('./admin/session/session')
const { handleGetAllUsers, handleGetUserById, handleCreateUser, handleUpdateUser, handleDeleteUser } = require('./admin/user/user')

app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

//endpoint
app.post("/authen/authen_request", handleAuthenRequest);
app.post("/authen/access_request", handleAccessRequest);
app.post("/register", handleRegister)
app.get("/user/latest-history", authMiddleware, handleGetLatestHistory)
app.get("/skill", authMiddleware, showSkill)
app.get("/session/:skill_id", authMiddleware, handleGetSession)
app.get("/exercise/:session_id", authMiddleware, getExerciseBysessionId)

// ทุก endpoint ที่ขึ้นต้นด้วย /admin ต้อง login และมี role เป็น admin
app.use("/admin", authMiddleware, requireRole("admin"));

// Admin exercise endpoints
app.get("/admin/exercise", authMiddleware, handleGetAllExercises);
app.post("/admin/exercise", authMiddleware, handleCreateExercise);
app.put("/admin/exercise/:exercise_id", authMiddleware, handleUpdateExercise);
app.patch("/admin/exercise/:exercise_id/status", authMiddleware, handleChangeExerciseStatus);

// Admin skill endpoints
app.get("/admin/skill", authMiddleware, handleGetAllSkills);
app.get("/admin/skill/:skill_id", authMiddleware, handleGetSkillById);
app.post("/admin/skill", authMiddleware, handleCreateSkill);
app.put("/admin/skill/:skill_id", authMiddleware, handleUpdateSkill);
app.patch("/admin/skill/:skill_id/status", authMiddleware, handleChangeSkillStatus);
app.delete("/admin/skill/:skill_id", authMiddleware, handleDeleteSkill);

// Admin goal endpoints (Many-to-Many with Skill)
app.get("/admin/goal", authMiddleware, handleGetAllGoals);
app.get("/admin/goal/:goal_id", authMiddleware, handleGetGoalById);
app.post("/admin/goal", authMiddleware, handleCreateGoal);
app.put("/admin/goal/:goal_id", authMiddleware, handleUpdateGoal);
app.patch("/admin/goal/:goal_id/status", authMiddleware, handleChangeGoalStatus);
app.delete("/admin/goal/:goal_id", authMiddleware, handleDeleteGoal);

// Admin session endpoints
app.get("/admin/session", authMiddleware, handleGetAllSessions);
app.post("/admin/session", authMiddleware, handleCreateSession);
app.put("/admin/session/:session_id", authMiddleware, handleUpdateSession);
app.delete("/admin/session/:session_id", authMiddleware, handleDeleteSession);

// Admin user endpoints
app.get("/admin/user", authMiddleware, handleGetAllUsers);
app.get("/admin/user/:user_id", authMiddleware, handleGetUserById);
app.post("/admin/user", authMiddleware, handleCreateUser);
app.put("/admin/user/:user_id", authMiddleware, handleUpdateUser);
app.delete("/admin/user/:user_id", authMiddleware, handleDeleteUser);

app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`);
});
