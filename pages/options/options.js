var manifestName = "manifest.xml"
var defaultVoiceText = "Default System Voice";
var configurationFile = "xml/config.xml"
var rateDefault = 1;
var pitchDefault = 1;
var volumeDefault = 1;
var messageResetDefaults = "Defaults reset."
var statusMessageDuration = 2000;
var messageSave = "Saved...";
var messageReady = "Ready";
var messageSpeakingTest = "Speaking sample text.";
var msp_apikey = "asdqwe123";
var progStage = 0;
var progStart = 0;
var onOpenDefault = "options/options.html";  
var voiceNameDefault = "native";    
var voiceEnqueueDefault = "true"; 
var defaultVocab = "B";
var defaultSwitchType = "direct";
var defaultSwitchQuantity = 1;
var defaultSW1 = "A";
var defaultSW2 = "Z";
var defaultSW1Code = 65;
var defaultSW2Code = 90;
var defaultSwitchRepeats = 3;
var defaultSwitchIntervals = 0.7;
var defaultSwitchSpacing = 100;
var defaultLocationRange = 50;
var defaultLocationState = "true";
var defaultSwitchWarning = "Click 'Set this switch' then hit the switch or key you would like to assign to that switch.";
var manifestText = "";


var vocabularyManifest = "";
var layoutManifest = "";
var themeManifest = "";
var imageManifest = "";
var selectionSetManifest = "";
var vocabularyManifestUpdated = false;
var layoutManifestUpdated = false;
var themeManifestUpdated = false;
var imageManifestUpdated = false;
var selectionSetManifestUpdated = false;


//var msp_install_date;
var my_value;
var msp_install_date;
var msp_on_open;
var msp_user_id;
var msp_auto_update;
var msp_token;
var msp_voice_name;
var msp_voice_enqueue;
var msp_last_sync;


//If install date not set, ie first run, load splash page instead and set the install date
/* REINSTATE THIS

if (!localStorage["msp_install_date"]){
    document.location.href = "/pages/index/index.html";
}

*/

document.addEventListener('DOMContentLoaded', function () {

        
    //Hide sign in until it's required
    $("#signin-form").hide();    
    $("#switchWarning").hide();
    
    //Set Progress bar
    $(function () {
        $("#progressbar").progressbar({
            value: 0
        });
    });
    $("#progressbar").hide();    

    
    //Check for some values in local storage
    chrome.storage.local.get([
        'msp_on_open',
        'msp_user_id',
        'msp_last_sync',
        'msp_auto_update',
        'msp_install_date',
        'msp_vocab',
        'msp_token',
        'msp_voice_name',
        'msp_voice_enqueue',
        'msp_voice_pitch',
        'msp_voice_rate',
        'msp_voice_volume',
        'msp_location_enabled',
        'msp_location_range'], function (values) {
        
            msp_on_open = values.msp_on_open; 
            msp_user_id = values.msp_user_id; 
            msp_auto_update = values.msp_auto_update; 
            msp_install_date = values.msp_install_date; 
            msp_vocab = values.msp_vocab; 
            msp_token = values.msp_token;
            msp_voice_name = values.msp_voice_name;
            msp_last_sync = values.msp_last_sync;
        
            //Populate the available voices
            populateVoices();  
        
            //Populate User Vocabularies select    
            populateVocabularies();
        
            //Check if this is the first run
            if (msp_vocab == undefined) {
                console.log("Doing first run...");
                firstRun();
            } else {
                console.log("First run not required");
            }
                
            //Set auto update settings
            if (msp_auto_update == true) {
                update = true;
            } else {
                update = false;
            }
            document.getElementById("checkUpdate").checked = update;          

            //Display or hide sign in buttons
            if (msp_token && msp_user_id) {
                $("#sign-in").hide();
                $("#sign-out").show();
                $("#sync").show();
            } else {
                $("#sign-in").show();
                $("#sign-out").hide();
                $("#sync").hide();
            }

            //Set start page
            $("#onOpen").val(msp_on_open);        

            //Set speech and voice characteristics
            if (values.msp_voice_enqueue == "true") {
                enqueue = true;
            } else {
                enqueue = false;
            }
            document.getElementById("enqueue").checked = enqueue;
            document.getElementById("pitch").value = values.msp_voice_pitch;
            document.getElementById("pitchValue").innerText = values.msp_voice_pitch;
            document.getElementById("rate").value = values.msp_voice_rate;
            document.getElementById("rateValue").innerText = values.msp_voice_rate;
            document.getElementById("volume").value = values.msp_voice_volume;
            document.getElementById("volumeValue").innerText = values.msp_voice_volume;
        
            //Set location related controls
            if (values.msp_location_enabled == true) {
                locationEnabled = true;
            } else {
                locationEnabled = false;
            }
        
            console.log("Location enabled value is " + locationEnabled);
            document.getElementById("locationEnabled").checked = locationEnabled;
            document.getElementById("locationRange").value = values.msp_location_range;

        });

        console.log("DOwn to here");
    
        //Set ACCESS SETTINGS
        setAccessSettings()
        setAccessControls();
    
        //NEED TO TWEAK THIS

        //Only want to sync if the user has signed in
        //If signed in an not synchronised
        if (msp_user_id) {

            //alert("Signed in");
            if (!msp_last_sync) {
                //$("#progressbar").show();
                //alert("You need to do first time sync");
                sync();

            } else {
            //If auto updates allowed...
                if (msp_auto_update == "true") {
                //Check if sync required
                    if (checkIfSyncRequired() == true) {
                        //Run the sync
                        sync();
                    }
                }

            }
        }
    /*
     && 
        
        //**CHECK THIS***
        sync();

    } else {
        //If auto updates allowed...
        if (localStorage["msp_auto_update"] == "true") {
            //Check if sync required
            if (checkIfSyncRequired() == true) {
                //Run the sync
                sync();
            }
        }
    }
    */
    

    //Set Event Listeners

    //Vocabulary Options
    document.getElementById('userVocabs').addEventListener('change', getVocabDescription);
    document.getElementById('open').addEventListener('click', openVocab);
    document.getElementById('save').addEventListener('click', save_options);
    document.getElementById('sign-out').addEventListener('click', signOut);
    document.getElementById('sync').addEventListener('click', sync);  
    $("#sign-in").click(function () {
        //Not now...
        //document.location.href = "/pages/signin/signin.html";
        
        //..now do this:
        $("#signin-form").show();
        $("#holder").hide();
        
    });      

    //Speech Characteristics
    document.getElementById('rate').addEventListener('change', updateCurrentValue);
    document.getElementById('pitch').addEventListener('change', updateCurrentValue);
    document.getElementById('volume').addEventListener('change', updateCurrentValue);
    document.getElementById('resetDefaults').addEventListener('click', resetDefaults);

    //Access Settings
    document.getElementById('accessType').addEventListener('change', setAccessControls);
    document.getElementById('alignment').addEventListener('change', setAccessControls);
    document.getElementById('switchQuantity').addEventListener('change', setAccessControls);
    document.getElementById('screenSw1').addEventListener('change', flipScreenSwitches);
    document.getElementById('sample').addEventListener('click', testSettings);
    
    document.getElementById('authenticate').addEventListener('click', authUser);    

    $("#setSw1").click(function () {
        $("#sw").val("1");
        $("#switchWarning").text("Hit the switch or key you would like to assign to this switch.");
        //alert("Click OK and then click Switch 1.");
    });

    $("#setSw2").click(function () {
        $("#sw").val("2");
        $("#switchWarning").text("Hit the switch or key you would like to assign to this switch.");
        //alert("Click OK and then click Switch 2.");
    });


    //Get the key press when switch activated
    $("body").keyup(function (e) {
        if ($("#sw").val() == "1") {
            //alert("Switch 1 selected")
            $("#sw1").val(String.fromCharCode(e.keyCode));
            $("#sw1Code").val(e.keyCode);

            //Reset the hidden value to prevent contsant popups
            $("#sw").val("");
            $("#switchWarning").text(defaultSwitchWarning);            
            
        }
        if ($("#sw").val() == "2") {
            //alert("Switch 2 selected");
            $("#sw2").val(String.fromCharCode(e.keyCode));
            $("#sw2Code").val(e.keyCode);

            //Reset the hidden value to prevent contsant popups
            $("#sw").val("");
            $("#switchWarning").text(defaultSwitchWarning);           
        }
    });

    //$("#sw2").keyup(function (e) {
    //    $("#sw2Code").val(e.keyCode);
    //    alert("All done, clever you!");
    //});
});


