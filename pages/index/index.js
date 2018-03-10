var splashDuration = 3000;
var optionsPage = "/pages/options/options.html";
var vocabPage = "/pages/vocab/vocab.html";
var signinPage = "/pages/signin/signin.html";
var pagesPath = "/pages/";
var page;
var msp_install_date, msp_on_open, msp_user_id, msp_auto_update;


document.addEventListener('DOMContentLoaded', function () {

    console.log("Lets get this show on the road... in January");
    
    //Retrieve some values and set them as variables
    //chrome.storage.local.get('msp_on_open', function (value) {msp_on_open = value.msp_on_open; });
    //chrome.storage.local.get('msp_user_id', function (value) { msp_user_id = value.msp_user_id; });
    //chrome.storage.local.get('msp_auto_update', function (value) { msp_auto_update = value.msp_auto_update; });
    //chrome.storage.local.get('msp_install_date', function (value) { msp_install_date = value.msp_install_date; });

    
    chrome.storage.local.get(['msp_on_open','msp_user_id','msp_auto_update'], function (value) {
        msp_on_open = value.msp_on_open; 
        console.log("Doing some clever stuff");
    
    });
    //chrome.storage.local.get('msp_user_id', function (value) { msp_user_id = value.msp_user_id; });
    //chrome.storage.local.get('msp_auto_update', function (value) { msp_auto_update = value.msp_auto_update; });
    //chrome.storage.local.get('msp_install_date', function (value) { msp_install_date = value.msp_install_date; });
    
    

    
    //BIN THIS : SET TO RUN AS A SPLASH SCREEN WITHOUT BORDERS
    //Set style sheet based on screen size
    //If screen size greater than splash screen, use it
    //Otherwise, spread content on page
    //if(window.innerWidth < 600 || window.innerHeight < 300) {
        //Use small style sheet
      //  var css = "/css/splash_small.css";
    //    document.getElementById('splashStyle').href = css;
    //}

    
    //Test set some values and set variable
    chrome.storage.local.set({'msp_install_date': "21/06/2014"}, function() {
      // Notify that we saved.
        //var msp_install_date = value.msp_install_date;
      console.log('Item saved to storage');
    });    
    
    chrome.storage.local.get('msp_install_date', function(value) {

        console.log("Value retrieved is " + value.msp_install_date);
        msp_install_date = value.msp_install_date;
        console.log("Value from variable msp_install_date is: " + msp_install_date);
    });

    //var thisisatestvar;
    
    //console.log("Test var is " + thisisatestvar);
    
    //console.log("Moved onto next page");
    //TODO - UPDATE THIS LOT


    //Retrieve some values from storage
    chrome.storage.sync.get(['msp_install_date', 'msp_user_id', 'msp_auto_update'], function(result) {
        
        //Set the variables
        
        var msp_install_date = result.msp_install_date;
        var msp_user_id = result.msp_user_id;
        var msp_auto_update = result.msp_auto_update;
        
        //Now do some other stuff before loading the options page
        //Check if this is first run
        
        if(msp_install_date == undefined) {
        //if(chrome.local.storage.get('msp_install_date') == undefined) {
            //Set the install date
            var d = new Date();
            //chrome.storage.local.set({ 'msp_install_date': d.toUTCString() });
            //localStorage["msp_install_date"] = d.toUTCString();

            chrome.storage.local.set({'msp_install_date': d.toUTCString()}, function() {
              // Notify that we saved.
                msp_install_date = d.toUTCString();
                console.log('Install date set to storage: ' + msp_install_date);
            });         


            //Go to options page for firstrun
            page = optionsPage;

        } else {

            //Page will normally be what they have set in options
            page = pagesPath + msp_on_open;

            //If user is signed in and requires auto update check
            if(msp_userid && msp_auto_update == true) {
                //Check if sync required
                if(checkIfSyncRequired() == true) {
                    //Go to options page for auto sync
                    page = optionsPage;
                }
            }
        }
   
    });
        //Can probably take this out
    page = optionsPage;

    console.log("Page is " + page);

    var t = setTimeout(redirectPage, splashDuration);
    
});
    
function redirectPage() {
    
    console.log("Opening page, " + msp_install_date);
    console.log("About to try to open new window...");
    //Need to remove this
    //document.location.href = page;
    
    //Replaced with:
    chrome.app.window.create('pages/options/options.html',
    {
        bounds: {
            width: 1000, 
            height: 600
        }
    });
    
    //HIde this window
    //Hide window with a specific id
    chrome.app.window.get("launch").hide();
 
};