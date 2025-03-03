const fs = require("fs");

const readFromFile = (filePath) => {
  fs.readFile(filePath, (err, res) => {
    if (res != undefined) {
      return res.toString();
    } else {
      return null;
    }
  });
};

const writeToFile = (filePath, data) => {
  fs.appendFile(filePath, data, (err, res) => {
    if (err) console.log("error writing to the file", err);
    console.log("successfully writing to the file");
  });
};

module.exports = { readFromFile, writeToFile };