function firstRun() {
    //Set some default values if this is first run.
    //Add some internationalisation settings here too to detect user's language
    //to do when internationalisation added.

    console.log("Doing first run...");

    //Load up the default vocabularies
    
    
    //Try a slightly different version
    setXML("/xml/default/vocabularies.xml");
    //defaultVocabA = new XMLSerializer().serializeToString(xmlDoc);
    
    //Selectionsets
    setXML("/xml/default/selectionsets/A.xml");
    //defaultSSA = new XMLSerializer().serializeToString(xmlDoc);
    
    setXML("/xml/default/selectionsets/B.xml");
    //defaultSSB = new XMLSerializer().serializeToString(xmlDoc);
    
    
    setXML("/xml/default/selectionsets/C.xml");
    //defaultSSC = new XMLSerializer().serializeToString(xmlDoc);
    
    //Layouts
    setXML("/xml/default/layouts/A.xml");
    //defaultLayoutA = new XMLSerializer().serializeToString(xmlDoc);
    //console.info(defaultLayoutA);
    
    setXML("/xml/default/layouts/B.xml");
    //defaultLayoutB = new XMLSerializer().serializeToString(xmlDoc);

    setXML("/xml/default/layouts/C.xml");
    //defaultLayoutC = new XMLSerializer().serializeToString(xmlDoc);

    //Themes
    setXML("/xml/default/themes/A.xml");
    //defaultThemeA = new XMLSerializer().serializeToString(xmlDoc);

    setXML("/xml/default/themes/B.xml");
    //defaultThemeB = new XMLSerializer().serializeToString(xmlDoc);

    //Items
    setXML("/xml/default/items/A.xml");
    //defaultItemsA = new XMLSerializer().serializeToString(xmlDoc);

    setXML("/xml/default/items/B.xml");
    //defaultItemsB = new XMLSerializer().serializeToString(xmlDoc);
    
    setXML("/xml/default/items/C.xml");
    //defaultItemsC = new XMLSerializer().serializeToString(xmlDoc);
    
    setXML("/xml/default/items/D.xml");
    //defaultItemsD = new XMLSerializer().serializeToString(xmlDoc);
    
    setXML("/xml/default/items/E.xml");
    //defaultItemsE = new XMLSerializer().serializeToString(xmlDoc);
    
    
        
    console.log("About to save some more values to storage");
    
    chrome.storage.local.set({
            'msp_on_open': onOpenDefault,
            'msp_voice_name' : voiceNameDefault,
            'msp_voice_rate' : rateDefault,
            'msp_voice_pitch' : pitchDefault,
            'msp_voice_volume' : volumeDefault,
            'msp_voice_enqueue' : voiceEnqueueDefault,
            'msp_vocab' : defaultVocab,
            'msp_switch_type' : defaultSwitchType,
            'msp_switch_quantity' : defaultSwitchQuantity,
            'msp_switch_sw1' : defaultSW1,
            'msp_switch_sw2' : defaultSW2,
            'msp_switch_sw1Code' : defaultSW1Code,
            'msp_switch_sw2Code' : defaultSW2Code,
            'msp_switch_repeats' : defaultSwitchRepeats,
            'msp_switch_interval' : defaultSwitchIntervals,
            'msp_switch_spacing' : defaultSwitchSpacing,
            'msp_location_range' : defaultLocationRange,
            'msp_location_enabled' : defaultLocationState
        }, function() {
            // Notify that we saved.
            //var msp_install_date = value.msp_install_date;
            console.log('Items saved to storage');
        });  


    

 /*   
    console.log("ABOUT TO TRY TO GET");
    var key = "/xml/default/selectionsets/C.xml";
    //var value = "<xml>Some xml in here</xml>";
    //var nameThree = "carl";
    //var nameFour = "dan";

    var obj = {};

    //obj[key] = value;

    //chrome.storage.local.set(obj);

    chrome.storage.local.get(obj[key], function(result)
         {
            console.log("JUst tried getting the result with " + result[key]);

    });
 */   
    
    
}

