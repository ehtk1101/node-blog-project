const { Router } = require("express");
const router = Router();

router.use("/post", require("./post")); // ./post/index.js
router.use("/profile", require("./profile")); // ./movie/index.js
router.use("/user", require("./user")); // ./user/index.js

module.exports = router;
