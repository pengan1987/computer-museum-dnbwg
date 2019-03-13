var emuRunner = null;
var emuConfig = null;
var machineConfig = null;
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

function runDoxbox() {
    console.log("running dosbox");

    var emuArguments = [
        DosBoxLoader.emulatorJS(emuConfig.emulatorJS),
        DosBoxLoader.nativeResolution(emuConfig.nativeResolution.width, emuConfig.nativeResolution.height),
        DosBoxLoader.locateAdditionalEmulatorJS(function (filename) {
            if (emuConfig.fileLocations[filename]) {
                return emuConfig.fileLocations[filename]
            } else {
                return filename;
            }
        }),
        DosBoxLoader.startExe(machineConfig.startExe),
        DosBoxLoader.fileSystemKey(machineId)
    ]

    var fileParams = buildFileLoadParameters(DosBoxLoader);
    emuArguments = emuArguments.concat(fileParams);

    var emulator = new Emulator(document.querySelector("#emularity-canvas"), postRun, DosBoxLoader.apply(this, emuArguments));
    emulator.start({ waitAfterDownloading: true });
}

function runPC98Dosbox() {
    console.log("running pc98dosbox");

    var emuArguments = [
        PC98DosBoxLoader.emulatorJS(emuConfig.emulatorJS),
        PC98DosBoxLoader.emulatorWASM(emuConfig.emulatorWASM),
        PC98DosBoxLoader.nativeResolution(emuConfig.nativeResolution.width, emuConfig.nativeResolution.height),
        PC98DosBoxLoader.startExe(machineConfig.startExe),
        PC98DosBoxLoader.fileSystemKey(machineId)
    ];

    var fileParams = buildFileLoadParameters(PC98DosBoxLoader);
    emuArguments = emuArguments.concat(fileParams);

    var emulator = new Emulator(document.querySelector("#emularity-canvas"), postRun, PC98DosBoxLoader.apply(this, emuArguments));
    emulator.start({ waitAfterDownloading: true });
}

function runSAE() {
    console.log("running sae");
    var emuArguments = [
        SAELoader.model(emuConfig.driverName),
        SAELoader.nativeResolution(emuConfig.nativeResolution.width, emuConfig.nativeResolution.height),
        SAELoader.emulatorJS(emuConfig.emulatorJS),
        SAELoader.fileSystemKey(machineId)
    ];
    var fileParams = buildFileLoadParameters(SAELoader);
    emuArguments = emuArguments.concat(fileParams);
    emuArguments.push(
        SAELoader.rom(emuConfig.rom)
    );
    for (var i = 0; i < machineConfig.floppy.length; i++) {
        emuArguments.push(
            SAELoader.floppy(i, machineConfig.floppy[i])
        );
    }

    var emulator = new Emulator(document.querySelector("#emularity-canvas"), postRun, SAELoader.apply(this, emuArguments));

    emulator.start({ waitAfterDownloading: true });
}

function runMAME() {
    console.log("running mame");
    var emuArguments = [
        JSMAMELoader.driver(emuConfig.driverName),
        JSMAMELoader.nativeResolution(emuConfig.nativeResolution.width, emuConfig.nativeResolution.height),
        JSMAMELoader.emulatorJS(emuConfig.emulatorJS),
        JSMAMELoader.emulatorWASM(emuConfig.emulatorWASM),
        JSMAMELoader.fileSystemKey(machineId)
    ];

    var fileParams = buildFileLoadParameters(JSMAMELoader);
    emuArguments = emuArguments.concat(fileParams);

    for (var i = 0; i < machineConfig.peripherals.length; i++) {
        var peripheral = machineConfig.peripherals[i];
        emuArguments.push(
            JSMAMELoader.peripheral(peripheral.name, peripheral.value)
        );
    }

    var extraArgs = [];
    if (emuConfig.extraArgs) {
        extraArgs = extraArgs.concat(emuConfig.extraArgs);
    }
    if (machineConfig.extraArgs) {
        extraArgs = extraArgs.concat(machineConfig.extraArgs);
    }

    if (extraArgs.length > 0) {
        emuArguments.push(
            JSMAMELoader.extraArgs(extraArgs)
        );
    }

    var canvas = document.querySelector("#emularity-canvas");
    canvas.onclick = function () {
        canvas.focus();
        canvas.requestPointerLock();
    }

    var emulator = new Emulator(document.querySelector("#emularity-canvas"), postRun, JSMESSLoader.apply(this, emuArguments));
    emulator.start({ waitAfterDownloading: true });
}

function runPCE() {
    var emuArguments = [
        PCELoader.emulatorJS(emuConfig.emulatorJS),
        PCELoader.nativeResolution(emuConfig.nativeResolution.width, emuConfig.nativeResolution.height),
        PCELoader.fileSystemKey(machineId),
        PCELoader.locateAdditionalEmulatorJS(function (filename) {
            if (emuConfig.fileLocations[filename]) {
                return emuConfig.fileLocations[filename]
            } else {
                return filename;
            }
        }),
        PCELoader.model(emuConfig.driverName)
    ];

    var fileParams = buildFileLoadParameters(PCELoader);
    emuArguments = emuArguments.concat(fileParams);

    var extraArgs = [];
    if (emuConfig.extraArgs) {
        extraArgs = extraArgs.concat(emuConfig.extraArgs);
    }
    if (machineConfig.extraArgs) {
        extraArgs = extraArgs.concat(machineConfig.extraArgs);
    }
    if (extraArgs.length > 0) {
        emuArguments.push(
            PCELoader.extraArgs(extraArgs)
        );
    }

    var canvas = document.querySelector("#emularity-canvas");
    canvas.onclick = function () {
        canvas.requestPointerLock();
    }

    var emulator = new Emulator(document.querySelector("#emularity-canvas"), postRun, PCELoader.apply(this, emuArguments));
    emulator.start({ waitAfterDownloading: true });
}