///////////////////////////////////////////
//HERE - DO THIS BIT
///////////////////////////////////////////

function setXML(path) {
    
    var xhr = new XMLHttpRequest();
    
    xhr.open("GET", path, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {        
                //Got the xml, now set to storage

                var obj = {};

                obj[path] = xhr.responseText;

                chrome.storage.local.set(obj);

            } else {
                console.error(xhr.statusText);
            }
        } else {
            console.log("Redy state is " + xhr.readyState);   
        }
    };
    xhr.onerror = function (e) {
    console.error(xhr.statusText);
    };

    xhr.send(null);    

}

function getXML(path) {
   

    var xmlOutput = "blah";
    //Get xml and return to calling function
    
   /* 
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", path, true);
    xmlhttp.send();
    
//    console.log ("Got for path " + path + ": " + xmlhttp.responseXML);
    console.log ("Got for path " + path + ": " + xmlhttp.responseXML);
    

    
    return xmlhttp.responseXML;


    
  
    console.log("STarting to get");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", path, true);
    xhr.onload = function (e) {
        console.log("LOaded xhr..." + xhr.readyState);
        if (xhr.readyState === 4) {
            console.log("Ready state is 4");
            console.log("status is " + xhr.status);
            if (xhr.status === 200) {
                console.log("Response Type " + xhr.responseType);
                console.log("Response Text " + xhr.responseText);
                console.log("Response " + xhr.response);
                console.log("Response XML " + xhr.responseXML);
                xmlOutput = xhr.responseXML;
                //console.log(xhr.responseText);
            } else {
                console.error(xhr.statusText);
            }
        } else {
            console.log("Redy state is " + xhr.readyState);   
        }
    };
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.send(null);    
      
    console.log("at botto, got " + xmlOutput);
    return xmlOutput;
*/    
    
}

/*
function authUser() {

    console.log("Starting auth user...");

    xmlToSubmit = "<user>";
    xmlToSubmit += "<username>" + document.getElementById('username').value + "</username>";
    xmlToSubmit += "<password>" + document.getElementById('password').value + "</password>";
    xmlToSubmit += "</user>";

    console.log("About to auth user with " + xmlToSubmit);

    $.ajax({
        cache: false,
        crossDomain: true,
        async: false,
        headers: {
            'apikey': 'asdqwe123',
        },
        url: 'https://mespee.ch/api/auth/',
        type: 'POST',
        data: {
            data: xmlToSubmit
        },
        success: function(xml) {
            //Retrieve user token
            var token = $(xml).find('token').text(); // Store token for subsequent requests
            var user = $(xml).find('id').text(); // Store token for subsequent requests

            //Store user token and userid
            localStorage["msp_token"] = token;
            localStorage["msp_userid"] = $(xml).find('id').text();

            //console.log("Signed in");

            //Do a first run to set some other values
            //firstRun();

            /*
            var q = 'uservocabularies/' + localStorage["msp_userid"];
            //TEST REQUEST
            console.log("About to do the test");
            $.ajax({

                //crossDomain: true,
                async: false,
                type: "GET",
                headers: {
                    'apikey': 'asdqwe123',
                    'token': localStorage["msp_token"]
                },
                url: "http://mespee.ch/api/" + q,
                success: function (xml) {

                   console.log("Done the test");
                },
                error: function (xhr) {
                    xml = xhr.responseXML; // complete XmlHttpRequest object returned
                    console.log("Error doing the test");
                }
            });


            alert("Successfully signed in");
            sync();
            //redirectPage("/pages/options/options.html");

        },
        error: function(xhr) {
            console.log("THere was an error");
            xml = xhr.responseXML;
            $(xml).find('error').each(function() {
                alert("Your username or password were incorrect, please try again.")
            });
        }
    });
}
*/

function authUser() {

    console.log("Starting auth user...");

    xmlToSubmit = "<user>";
    xmlToSubmit += "<username>" + document.getElementById('username').value + "</username>";
    xmlToSubmit += "<password>" + document.getElementById('password').value + "</password>";
    xmlToSubmit += "</user>";

    console.log("About to auth user with " + xmlToSubmit);

    $.ajax({
        //cache: false,
        //crossDomain: true,
        //async: false,
        headers: {
            'apikey': 'asdqwe123'
        },
        url: 'https://mespee.ch/api/auth',
        type: 'POST',
        data: {
            data: xmlToSubmit
        },
        success: function (xml) {
            //Retrieve user token
            var token = $(xml).find('token').text(); // Store token for subsequent requests
            var user = $(xml).find('id').text(); // Store token for subsequent requests

            console.log("Token is " + token + " for user " + user);

            //Set some values in local storage
            chrome.storage.local.set({
                    'msp_token': token,
                    'msp_user_id' : user
                }, function() {
                    // Notify that we saved.
                    //var msp_install_date = value.msp_install_date;
                    console.log('Items saved to storage');
                
                    switch ($(xml).find('default_symbolset').text()) {

                        case "1":
                            preferredSs = "ss";
                            break;
                        case "2":
                            preferredSs = "wi"
                            break;
                        case "3":
                            preferredSs = "me"
                            break;
                        case "4":
                            preferredSs = "mu"
                            break;

                    }

                    console.log("Signed in");
                    //..now do this:
                    $("#signin-form").hide();
                    $("#holder").show();
                
                });  
        },
        error: function (xhr) {
            console.log("There was an error");
            xml = xhr.responseXML;
            $(xml).find('error').each(function () {
                console.log("Your username or password were incorrect, please try again.")
            });
        }
    });
}

