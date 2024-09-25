var express = require("express");
var router = express.Router();

const db = require("../database/db_connect");
const { use } = require(".");
const admin = require("firebase-admin");
const { response } = require("../app");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

const updateFcm = (fcmToken, table, idColName, id) => {
  const queryStr = `UPDATE ${table} SET fcm_token="${fcmToken}" WHERE ${idColName}="${id}"`;

  console.log(">> updateFcm / queryStr = " + queryStr);

  db.query(queryStr, (err, rows, fields) => {
    if (err) {
      console.log("updateFcm / err = " + JSON.stringify(err));
    }
  });
};

const sendPushToAlldriver = () => {
  let queryStr = "SELECT fcm_token from tb_driver";

  console.log(">> queryStr = ", queryStr);

  db.query(queryStr, (err, rows, fields) => {
    if (!err) {
      for (row of rows) {
        console.log("allDriver - fcm_token = ", +row.fcm_token);
        if (row.fcm_token) {
          sendFcm(row.fcm_token, "배차 요청이 있습니다.");
        }
      }
    }
  });
};

const sendPushuser = (userId) => {
  let queryStr = `SELECT fcm_token FROM tb_user WHERE user_id="${userId}"`;
  console.log(">> push user / queryStr = " + queryStr);

  db.query(queryStr, (err, rows, fields) => {
    if (!err) {
      console.log(">> push user / rows = " + JSON.stringify(rows));
      if (Object.keys(rows).length > 0 && rows[0].fcm_token) {
        sendFcm(rows[0].fcm_token, "배차가 완료 되었습니다");
      } else {
        console.log("전송실패");
      }
    } else {
      console.log(">> push user / err = " + err);
    }
  });
};

router.get("/taxi/test", function (req, res, next) {
  db.query("select * from tb_user", (err, rows, fields) => {
    if (!err) {
      console.log("test / rows =" + JSON.stringify(rows));
      res.json([{ code: 0, data: rows }]);
    } else {
      console.log("test/ err: " + err);
      res.json([{ code: 1, data: err }]);
    }
  });
});

router.post("/taxi/login", function (req, res, next) {
  console.log("login/ req.body " + JSON.stringify(req.body));

  let userId = req.body.userId;
  let userPw = req.body.userPw;
  let fcmToken = req.body.fcmToken || "";

  let queryStr = `SELECT * FROM tb_user WHERE user_id="${userId}" AND user_pw="${userPw}"`;

  console.log("login/ queryStr = " + queryStr);

  db.query(queryStr, (err, rows, fields) => {
    if (!err) {
      console.log("login/ rows =", JSON.stringify(rows));
      let len = Object.keys(rows).length;
      console.log("login/ len =" + len);

      let code = len == 0 ? 1 : 0;

      let message =
        len == 0
          ? "아이디 또는 비밀번호가 잘못 입력되었습니다."
          : "로그인 성공";
      if (code == 0) {
        updateFcm(fcmToken, "tb_user", "user_id", userId);
      }
      res.json([{ code: code, message: message }]);
    } else {
      console.log("login/ err: " + err);
      res.json([{ code: 1, message: err }]);
    }
  });
});

router.post("/taxi/register", function (req, res) {
  console.log("register /req.body" + JSON.stringify(req.body));

  let userId = req.body.userId;
  let userPw = req.body.userPw;
  let fcmToken = req.body.fcmToken || "";

  console.log("register / userId = " + userId + ", userPw= " + userPw);

  if (!(userId && userPw)) {
    res.json([{ code: 1, message: "아이디나 패스워드가 없습니다" }]);
    return;
  }

  let queryStr = `insert into tb_user values ("${userId}","${userPw}","${fcmToken}")`;

  console.log("register/ queryStr = " + queryStr);

  db.query(queryStr, function (err, rows, fields) {
    if (!err) {
      console.log("register/ rows = " + JSON.stringify(rows));
      res.json([{ code: 0, message: "회원가입이 완료되었습니다" }]);
    } else {
      console.log("register / err : " + JSON.stringify(err));
      if (err.code == "ER_DUP_ENTRY") {
        res.json([{ code: 2, message: "이미 등록된 ID입니다" }]);
      } else {
        res.json([
          { code: 3, message: "알 수 없는 오류가 발생했습니다.", data: err },
        ]);
      }
    }
  });
});

