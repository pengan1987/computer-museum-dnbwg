
var machineId = "emularity";

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function processMachineJson(data) {
    var machineList = data.machines;
    machineId = getUrlVars()["machine"];
    for (i = 0; i < machineList.length; i++) {
        var machine = machineList[i];
        if (machine.id == machineId) {
            processMachineConfig(machine);
        }
    }
}

function processMachineConfig(machine) {
    console.log(machine);
    var x3dbrowser = X3D.getBrowser("#xiteview");
    if (!machine.hasgravity && x3dbrowser) {
        x3dbrowser.addBrowserCallback(X3D.X3DConstants.INITIALIZED_EVENT, function () {
            x3dbrowser.setBrowserOption("Gravity", 0);
        });
    }
    $("#xiteview").attr("src", machine.url);

    showIntroduction(machine.introduction);
}

$(document).ready(function () {
    $.ajaxSetup({ cache: false });

    var machineParam = getUrlVars()["machine"];
    var emularityParam = getUrlVars()["emularity"];
    var machineUrlParam = getUrlVars()["machineurl"];

    if (machineParam && machineParam.length > 0) {
        $.getJSON("machines.json", processMachineJson);
    } else if (emularityParam && machineUrlParam.length > 0) {
        machineId = emularityParam + "-" + machineUrlParam.replace(/[.:#\/\\]/g, '-');
        var dummyMachineConfig = {
            "machineId": machineId,
            "emularity": emularityParam,
            "url": machineUrlParam
        }
        console.log(dummyMachineConfig);
        processMachineConfig(dummyMachineConfig);
    }
});

function showIntroduction(introUrl) {
    if (!introUrl || introUrl == "") {
        introUrl = "../document/pending.md";
    }
    var showdownConv = new showdown.Converter();
    showdownConv.setOption('tables', true);
    $.get(introUrl,
        function (data) {
            var htmlContent = showdownConv.makeHtml(data);
            $("#introduction").html(htmlContent);
        }
    );
}