apiRequest = function (uri, manifest, element, completion) {

    //completion indicates if it is the last cycle.
    
    
    //Make some requests to get vocabulary data
    api_url = "https://mespee.ch/api/" + uri;

   
    
        //Check for some values in local storage
    chrome.storage.local.get([
        'msp_token'
        ], function (value) {

            //console.log("Got some stuff here. Token is " + value.msp_token);
            //console.log("API key is " + msp_apikey);
            ///console.log("URL is " + api_url);
            
            
        
            $.ajax({

            async: true,
            //cache: false,
            headers: {
                'apikey': msp_apikey,
                'token': value.msp_token
            },
            url: api_url,
            success: function (xml) {
    
                //var manifestText = value.manifestValue;
                //var imageManifestText = value.imageManifest;
                //var layoutManifestText = value.layoutManifest;
                //var themeManifestText = value.themeManifest;

                $(xml).find(element).each(function () {
                            
                    //console.log("FOund some stuff");
                    manifestText += $(this).find('id').text() + ";";

                    //Make a special case for items, to also get representation and add to image manifest
                    //Only add the image to the manifest if a value is present
                    if (element=="item" && $(this).find('representation').text() != "none")
                    {
                        imageManifest += $(this).find('representation').text() + ";";
                    }

                    //Get the layout_id's for Layout Manifest
                    if (element=="selectionset")
                    {
                        //Need to avoid putting duplicates in, but requires delimiting character too
                        layoutManifest += $(this).find('layout_id').text() + ";";
                    }

                    //Get the theme_id's for Theme Manifest
                    if (element=="vocabulary")
                    {
                        themeManifest += $(this).find('theme_id').text() + ";";
                        //console.log($(this).find('representation').text());
                    }

                });

                console.log("Manifest text for " + manifest + " is " + manifestText);
                
                    //Set some values    
                 chrome.storage.local.set({
                    manifest: manifestText,
                    'imageManifest' : imageManifest,
                    'layoutManifest' : layoutManifest,
                    'themeManifest' : themeManifest,
                    uri : new XMLSerializer().serializeToString(xml),
                    'msp_voice_enqueue' : voiceEnqueueDefault,
                    'msp_vocab' : defaultVocab,
                    'msp_switch_type' : defaultSwitchType,
                    'msp_switch_quantity' : defaultSwitchQuantity,
                    'msp_switch_sw1' : defaultSW1,
                    'msp_switch_sw2' : defaultSW2,
                    'msp_switch_sw1Code' : defaultSW1Code,
                    'msp_switch_sw2Code' : defaultSW2Code,
                    'msp_switch_repeats' : defaultSwitchRepeats,
                    'msp_switch_interval' : defaultSwitchIntervals,
                    'msp_switch_spacing' : defaultSwitchSpacing,
                    'msp_location_range' : defaultLocationRange,
                    'msp_location_enabled' : defaultLocationState
                }, function() {
                    // Notify that we saved.
                    //var msp_install_date = value.msp_install_date;
                    console.log('Items saved to storage');
                    document.getElementById("status").innerHTML = uri;
                });        
                
                //localStorage[manifest] = manifestText;
                //localStorage["imageManifest"] = imageManifestText;
                //localStorage["layoutManifest"] = layoutManifestText;
                //localStorage["themeManifest"] = themeManifestText;

                //Storing this in local storage at the moment, but worried quota will be exceeded.            
                //localStorage[uri] = new XMLSerializer().serializeToString(xml);



            },
            error: function (xhr) {
                console.log("Looks like there's been an error");
                xml = xhr.responseXML; // complete XmlHttpRequest object returned
                var e = "";
                $(xml).find('error').each(function () {
                    e += $(this).find('message').text() + ". ";
                    console.log($(this).find('message').text()); // log errors in console
                });
            }
        });    
    });
};

function checkIfData(){
    
    if(localStorage["layoutManifest"] == ""){
        var r=confirm("You need to link at least one Vocabulary to this user. Would you like to do that now?");
        
        if (r==true) {
            window.open("https://mespee.ch/manage-and-design/users", "_blank");
        } else {

        }
    }
}

function flipScreenSwitches(){
    
    //Horizontal orientation
    if ($("#screenSw1").val() == "r"){
        
        $("#screenSw2").empty();
        $("#screenSw2").append('<option value="l" selected="selected">Left</option>');

    }

    if ($("#screenSw1").val() == "l"){
        
        $("#screenSw2").empty();
        $("#screenSw2").append('<option value="r" selected="selected">Right</option>');

    }

    //Vertical orientation
    if ($("#screenSw1").val() == "b"){
        
        $("#screenSw2").empty();
        $("#screenSw2").append('<option value="t" selected="selected">Top</option>');
        $("#screenSw2").append('<option value="n">None</option>');

    }

    if ($("#screenSw1").val() == "t"){
        
        $("#screenSw2").empty();
        $("#screenSw2").append('<option value="b" selected="selected">Bottom</option>');
        $("#screenSw2").append('<option value="n">None</option>');

    }

    console.log($("#screenSw1").val());
    console.log($("#screenSw2").val());
    
}

function getVocabDescription() {

    //Get user's ID
    chrome.storage.local.get('msp_user_id', function (value) {
        currentUser = value.msp_user_id; 
        
        if(value.msp_user_id){
            //the user's vocabulary
            vocaburi = "uservocabularies/" + currentUser;
        } else {
            //use a default vocabulary
            vocaburi = "/xml/default/vocabularies.xml";
        }
            
    });
    
    var obj = {};


    chrome.storage.local.get(obj[vocaburi], function(result)
         {
        
            //Data stored as text so we need to parse it to XML
            var parser = new DOMParser();
            xml = parser.parseFromString(result[vocaburi], "text/xml");

            $(xml).find("vocabulary").each(function () {
                if($(this).find('id').text()==$('#userVocabs option:selected').val()){
                    document.getElementById("description").innerText = $(this).find('description').text(); 
                }           
                
            });  

    });

}

//Not sure if this is needed now? Delete?
function getVocabList() {
    //Populate the vocab drop down box
    vocabLocation = document.getElementById("location").value + manifestName;
    populateVocabularies(vocabLocation, "")
}


function hideProgressBar(){

    $("#progressbar").fadeOut("slow");

    $( "#progressbar" ).progressbar({
	    value: 100
    });    
    progStage = 0;
    progStart = 0;
    document.getElementById("status").innerHTML = "Ready";
}

