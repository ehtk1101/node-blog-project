const UserModel = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const showSignupPage = (req, res) => {
  res.render("user/signup");
};

const showLoginPage = (req, res) => {
  res.render("user/login");
};

const signup = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).send("필수값이 입력되지 않았습니다.");
  UserModel.findOne({ email }, (err, result) => {
    if (err) return res.status(500).send("회원가입 시 오류가 발생했습니다.");
    if (result) return res.status(409).send("이미 사용중인 E-mail 입니다.");

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return res.stauts(500).send("암호화 시 오류가 발행했습니다.");

      const user = new UserModel({ name, email, password: hash });
      user.save((err, result) => {
        if (err)
          return res.status(500).send("회원가입 시 오류가 발생했습니다.");
        res.status(201).json(result);
      });
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).send("필수값이 입력되지 않았습니다.");

  UserModel.findOne({ email }, (err, user) => {
    if (err)
      return res.status(500).send("사용자 조회 시 오류가 발생하였습니다.");
    if (!user) return res.status(404).send("가입되지 않은 계정입니다.");

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).send("로그인 시 오류가 발생했습니다.");
      if (!isMatch)
        return res.status(500).send("비밀번호가 올바르지 않습니다.");

      const token = jwt.sign(user._id.toHexString(), "secretKey");
      UserModel.findByIdAndUpdate(user._id, { token }, (err, result) => {
        if (err) return res.status(500).send("로그인 시 오류가 발생했습니다.");

        res.cookie("token", token, { httpOnly: true });
        res.json(result);
      });
    });
  });
};

const checkAuth = (req, res, next) => {
  res.locals.user = null;

  const token = req.cookies.token;

  if (!token) {
    if (
      req.url === "/" ||
      req.url === "/api/user/signup" ||
      req.url === "/api/user/login"
    )
      return next();
    else return res.render("user/login");
  }

  jwt.verify(token, "secretKey", (err, _id) => {
    if (err) {
      res.clearCookie("token");
      return res.render("user/login");
    }

    UserModel.findOne({ _id, token }, (err, user) => {
      if (err) return res.status(500).send("인증 시 오류가 발생했습니다.");
      if (!user) return res.render("user/login");
      res.locals.user = { name: user.name, role: user.role };
      next();
    });
  });
};

const logout = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.render("user/login");

  jwt.verify(token, "secretKey", (err, _id) => {
    if (err) return res.status(500).send("로그아웃 시 오류가 발생했습니다.");
    UserModel.findByIdAndUpdate(_id, { token: "" }, (err, result) => {
      if (err) return res.status(500).send("로그아웃 시 오류가 발생했습니다.");
      res.clearCookie("token");
      res.redirect("/");
    });
  });
};

module.exports = {
  showSignupPage,
  signup,
  showLoginPage,
  login,
  checkAuth,
  logout,
};
