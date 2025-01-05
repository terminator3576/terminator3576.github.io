// analytics.js

// Load the Google Analytics library
(function(i, s, o, g, r, a, m) {
  i["GoogleAnalyticsObject"] = r;
  (i[r] =
    i[r] ||
    function() {
      (i[r].q = i[r].q || []).push(arguments);
    }),
    (i[r].l = 1 * new Date());
  (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
})(
  window,
  document,
  "script",
  "https://www.google-analytics.com/analytics.js",
  "ga"
);

// Initialize Google Analytics with your Measurement ID
ga("create", "G-KWSR49792B", "auto");

// Send a pageview for the current page
ga("send", "pageview");

// Helper function to log custom events
function logEvent(category, action, label = "", value = 0) {
  ga("send", "event", category, action, label, value);
}

// Example usage of logEvent:
// logEvent("Code Execution", "Run", "main.py", 1);
