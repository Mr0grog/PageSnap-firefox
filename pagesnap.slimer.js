var webpage = require('webpage');

// Handle redirects when loading :\
function loadPage(url, callback) {
  var navigations = 0;
  var page = webpage.create();
  page.onNavigationRequested = function(url, type, willNavigate, main) {
    navigations++;
  };
  page.onLoadFinished = function(status) {
    navigations--;
    if (navigations < 1) {
      callback(status, page);
    }
  };
  page.open(url);
  return page;
}

loadPage(phantom.args[0], function(status, page) {
  page.viewportSize = {
    width: 1024,
    height: 768
  };
  console.log(page.renderBase64({
    format: "png"
  }));
  slimer.exit();
});
