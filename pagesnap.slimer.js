var webpage = require('webpage');

// Handle redirects when loading :\
function loadPage(url, callback) {
  var intendedUrl = url;
  var page = webpage.create();
  page.onNavigationRequested = function(url, type, willNavigate, main) {
    intendedUrl = url;
  };
  page.onLoadFinished = function(status) {
    if (page.url === intendedUrl) {
      callback(status, page);
    }
  };
  page.open(url);
  return page;
}

loadPage("https://www.c4yourself.com", function(status, page) {
  page.viewportSize = {
    width: 1024,
    height: 768
  };
  console.log(page.renderBase64({
    format: "png"
  }));
  slimer.exit();
});
