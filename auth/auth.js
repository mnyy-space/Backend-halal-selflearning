const express = require("express");
const jwt = require("../libs/jwt");
const userAccountModel = require("../models/user_account");

const handleAuthenRequest = async (req, res) => {
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
};

const handleAccessRequest = async (req, res) => {
  //access request DTO hashed{request token, password}
  const authenSignature = req.body.authenSignature;
  const authenToken = req.body.authenToken;
  var response;
  var decode;

  try {
    decode = await jwt.verify(authenToken);
  }
  catch(error){
    decode = null;
  }

  if (decode) {
    const result = await userAccountModel.checkAuthenAcess(
      authenToken,
      authenSignature,
    );
    console.log(result);
    if(result.isError){
        response = {
            isError : true,
            data: "",
            errorMessage : result.errorMessage,
        }
    }
    else{
        var payload = {
            user_id : result.data[0].user_id,
            username : result.data[0].username,
        }

        const accessToken = jwt.sign(payload);
        response = {
            isError : false,
            data : accessToken,
            errorMessage: ""
        }
    }
  }
  else{
    response = {
      isError: true,
      data: '',
      errorMessage: "ข้อมูลไม่ถูกต้อง"
    }
  }
  res.send(JSON.stringify(response))
};


module.exports = {
  handleAuthenRequest,
  handleAccessRequest,
};
