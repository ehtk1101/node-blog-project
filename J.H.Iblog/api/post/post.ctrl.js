const PostModel = require("../../models/post");
const mongoose = require("mongoose");

const checkId = (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).end();
  }
  next();
};

const list = (req, res) => {
  const limit = parseInt(req.query.limit || 10, 10);
  if (Number.isNaN(limit)) return res.status(400).end();

  PostModel.find((err, result) => {
    if (err) return res.status(500).end();
    res.render("post/list", { result });
  })
    .limit(limit)
    .sort({ created: -1 });
};

const detail = (req, res) => {
  const { id } = req.params;

  PostModel.findById(id, (err, result) => {
    if (err) return res.status(500).end();
    if (!result) res.status(404).end();

    res.render("post/detail", { result });
  });
};

const create = (req, res) => {
  const { title, contents } = req.body;

  if (!title || !contents)
    return res.status(400).send("필수값이 입력되지 않았습니다.");
  PostModel.create({ title, contents }, (err, result) => {
    if (err) return res.status(500).send("등록 시 오류가 발생했습니다.");
    res.status(201).json(result);
  });
};

const update = (req, res) => {
  const id = req.params.id;

  const { title, contents } = req.body;
  PostModel.findByIdAndUpdate(
    id,
    { title, contents },
    { new: true },
    (err, result) => {
      if (err) return res.status(500).send("수정 시 오류가 발생했습니다.");
      if (!result) return res.status(404).send("해당하는 정보가 없습니다.");
      res.json(result);
    }
  );
};

const remove = (req, res) => {
  const id = req.params.id;

  PostModel.findByIdAndDelete(id, (err, result) => {
    if (err) res.status(500).send("삭제 시 오류가 발생했습니다.");
    if (!result) res.status(404).send("해당하는 정보가 없습니다.");
    res.json(result);
  });
};

const showCreatePage = (req, res) => {
  res.render("post/create");
};

const showUpdatePage = (req, res) => {
  const id = req.params.id;

  PostModel.findById(id, (err, result) => {
    if (err) return res.status(500).send("조회 시 오류가 발생했습니다.");
    if (!result) return res.status(404).send("해당하는 정보가 없습니다.");
    res.render("post/update", { result });
  });
};

module.exports = {
  list,
  detail,
  create,
  update,
  remove,
  checkId,
  showCreatePage,
  showUpdatePage,
};
