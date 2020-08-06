const { Router } = require("express");
const router = Router();
const ctrl = require("./profile.ctrl");

router.get("/", ctrl.showProfilePage); // 목록조회

module.exports = router;
