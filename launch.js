/*
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/trunk/apps/app.runtime.html
 * @see http://developer.chrome.com/trunk/apps/app.window.html
 */
 var msp_install_date;

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('pages/index/index.html',
    {
        id: "launch",
        bounds: {
            width: 1000, 
            height: 600
        }
    });
});