function openVocab() {

    save_options();

    //Construct vocab uri
    vocaburi = "selectionsets/?vocabulary_id=" + document.getElementById("userVocabs").value;
    
    //Get the xml from local storage and parse it 
    selectionSetListxml = localStorage[vocaburi];
    var parser=new DOMParser();
    xml=parser.parseFromString(selectionSetListxml,"text/xml");

    //Get the Home selection set. Vocab must have ss called Home.
    $(xml).find("selectionset").each(function () {
            console.log($(this).find('name').text());
            if ($(this).find('name').text()=="Home"){
                console.log("ID of home is " + $(this).find('id').text());
                localStorage["msp_currentSS"] = $(this).find('id').text();
            }
    });

    //Open page to display the vocab
    document.location.href = "/pages/vocab/vocab.html";
}

//DELETE??
function populateLocations(selectedItem) {
    //Get location list xml manifest
    xmlDoc = getXML(configurationFile);
    x = xmlDoc.getElementsByTagName('location');
    //Current location
    var locationList = document.getElementById('location');
    //Add an option to location drop down box
    for (i = 0; i < x.length; i++) {
        xx = x[i].getElementsByTagName("path");
        yy = x[i].getElementsByTagName("description");
        var anOption = document.createElement("option");
        //Select the specified option
        if (xx[0].firstChild.nodeValue == selectedItem) {
            anOption.selected = "selected";
        }
        anOption.innerText = yy[0].firstChild.nodeValue;
        anOption.value = xx[0].firstChild.nodeValue;
        locationList.options.add(anOption);
    }
}

function populateVocabularies(manifestPath, selectedItem) {
   
    var vocabListXml;
    
    console.log("Populating vocabs...");
    
    chrome.storage.local.get('msp_user_id', function (value) {
        currentUser = value.msp_user_id; 
        console.log("Current user is " + currentUser);
    
    });
    
    
    
    //                    'msp_token': token,
    //                'msp_userid' : $(xml).find('id').text()
    
    
    //console.log("User ID from variab;e is " + msp_user_id);
                
    /*REINSTATE THIS
    
    //If user not signed in, load some basic predefined vocabs
    if (!localStorage["msp_userid"]) {
*/
        //alert("You just want to use free ones.");
        vocaburi = "/xml/default/vocabularies.xml";
/*
    } else {


        vocaburi = "uservocabularies/" + localStorage["msp_userid"];
*/
  //  }

    //alert("Vocab uri is " + vocaburi);

    //Load the downloaded vocabs
    //Will need to add this in again
    //checkIfData();

    //Clear drop down
    $("#userVocabs").empty();

    var obj = {};

    chrome.storage.local.get(obj[vocaburi], function(result)
        {
            var parser = new DOMParser();
            xml = parser.parseFromString(result[vocaburi], "text/xml");

            $(xml).find("vocabulary").each(function () {
                $("#userVocabs").append('<option value=' + $(this).find('id').text() + '>' + $(this).find('name').text() + '</option>');
                document.getElementById("description").innerText = $(this).find('description').text();
            });

            //Get the description of the selected option
            getVocabDescription() 
        });
}

function populateVoices(){
    
    //Get available voices and populate select box
    chrome.tts.getVoices(function (voices) {
        
        //voiceArray = va;
        var language;
        for (var i = 0; i < voices.length; i++) {
            
            if (voices[i].lang) {
                language = " (" + voices[i].lang + ")";
            } else {
                language = "";
            }
            
            if (voices[i].voiceName == "native") {
                voiceText = defaultVoiceText;
            } else {
                voiceText = voices[i].voiceName;
            }
            
            
            text = "text";
            val = "value";
            
            $('#voiceName').append( new Option(voiceText,voices[i].voiceName) );
            
            if (voices[i].voiceName == msp_voice_name) {
                console.log("THis is one I want to select " + voices[i].voiceName);
                $('#voiceName').val( voices[i].voiceName )
            }
            
        }
    });
}

function resetDefaults() {
    //Set defaults for controls
    document.getElementById("rate").value = rateDefault;
    document.getElementById("pitch").value = pitchDefault;
    document.getElementById("volume").value = volumeDefault;
    document.getElementById("rateValue").innerText = rateDefault;
    document.getElementById("pitchValue").innerText = pitchDefault;
    document.getElementById("volumeValue").innerText = volumeDefault;
    statusMessage(messageResetDefaults, statusMessageDuration);
}

function roundNumber(number) {
    //Rounds to one decimal place
    var newnumber = new Number(number + '').toFixed(parseInt(1));
    return parseFloat(newnumber); // Output the result to the form field (change for your purposes)
}

function save_options() {

    //Save some values
    //Test set some values and set variable
    chrome.storage.local.set({
        'msp_on_open': $("#voiceName :selected").val(),
        'msp_voice_name' : $("#voiceName :selected").val(),
        'msp_voice_rate' : roundNumber(document.getElementById("rate").value),
        'msp_voice_pitch' : roundNumber(document.getElementById("pitch").value),
        'msp_voice_enqueue' : document.getElementById("enqueue").checked,
        'msp_auto_update' : document.getElementById("checkUpdate").checked,
        'msp_voice_volume' : roundNumber(document.getElementById("volume").value),
        'msp_vocab' : document.getElementById("userVocabs").value,
        'msp_switch_type' : $("#accessType :selected").val(),
        'msp_switch_quantity' : $("#switchQuantity :selected").val(),
        'msp_switch_sw1' : $("#sw1").val(),
        'msp_switch_sw2' : $("#sw2").val(),
        'msp_switch_sw1Code' : $("#sw1Code").val(),
        'msp_switch_sw2Code' : $("#sw2Code").val(),
        'msp_switch_repeats' : $("#repeats").val(),
        'msp_switch_interval' : $("#interval").val(),
        'msp_switch_alignment' : $("#alignment :selected").val(),
        'msp_switch_screenSw1' : $("#screenSw1 :selected").val(),
        'msp_switch_screenSw2' : $("#screenSw2 :selected").val(),
        'msp_switch_spacing' : $("#spacing").val(),
        'msp_location_range' : $("#locationRange").val(),
        'msp_location_enabled' : document.getElementById("locationEnabled").checked
        
    }, function() {

      console.log('Looks like all the values have been saved to storage! Great! Rate is ' + roundNumber(document.getElementById("rate").value));

    }); 

    statusMessage(messageSave, statusMessageDuration)
}

