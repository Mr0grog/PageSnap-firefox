var express = require('express');
var through2 = require('through2');
var Buffer = require('buffer').Buffer;
var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');

var PORT = process.env.PORT || process.argv[2] || 3000;
var USE_XVFB = /true/i.test(process.env.USE_XVFB);
var FIREFOX_PATH = process.env.FIREFOX_PATH || (function findFirefox() {
  var firefox = [
    "/usr/bin/firefox",
    "/Applications/Firefox.app/Contents/MacOS/firefox"
  ].filter(fs.existsSync)[0];
  return firefox || console.error("Can't find Firefox.") && process.exit(1);
})();


var app = express();

var slimerBinary = path.join(__dirname, "node_modules", "slimerjs", "bin", "slimerjs");
var slimerScript = path.join(__dirname, "pagesnap.slimer.js");
var slimerCommand = slimerBinary;
var slimerArgs = ["--ssl-protocol=any", slimerScript];
if (USE_XVFB) {
  slimerArgs = ["-a", slimerCommand].concat(slimerArgs);
  slimerCommand = "xvfb-run";
}

// generate a PNG of the requested URL
app.get('/:url.png', function(req, res) {
  var url = decodeURIComponent(req.params.url);
  process.stdout.write("Request to render " + url + "\n");
  
  var slimer = spawn(
    slimerCommand,
    slimerArgs.concat([url]),
    {env: {SLIMERJSLAUNCHER: FIREFOX_PATH}});
  
  // TODO: handle errors
  slimer.stdout.pipe(through2(function(chunk, encoding, callback) {
    callback(null, new Buffer(chunk.toString(), "base64"));
  })).pipe(res);

  slimer.stderr.pipe(process.stdout);
  slimer.on("close", function(code) {
    clearTimeout(renderTimeout);
    console.log("Slimer exited with code " + code);
  });

  var renderTimeout = setTimeout(function() {
    slimer.kill();
    console.error("Killing slow render:", url);
  }, 120 * 1000);
});

app.listen(PORT);
console.log('Running PageSnap server on port %d', PORT);
