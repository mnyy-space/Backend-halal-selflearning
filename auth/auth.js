const express = require("express");
const jwt = require("../libs/jwt");
const userAccountModel = require("../models/user_account");

const handleAuthenRequest = async (req, res) => {
  const authenRequest = req.body.authen_request;
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
  const authenSignature = req.body.authen_signature;
  const authenToken = req.body.authen_token;
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
            const user_id = result.data[0].user_id
            const username = result.data[0].username
            const role_name = result.data[0].role_name

        // ตรวจสอบประวัติล่าสุด 1 แถวเพื่อดูว่าเคยเรียน/ทำแบบฝึกหัดแล้วหรือยัง
        const historyResult = await userAccountModel.getLatestHistory(user_id);
        const latestHistory = (!historyResult.isError && historyResult.data) ? historyResult.data : null;
        const hasHistory = latestHistory !== null;

        var payload = {
            user_id,
            username,
        }

        const accessToken = jwt.sign(payload);
        response = {
            isError : false,
            data : {
              user_id,
              username,
              role_name,
              has_history: hasHistory,
              latest_history: latestHistory,
              accessToken},
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
  console.log(response)
  res.send(JSON.stringify(response))
};

const handleGetLatestHistory = async (req, res) => {
  const user_id = req.user?.user_id;
  if (!user_id) {
    return res.status(401).json({ isError: true, errorMessage: "Unauthorized", data: null });
  }
  const result = await userAccountModel.getLatestHistory(user_id);
  res.json(result);
};

module.exports = {
  handleAuthenRequest,
  handleAccessRequest,
  handleGetLatestHistory,
};