function saveWebImage(url,stage,stages){
    
    
    //Modify to take account of dropbox
    //Need to improve this.
    //https://mespee.ch/images/symbols/250https:
    url = url.replace("https://mespee.ch/images/symbols/250https:", "https:");
    console.log("URL IS " + url);

    //Save the image as a blob in local storage    
    stage = stage + 1;

    var xhr = new XMLHttpRequest(),
    fileReader = new FileReader();
    
    xhr.open("GET", url, true);
    // Set the responseType to arraybuffer. "blob" is an option too, rendering BlobBuilder unnecessary, but the support for "blob" is not widespread enough yet
    xhr.responseType = "blob";

    xhr.addEventListener("load", function () {
        if (xhr.status === 200) {
            // onload needed since Google Chrome doesn't support addEventListener for FileReader
            fileReader.onload = function (evt) {
                // Read out file contents as a Data URL
                var result = evt.target.result;

                try {

                    var db = window.openDatabase(
                        'mespeech',           // dbName
                        '',            // version
                        'mespeech',  // description
                        20 * 1024 * 1024,  // estimatedSize in bytes
                        function(db) {}   // optional creationCallback
                    );

                    db.transaction(function(tx) {
                    
                        //Create the table
                        tx.executeSql('CREATE TABLE IF NOT EXISTS images(id INTEGER PRIMARY KEY ASC, path TEXT, image_blob TEXT, added_on DATETIME)');
                        
                        //Check if the image already exists
                        db.transaction(function(tx) {
                        tx.executeSql('SELECT * FROM images WHERE path = "' + url + '"', [], function (tx, results) {
                            
                            var len = results.rows.length, i;
                            
                            if(len==0){
                                //Add the image to the table
                                tx.executeSql('INSERT INTO images(path, image_blob, added_on) VALUES (?,?,?)', [url, result, new Date()]);
                                console.log(url + " added.");
                            } else {
                                console.log(url + " already exists.");
                            }

                            //console.log("Progtart " + progStart);
                                                           
                            availStages = 100 - progStart;

                            stageIncrement = (availStages/stages);
                                
                            progStage = progStage + stageIncrement
                                

                            $( "#progressbar" ).progressbar({
		                        value: progStage
		                    });
                            //document.getElementById("status").innerHTML = "Processing images...";
                            
                            console.log("Stage " + stage + " of " + stages);
                            if (stage==stages){   
                                $( "#progressbar" ).progressbar({
		                            value: 100
		                        });
                                progStage=0;
                                populateVocabularies();
                                hideProgressBar();
                                document.getElementById("status").innerHTML = "Ready";
                                alert("Synchronisation complete.");
                            } 
                            });
                        });
                    });
                }
                catch (e) {
                    console.log("Storage failed: " + e);
                }
            };
            // Load blob as Data URL
            fileReader.readAsDataURL(xhr.response);
        }
    }, false);
    // Send XHR
    xhr.send();
}

function setAccessControls(){

    //alert($("#accessType").val());


    //Retrieve some values
    chrome.storage.local.get([
        'msp_switch_screenSw1',
        'msp_switch_screenSw2'
    ], function (value) {
    
    
    
        //Set access type select box
        switch($("#accessType").val()) {

            case "switch":
                //Switch access
                $(".screen-sw2").hide();        //Always hide
                $(".sw1").show();               //Always show
                $("#switchWarning").show();
                
                $(".switchQuantity").show();

                if ($("#switchQuantity").val() == 1){
                    //$(".sw1").show();
                    $(".sw2").hide();
                    $(".repeats").show();
                    $(".interval").show();
                } else {
                    //$(".sw1").hide();
                    $(".sw2").show();
                    $(".repeats").hide();
                    $(".interval").hide();
                }

                break;
            case "screen":
                //Use screen as a switch
                $(".screen-sw2").show();
                $("#switchWarning").hide();                
                $(".sw1").hide();
                $(".sw2").hide();
                $(".switchQuantity").show();

                if ($("#switchQuantity").val() == 1){
                    $(".screen-sw2").hide();
                } else {
                    $(".screen-sw2").show();
                }

                break;
            case "direct":
                $("#switchWarning").hide();
                //Direct selection
                $(".sw1").hide();
                $(".sw1").hide();
                $(".sw2").hide();
                $(".switchQuantity").hide();
                $(".screen-sw2").hide();
                break;
        }

        //Set access type select box
        switch($("#alignment").val()) {

            case "h":
                //Switch access
                $("#screenSw1").empty();
                $("#screenSw2").empty();
                $("#screenSw1").append('<option value="l">Left</option>');
                $("#screenSw1").append('<option value="r">Right</option>');
                $("#screenSw2").append('<option value="r">Right</option>');

                //If there's a value saved, use it
                if (value.msp_switch_screenSw1) {
                    $("#screenSw1").val(value.msp_switch_screenSw1);
                } else {
                    $("#screenSw1").val("l");
                }

                if (value.msp_switch_screenSw2) {
                    $("#screenSw2").val(value.msp_switch_screenSw2);
                } else {
                    $("#screenSw2").val("r");
                }

                break;

            case "v":
                //Use screen as a switch
                $("#screenSw1").empty();
                $("#screenSw2").empty();
                $("#screenSw1").append('<option value="t">Top</option>');
                $("#screenSw1").append('<option value="b">Bottom</option>');
                $("#screenSw2").append('<option value="b">Bottom</option>');

                //If there's a value saved, use it
                //If there's a value saved, use it
                if (value.msp_switch_screenSw1) {
                    $("#screenSw1").val(value.msp_switch_screenSw1);
                } else {
                    $("#screenSw1").val("t");
                }

                if (value.msp_switch_screenSw2) {
                    $("#screenSw2").val(value.msp_switch_screenSw2);
                } else {
                    $("#screenSw2").val("b");
                }

                break;
        }
    });
}

