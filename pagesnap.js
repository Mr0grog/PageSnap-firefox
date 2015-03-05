var PORT = process.env.PORT || process.argv[2] || 3000;

var express = require('express');
var through2 = require('through2');
var Buffer = require('buffer').Buffer;
var spawn = require('child_process').spawn;
var path = require('path');

var app = express();

// generate a PNG of the requested URL
app.get('/:url.png', function(req, res) {
  var url = decodeURIComponent(req.params.url);
  
  var slimerBinary = path.join(__dirname, "node_modules", "slimerjs", "bin", "slimerjs");
  var slimerScript = path.join(__dirname, "pagesnap.slimer.js");
  var slimer = spawn(
    slimerBinary,
    ["--ssl-protocol=any", slimerScript],
    {env: {SLIMERJSLAUNCHER: "/Applications/Firefox.app/Contents/MacOS/firefox"}});
  
  // TODO: handle errors
  slimer.stdout.pipe(through2(function(chunk, encoding, callback) {
    callback(null, new Buffer(chunk.toString(), "base64"));
  })).pipe(res);
});

app.listen(PORT);
console.log('Running PageSnap server on port %d', PORT);
