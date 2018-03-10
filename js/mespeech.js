//Might want to use this array elsewhere
var rowRefs = new Array();
rowRefs[1] = "a";
rowRefs[2] = "b";
rowRefs[3] = "c";
rowRefs[4] = "d";
rowRefs[5] = "e";
rowRefs[6] = "f";
rowRefs[7] = "g";
rowRefs[8] = "h";
rowRefs[9] = "i";
rowRefs[10] = "j";
rowRefs[11] = "k";
rowRefs[12] = "l";
rowRefs[13] = "m";
rowRefs[14] = "n";
rowRefs[15] = "o";
rowRefs[16] = "p";
rowRefs[17] = "q";
rowRefs[18] = "r";
rowRefs[19] = "s";
rowRefs[20] = "t";
rowRefs[21] = "u";
rowRefs[22] = "v";
rowRefs[23] = "w";
rowRefs[24] = "x";
rowRefs[25] = "y";
rowRefs[26] = "z";

//Need to check if these are all used, and if correctly positioned
var columns;
var rows;
var cellQty;
var columnProportion;
var screenOverflow;
var minimumSize;
var preferredQty;
var SelectionSetHeight;
var SelectionSetWidth;
var g;
var imagePath = "images/symbols/";
var warningDuration = 5; 		//duration of message in seconds
var usedHeight = 0;
var gridType;
var startingRow;
var symbolRoot ="https://mespee.ch/images/symbols/250/";
//var handler;
var msp_apikey = "asdqwe123";
var scanTimer;
var scanCurrentChild = 0;
var scanCurrentSelector;
//var maxScanRepeats = chrome.local.storage.get('msp_install_date');
//var maxScanRepeats = localStorage["msp_switch_repeats"];
//chrome.storage.local.get("msp_switch_repeats", function (result) {
//    maxScanRepeats = result.msp_switch_repeats;
//    console.log("Got " + result.msp_switch_repeats);

//});
var scanRepeats = 0;
var screenSwitchType = "Vertical"  //Horiontal or Vertical
var screenSwitchSpace = 100         //Value in pixels
var currentLatitude = null;
var currentLongitude = null;

//var watchLocation = navigator.geolocation.watchPosition(setPosition);



//TODO - UPDATE THIS
/*
var db = window.openDatabase(
    'mespeech',           // dbName
    '',            // version
    'mespeech',  // description
    2 * 1024 * 1024,  // estimatedSize in bytes
    function(db) { }   // optional creationCallback
);
*/


function addToMessageWindow(image,gloss,displayImage){
    
    console.log("Image to add is " + image);

	if(!(image=="" && gloss=="")){
		htmlToAppend = "<div class=\"messageWindowHolder\">";

        //JUst moved this to here - need to check all works OK
		if(!gloss==""){
		    if (gloss == " ") {
		        txt = "&nbsp;"
		    }else{
		    txt = gloss;
            }
			//htmlToAppend += i + "<div>" + txt + "</div>";
            htmlToAppend += "<div>" + txt + "</div>";
		}
		htmlToAppend += "</div>";
		document.getElementById('messageWindow').innerHTML += htmlToAppend;

		
        //If signed in, use images in db
        if(localStorage["msp_userid"]){

            if(!image==""){

                //Build the sql
                //var sql = 'SELECT * FROM images WHERE path = "' + symbolRoot + image + '"';
                var sql = 'SELECT * FROM images WHERE path = "' + image + '"';

                db.transaction(function(tx) {

                    //Perform the query
                    tx.executeSql(sql, [], function(tx, results) {

                        if(results.rows.length>0){
                            //If rows returned, it image found, use it
                            //htmlToAppend += "<img src=\"" + imagePath + image + "\" />";	
                            i = "<img class=\"representation\" src=\"" + results.rows.item(0).image_blob + "\" />";
                            $(".messageWindowHolder").last().prepend(i);
                        }
                    });
                });

		    }
        //Otherwise, use local image path
        } else {
            console.log("Use local image");
            console.log("Image " + image);
            if(image!="none"){

                i = "<img class=\"representation\" src=\"/images/symbols/" + image + "\">";
                //$(".messageWindowHolder").last().prepend(i);            
                console.log("Load local image: " + i);
                console.log('Should be <img class="representation" src="/images/symbols/ss/wherever.png">');
                $(".messageWindowHolder").last().prepend(i);
            }
        }
        
		//Add the text to speech thingy
		if(!document.getElementById("messageWindowText")){
			createElement('body','messageWindowText');
		}

        //If text only is shown in the message window, do not need psace between items, otherwise
        //the space is needed.
		if (displayImage == 1) {
		    document.getElementById('messageWindowText').innerHTML += gloss + " ";
		} else {
		    document.getElementById('messageWindowText').innerHTML += gloss;
		}

	} else {
		displaySystemMessage('There is no data to add to the message window. Check the selection set parameters.','systemMessageWarning')
	}
}

function bodyClick(){
    //Used in scanning
    var p = $("body");
    var off = p.offset();

}

function buildTable( id, rows, columns, startingRowRef ) {
    tableHTML = '<table id="' + id + '">';
    for (r = startingRowRef; r <= rows; r++) {
        tableHTML = tableHTML + "<tr>";
        for (c = 1; c <= columns; c++) {
            gridRef = rowRefs[r] + "-" + c;
            tableHTML = tableHTML + '<td id="' + gridRef + '">';
            tableHTML = tableHTML + "&nbsp;";
            tableHTML = tableHTML + "</td>";
        }
        tableHTML = tableHTML + "</tr>";
    }
    tableHTML = tableHTML + "</table>"
    return tableHTML;
}

