var splashDuration = 3000;
var optionsPage = "/pages/options/options.html";
var vocabPage = "/pages/vocab/vocab.html";
var signinPage = "/pages/signin/signin.html";
var pagesPath = "/pages/";
var page;

document.addEventListener('DOMContentLoaded', function() {

    //Set style sheet based on screen size
    //If screen size greater than splash screen, use it
    //Otherwise, spread content on page
    if(window.innerWidth < 600 || window.innerHeight < 300) {
        //Use small style sheet
        var css = "/css/splash_small.css";
        document.getElementById('splashStyle').href = css;
    }


    //Check if this is first run
    if(localStorage["msp_install_date"] == undefined) {
    //if(chrome.local.storage.get('msp_install_date') == undefined) {
        //Set the install date
        var d = new Date();
        //chrome.local.storage.set({ 'msp_install_date': d.toUTCString() });
        localStorage["msp_install_date"] = d.toUTCString();

        //Go to options page for firstrun
        page = optionsPage;

    } else {

        //Page will normally be what they have set in options
        page = pagesPath + localStorage["msp_on_open"];

        //If user is signed in and requires auto update check
        if(localStorage["msp_userid"] && localStorage["msp_auto_update"] == true) {
            //Check if sync required
            if(checkIfSyncRequired() == true) {
                //Go to options page for auto sync
                page = optionsPage;
            }
        }
    }

    var t = setTimeout(redirectPage, splashDuration);
});

function redirectPage() {

    document.location.href = page;
}