function setAccessSettings(){
    
    chrome.storage.local.get([
        'msp_switch_type',
        'msp_switch_quantity',
        'msp_switch_sw1', 
        'msp_switch_sw2',
        'msp_switch_sw1Code',
        'msp_switch_sw2Code',
        'msp_switch_repeats',
        'msp_switch_interval',
        'msp_switch_alignment',
        'msp_switch_screenSw1',
        'msp_switch_screenSw2',
        'msp_switch_spacing'], function (values) {   
            msp_on_open = values.msp_on_open; 
            msp_user_id = values.msp_user_id; 
            msp_auto_update = values.msp_auto_update; 
            msp_install_date = values.msp_install_date; 
            msp_vocab = values.msp_vocab; 
            msp_token = values.msp_token;
            msp_voice_name = values.msp_voice_name;

            //Get the saved values for access
            $("#accessType").val(values.msp_switch_type);
            $("#switchQuantity").val(values.msp_switch_quantity);
            $("#sw1").val(values.msp_switch_sw1);
            $("#sw2").val(values.msp_switch_sw2);
            $("#sw1Code").val(values.msp_switch_sw1Code);
            $("#sw2Code").val(values.msp_switch_sw2Code);
            $("#repeats").val(values.msp_switch_repeats);
            $("#interval").val(values.msp_switch_interval);
            $("#alignment").val(values.msp_switch_alignment);
            $("#screenSw1").val(values.msp_switch_screenSw1);
            $("#screenSw2").val(values.msp_switch_screenSw2);
        });
}

function signOut() {

    console.log("Doing signout");
    
    var db = window.openDatabase(
        'mespeech',           // dbName
        '',            // version
        'mespeech',  // description
        2 * 1024 * 1024,  // estimatedSize in bytes
        function(db) {}   // optional creationCallback
    );

    db.transaction(function(tx) {
        tx.executeSql('DROP TABLE api', []);
        tx.executeSql('DROP TABLE images', []);
    });

    //Keep install date,e but delete all other values
    var installDate = localStorage['msp_install_date'];

    localStorage.clear();

    localStorage["msp_install_date"] = installDate;

    //window.location.href = "/pages/signin/signin.html";
    //alert("Successfully signed out");

    statusMessage("Successfully signed out.", 5000);
    $("#sign-in").show();
    $("#sign-out").hide();
    $("#sync").hide();
    
    //alert("About to do first run");
    
    //Do a first run to set up basic free vocabs
    firstRun();

    //Re-populate the vocabulary list
    populateVocabularies();
}

function status(message) {
    document.getElementById("status").innerHTML = message;
}

function statusMessage(message, time) {
    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = message;
    setTimeout(function () {
        status.innerHTML = messageReady;
    }, time);
}

function sync() {

    //Retrieve some values
    chrome.storage.local.get([
            'msp_last_sync',
            'imageManifest'
        ], function (value) {   
    
        console.log("Entering Sync");

        if (value.msp_last_sync){
            message = "Welcome! You need to download your vocabularies. Synchronisation about to start...";
        } else {
            message = "Synchronisation about to start, it'll only take a tick...";
        }

        $("#progressbar").show();

        progStage = progStage + 1
        $(function() {
            $( "#progressbar" ).progressbar({
                value: progStage
            });
        });

        document.getElementById('status').innerHTML = 'Synchronising selection sets...';

        //alert(message); 

        //The chunk below follows this post:
        //http://stackoverflow.com/questions/7342084/jquery-javascript-how-to-wait-for-manipulated-dom-to-update-before-proceeding
        //Looks a bit messy, but works for now

        setTimeout(function(){
            start = new Date();
             end = syncVocabularies();
             do {start = new Date();} while (end-start > 0);

                $(function() {
                    progStage = progStage + 1;
                    $( "#progressbar" ).progressbar({
                        value: progStage
                    });
                });

                document.getElementById('status').innerHTML = 'Synchronising images...'; 

                //If no images to download, change progress bar and delete it.
                if(value.imageManifest){

                    //REMOVED 5/4/2013
                    hideProgressBar();
                    checkIfData();
                    document.getElementById('status').innerHTML = 'Ready'; 
                }

            },10);

        populateVocabularies();

        var d = new Date();
        
        //Set some values
        chrome.storage.local.set({
            }, function() {
                // Notify that we saved.
                //var msp_install_date = value.msp_install_date;
                console.log('Updated sync last sync');
            }); 
        
        
        //UPDATE THIS
        //localStorage["msp_last_sync"] = d.toUTCString();
    });
}

function syncImages(){

    console.log("Syncing images...");
    
    var imgSyncPath = "https://mespee.ch/images/symbols/250";
    var i = localStorage["imageManifest"].split(";");
    var trimmedPath;

    //alert("Image manifest" + localStorage["imageManifest"])

    for (k=0; k<i.length-1; k++)
    {     
        str = i[k];
        //Trim full path if it's there - some have, some don't
        trimmedPath = str.replace(imgSyncPath,"");
        trimmedPath = str.replace("images/symbols/150/","");
        
        syncImgPath = imgSyncPath + trimmedPath
        //console.log("Current image " + trimmedPath)        ;
        //if(trimmedPath != "none"){
            saveWebImage(syncImgPath, k+1, i.length-1);
        //}
    }
}

