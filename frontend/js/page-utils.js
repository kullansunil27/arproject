// Dynamic utils loader - NO CONFLICTS
(function() {
  if (typeof window.apiFetch !== 'undefined') {
    console.log('utils.js already loaded');
    return;
  }
  
  const script = document.createElement('script');
  script.src = 'js/utils.js';
  script.async = false;
  document.head.appendChild(script);
  
  script.onload = () => console.log('utils.js loaded');
  script.onerror = () => console.error('utils.js load failed');
})();

window.utilsReady = true;