function runNP2() {
    var emuArguments = [

        NP2Loader.nativeResolution(emuConfig.nativeResolution.width, emuConfig.nativeResolution.height),
        NP2Loader.emulatorJS(emuConfig.emulatorJS),
        NP2Loader.emulatorWASM(emuConfig.emulatorWASM),
        NP2Loader.fileSystemKey(machineId)
    ];

    var fileParams = buildFileLoadParameters(NP2Loader);
    emuArguments = emuArguments.concat(fileParams);

    var extraArgs = [];
    if (emuConfig.extraArgs) {
        extraArgs = extraArgs.concat(emuConfig.extraArgs);
    }
    if (machineConfig.extraArgs) {
        extraArgs = extraArgs.concat(machineConfig.extraArgs);
    }
    if (extraArgs.length > 0) {
        emuArguments.push(
            NP2Loader.extraArgs(extraArgs)
        );
    }

    var emulator = new Emulator(document.querySelector("#emularity-canvas"), postRun, NP2Loader.apply(this, emuArguments));
    emulator.start({ waitAfterDownloading: true });
}

function buildFileLoadParameters(someLoader) {
    var fileParams = [];
    if (emuConfig.mountFile) {
        for (var i = 0; i < emuConfig.mountFile.length; i++) {
            var file = emuConfig.mountFile[i];
            fileParams.push(
                someLoader.mountFile(
                    file.targetPath,
                    someLoader.fetchFile(file.title, file.source)
                )
            );
        }
    }

    if (emuConfig.mountZip) {
        for (var i = 0; i < emuConfig.mountZip.length; i++) {
            var file = emuConfig.mountZip[i];
            fileParams.push(
                someLoader.mountZip(
                    file.targetPath,
                    someLoader.fetchFile(
                        file.title,
                        file.source
                    ))
            );
        }
    }

    if (machineConfig.files) {
        for (var i = 0; i < machineConfig.files.length; i++) {
            var file = machineConfig.files[i];
            fileParams.push(
                someLoader.mountFile(
                    file.targetPath,
                    someLoader.fetchFile(file.title, file.source)
                )
            );
        }
    }

    if (machineConfig.zips) {
        for (var i = 0; i < machineConfig.zips.length; i++) {
            var zip = machineConfig.zips[i];
            fileParams.push(
                someLoader.mountZip(
                    zip.targetPath,
                    someLoader.fetchFile(
                        zip.title,
                        zip.source
                    ))
            );
        }
    }
    return fileParams;
}

function processMachineConfig(machine) {
    var emularityConfigURL = "emularity-config/" + machine.emularity + ".json";
    if (machine.emularity.indexOf("dosbox-websocket") === 0) {
        setupJoystick();
    }

    if (machine.emularity.indexOf("dosbox") === 0) {
        emuRunner = runDoxbox;
    }

    if (machine.emularity.indexOf("sae") === 0) {
        emuRunner = runSAE;
    }

    if (machine.emularity.indexOf("np2") === 0) {
        emuRunner = runNP2;
    }

    if (machine.emularity.indexOf("pc98dosbox") === 0) {
        emuRunner = runPC98Dosbox;
    }

    if (machine.emularity.indexOf("mame-") === 0) {
        emuRunner = runMAME;
    }

    if (machine.emularity.indexOf("pce-") === 0) {
        emuRunner = runPCE;
    }

    $.getJSON(emularityConfigURL, function (data) {
        emuConfig = data;
        newDataLoaded();
    });

    $.getJSON(machine.url, function (data) {
        machineConfig = data;
        newDataLoaded();
    });
}

function newDataLoaded() {
    if (emuConfig && machineConfig) {
        showIntroduction();
        emuRunner();
    }
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

function postRun() {
    console.log("Emulator started");
    var bodyWidth = $("body").width();
    if (bodyWidth < 600) {
        $("#mobile-tools").show();
        resizeCanvas();
    }
}

function resizeCanvas() {
    var bodyWidth = $("body").width();
    var canvasWidth = $("#emularity-canvas").width();
    var canvasHeight = $("#emularity-canvas").height();
    if (bodyWidth < canvasWidth) {
        //Resize canvas for mobile device
        var newHeight = Math.round(canvasHeight * bodyWidth / canvasWidth);
        $("#emularity-canvas").width(bodyWidth);
        $("#emularity-canvas").height(newHeight);
    }
}

function toggleMobileKeyboard() {
    var inputElement = document.getElementById("mobile-keyboard-helper");
    inputElement.style.visibility = 'visible'; // unhide the input
    inputElement.focus(); // focus on it so keyboard pops
}

function showIntroduction() {
    var introUrl = "document/pending.md";
    if (machineConfig.introduction) {
        introUrl = machineConfig.introduction;
    }
    var showdownConv = new showdown.Converter();
    showdownConv.setOption('tables',true);
    $.get(introUrl,
        function (data) {
            var htmlContent = showdownConv.makeHtml(data);
            $("#introduction").html(htmlContent);
        }
    );
}

function setupJoystick() {
    navigator.getGamepads_ = navigator.getGamepads;
    navigator.getGamepads = function () {
        var gamepadlist = navigator.getGamepads_();
        var pads = [];
        for (var i = 0; i < gamepadlist.length; i++) {
            pads[i] = (gamepadlist[i] !== null ? gamepadlist[i] : undefined);
        }
        return pads;
    }
}