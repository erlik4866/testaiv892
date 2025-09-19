// Load Fengari Lua VM from CDN
(function() {
  var script = document.createElement('script');
  script.src = 'https://unpkg.com/fengari-web@0.1.4/dist/fengari-web.js';
  script.onload = function() {
    console.log('Fengari Lua VM loaded');
    window.fengariLoaded = true;
  };
  script.onerror = function() {
    console.error('Failed to load Fengari Lua VM');
    window.fengariLoaded = false;
  };
  document.head.appendChild(script);
})();
