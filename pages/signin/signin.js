var splashDuration = 5000;
 
document.addEventListener('DOMContentLoaded', function () {

    //Set style sheet based on screen size
    //If screen size greater than splash screen, use it
    //Otherwise, spread content on page
    if(window.innerWidth < 600 || window.innerHeight < 300) {
        var css = "css/splash_small.css";
        document.getElementById('splashStyle').href = css;

    }

    document.getElementById('username').addEventListener('focus', clear);
    document.getElementById('password').addEventListener('focus', clear);
    document.getElementById('username').addEventListener('blur', add);
    document.getElementById('password').addEventListener('blur', add);

    document.getElementById('authenticate').addEventListener('click', authUser);

});

function add(){
    //Add a default when input left empty
    if ($(this).val() == ""){
        $(this).val("Username");
    }
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
        url: 'https://mespee.ch/api/auth',
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

            //Set default symbolset
          //  alert("Symbolset is " + $(xml).find('default_symbolset').text());

            switch($(xml).find('default_symbolset').text()) {

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

            localStorage["msp_preferredSs"] = preferredSs;

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

            console.log("Signed in");
            redirectPage("/pages/options/options.html");

        },
        error: function(xhr) {
            console.log("There was an error");
            xml = xhr.responseXML;
            $(xml).find('error').each(function() {
                alert("Your username or password were incorrect, please try again.")
            });
        }
    });
}

function clear(){
    //Clear default values when want to add value
    if ($(this).val() == "Username" || $(this).val() == "Password"){
        $(this).val("");
    }
}

function redirectPage(page) {

        document.location.href = page;
}