router.post("/taxi/list", function (req, res) {
  console.log("list / req.body" + JSON.stringify(req.body));

  let userId = req.body.userId;
  console.log("list / userId = " + userId);

  let queryStr = `SELECT * FROM tb_call where user_id="${userId}" ORDER BY id DESC`;
  db.query(queryStr, (err, rows, fields) => {
    if (!err) {
      console.log("list / rows = " + JSON.stringify(rows));
      let code = 0;

      rows = rows.map((row) => {
        const reqTime = new Date(row.requset_tim);
        const today = new Date();
        const isToday = reqTime.toDateString() === today.toDateString();

        const formattedDate = reqTime.toISOString().split("T")[0];
        const formattedTime = reqTime.toTimeString().split(" ")[0].slice(0, 5);

        row.formatted_time = isToday ? formattedTime : formattedDate;
        return row;
      });

      res.json([{ code: code, message: "택시 목록 호출 성공", data: rows }]);
    } else {
      console.log("err :" + err);
      res.json([
        { code: 1, message: "알 수 없는 오류가 발생했습니다.", data: err },
      ]);
    }
  });
});

router.post("/taxi/call", function (req, res) {
  console.log("taxi/call / req.body = " + JSON.stringify(req.body));

  let userId = req.body.userId;
  let startAddr = req.body.startAddr;
  let startLat = req.body.startLat;
  let startLng = req.body.startLng;
  let endAddr = req.body.endAddr;
  let endLat = req.body.endLat;
  let endLng = req.body.endLng;

  if (
    !(
      userId &&
      startAddr &&
      startLat &&
      startLng &&
      endAddr &&
      endLat &&
      endLng
    )
  ) {
    res.json([{ code: 1, message: "출발지 또는 도착지 정보가 없습니다" }]);
    return;
  }

  let queryStr = `INSERT INTO tb_call VALUES(NULL, "${userId}",
  "${startLat}","${startLng}","${startAddr}",
  "${endLat}","${endLng}","${endAddr}","REQ","",CURRENT_TIMESTAMP)`;

  console.log("call/ queryStr = " + queryStr);

  db.query(queryStr, (err, rows, fields) => {
    if (!err) {
      console.log("call / rows = " + JSON.stringify(rows));
      sendPushToAlldriver();
      res.json([{ code: 0, message: "택시 호출이 완료 되었습니다." }]);
    } else {
      console.log("call/ err = " + err);
      res.json([{ code: 2, message: "택시 호출 실패했습니다", data: err }]);
    }
  });
});

router.post("/driver/register", function (req, res) {
  console.log("/driver/register / req.body = " + JSON.stringify(req.body));

  let driverId = req.body.driverId;
  let driverPw = req.body.driverPw;
  let fcmToken = req.body.fcmToken || "";

  console.log(
    "/driver/register / driver_id = " + driverId + " , driver_pw = " + driverPw
  );

  if (!(driverId && driverPw)) {
    console.log("아이디나 패스워드 없음");
    res.json([{ code: 1, message: "아이디나 패스워드가 없습니다." }]);
    return;
  }

  let queryStr = `INSERT INTO tb_driver VALUES("${driverId}","${driverPw}","${fcmToken}")`;
  db.query(queryStr, (err, rows, fields) => {
    if (!err) {
      console.log("/driver/register / rows = " + JSON.stringify(rows));
      let code = 0;
      res.json([{ code: code, message: "회원가입이 완료되었습니다." }]);
    } else {
      console.log("/driver/register / err = " + err);
      if (err.code == "ER_DUP_ENTRY") {
        res.json([{ code: 2, message: "이미 있는 ID입니다." }]);
      } else {
        res.json([
          { code: 3, message: "알수 없는 오류가 발생 했습니다.", data: err },
        ]);
      }
    }
  });
});

