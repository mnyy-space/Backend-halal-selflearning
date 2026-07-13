//676767676767
//scubaaaaaaaaaaaaaaaaaaaaaaaaa

const port = 3000;
const host = "localhost";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const {
  handleAuthenRequest,
  handleAccessRequest,
} = require("./auth/auth");

app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

//endpoint
app.post("/authen/access_request", handleAccessRequest);
app.post("/authen/authen_request", handleAuthenRequest);


app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`);
});
