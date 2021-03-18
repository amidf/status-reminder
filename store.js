const fs = require("fs");
const dbFile = "db.json";

const readDatabase = () => {
  try {
    const stringContent = fs.readFileSync(dbFile);
    db = JSON.parse(stringContent);
  } catch (e) {
    console.log("No db found, creating %s", dbFile);
  }
};

const saveDatabase = () => {
  console.log("Saving db");
  const stringContent = JSON.stringify(db, null, 2);
  fs.writeFileSync(dbFile, stringContent);
};

// Everything is stored here
let db = null;

readDatabase();

// Accessors
exports.saveAdminUser = (userId, token) => {
  db.adminUser = {
    userId,
    token,
    selectedChannels: [],
    ignoredUsers: [],
  };

  saveDatabase();
};

exports.saveSelectedChannels = (channels) => {
  db.adminUser = {
    ...db.adminUser,
    selectedChannels: channels,
  };

  saveDatabase();
};

exports.saveIgnoredUsers = (users) => {
  db.adminUser = {
    ...db.adminUser,
    ignoredUsers: users,
  };
};

exports.getAdminUser = () => db.adminUser;

exports.resetDb = () => {
  db = {
    adminUser: null,
  };
  saveDatabase();
};

exports.getDb = () => db