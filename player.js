function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function processJson(data) {
    var machineList = data.machines;
    var machineid = getUrlVars()["machine"];
    var playerFrame = $("#emuframe");
    var standaloneLink = $("#standalone-tab");
    for (i = 0; i < machineList.length; i++) {
        var machine = machineList[i];
        if (machine.id == machineid) {
            playerFrame.attr("src", machine.url);
            standaloneLink.attr("href", machine.url);
        }
    }
    playerFrame[0].contentWindow.focus();
}

function matchFrameHeight(){
	  var frameheight = document.body.clientHeight - 30;
      var iFrame = document.getElementById('emuframe');
      iFrame.height = frameheight;
}

$(document).ready(function () {
    console.log("ready!");
    $.getJSON("machines.json", processJson);
	matchFrameHeight();
});

$(window).resize(function() {
	matchFrameHeight();
});