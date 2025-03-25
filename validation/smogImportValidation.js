const Joi = require("joi");
const cleanDiagcode = require("../helpers/cleanDiagcode");
const cleanCID = require("../helpers/cleanCID");

const smogImportSchema = Joi.object({
  hospcode: Joi.string().max(5).required(),
  pid: Joi.string().max(50).required(),
  birth: Joi.date().required(),
  sex: Joi.string().valid("1", "2").required(),
  addrcode: Joi.string().max(10).required(),
  hn: Joi.string().max(50).required(),
  seq: Joi.string().max(50).required(),
  date_serv: Joi.date().max("now").required(),
  diagtype: Joi.number().integer().min(0).max(7).required(),
  diagcode: Joi.string()
    .max(50)
    .custom((value, helpers) => {
      return cleanDiagcode(value);
    }, "Custom diagcode cleaning"),
  clinic: Joi.string().max(255).allow(null, ""),
  provider: Joi.string().max(100).allow(null, ""),
  d_update: Joi.date().required(),
  cid: Joi.string()
    .max(64)
    .custom((value, helpers) => {
      return cleanCID(value);
    }, "Custom diagcode cleaning"),
  appoint: Joi.string().valid("Y", "N").required(),
  admit: Joi.string().valid("Y", "N").required(),
  er: Joi.string().valid("Y", "N").required(),
});

module.exports = smogImportSchema;