function syncVocabularies() {

    
    vocabularyManifestUpdated = false;
    layoutManifestUpdated = false;
    themeManifestUpdated = false;
    imageManifestUpdated = false;
    selectionSetManifestUpdated = false;
    
    
    //Retrieve some values
    chrome.storage.local.get([
            'msp_token',
            'msp_user_id',
        ], function (value) { 
        
            //Load the vocabulary data
            if (value.msp_token && value.msp_user_id) {
                
                //console.log("Need to run the sync now");
                var q = 'uservocabularies/' + value.msp_user_id;
                buildVocabularyManifest(q);
                
/*                
                
                
                    //Get the vocabularies
                    $(function() {
                        $( "#progressbar" ).progressbar({
                            value: 10
                        });
                    });

                    var q = 'uservocabularies/' + value.msp_user_id;

                    console.log("Sending request at line 845 " + q);
                    apiRequest(q, "vocabularyManifest", "vocabulary", true);

                    //Get the selectionsets for the vocabularies
                    var str = vocabularyManifest;
                    
                    console.log("VALUE IS " + str);
                    
                    var n = str.split(";");
                    for (i=0; i<n.length-1; i++)
                    {
                        document.getElementById("status").innerHTML = "Getting " + k + " of " + (n.length - 1) + " vocabularies.";
                        apiRequest('selectionsets/?vocabulary_id=' + n[i],"selectionSetManifest","selectionset");
                        var k = i + 1;
                    }

                    //Get the layouts
                    var str = layoutManifest;
                    var n = str.split(";");
                    for (i = 0; i < n.length - 1; i++)
                    {
                        apiRequest('layouts/' + n[i],"layoutManifest","layout");
                        var k = i + 1;
                        document.getElementById("status").innerHTML = "Getting " + k + " of " + (n.length - 1) + " layouts.";
                    }

                    //Get the themes
                    var str=themeManifest;
                    var n=str.split(";");
                    for (i=0; i<n.length-1; i++)
                    {
                        apiRequest('themes/' + n[i],"themeManifest","theme");
                        var k = i + 1;
                        console.log("Getting " + k + " of " + (n.length - 1) + " themes.")
                    }

                    //Get the items for the selectionsets
                    var str = selectionSetManifest;
                    var n=str.split(";");
                    for (i=0; i<n.length-1; i++)
                    {
                        apiRequest('items/?selectionset_id=' + n[i],"itemManifest", "item");
                        var k = i + 1;
                        console.log("Getting " + k + " of " + (n.length - 1) + " selection sets.")
                    }
                    
                */  
                
                } else {
                    alert("You need to authenticate user")
                }

                //Synchronize images using the manifest file
                if(value.imageManifest){
                    syncImages();
                }



    });
 
}


buildVocabularyManifest = function (uri) {

    themeManifest = "";
    vocabularyManifest = "";
    console.log("Building vocabulary manifest");
        
        
    console.log("URI is " + uri);    
    //apiRequest(q, "vocabularyManifest", "vocabulary", true);    
    //completion indicates if it is the last cycle.
        
    //Make some requests to get vocabulary data
    api_url = "https://mespee.ch/api/" + uri;

    //Check for some values in local storage
    chrome.storage.local.get([
        'msp_token'
        ], function (value) {    
        
            $.ajax({

            async: true,
            //cache: false,
            headers: {
                'apikey': msp_apikey,
                'token': value.msp_token
            },
            url: api_url,
            success: function (xml) {
    
                $(xml).find("vocabulary").each(function () {
                    vocabularyManifest += $(this).find('id').text() + ";";                            
                    themeManifest += $(this).find('theme_id').text() + ";";

                });

                console.log("Theme manifest is: " + themeManifest);
                console.log("Vocabulary manifest is: " + vocabularyManifest);
                    //Set some values    
                chrome.storage.local.set({
                    uri : new XMLSerializer().serializeToString(xml),
                }, function() {
                    
                    var complete = false;
                    console.log('Vocabulary XML saved to storage');
                    //NOw want to run the next stage: 
                    
                    
                    var str = vocabularyManifest;
                    var n = str.split(";");
                    for (i=0; i<n.length-1; i++) {
                     
                        if (i+2== n.length){
                                complete = true;
                                //console.log("THis is the last cycle");
                        }                        
                        buildSelectionSetManifest('selectionsets/?vocabulary_id=' + n[i],complete);
                    }
                });        
            },
            error: function (xhr) {
                console.log("Looks like there's been an error");
            }
        });    
    });
};        

buildSelectionSetManifest = function (uri,complete) {

    selectionSetManifest = "";
    layoutManifest = "";
    console.log("Building selection set manifest for " + uri);
        
    //apiRequest(q, "vocabularyManifest", "vocabulary", true);    
    //completion indicates if it is the last cycle.
        
    //Make some requests to get vocabulary data
    api_url = "https://mespee.ch/api/" + uri;

    //Check for some values in local storage
    chrome.storage.local.get([
        'msp_token'
        ], function (value) {    
        
            $.ajax({

            async: true,
            //cache: false,
            headers: {
                'apikey': msp_apikey,
                'token': value.msp_token
            },
            url: api_url,
            success: function (xml) {
    
                $(xml).find("selectionset").each(function () {
                    
                    selectionSetManifest += $(this).find('id').text() + ";";
                    layoutManifest += $(this).find('layout_id').text() + ";";
                    //console.log("Found " + $(this).find('layout_id').text());
                });

                //console.log("Layout manifest is: " + layoutManifest);
                
                //Set some values    
                chrome.storage.local.set({
                    uri : new XMLSerializer().serializeToString(xml),
                }, function() {
                    console.log('Selection Set XML saved to storage');
                    
                    if (complete == true) {
                        console.log("That was the last cycle, run the next stage");
                        //Probaly want to run syncIMages here..
                        
                        //syncImages();
                        
                        
                        
                    }
                    
                });        
            },
            error: function (xhr) {
                console.log("Looks like there's been an error");
            }
        });    
    });
};


        
function testSettings() {
    //Output speech to test settings
    
    console.log("About to test settings...");
    
    
    var options = {};
    options.voiceName = document.getElementById("voiceName").value;
    options.rate = roundNumber(document.getElementById("rate").value);
    options.pitch = roundNumber(document.getElementById("pitch").value); 	//0 to 2, increment 0.1
    options.volume = roundNumber(document.getElementById("volume").value); 		//0 to 1, increment 0.1 or less
    options.enqueue = document.getElementById("enqueue").checked;
    chrome.tts.speak(document.getElementById("testString").value, options);
    statusMessage(messageSpeakingTest, statusMessageDuration);
}

function updateCurrentValue() {
    //Display slider current value when slider changed
    elementId = this.id + "Value"
    document.getElementById(elementId).innerHTML = roundNumber(this.value);
}

function vocabChange() {
    //Display the vocabulary description
    getVocabDescription(document.getElementById("location").value + manifestName, document.getElementById("vocab").value);
}