router.post("/driver/login", function (req, res) {
  console.log("/driver/login / req.body = " + JSON.stringify(req.body));

  let driverId = req.body.driverId;
  let driverPw = req.body.driverPw;
  let fcmToken = req.body.fcmToken || "";

  console.log(
    "/driver/login / driver_id = " + driverId + " , driver_pw = " + driverPw
  );

  if (!(driverId && driverPw)) {
    console.log("아이디나 패스워드 없음");
    res.json([{ code: 1, message: "아이디나 패스워드가 없습니다." }]);
    return;
  }

  let queryStr = `SELECT * FROM tb_driver WHERE driver_id="${driverId}" AND driver_pw="${driverPw}"`;

  db.query(queryStr, (err, rows, fields) => {
    if (!err) {
      console.log("/driver/login / rows = " + JSON.stringify(rows));
      let len = Object.keys(rows).length;
      let code = len == 0 ? 1 : 0;
      let message =
        len == 0
          ? "아이디 또는 비밀번호가 잘못 입력되었습니다."
          : "로그인 성공";
      if (code == 0) {
        updateFcm(fcmToken, "tb_driver", "driver_id", driverId);
      }
      res.json([{ code: code, message: message }]);
    } else {
      console.log("/driver/login / err = " + err);
      res.json([{ code: 1, message: "로그인 실패", data: err }]);
    }
  });
});

router.post("/driver/list", function (req, res) {
  console.log("/driver/list / req.body" + JSON.stringify(req.body));

  let driverId = req.body.driverId;

  let queryStr = `SELECT * FROM tb_call WHERE driver_id="${driverId}" OR call_state="REQ" ORDER BY id DESC`;

  db.query(queryStr, (err, rows, fields) => {
    if (!err) {
      console.log("list / rows = " + JSON.stringify(rows));
      let code = 0;
      rows = rows.map((row) => {
        const reqTime = new Date(row.requset_tim);
        const today = new Date();
        const isToday = reqTime.toDateString() === today.toDateString();

        const formattedDate = reqTime.toISOString().split("T")[0];
        const formattedTime = reqTime.toTimeString().split(" ")[0].slice(0, 5);

        row.formatted_time = isToday ? formattedTime : formattedDate;
        return row;
      });
      res.json([{ code: code, message: "택시 목록 호출 성공", data: rows }]);
    } else {
      console.log("err :" + err);
      res.json([
        { code: 1, message: "알 수 없는 오류가 발생했습니다.", data: err },
      ]);
    }
  });
});

router.post("/driver/accept", function (req, res) {
  console.log("/driver/accept / req.body = " + JSON.stringify(req.body));

  let callId = req.body.callId;
  let driverId = req.body.driverId;
  let userId = req.body.userId;
  console.log(
    "/driver/accept / driver_id = " + driverId + ", call_state = " + callId
  );

  if (!(callId && driverId)) {
    res.json([{ code: 1, message: "callId나 driverId가 없습니다" }]);
    return;
  }

  let queryStr = `UPDATE tb_call set driver_id="${driverId}", call_state="RES" WHERE id=${callId}`;
  db.query(queryStr, (err, rows, fields) => {
    if (!err) {
      console.log("/driver/accept / rows = " + JSON.stringify(rows));
      if (rows.affectedRows) {
        console.log(rows.affectedRows);
        sendPushuser(userId);
        res.json([{ code: 0, message: "콜을 수락했습니다." }]);
      } else {
        res.json([{ code: 2, message: "이미 완료되었거나 없는 call입니다" }]);
      }
    } else {
      res.json([
        { code: 3, message: "알 수 없는 오류가 발생 했습니다", data: err },
      ]);
    }
  });
});

router.post("/push/test", function (req, res) {
  console.log("/push-test / req.body = " + JSON.stringify(req.body));

  let fcmToken = req.body.fcmToken;
  let message = req.body.message;

  sendFcm(fcmToken, message);

  res.json([{ code: 0, message: "푸시 완료" }]);
});

const sendFcm = (fcmToken, msg) => {
  const message = {
    notification: { title: "알람", body: msg },
    token: fcmToken,
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("성공");
    })
    .catch((e) => {
      console.log("-- push error / " + JSON.stringify(e));
    });
};

module.exports = router;
