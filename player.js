function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function processJson(data) {
    var machineList = data.machines;
    var machineid = getUrlVars()["machine"].replace('#', '');
    var playerFrame = document.getElementById("emuframe");
    playerFrame.onload = function () {
        playerFrame.contentWindow.focus();
    }
    var standaloneLink = $("#standalone-tab");
    for (i = 0; i < machineList.length; i++) {
        var machine = machineList[i];
        if (machine.id == machineid) {
            playerFrame.src = machine.url;
            standaloneLink.attr("href", machine.url);
            loadIntroduction(machine);
        }
    }
}

function loadIntroduction(machineConfig) {
    $("#player-intro").hide()
    var introUrl = "document/pending.md";
    if (machineConfig.introduction) {
        introUrl = machineConfig.introduction;
    }
    var showdownConv = new showdown.Converter();
    $.get(introUrl,
        function (data) {
            var htmlContent = showdownConv.makeHtml(data);
            $("#player-intro").html(htmlContent);
        }
    );
}

function matchFrameHeight() {
    var frameheight = document.body.clientHeight - 30;
    var iFrame = document.getElementById('emuframe');
    iFrame.height = frameheight;
}

$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    $.getJSON("machines.json", processJson);
    matchFrameHeight();
    $("#showIntro").click(function () {
        $(function () {
            $("#player-intro").dialog();
        });
    })
});

$(window).resize(function () {
    matchFrameHeight();
});