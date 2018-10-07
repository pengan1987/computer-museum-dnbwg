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

    for (var i = 0; i < machineConfig.zips.length; i++) {
        var zip = machineConfig.zips[i];
        emuArguments.push(
            DosBoxLoader.mountZip(
                zip.targetPath,
                DosBoxLoader.fetchFile(
                    zip.title,
                    zip.source
                ))
        );
    }

    var emulator = new Emulator(document.querySelector("#emularity-canvas"), null, DosBoxLoader.apply(this, emuArguments));
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

    if (emuConfig.mountFile) {
        emuArguments.push(
            PC98DosBoxLoader.mountFile(
                emuConfig.mountFile.targetPath,
                PC98DosBoxLoader.fetchFile(
                    emuConfig.mountFile.title,
                    emuConfig.mountFile.source
                ))
        );
    }

    if (emuConfig.mountZip) {
        emuArguments.push(
            PC98DosBoxLoader.mountZip(
                emuConfig.mountZip.targetPath,
                PC98DosBoxLoader.fetchFile(
                    emuConfig.mountZip.title,
                    emuConfig.mountZip.source
                ))
        );
    }

    for (var i = 0; i < machineConfig.files.length; i++) {
        var file = machineConfig.files[i];
        emuArguments.push(
            PC98DosBoxLoader.mountFile(
                file.targetPath,
                PC98DosBoxLoader.fetchFile(
                    file.title,
                    file.source
                ))
        );
    }

    for (var i = 0; i < machineConfig.zips.length; i++) {
        var zip = machineConfig.zips[i];
        emuArguments.push(
            PC98DosBoxLoader.mountZip(
                zip.targetPath,
                PC98DosBoxLoader.fetchFile(
                    zip.title,
                    zip.source
                ))
        );
    }

    var emulator = new Emulator(document.querySelector("#emularity-canvas"), null, PC98DosBoxLoader.apply(this, emuArguments));
    emulator.start({ waitAfterDownloading: true });
}

function runSAE() {
    console.log("running sae");
}

function runMAME() {
    console.log("running mame");
    var emuArguments = [
        JSMAMELoader.driver(emuConfig.driverName),
        JSMAMELoader.nativeResolution(emuConfig.nativeResolution.width, emuConfig.nativeResolution.height),
        JSMAMELoader.emulatorJS(emuConfig.emulatorJS),
        JSMAMELoader.emulatorWASM(emuConfig.emulatorWASM),
    ];
    if (emuConfig.mountFile) {
        for (var i = 0; i < emuConfig.mountFile.length; i++) {
            var file = emuConfig.mountFile[i];
            emuArguments.push(
                JSMAMELoader.mountFile(
                    file.targetPath,
                    JSMAMELoader.fetchFile(
                        file.title,
                        file.source
                    ))
            );
        }
    }
    if (emuConfig.mountZip) {
        for (var i = 0; i < emuConfig.mountZip.length; i++) {
            var file = emuConfig.mountZip[i];
            emuArguments.push(
                JSMAMELoader.mountZip(
                    file.targetPath,
                    JSMAMELoader.fetchFile(
                        file.title,
                        file.source
                    ))
            );
        }
    }

    for (var i = 0; i < machineConfig.files.length; i++) {
        var file = machineConfig.files[i];
        emuArguments.push(
            JSMAMELoader.mountFile(
                file.targetPath,
                JSMAMELoader.fetchFile(
                    file.title,
                    file.source
                ))
        );
    }

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
        canvas.requestPointerLock();
    }

    var emulator = new Emulator(document.querySelector("#emularity-canvas"), null, JSMESSLoader.apply(this, emuArguments));
    emulator.setScale(3).start({ waitAfterDownloading: true });
}

function processMachineConfig(machine) {
    var emularityConfigURL = "emularity-config/" + machine.emularity + ".json";
    if (machine.emularity.indexOf("dosbox") === 0) {
        emuRunner = runDoxbox;
    }

    if (machine.emularity.indexOf("sae") === 0) {
        emuRunner = runSAE;
    }

    if (machine.emularity.indexOf("pc98dosbox") === 0) {
        emuRunner = runPC98Dosbox;
    }

    if (machine.emularity.indexOf("mame") === 0) {
        emuRunner = runMAME;
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
        emuRunner();
    }
}

$(document).ready(function () {
    console.log("ready!");
    $.getJSON("machines.json", processMachineJson);
});

