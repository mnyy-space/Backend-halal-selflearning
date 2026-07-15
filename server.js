//676767676767
//scubaaaaaaaaaaaaaaaaaaaaaaaaa

const port = 3000;
const host = "localhost";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { authMiddleware } = require("./middleware/auth_middleware")

const { handleAuthenRequest, handleAccessRequest } = require("./auth/auth");
const handleRegister = require('./register/register')
const showSkill = require('./skills/skill')
const handleGetSession = require('./session/session')
const getExerciseBysessionId = require('./exercise/exercise')

app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

//endpoint
app.post("/authen/authen_request", handleAuthenRequest);
app.post("/authen/access_request", handleAccessRequest);
app.post("/register", handleRegister)
app.get("/skill", authMiddleware, showSkill)
app.get("/session/:skill_id", authMiddleware, handleGetSession)
app.get("/exercise/:session_id", authMiddleware, getExerciseBysessionId)

app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`);
});
