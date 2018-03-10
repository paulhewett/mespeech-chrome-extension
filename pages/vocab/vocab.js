document.addEventListener('DOMContentLoaded', function () {

    //console.log("Starting to run this");

    //alert(localStorage["msp_location_enabled"]);

    if (localStorage["msp_location_enabled"] == "true") {
        //If location is enabled in options

        if (navigator.geolocation) {
            //alert("Your Browser supports GeoLocation");
            navigator.geolocation.getCurrentPosition(initialLocation, errorHandler, { enableHighAccuracy: true });
            //test();
        }
        //console.log("location allowed and enabled");
    } else {
        console.log("Location not allowed.");
        initialise();
    }

    function initialLocation(position) {

        //Set global variables
        currentLatitude = position.coords.latitude;
        currentLongitude = position.coords.longitude;
        //console.log("Tracking your position --> Current Latitude : " + currentLatitude + " , Longitude : " + currentLongitude);

        //Initialise now after getting location data
        initialise();
    }

    function errorHandler(error) {
        alert("Error while retrieving current position. Error code: " + error.code + ",Message: " + error.message);
    }

    function stopLocationTracking() {
        if (watchID > 0) {
            navigator.geolocation.clearWatch(watchID);
            alert("Stopped Tracking Location");
        }
    }


    $(document).keyup(function (e) {
        //console.log("You pressed " + e.keyCode);
        //Detect keyup to take to options page
        if (e.keyCode == 79) {
            window.location.href = "/pages/options/options.html";
        }   // esc

        if (e.keyCode == localStorage['msp_switch_sw1Code']) {

            if (localStorage['msp_switch_quantity'] == 1) {
                //Single switch scan
                scanAdvance();
            } else {
                //Two switch scan
                scanBlocks();

            }
        }

        //Selected second switch on two switch scan
        if (e.keyCode == localStorage['msp_switch_sw2Code']) {
            //if (e.keyCode == 52) {
            scanSelectStage();
        }

    });

    function initialise() {

        //alert("Starting initialise function");

        //Check if there is a vocab set
        if (localStorage["msp_vocab"]) {

            //Get vocab uri
            vocabPath = localStorage["msp_vocab"];

            //Get the CSS for the vocab
            var themeuri;
            var vocaburi;

            if (localStorage["msp_userid"]) {
                vocaburi = "uservocabularies/" + localStorage["msp_userid"];
            } else {
                vocaburi = "uservocabularies/A";
            }



            //Parse the vocab xml
            parsedXML = $.parseXML(localStorage[vocaburi]);

            //Find the them id for current vocab
            $(parsedXML).find('vocabulary').each(function () {
                //console.log($(this).find('id').text());
                if ($(this).find('id').text() == localStorage["msp_vocab"]) {
                    themeuri = "themes/" + $(this).find('theme_id').text()
                }
            });

            //Set the style
            css = $(localStorage[themeuri]).find('css').html();

            //alert("Theme uri " + themeuri);

            //This is probably a cheat, but the only way I could get it to work!!
            css = css.replace("<!--[CDATA[", "").replace("]]-->", "");

            $("#userStyle").text(css);

            //Set up the page
            setPage();
        } else {
            //Load options page, which will prompt sync etc if required.

            //THIS COMMENTED OUT
            //window.location.href = "/pages/options/options.html";
        }

        //Determine how to scan
        switch (localStorage["msp_switch_type"]) {

            case "direct":
                //Switch access
                //alert("Direct delection")
                break;
            case "switch":
                //Use screen as a switch
                if (localStorage["msp_switch_quantity"] == 1) {
                    //alert("SIngle switch scan");
                    scanGrid();
                } else {
                    //alert("Two swich scan");
                    twoSwitchScan();
                }
                break;
            case "screen":
                //Direct selection
                if (localStorage["msp_switch_quantity"] == 1) {
                    //alert("SIngle screen switch scan");
                    scanGrid();
                } else {
                    //alert("Two screen switch scan");
                    twoSwitchScan();
                }

                //Detect screen click
                $(document).bind('click', function (e) {

                    getScreenSwitchClick(e.pageX, e.pageY);

                });

                break;
        }
    }
    /*
    //Determine switch scan type
    if (localStorage["msp_access_type"] != "direct") {
    alert("Scan grid");
    scanGrid();
    } else {
    alert("Two switch scan");
    twoSwitchScan();
    }

    //Set this depending on input type;
    //$('body').bind('click', bodyClick);
    $(document).bind('click', function (e) {

    getScreenSwitchClick(e.pageX, e.pageY);

    });
    */
});