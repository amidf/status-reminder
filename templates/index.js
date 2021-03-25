const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

exports.channels = Handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, "./channels.html")).toString()
);
exports.users = Handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, "./users.html")).toString()
);
exports.help = Handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, "./help.html")).toString()
);
exports.userAnswer = Handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, "./user-answer.html")).toString()
);
exports.userStatus = Handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, "./user-status.html")).toString()
);
exports.timezones = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, './timezones.html')).toString())