import * as fs from "fs";

let path = "./build/bookmarklets.js";

// double quote to
var contents = fs.readFileSync(path, { encoding: "utf-8" });
contents = "javascript:(function(){" + contents + "})()";
fs.writeFileSync(path, contents, { encoding: "utf-8" });

var compressor = require("node-minify");

// Using Google Closure Compiler
compressor.minify({
  compressor: "yui-js",
  input: path,
  output: path,
  callback: function(err, min) {
    var contents = fs.readFileSync(path, { encoding: "utf-8" });
    contents = contents.replace(/\\/g, "\\\\");
    fs.writeFileSync(path, contents, { encoding: "utf-8" });
  }
});


//.replace(/\"/g, '""')