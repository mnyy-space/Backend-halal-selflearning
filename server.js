//676767676767
//scubaaaaaaaaaaaaaaaaaaaaaaaaa

const port = 3000;
const host = "127.0.0.1";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const userAccountModel = require("./models/user_account");

app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  var response = {
    isOk: true,
    messsage: "scubaaaaaaa",
  };

  res.send(JSON.stringify(response));
});

app.post("/authen/authen_request", async (req, res) => {
  const authenRequest = req.body.authenRequest;
  const auth_grant = await userAccountModel.checkAuthenRequest(authenRequest);

  var response;
  //close
  console.log("this is authen grant from authen request", auth_grant);
  if (auth_grant.isError) {
    response = {
      isError: true,
      errorMessage: auth_grant.errorMessage,
    };
  } else {
    var payload = {
      username: auth_grant.data[0].username,
    };
    const auth_token = jwt.sign(payload);
    response = {
      isError: false,
      data: auth_token,
      errorMessage: "",
    };
  }
  res.send(JSON.stringify(response));
});

//not done
app.post("/authen/acces_request", async (req, res) => {
  //access request DTO hashed{request token, password}
  const authenSignature = req.body.authenSignature;
  const authenToken = req.body.authenToken;

  var decode = jwt.verify(authenToken);

  let response;
  if (decode) {
    const result = await userAccountModel.checkAuthenAcess(
      authenToken,
      authenSignature,
    );
    console.log(result);
    if(result.isError){
        reponse = {
            isError : true,
            data: "",
            errorMessage : result.errorMessage,
        }
    }
    else{
        var payload = {
            user_ud : result.data[0].user_id,
            username : result.data[0].username,
        }

        
    }
  }
});

app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`);
});