function cellClickHandler() {

    //This seems a pain in the *rs* to do it this way, and I'm not sure I'm doing it right, but
    //just need to get it to work.

    selector = "#" + this.id + " input";
    var k = $("#" + this.id + " input").val();

    var l = k.split("(");
    var m = l[1].replace(")", "");
    var m = m.replace(/\'/g, "");

    //Need to use switch statement to set the event listener for item click.
    //Some also need the parameters setting too.
    switch(l[0]) {

        case "loadSelectionSet":
            loadSelectionSet(m);
            break;
        case "speakMessageWindow":
            speakMessageWindow();
            break;
        case "clearMessageWindow":
            clearMessageWindow();
            break;
        case "speakMessage":
            speakMessage(m);
            break;
        case "addToMessageWindow":
            //Need to split the parameter into its three parts
            var s = m.split(",");
            addToMessageWindow(s[0],s[1],s[2]);
            break;
    }
}

function checkIfSyncRequired() {
    
    //Check to see if vocabs, selection sets or items updated since last sync

    var lastSync = new Date(localStorage["msp_last_sync"]);

    //Check for vocabulary updates.
    if (localStorage["msp_token"] && localStorage["msp_userid"]) {

        var vocabList = "";
        var selectionSetList = "";
        var itemList = "";
        var syncReqd = false;
  
        //Check for updated vocabs
        $.ajax({

            async: false,
            headers: {
                'apikey': msp_apikey,
                'token': localStorage["msp_token"]
            },
            url: "https://mespee.ch/api/" + 'uservocabularies/' + localStorage["msp_userid"],
            success: function (xml) {

                $(xml).find('vocabulary').each(function () {
                    vocabList += $(this).find('id').text() + ";";
                    var k = new Date($(this).find('modified_date').text());
                    if ((k - lastSync) > -1) {
                        syncReqd = true;
                    }
                });
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
      
        //Break out of function - might not be best way to do this
        //Couldn;t get to work from inside $.ajax
        if (syncReqd==true){
            return true;
        }

        //Check for updated selection sets
        var n=vocabList.split(";");
        for (i = 0; i < n.length - 1; i++) {

            $.ajax({

                async: false,
                headers: {
                    'apikey': msp_apikey,
                    'token': localStorage["msp_token"]
                },
                url: "https://mespee.ch/api/selectionsets/?vocabulary_id=" + n[i],
                success: function (xml) {

                    $(xml).find('selectionset').each(function () {
                        
                        selectionSetList += $(this).find('id').text() + ";";
                        
                        var l = new Date($(this).find('modified_date').text());
                        if ((l - lastSync) > -1) {
                            syncReqd = true;
                        }

                    });
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
        }

        //Break out of function - might not be best way to do this
        //Couldn;t get to work from inside $.ajax
        if (syncReqd==true){
            return true;
        }

        //Check for updated items
        var items=selectionSetList.split(";");
        for (j = 0; j < items.length - 1; j++) {

            $.ajax({

                async: false,
                headers: {
                    'apikey': msp_apikey,
                    'token': localStorage["msp_token"]
                },
                url: "https://mespee.ch/api/items/?selectionset_id=" + items[j],
                success: function (xml) {

                    $(xml).find('item').each(function () {

                        var m = new Date($(this).find('modified_date').text());
                        if ((m - lastSync) > -1) {
                            syncReqd = true;
                        }
                    });
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
        }

    }

    //Return true or false
    return syncReqd;
}

function clearMessageWindow(){
	//Clear the message window
	document.getElementById('messageWindow').innerHTML = "";
	if(document.getElementById('messageWindowText')){
		document.getElementById('messageWindowText').innerHTML = ""
	}
}

function clearSelectionSet() {

    //Need to change this to remove the styles and actions not now required

    //Clear all existing content
    var table = document.getElementById("selectionSetTable");

    for (r = 0; r < table.rows.length; r++) {
        for (c = 0; c < table.rows[r].cells.length; c++) {
            //Remove cell contents
            table.rows[r].cells[c].innerHTML = "&nbsp;";

            //Remove any previous cell style
            table.rows[r].cells[c].className = null;
        }
    }
}

function createElement(parent, id) {
    var newdiv = document.createElement("div");
    newdiv.setAttribute("id", id);
    document.getElementsByTagName("body")[0].appendChild(newdiv);
}

function displaySystemMessage(message, type){

	//Check to see of the element exists
	if(!document.getElementById("systemMessage")){
		createElement('body','systemMessage');
	}
	var t=setTimeout("hideSystemMessage()",warningDuration*1000);
	document.getElementById('systemMessage').innerHTML = message;
	document.getElementById("systemMessage").className = type;            
}

function getLocalApi(uri) {
    var xmlToReturn = "";
    var xml;
    var db = window.openDatabase(
        'mespeech',           // dbName
        '1.0',            // version
        'mespeech',  // description
        2 * 1024 * 1024,  // estimatedSize in bytes
        function(db) {}   // optional creationCallback
    );

    db.transaction(function(tx)
    {
        tx.executeSql('SELECT * FROM api WHERE uri = "' + uri + '"', [], function(tx, results)
        {
            var len = results.rows.length, i;
            if(len == 1){
                localStorage["currentAPIRequest"] = results.rows.item(0).data;
            } else {
                console.log("There was an error retrieving the xml.");
            }
        });
    });
}

function getNextAvailableCell(tableID) {

    var table = document.getElementById(tableID);

    for (r = 0; r < table.rows.length; r++) {
        for (c = 0; c < table.rows[0].cells.length; c++) {
            ref = rowRefs[r + startingRow] + "-" + (c + 1);
            if (document.getElementById(ref).innerHTML == "&nbsp;") {
                return ref;
            } else {
                
            }
        }
    }
}

function getNumericRowRef(alphaRowRef) {
    for (t = 1; t < rowRefs.length; t++) {
        if (rowRefs[t] == alphaRowRef) {
            return t;
        }
    }
}

function getScreenSwitchClick(x,y){
    
    //alert("Clicked");

    if (localStorage["msp_switch_quantity"]==1){
        //Using screen as single switch
        scanAdvance();

    } else {
        //Using two hotspots, ie. two switches
        //Determine which switch has been pressed, 1 or 2

        if (localStorage["msp_switch_alignment"] == "v") {

            //Horizontal alignment
            console.log("Vertical switch alignment");
            var s1Bottom = ($(window).height() - screenSwitchSpace) / 2;
            var s2Top = $(window).height() - screenSwitchSpace;

            if (y < s1Bottom) {
                //Hit top switch
                console.log("Hit top switch")
                if (localStorage["msp_switch_screenSw1"] == "t"){
                    scanBlocks();
                } else {
                    scanSelectStage();
                }
            }

            if (y > s2Top) {
                //Hit bottom switch
                console.log("Hit bottom switch");
                if (localStorage["msp_switch_screenSw1"] == "b"){
                    scanBlocks();
                } else {
                    scanSelectStage();
                }
            }

        } else {

            //Vertical alignment
            console.log("Horizontal switch alignment");
            var s1Right = ($(window).width() - screenSwitchSpace) / 2;
            var s2Left = $(window).width() - s1Right;

            if (x < s1Right) {
                //Hit left switch
                console.log("Hit left switch");
                if (localStorage["msp_switch_screenSw1"] == "l"){
                    scanBlocks();
                } else {
                    scanSelectStage();
                }
            }

            if (x > s2Left) {
                //Hit right switch
                console.log("Hit right switch");
                if (localStorage["msp_switch_screenSw1"] == "r"){
                    scanBlocks();
                } else {
                    scanSelectStage();
                }
            }
        }
    }
}

function getXMLHTTPRequest() {
    try {
        req = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
    } catch (e) {
        try {
            req = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5 ie ie5minimum requirement
        } catch (e) {
            req = false;
        }
    }
    return req;
}

function hideSystemMessage(){

	document.getElementById("systemMessage").className = "hide";            

}

function setLocation() {
    //Set the current location
    console.log("SETTING THE POSITION");
    if (navigator.geolocation){
            
        navigator.geolocation.getCurrentPosition(function(position){

            currentLatitude = position.coords.latitude;
            currentLongitude = position.coords.longitude;
            console.log("CURRENT latitude: " + position.coords.latitude);
            console.log("CURRENT longitude: " + position.coords.longitude);            

        });

    } else {
        console.log("Unable to find location");
        currentLatitude = null;
        currentLongitude = null;

    }

    console.log("done setting location");

}

function checkAtLocation(lat, lon){

    /** Converts numeric degrees to radians */
    if (typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      }
    }

    //Check for location
    //Calculate distances using Haversine Formula
    //see http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points

    var R = 6371; // Radius of the earth in km
    var dLat = (lat-currentLatitude) * Math.PI / 180;  // Javascript functions in radians
    var dLon = (lon-currentLongitude) * Math.PI / 180; 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(currentLatitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = Math.round((R * c) * 1000); // Distance in m

    //console.log("Difference between points is " + d + "m"); 

    var locationDiff = parseInt(localStorage["msp_location_range"]) - d;

    //Check if at a location within limits based on data sent
    if((parseInt(localStorage["msp_location_range"]) - d) >=0){
    
        return true;

    } else {

        return false;

    }
}

function checkLocation(){
    
    //console.log("Checking location...");

    if (navigator.geolocation){
            
        navigator.geolocation.getCurrentPosition(function(position){

            //console.log("Setting position alt...");

            currentLatitude = position.coords.latitude;
            currentLongitude = position.coords.longitude;
            //console.log("Current latitude: " + currentLatitude);
            //console.log("Current longitude: " + currentLongitude);            
        });

    } else {
        //console.log("Unable to find location");
        currentLatitude = null;
        currentLongitude = null;
    }

}

function loadSelectionSet(gridurl) {

    gridurl = "items/?selectionset_id=" + gridurl;

    //console.log("Loading selection set with " + gridurl);

    //alert("SS to load: " + gridurl);

    var currentImage, gloss, currentId;
    
    //Clear the exisiting grid contents
    clearSelectionSet();

    //Load the selection set text, and parse as xml            
    var parser = new DOMParser();
    xml = parser.parseFromString(localStorage[gridurl], "text/xml");
    
    //Get the current item                   
    y = xml.documentElement.getElementsByTagName("item");

    //Get selection set row quantity
    ssRows = document.getElementById('selectionSetTable').rows.length;
    ssColumns = document.getElementById('selectionSetTable').rows[0].cells.length;

    //Lets try this in jquery
    $(xml).find("item").each(function() {

        //Flexible grid may NOT have a location, otherwise it may not be displayed

        //alert("Gloss " + $(this).find('gloss').text());
        //alert("Length " + $(this).find('force_location').length);
        //alert("Value " + $(this).find('force_location').text());

        if($(this).find('force_location').length > 0) {
        //if(!$(this).find('force_location').text()=="") {
            currentCell = $(this).find('force_location').text();
        } else {
            //alert("Trying to get next avaailable cell");
            currentCell = getNextAvailableCell("selectionSetTable");
        }

        //Check within time
        if (checkWithinTime($(this).find('start_date').text(),$(this).find('end_date').text(),$(this).find('start_time').text(),$(this).find('end_time').text()) == true){
            //console.log("WITHIN TIME AND DATE - DISPLAY");
            itemWithinTime = true;
        } else {
            itemWithinTime = false;
            //console.log("OUTSIDE TIME AND DATE - DO NOT DISPLAY");
        }

        //Determine whether to display based on current location
        if ($(this).find('location').text() != "all"){

            //Check if the item should be displayed
            var l = $(this).find('location').text().split(",");
            itemLat = l[0];
            itemLon = l[1];

            if(localStorage["msp_location_enabled"]=="true"){
            
                if (checkAtLocation(itemLat, itemLon)==true){
                    //We're in the location, so display
                    itemWithinLocation = true;
                    //console.log("Item in location");
                } else {
                    //We're not in the location, so do not display
                    itemWithinLocation = false;
                    //console.log("Item not in location");
                }

            } else {
                //Don't display it, even though location set as user chosen not to use location in app
                itemWithinLocation = false;
                //console.log("Item not in location");
            }
        } else {
            //Display the item if location set to 'Everything'
            itemWithinLocation = true;
            //console.log("Item within location")
        }

        //console.log("Current cell is " + currentCell);

        //console.log("FINAL CHECK in location: " + itemWithinLocation + ", time: " + itemWithinTime);

        //If has location and is within time and date limits, check it exists in DOM, otherwise ignore it
        if (document.getElementById(currentCell) && itemWithinLocation == true && itemWithinTime == true){
        //if (document.getElementById(currentCell)){
             
            //console.log("GEtting gloss"); 
                    
            //Set up the cell. It must have gloss, but may not have an image
            if($(this).find('gloss')) {
                gloss = $(this).find('gloss').text();
            } else {
                gloss = "";
            }

            // If there is a representation node
            if ($(this).find('enable_image').text() == 1 || $(this).find('representation').text() !== "none") {
                //console.log("Image is " + $(this).find('representation').text());
                
                if(!localStorage["msp_userid"]){
                    //Use sample images on file system
                    //console.log("Use local file system");
                    currentImage = "<img class=\"representation\" src=\"/images/symbols/" + $(this).find('representation').text() + "\" />";
                    currentId = "#" + currentCell;

                } else {
                
                    //Use images stored in db
                    //console.log("Want to set image");
                    setImage($(this).find('representation').text(), currentCell);
                    
                }

            }

            //Must have an onclick event, if gloss or representation are present
            //Now we can set the onclick event
            if(!(currentImage == "" && gloss == "")) {

                if($(this).find('action').length > 0) {

                    //Set the click event
                    var str = $(this).find('action').text();

                    //Remove escaping character \ inserted by the api
                    var k = str.replace(/\\/g, "");

                    //Add hidden field to store cell click action and parameters
                    newHTML = '<input type="hidden" value="' + k + '" />';

                    //Add the event listener, same for all. This function deals with the different events.
                    //Only do this if using direct selection
                    if (localStorage["msp_switch_type"] == "direct"){
                        document.getElementById(currentCell).addEventListener('click', cellClickHandler);    
                    }
                    
                } else {
                    //Remove event listener if the cell is empty
                    document.getElementById(currentCell).removeEventListener('click', cellClickHandler);
                }
            }  

            // If there is a representation node
            if($(this).find('style').text()) {
                document.getElementById(currentCell).className = $(this).find('style').text();
            } else {
                document.getElementById(currentCell).className = "";
            }
        
            //Add the gloss to the html to add. Could do this in jquery
            newHTML += "<div class=\"Gloss\">" + gloss + "</div>";

            //If the element exists in the selection set table, set it
            if(document.getElementById(currentCell)) {
                document.getElementById(currentCell).innerHTML = newHTML;
                
                //If not signed in and using images from db - an an image is required, prepend it now
                if(!localStorage["msp_userid"] && $(this).find('enable_image').text() == 1){
                    //console.log("Current id is " + currentId);
                    //console.log("Current id " + currentId);
                    //console.log("Current symbol " + currentImage);
                    $(currentId).prepend(currentImage);    
                    //$(currentCell).prepend(currentImage);    
                }
                
                
            }
        }
    });
}

function checkWithinTime(startDate, endDate, startTime, endTime){
    
    var today = new Date();

    //Try to convert dates
    var startD = new Date(startDate);
    var endD = new Date(endDate);
    var startT = new Date(startTime);
    var endT = new Date(endTime);

    var withinDateRange;
    var withinTimeRange;

    //Check start date first
    if (!(startDate == "0000-00-00 00:00:00") || !(endDate == "0000-00-00 00:00:00")){
        

        if ((today >= startD) && (today<= endD)){
            
            //console.log("SHOW IT PLEASE")
            withinDateRange = true;
        } else {
            //console.log("ITS FALSE - HIDE IT");
            withinDateRange = false;
        }

    } else {
        //startDate not set, so display it
        withinDateRange = true;
    }

    //Check start time first
    if (!(startTime == "0000-00-00 00:00:00") || !(endTime == "0000-00-00 00:00:00")){

        //Get the time portion of today's time
        timeStr = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        //Measure from 1/1/1970 using time
        var currentTime = new Date("1970-01-01 " + timeStr);

        if ((currentTime.getTime() <= endT.getTime()) && (currentTime.getTime() > startT.getTime())){
            
            //console.log("SHOW IT PLEASE")
            withinTimeRange = true;
        } else {
            //console.log("ITS FALSE - HIDE IT");
            withinTimeRange = false;
        }

    } else {
        //Show at any time
        withinTimeRange = true;
    }

     //console.log("DATE CHECKED - SHOW? " + withinDateRange);
     //console.log("TIME CHECKED - SHOW? " + withinTimeRange);

    if ((withinTimeRange == true) && (withinDateRange == true)) {

        return true;

    } else {

        return false;
    }
}

function playSound(soundFile) {

    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', mediaPath + soundFile);
    audioElement.play();

}

function runEvent(id){
    
    //console.log("ID is " + id);
    //Should probably try and combine with cellClickHandler()

    //This seems a pain in the *rs* to do it this way, and I'm not sure I'm doing it right, but
    //just need to get it to work.

    if (id=="messageWindow"){
        //Speak the message window
        speakMessageWindow();
    
    } else {
        //Do the cell action 
        selector = "#" + id + " input";
        var k = $("#" + id + " input").val();

        if (k) {
            //If there is a value
            var l = k.split("(");
            var m = l[1].replace(")", "");
            var m = m.replace(/\'/g, "");

            //Need to use switch statement to set the event listener for item click.
            //Some also need the parameters setting too.
            switch(l[0]) {

                case "loadSelectionSet":
                    loadSelectionSet(m);
                    break;
                case "speakMessageWindow":
                    speakMessageWindow();
                    break;
                case "clearMessageWindow":
                    clearMessageWindow();
                    break;
                case "speakMessage":
                    speakMessage(m);
                    break;
                case "addToMessageWindow":
                    //Need to split the parameter into its three parts
                    var s = m.split(",");
                    addToMessageWindow(s[0],s[1],s[2]);
                    break;
            }
        }
    }
}

function scanGrid(){

    scanCurrentSelector = ".block";
    var scanDelay = localStorage["msp_switch_interval"] * 1000;

    scanTimer = setInterval(function(){
            scanBlocks()
        }, scanDelay);

}

function twoSwitchScan(){
    scanCurrentSelector = ".block";
    scanBlocks()
    
}

function scanAdvance(){
    
    //Reset scan counter ready for restart;
    scanCurrentChild = 0;
    scanRepeats = 0;

    console.log("Running function scanAdvance, scanCurrentSelector = " + scanCurrentSelector);

    //If scanning a table
    if (scanCurrentSelector.indexOf("tbody") >= 0) {
        //Check if column scanning
        //alert("Currently selected tbidy");
        scanCurrentSelector = scanCurrentSelector + " tr:nth-child(" + ($(".scan").index() + 1) + ")";

    } else {
        //Scan rows
        //alert("No tbody");
        //console.log("Scanning rows");
        scanCurrentSelector = "#" + $(".scan").attr("id") + " tbody";
        
        //if ($(scanCurrentSelector).children().length < 2) {
        //    scanCurrentSelector = scanCurrentSelector + " tr:nth-child(1)";
        //}

        if ($(scanCurrentSelector).children().length < 2) {
            scanCurrentSelector = scanCurrentSelector + " tr";
        }
    }

    if ($(".scan").attr("id")) {
            console.log("Current item got id of " + $(".scan").attr("id") + ". Run event?");
        //If the current selection has an id and is not selectionSet of messageWindow, run the event and restart scan
        if (($(".scan").attr("id") != "fixedRows") && ($(".scan").attr("id") != "selectionSet")) {
            runEvent($(".scan").attr("id"));
            scanCurrentSelector = ".block";
            scanCurrentChild = 0;
        }
    }
}


function scanBlocks(){
    
    //Need to prevent scanning of empty items
    console.log ("Running scanBlocks. Current selector " + scanCurrentSelector);

    //alert("Scan current selector is " + scanCurrentSelector + "; Has " + $(scanCurrentSelector).children().length + " children");

    //Remove any previously selected items
    $(".scan").removeClass("scan");

    //Check for number of body elements
    
    if ($(scanCurrentSelector).children().length > 1){
        
        //Iterate through body children
        for (i = 0; i < $(scanCurrentSelector).children().length; i++) {
            console.log("i is " + i);
            if (i == scanCurrentChild){
                //Add the class
                if(scanCurrentSelector==".block"){
                    $('.block').children().eq(i).addClass("scan");
                    console.log("Adding scan class to div. There are " + $('.block').children().length + " children");
                } else {
                    $(scanCurrentSelector).children().eq(i).addClass("scan");
                    //alert("Adding scan class currentSelector scan");
                }
            } else {
                //Remove the class
                if (scanCurrentSelector==".block"){
                    $('.block').children().eq(i).removeClass("scan");
                } else {
                    $(scanCurrentSelector).children().eq(i).removeClass("scan");
                }
            }
        }

        scanCurrentChild += 1;

        //Reset counter back to zero if reached the end
        if (scanCurrentChild == $(scanCurrentSelector).children().length){
            //Reset current child back to beginning
            //alert("Resetting");
            scanCurrentChild = 0;
            //Add one to scanRepeats counter                        
            scanRepeats += 1;
        }

    } else {
        //There's only a selectionSet so scan that
        scanCurrentSelector = "#selectionSet tbody";
        scanCurrentChild = 0;
        
    }

    //console.log("Scan Repeats " + scanRepeats);
    if ((scanRepeats + 1) > maxScanRepeats){

        //Reset to scan body to start block scanning again
        scanCurrentSelector = ".block";
        scanRepeats = 0;

    }

    //alert("Scan blocks complete - scanCurrentSelector: " + scanCurrentSelector);

    //Remove the container bit
    //scanCurrentSelector = scanCurrentSelector.replace("Container", "");

    //alert("Scan blocks complete - scanCurrentSelector: " + scanCurrentSelector);
    
}

function scanSelectStage(){
    
    //Move the scan on a single stage, eg. after second switch press

    console.log("Pressed 2 - second switch");

    //Reset scan counter ready for restart;
    scanCurrentChild = 0;
    scanRepeats = 0;

    //If scanning a table
    if (scanCurrentSelector.indexOf("tbody") >= 0) {
    
        //alert("tbody there: " + scanCurrentSelector);
        
        //Check if column scanning
        scanCurrentSelector = scanCurrentSelector + " tr:nth-child(" + ($(".scan").index() + 1) + ")";

    } else {
        //Scan rows

        //alert("no tbody");
        scanCurrentSelector = "#" + $(".scan").attr("id") + " tbody";

        //alertscanCurrentSelector);

        if ($(scanCurrentSelector).children().length < 2) {
            scanCurrentSelector = scanCurrentSelector + " tr:nth-child(1)"
        }

        //alert("Final " + scanCurrentSelector);

    }

    if ($(".scan").attr("id")) {
        console.log("Current item got id of " + $(".scan").attr("id") + ". Run event?");
        //If the current selection has an id and is not selectionSet of messageWindow, run the event and restart scan
        if (($(".scan").attr("id") != "fixedRows") && ($(".scan").attr("id") != "selectionSet")) {
            runEvent($(".scan").attr("id"));
            scanCurrentSelector = ".block";
            scanCurrentChild = 0;
        }
    }
    scanBlocks();
}

function setImage(url,grid){
    
    imageUrl = symbolRoot + url
    //var m = l[1].replace(")", "");
    imageUrl = imageUrl.replace("/images/symbols/250/","");

    //Action dropbox files - update this
     imageUrl = imageUrl.replace ("https://mespee.chhttps:", "https:");

     imageUrl = imageUrl.replace ("/150/", "/250/");

    //Build the sql
    var sql = 'SELECT * FROM images WHERE path = "' + imageUrl + '"';
    var currentImage;





    //Decide whether to display the image
    //Do a check to see if image is licensed
            //console.log("Preferred symbolset is " + localStorage["msp_preferredSs"])
            
            //var str = "Hello world, welcome to the universe.";
            

            var showImage;

            //console.log("n is " + n);

            //Check if dropbox image
            if (imageUrl.indexOf("dropboxusercontent") >= 0){
                console.log(imageUrl + " is a dropboxfile - show it");
                showImage = true;
            } else {

                var n = imageUrl.indexOf("/ss/") + imageUrl.indexOf("/wi/") + imageUrl.indexOf("/me/");

                //It's a licensed symbol set, check if it's licensed
                if (n >= 0){
                
                    //Using a symbol set that requires a license

                    //Check if user's preferred symbols set in url, show it
                    //String to test
                    var k = "/" + localStorage["msp_preferredSs"] + "/";

                    if (imageUrl.indexOf(k) < 0){
                    
                        //Symbol not licensed.
                        //console.log("Symbol not licensed, dont show it");
                        showImage = false;

                    } else {
                    
                        //console.log("Symbol licensed, show it");
                        showImage = true;

                    }                    
                } else {

                    //Symbol does not require a license
                    console.log(imageUrl + " does not need license - show it");
                    showImage = true;
                }
            }


    if (showImage == true){
        db.transaction(function(tx) {

            //Perform the query
            tx.executeSql(sql, [], function(tx, results) {

                if(results.rows.length>0){
                    //If rows returned, it image found, use it
                    currentImage = "<img class=\"representation\" src=\"" + results.rows.item(0).image_blob + "\" />";

                }else{
                    //If not, say so
                    currentImage = "";

                }
                //Display the image
                var cell = "#" + grid;
            
                $(cell).prepend(currentImage);
            
            });

        });

    }

}

function setFixedGrid() {

    //Possibly need to do a check for overlap as this can make the page look a mess.
    //Set up the table
    document.getElementById("selectionSet").innerHTML = buildTable("selectionSetTable", g.getElementsByTagName("gridRows")[0].childNodes[0].nodeValue, g.getElementsByTagName("gridColumns")[0].childNodes[0].nodeValue,1);

    //Sort throught MergedCells
    x = g.getElementsByTagName("mergedCell");
    for (i = 0; i < x.length; i++) {
        k = x[i].attributes.getNamedItem("id").value;
        idElements = k.split("-")
        mergedCellRow = idElements[0];
        mergedCellColumn = idElements[1];

        //Change the current row value from letter to a number
        mergedCellRow = getNumericRowRef(mergedCellRow);

        //Implement the row span if there is one
        document.getElementById(k).rowSpan = x[i].attributes.getNamedItem("rows").value
        document.getElementById(k).colSpan = x[i].attributes.getNamedItem("columns").value

        //Hide unwanted cells from column span
        //If there are merged columns
        //This bit just deals with the first row
        if (x[i].attributes.getNamedItem("columns").value > 1) {
            for (p = 1; p <= x[i].attributes.getNamedItem("columns").value - 1; p++) {
                currentColumn = Number(mergedCellColumn) + p;
                cellToHideId = rowRefs[mergedCellRow] + "-" + currentColumn;
                document.getElementById(cellToHideId).style.display = 'none';
            }
        }

        //Hide unwanted cells from row span
        //If there are merged rows
        //Don't forget to ignore first row, this has already been dealt with
        if (x[i].attributes.getNamedItem("rows").value > 1) {
            for (q = 1; q < x[i].attributes.getNamedItem("rows").value; q++) {
                currentRow = rowRefs[mergedCellRow + q];
                //Now need to loop through the columns
                for (p = 0; p < x[i].attributes.getNamedItem("columns").value; p++) {
                    currentColumn = Number(mergedCellColumn) + p;
                    cellToHideId = currentRow + "-" + currentColumn;
                    document.getElementById(cellToHideId).style.display = 'none';
                }
            }
        }
    }
    //Get the row height before content inserted into cells - normally equally spaced
	//Can change depending on the height of content that's been inserted.
    rowHeight = document.getElementById('selectionSetTable').offsetHeight/document.getElementById('selectionSetTable').rows.length;
    for (r = 0; r < document.getElementById('selectionSetTable').rows.length; r++){
        rowHeight = 100 / document.getElementById('selectionSetTable').rows.length;
        //alert("ROw height is " + rowHeight);
    	document.getElementById('selectionSetTable').rows[r].style.height = rowHeight + "%";
    }
}

function setFlexibleGrid() {
    //alert("Setting flexible");
    console.log("Setting flexible grid");
	var SCROLL_BAR_HEIGHT = 7;
	var OPERA_SELECTIONSET_HEIGHT_REDUCTION = 5;
	var OPERA_SELECTIONSET_TABLE_HEIGHT_REDUCTION = 3;
	var MSIE_FIREFOX_SELECTIONSET_HEIGHT_REDUCTION = 2;	//move this to a settings section

    document.getElementById("selectionSet").className = "hideVerticalScroll";
    fixedRowRowQty = g.getElementsByTagName("fixedCells")[0].attributes.getNamedItem("rows").value
    fixedRowColumnQty = g.getElementsByTagName("fixedCells")[0].attributes.getNamedItem("columns").value    
    minimumCellQuantity = g.getElementsByTagName("gridCells")[0].childNodes[0].nodeValue;
    
	//Set the starting row for the main grid if there are fixedRows
	startingRow = Number(fixedRowRowQty) + 1;

    //Populate the Fixed Rows
    document.getElementById("fixedRows").innerHTML = buildTable("fixedRowTable", fixedRowRowQty, fixedRowColumnQty,1);

    columnProportion = g.getElementsByTagName("columnProportion")[0].childNodes[0].nodeValue;
 
    //If there's a rowMinHeight, might want horizontal scroll
    if (g.getElementsByTagName("rowMinHeight").length>0) {

        rowMinimumHeight = g.getElementsByTagName("rowMinHeight")[0].childNodes[0].nodeValue;

        //Sort out the selectionSet
        minimumRows = Math.floor(document.getElementById("selectionSet").offsetHeight/ rowMinimumHeight);

        //Check first to see if the ideal will fit on one screen
        //Need to see if cellQuantity is divisible by minimumRows, if not find nearest value that is

        columnQuantity = Math.ceil(minimumCellQuantity / minimumRows)
        columns = columnQuantity;
        //Set the grid
        document.getElementById("selectionSet").innerHTML = buildTable("selectionSetTable", minimumRows, columnQuantity,startingRow);
        rowHeight = document.getElementById('selectionSetTable').rows[0].offsetHeight;
        
        columnWidth = rowHeight * columnProportion;

        //Also this bit below, need to set column width, or possibly use CSS to set table width to allow
        //spread across whole screen in Opera and Firefox
        if ((columnWidth * columnQuantity) > document.getElementById("selectionSetTable").offsetWidth) {
            console.log("Table wider than screen");
            //The grid width is larger than the display width
            document.getElementById("selectionSetTable").style.width = columnWidth * columnQuantity + "px";
            
            //Possibly need to adjust the selection set height to take account of scroll bar height

            str = navigator.userAgent;

			if (str.search("Chrome")>=0 || str.search("Opera")>=0){
				
			    var table = document.getElementById("selectionSetTable");

                for (var i = 0, row; row = table.rows[i]; i++) {
			        //table.rows[i].style.height = rowHeight + "px"
			        console.log("setting row height again, as scroll bar reqd");
			    }

			    selectionSetTableHeight = document.getElementById('selectionSetTable').offsetHeight - SCROLL_BAR_HEIGHT;
				document.getElementById("selectionSetTable").style.height = selectionSetTableHeight + "px";
				console.log("Selection Set Height: " + selectionSetTableHeight);
			}
			if (str.search("Opera")>=0){ 
				//Need to tweak in Opera so whole scroll bar is visible 
				document.getElementById("selectionSet").style.height = document.getElementById('selectionSet').offsetHeight - OPERA_SELECTIONSET_HEIGHT_REDUCTION;
				document.getElementById("selectionSetTable").style.height = document.getElementById('selectionSetTable').offsetHeight - OPERA_SELECTIONSET_TABLE_HEIGHT_REDUCTION;				
 			}
 
 			if (str.search("MSIE")>=0 || str.search("Firefox")>=0){
				//var adjustedSelectionSetHeight = document.getElementById("messageWindow").offsetHeight + document.getElementById("fixedRows").offsetHeight 
		        var adjustedHeight = document.getElementsByTagName('body')[0].clientHeight - document.getElementById("messageWindow").offsetHeight - document.getElementById("fixedRows").offsetHeight - MSIE_FIREFOX_SELECTIONSET_HEIGHT_REDUCTION;
				document.getElementById("selectionSet").style.height = document.getElementsByTagName('body')[0].clientHeight - document.getElementById("messageWindow").offsetHeight - document.getElementById("fixedRows").offsetHeight - MSIE_FIREFOX_SELECTIONSET_HEIGHT_REDUCTION;
			} 
            document.getElementById("selectionSet").className = "showHorizontalScrollbar";            
        } else {
            //The grid is smaller than the display width, remove the horizontal scroll bar
            document.getElementById("selectionSet").className = "hideHorizontalScrollbar";
        }
    }

    //Check if we want to set vertical or horizontal scroll

    //If there's a columnMinWidth, may want a vertical scroll
    if (g.getElementsByTagName("columnMinWidth").length > 0) {
        columnMinimumWidth = g.getElementsByTagName("columnMinWidth")[0].childNodes[0].nodeValue;

        //Sort out the selectionSet
        minimumColumns = Math.floor(document.getElementById("selectionSet").offsetWidth / columnMinimumWidth);

        //Check first to see if the ideal will fit on one screen
        //Need to see if cellQuantity is divisible by minimumRows, if not find nearest value that is

        rowQuantity = Math.ceil(minimumCellQuantity / minimumColumns)
        
        //Set the grid
        document.getElementById("selectionSet").innerHTML = buildTable("selectionSetTable", rowQuantity, minimumColumns, startingRow);

        columnWidth = document.getElementById('selectionSetTable').rows[0].cells[0].offsetWidth;
        rowHeight = columnWidth / columnProportion

        //Also this bit below, need to set column width, or possibly use CSS to set table width to allow
        //spread across whole screen in Opera and Firefox
        if ((rowHeight * rowQuantity) > document.getElementById("selectionSetTable").offsetHeight) {

            //need to set individual row heights, rather than overall table heights so rows
            //cannot stretch
            var table = document.getElementById("selectionSetTable");
            for (var i = 0, row; row = table.rows[i]; i++) {
                table.rows[i].style.height = rowHeight + "px"
                //console.log("Row " + i);
            }
            document.getElementById("selectionSet").className = "hideVerticalScrollbar";
        } else {
        	displaySystemMessage('The grid is smaller than the display height, remove the vertical scroll bar','systemMessageInformation')
        }
    }
}

function setPage() {
    //console.log("Setting page");
    setTemplate();
  
}

function setSwitch(sw){
    
    alert("want to set sw" + sw);
}

function setTemplate() {

    var vocaburi = "selectionsets/?vocabulary_id=" + localStorage["msp_vocab"];
    var layouturi;

    //Establish layout uri for selectionset
    $(localStorage[vocaburi]).find('selectionset').each(function()
    {
        if($(this).find('name').text() == "Home")
        {
            layouturi = "layouts/" + $(this).find('layout_id').text()   
        }
    });

    //alert("Vocab: " + vocaburi);
    //alert("Layout: " + layouturi);

    //console.log(layouturi);
    parsedXML = $.parseXML(localStorage[layouturi]);
    
    g = $.parseXML("<document>" + $(parsedXML).find('xml').text() + "</document>");

	//Set up the page element. They will be set as the order they are in the xml
	e = g.getElementsByTagName("pageElement");
	for(j = 0; j < e.length; j++)
	{
	    pageElement = e[j].childNodes[0].nodeValue;
	    //createElement("body", pageElement);
	    
        height = e[j].getAttribute("height");
        //alert ("Height of " + pageElement + " is " + height);
        
        //Create containing element
        createElement("body", pageElement + "Container");

        //Create element to be used
        var newdiv = document.createElement("div");
        newdiv.setAttribute("id", pageElement);

        document.getElementById(pageElement + "Container").appendChild(newdiv);
        //Set the element height
        document.getElementById(pageElement + "Container").style.height = height + "%";
        //Set a class
        document.getElementById(pageElement + "Container").className = "block";

        //console.log("Added element: " + pageElement);
	    if(pageElement != "selectionSet")
	    {
	        //console.log("Not selection set");
	        //console.log("Height is " + document.getElementById(pageElement).offsetHeight);
	        usedHeight += document.getElementById(pageElement).offsetHeight;

	    }
	}
	//console.log("Used height: " + usedHeight);

	gridType = g.getElementsByTagName("templateType")[0].childNodes[0].nodeValue;

    //alert($(parsedXML).find('xml').text());

	SelectionSetWidth = document.getElementById('selectionSet').offsetWidth;
	SelectionSetHeight = document.getElementById('selectionSet').offsetHeight;
	
    //alert("Gris type is " + gridType);
    switch(gridType)
	{
	    case "fixed":
	        setFixedGrid();
	        break;
	    case "flexible":
	        setFlexibleGrid();
	        break;
	    default:
	        break;
	}

	//Now load the selection set
	if(localStorage["msp_currentSS"])
	{
	    //Load the selection set
        loadSelectionSet(localStorage["msp_currentSS"]);
	} else
	{
	    displaySystemMessage('There is no selection set to load!', 'systemMessageWarning')
	    //alert('No selection set to load');	//Error message to go here.
	}

}

function speakMessage(message) {
    var options = {};

    options.voiceName = localStorage["msp_voice_name"];
    options.rate = parseInt(localStorage["msp_voice_rate"]);
    options.pitch = parseInt(localStorage["msp_voice_pitch"]); 			//0 to 2, increment 0.1
    options.volume = parseInt(localStorage["msp_voice_volume"]); 		//0 to 1, increment 0.1 or less

    if (localStorage["msp_voice_enqueue"] == "true") {
        options.enqueue = true;
    }

    chrome.tts.speak(message, options);

}

function speakMessageWindow(){
	//Need to make sure there is something to speak
	if(document.getElementById('messageWindowText')){
		speakMessage(document.getElementById('messageWindowText').innerHTML);
	}
	clearMessageWindow();	
}