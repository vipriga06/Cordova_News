/* Cordova shim para pruebas en navegador
   NO incluir esto en producción de Cordova; es solo para desarrollo local.
   Si la plataforma Cordova real proporciona cordova.js, éste no será usado.
*/
(function(window){
  if (window.cordova) return; // no sobreescribir si ya existe
  window.cordova = {
    platformId: 'browser',
    version: '0.0.0'
  };

  // Mock de event deviceready: dispararlo inmediatamente para facilitar pruebas
  document.addEventListener('DOMContentLoaded', function(){
    var ev;
    try { ev = new Event('deviceready'); }
    catch(e) { ev = document.createEvent('Event'); ev.initEvent('deviceready', true, true); }
    document.dispatchEvent(ev);
  });
})(window);
