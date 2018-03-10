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

//If install date not set, ie first run, load splash page instead and set the install date
if (!localStorage["msp_install_date"]){
    document.location.href = "/pages/index/index.html";
}

document.addEventListener('DOMContentLoaded', function () {

    //CHECK IF FIRST RUN
    if (localStorage["msp_vocab"] == undefined) {
        firstRun();
    }

    //SET SOME CONTROL AND UI ELEMENTS

    //Set Progress bar
    $(function () {
        $("#progressbar").progressbar({
            value: 0
        });
    });
    $("#progressbar").hide();

    //Set VOCABULARY OPTIONS

    //Populate User Vocabularies select    
    populateVocabularies();

    //Set buttons
    if (localStorage["msp_token"] && localStorage["msp_userid"]) {
        $("#sign-in").show();
        $("#sign-out").show();
        $("#sync").show();
    } else {
        $("#sign-in").show();
        $("#sign-out").show();
        $("#sync").hide();
    }
    
    //Set SETTINGS
    $("#onOpen").val(localStorage["msp_on_open"]);
    
    //Set value to true or false based on fileStorage value
    if (localStorage["msp_auto_update"] == "true") {
        update = true;
    } else {
        update = false;
    }
    document.getElementById("checkUpdate").checked = update;

    //Set TEXT TO SPEECH PROPERTIES
    populateVoices();

    //Set value to true or false based on fileStorage value
    if (localStorage["msp_voice_enqueue"] == "true") {
        enqueue = true;
    } else {
        enqueue = false;
    }
    document.getElementById("enqueue").checked = enqueue;

    //Set SPEECH CHARACTERISTICS
    document.getElementById("pitch").value = localStorage["msp_voice_pitch"];
    document.getElementById("pitchValue").innerText = localStorage["msp_voice_pitch"];
    document.getElementById("rate").value = localStorage["msp_voice_rate"];
    document.getElementById("rateValue").innerText = localStorage["msp_voice_rate"];
    document.getElementById("volume").value = localStorage["msp_voice_volume"];
    document.getElementById("volumeValue").innerText = localStorage["msp_voice_volume"];

    //Set ACCESS SETTINGS
    setAccessSettings()
    setAccessControls();

    //Set LOCATION SETTING
    //Set value to true or false based on location enabled value
    if (localStorage["msp_location_enabled"] == "true") {
        locationEnabled = true;
    } else {
        locationEnabled = false;
    }
    document.getElementById("locationEnabled").checked = locationEnabled;
    document.getElementById("locationRange").value = localStorage["msp_location_range"];
    
    
    //NEED TO TWEAK THIS

    //Only want to sync if the user has signed in
    //If signed in an not synchronised
    if (localStorage["msp_userid"]) {

        //alert("Signed in");
        if (!localStorage["msp_last_sync"]) {
            //$("#progressbar").show();
            //alert("You need to do first time sync");
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
        document.location.href = "/pages/signin/signin.html";
        
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

    $("#setSw1").click(function () {
        $("#sw").val("1");
        alert("Click OK and then click Switch 1.");
    });

    $("#setSw2").click(function () {
        $("#sw").val("2");
        alert("Click OK and then click Switch 2.");
    });


    //Get the key press when switch activated
    $("body").keyup(function (e) {
        if ($("#sw").val() == "1") {
            //alert("Switch 1 selected")
            $("#sw1").val(String.fromCharCode(e.keyCode));
            $("#sw1Code").val(e.keyCode);
            //alert("You selected the letter '" + String.fromCharCode(e.keyCode) + "' for Switch 1.");
            //Reset the hidden value to prevent contsant popups
            $("#sw").val("");
        }
        if ($("#sw").val() == "2") {
            //alert("Switch 2 selected");
            $("#sw2").val(String.fromCharCode(e.keyCode));
            $("#sw2Code").val(e.keyCode);
            //alert("You selected the letter '" + String.fromCharCode(e.keyCode) + "' for Switch 2.");
            //Reset the hidden value to prevent contsant popups
            $("#sw").val("");

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

    //alert("Doing first run");

    //localStorage["msp_vocab"] = "A"; 

    //localStorage["msp_on_open"] = "options/options.html";

    //localStorage["msp_voice_name"] = "native";
    //localStorage["msp_voice_rate"] = rateDefault;
    //localStorage["msp_voice_volume"] = volumeDefault;
    //localStorage["msp_voice_pitch"] = pitchDefault;
    //localStorage["msp_voice_lang"] = "en";
    //localStorage["msp_voice_enqueue"] = "true";
    
    
    
    //localStorage["msp_location_range"] = 50;
    //localStorage["msp_location_enabled"] = "true";




    //Save values to local storage
    localStorage["msp_on_open"] = "options/options.html";
    localStorage["msp_voice_name"] = "native";
    localStorage["msp_voice_rate"] = rateDefault;
    localStorage["msp_voice_pitch"] = pitchDefault;
    localStorage["msp_voice_volume"] = volumeDefault;
    localStorage["msp_voice_enqueue"] = "true";
    
    localStorage["msp_vocab"] = "B";
    
    //Switch access settings
    localStorage["msp_switch_type"] = "direct";
    localStorage["msp_switch_quantity"] = 1;;
    localStorage["msp_switch_sw1"] = "A";
    localStorage["msp_switch_sw2"] = "Z"
    localStorage["msp_switch_sw1Code"] = 65;
    localStorage["msp_switch_sw2Code"] = 90;
    localStorage["msp_switch_repeats"] = 3;
    localStorage["msp_switch_interval"] = 0.7;
    localStorage["msp_switch_spacing"] = 100;

    //Need to do a check to make sure the value is valid
    localStorage["msp_location_range"] = 50;
    localStorage["msp_location_enabled"] = "true";

    console.log("Set defaults");

    //Open the xml file
    xmlDoc = getXML("/xml/default/vocabularies.xml");
    localStorage["uservocabularies/A"] = new XMLSerializer().serializeToString(xmlDoc);

    //Selectionsets
    xmlDoc = getXML("/xml/default/selectionsets/A.xml");
    localStorage["selectionsets/?vocabulary_id=A"] = new XMLSerializer().serializeToString(xmlDoc);

    xmlDoc = getXML("/xml/default/selectionsets/B.xml");
    localStorage["selectionsets/?vocabulary_id=B"] = new XMLSerializer().serializeToString(xmlDoc);

    xmlDoc = getXML("/xml/default/selectionsets/C.xml");
    localStorage["selectionsets/?vocabulary_id=C"] = new XMLSerializer().serializeToString(xmlDoc);

    //Layouts
    xmlDoc = getXML("/xml/default/layouts/A.xml");
    localStorage["layouts/A"] = new XMLSerializer().serializeToString(xmlDoc);

    xmlDoc = getXML("/xml/default/layouts/B.xml");
    localStorage["layouts/B"] = new XMLSerializer().serializeToString(xmlDoc);

    xmlDoc = getXML("/xml/default/layouts/C.xml");
    localStorage["layouts/C"] = new XMLSerializer().serializeToString(xmlDoc);

    //Themes
    xmlDoc = getXML("/xml/default/themes/A.xml");
    localStorage["themes/A"] = new XMLSerializer().serializeToString(xmlDoc);

    xmlDoc = getXML("/xml/default/themes/B.xml");
    localStorage["themes/B"] = new XMLSerializer().serializeToString(xmlDoc);

    //Items
    xmlDoc = getXML("/xml/default/items/A.xml");
    localStorage["items/?selectionset_id=A"] = new XMLSerializer().serializeToString(xmlDoc);

    xmlDoc = getXML("/xml/default/items/B.xml");
    localStorage["items/?selectionset_id=B"] = new XMLSerializer().serializeToString(xmlDoc);

    xmlDoc = getXML("/xml/default/items/C.xml");
    localStorage["items/?selectionset_id=C"] = new XMLSerializer().serializeToString(xmlDoc);

    xmlDoc = getXML("/xml/default/items/D.xml");
    localStorage["items/?selectionset_id=D"] = new XMLSerializer().serializeToString(xmlDoc);

    xmlDoc = getXML("/xml/default/items/E.xml");
    localStorage["items/?selectionset_id=E"] = new XMLSerializer().serializeToString(xmlDoc);

}

function getXML(path) {
    //Get xml and return to calling function
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", path, false);
    xmlhttp.send();
    return xmlhttp.responseXML;

}


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

            */

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


apiRequest = function (uri,manifest,element) {

    //Make some requests to get vocabulary data
    api_url = "https://mespee.ch/api/" + uri;
    console.log("Sending request " + api_url + "...to get vocab data and build manifests");

    $.ajax({

        async: false,
        //cache: false,
        headers: {
            'apikey': msp_apikey,
            'token': localStorage["msp_token"]
        },
        url: api_url,
        success: function (xml) {

            var manifestText = localStorage[manifest];
            var imageManifestText = localStorage["imageManifest"];
            var layoutManifestText = localStorage["layoutManifest"];
            var themeManifestText = localStorage["themeManifest"];
            
            $(xml).find(element).each(function () {
            
                manifestText += $(this).find('id').text() + ";";
            
                //Make a special case for items, to also get representation and add to image manifest
                //Only add the image to the manifest if a value is present
                if (element=="item" && $(this).find('representation').text() != "none")
                {
                    imageManifestText += $(this).find('representation').text() + ";";
                }

                //Get the layout_id's for Layout Manifest
                if (element=="selectionset")
                {
                    //Need to avoid putting duplicates in, but requires delimiting character too
                    layoutManifestText += $(this).find('layout_id').text() + ";";
                }

                //Get the theme_id's for Theme Manifest
                if (element=="vocabulary")
                {
                    themeManifestText += $(this).find('theme_id').text() + ";";
                    //console.log($(this).find('representation').text());
                }

            });

            localStorage[manifest] = manifestText;
            localStorage["imageManifest"] = imageManifestText;
            localStorage["layoutManifest"] = layoutManifestText;
            localStorage["themeManifest"] = themeManifestText;

            //Storing this in local storage at the moment, but worried quota will be exceeded.            
            localStorage[uri] = new XMLSerializer().serializeToString(xml);
 
            document.getElementById("status").innerHTML = uri;

        },
        error: function (xhr) {
            xml = xhr.responseXML; // complete XmlHttpRequest object returned
            var e = "";
            $(xml).find('error').each(function () {
                e += $(this).find('message').text() + ". ";
                console.log($(this).find('message').text()); // log errors in console
            });
        }
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

    if(localStorage["msp_userid"]){
        
        vocaburi = "uservocabularies/" + localStorage["msp_userid"];
    } else {
        vocaburi = "uservocabularies/A";
    }

    //vocaburi = "uservocabularies/" + localStorage["msp_userid"];
    vocabListxml = localStorage[vocaburi];
    var parser=new DOMParser();
    xml=parser.parseFromString(vocabListxml,"text/xml");

    //alert("List " + vocabListxml);

    $(xml).find("vocabulary").each(function () {            
        if($(this).find('id').text()==$('#userVocabs option:selected').val()){
            document.getElementById("description").innerText = $(this).find('description').text(); 
        }
    });
}

//Not sure if this is needed now? Delete?
function getVocabList() {
    //Populate the vocab drop down box
    vocabLocation = document.getElementById("location").value + manifestName;
    populateVocabularies(vocabLocation, "")
}

//DELETE??
function getXML(path) {

    path = path + "?t=" + Math.random();

    //Get xml and return to calling function
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", path, false);
    xmlhttp.send();
    return xmlhttp.responseXML;

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
    
    //If user not signed in, load some basic predefined vocabs
    if (!localStorage["msp_userid"]) {

        //alert("You just want to use free ones.");
        vocaburi = "uservocabularies/A";

    } else {

        vocaburi = "uservocabularies/" + localStorage["msp_userid"];

    }

    //alert("Vocab uri is " + vocaburi);

    //Load the downloaded vocabs
    //Will need to add this in again
    //checkIfData();

    //Clear drop down
    $("#userVocabs").empty();

    var parser = new DOMParser();
    xml = parser.parseFromString(localStorage[vocaburi], "text/xml");

    $(localStorage[vocaburi]).find("vocabulary").each(function () {
        $("#userVocabs").append('<option value=' + $(this).find('id').text() + '>' + $(this).find('name').text() + '</option>');
        document.getElementById("description").innerText = $(this).find('description').text();
    });

    // If user has not selected a vocab as they may have done an initial vocab
    // sync but not selected one. Set to the first on the list.

    if (!localStorage["msp_currentSS"]) {
        //alert("NEed to set a ss with " + $("#userVocabs").val());
        localStorage["msp_currentSS"] = $(this).find('id').text();
    }

    //Set the selected vocab
    $("select#userVocabs").val(localStorage["msp_vocab"]);

    //Get the description of the selected option
    getVocabDescription() 
}

function populateVoices(){
    
    //Set voice
    var voice = localStorage["msp_voice_name"];

    voices = document.getElementById('voiceName');

    //Get available voices and populate select box
    chrome.tts.getVoices(function (va) {
        voiceArray = va;
        var language;
        for (var i = 0; i < voiceArray.length; i++) {
            var opt = document.createElement('option');
            opt.setAttribute('value', voiceArray[i].voiceName);
            if (voiceArray[i].lang) {
                language = " (" + voiceArray[i].lang + ")";
            } else {
                language = "";
            }
            if (voiceArray[i].voiceName == "native") {
                voiceText = defaultVoiceText;
            } else {
                voiceText = voiceArray[i].voiceName;
            }
            opt.innerText = voiceText + language;
            if (voiceArray[i].voiceName == voice) {
                opt.setAttribute('selected', 'selected');
            }
            voices.appendChild(opt);
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

    //Save values to local storage
    localStorage["msp_on_open"] = $("#onOpen :selected").val();
    localStorage["msp_voice_name"] = $("#voiceName :selected").val();
    localStorage["msp_voice_rate"] = roundNumber(document.getElementById("rate").value);
    localStorage["msp_voice_pitch"] = roundNumber(document.getElementById("pitch").value);
    localStorage["msp_voice_enqueue"] = document.getElementById("enqueue").checked;
    localStorage["msp_auto_update"] = document.getElementById("checkUpdate").checked;
    localStorage["msp_voice_volume"] = roundNumber(document.getElementById("volume").value);
    //localStorage["msp_access_type"] = $("#accessType :selected").val();
    localStorage["msp_vocab"] = document.getElementById("userVocabs").value;
    
    //Switch access settings
    localStorage["msp_switch_type"] = $("#accessType :selected").val();
    localStorage["msp_switch_quantity"] = $("#switchQuantity :selected").val();
    localStorage["msp_switch_sw1"] = $("#sw1").val();
    localStorage["msp_switch_sw2"] = $("#sw2").val();
    localStorage["msp_switch_sw1Code"] = $("#sw1Code").val();
    localStorage["msp_switch_sw2Code"] = $("#sw2Code").val();
    localStorage["msp_switch_repeats"] = $("#repeats").val();
    localStorage["msp_switch_interval"] = $("#interval").val();
    localStorage["msp_switch_alignment"] = $("#alignment :selected").val();
    localStorage["msp_switch_screenSw1"] = $("#screenSw1 :selected").val();
    localStorage["msp_switch_screenSw2"] = $("#screenSw2 :selected").val();
    localStorage["msp_switch_spacing"] = $("#spacing").val();

    //Need to do a check to make sure the value is valid
    localStorage["msp_location_range"] = $("#locationRange").val();
    localStorage["msp_location_enabled"] = document.getElementById("locationEnabled").checked;

    statusMessage(messageSave, statusMessageDuration)
}

function saveWebImage(url,stage,stages){
    
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

    //Set access type select box
    switch($("#accessType").val()) {

        case "switch":
            //Switch access
            $(".screen-sw2").hide();        //Always hide
            $(".sw1").show();               //Always show

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
            if (localStorage['msp_switch_screenSw1']) {
                $("#screenSw1").val(localStorage['msp_switch_screenSw1']);
            } else {
                $("#screenSw1").val("l");
            }

            if (localStorage['msp_switch_screenSw2']) {
                $("#screenSw2").val(localStorage['msp_switch_screenSw2']);
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
            if (localStorage['msp_switch_screenSw1']) {
                $("#screenSw1").val(localStorage['msp_switch_screenSw1']);
            } else {
                $("#screenSw1").val("t");
            }

            if (localStorage['msp_switch_screenSw2']) {
                $("#screenSw2").val(localStorage['msp_switch_screenSw2']);
            } else {
                $("#screenSw2").val("b");
            }

            break;
    }
}

function setAccessSettings(){
    
    //Get the saved values for access
    $("#accessType").val(localStorage['msp_switch_type']);
    $("#switchQuantity").val(localStorage['msp_switch_quantity']);
    $("#sw1").val(localStorage['msp_switch_sw1']);
    $("#sw2").val(localStorage['msp_switch_sw2']);
    $("#sw1Code").val(localStorage['msp_switch_sw1Code']);
    $("#sw2Code").val(localStorage['msp_switch_sw2Code']);
    $("#repeats").val(localStorage['msp_switch_repeats']);
    $("#interval").val(localStorage['msp_switch_interval']);
    $("#alignment").val(localStorage['msp_switch_alignment']);
    $("#screenSw1").val(localStorage['msp_switch_screenSw1']);
    $("#screenSw2").val(localStorage['msp_switch_screenSw2']);
    $("#spacing").val(localStorage['msp_switch_spacing']);
}

function signOut() {

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
    $("#sign-out").show();
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
    
    if (!localStorage["msp_last_sync"]){
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

    alert(message); 

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
            if(!localStorage["imageManifest"]){
                
                //REMOVED 5/4/2013
                hideProgressBar();
                checkIfData();
                document.getElementById('status').innerHTML = 'Ready'; 
            }

        },10);
    
    populateVocabularies();

    var d = new Date();
    localStorage["msp_last_sync"] = d.toUTCString();
}

function syncImages(){

    var imgSyncPath = "https://mespee.ch/images/symbols/250/";
    var i = localStorage["imageManifest"].split(";");
    var trimmedPath;

    //alert("Image manifest" + localStorage["imageManifest"])

    for (k=0; k<i.length-1; k++)
    {     
        str = i[k];
        //Trim full path if it's there - some have, some don't
        trimmedPath = str.replace(imgSyncPath,"");
        //console.log("Current image " + trimmedPath)        ;
        //if(trimmedPath != "none"){
            saveWebImage(imgSyncPath + trimmedPath, k+1, i.length-1);
        //}
    }
}

function syncVocabularies() {
    
    //Load the vocabulary data
    if (localStorage["msp_token"] && localStorage["msp_userid"]) {
                  
        //alert("About to sync");

        //Reset the manifest files
        localStorage["vocabularyManifest"]="";
        localStorage["selectionSetManifest"]="";
        localStorage["layoutManifest"]="";
        localStorage["itemManifest"]="";
        localStorage["imageManifest"]="";
        localStorage["themeManifest"]="";

        //Get the vocabularies
        $(function() {
		    $( "#progressbar" ).progressbar({
			    value: 10
		    });
	    });
        
        var q = 'uservocabularies/' + localStorage["msp_userid"];

        console.log("Sending request at line 845 " + q);
        apiRequest(q,"vocabularyManifest","vocabulary");

        //Get the selectionsets for the vocabularies
        var str=localStorage["vocabularyManifest"];
        var n=str.split(";");
        for (i=0; i<n.length-1; i++)
        {
            document.getElementById("status").innerHTML = "Getting " + k + " of " + (n.length - 1) + " vocabularies.";
            apiRequest('selectionsets/?vocabulary_id=' + n[i],"selectionSetManifest","selectionset");
            var k = i + 1;
        }

        //Get the layouts
        var str=localStorage["layoutManifest"];
        var n=str.split(";");
        for (i=0; i<n.length-1; i++)
        {
            apiRequest('layouts/' + n[i],"layoutManifest","layout");
            var k = i + 1;
            document.getElementById("status").innerHTML = "Getting " + k + " of " + (n.length - 1) + " layouts.";
        }

        //Get the themes
        var str=localStorage["themeManifest"];
        var n=str.split(";");
        for (i=0; i<n.length-1; i++)
        {
            apiRequest('themes/' + n[i],"themeManifest","theme");
            var k = i + 1;
            console.log("Getting " + k + " of " + (n.length - 1) + " themes.")
        }

        //Get the items for the selectionsets
        var str=localStorage["selectionSetManifest"];
        var n=str.split(";");
        for (i=0; i<n.length-1; i++)
        {
            apiRequest('items/?selectionset_id=' + n[i],"itemManifest", "item");
            var k = i + 1;
            console.log("Getting " + k + " of " + (n.length - 1) + " selection sets.")
        }
    } else {
        alert("You need to authenticate user")
    }
    
    //Synchronize images using the manifest file
    if(localStorage["imageManifest"]){
        syncImages();
    }
}

function testSettings() {
    //Output speech to test settings
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