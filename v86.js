function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

var config = {
    "bios_url": "",
    "vbios_url": "",
    "hdd_zip_url": "",
    "img_filename": "",
    "ram": 128,
    "vram": 8,
    "document": "",
    "img_filename": ""
}
function loadFS() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', config['hdd_zip_url'], true);
    xhr.responseType = 'arraybuffer';
    xhr.onprogress = function (e) {
        var loaded = Math.round(e.loaded / 1024) + " KB";
        var total = Math.round(e.total / 1024) + " KB";
        var loadingState = loaded + " / " + total;
        document.getElementById("loading_status").textContent = loadingState;
    };
    xhr.onload = function (e) {
        if (xhr.status === 200) {
            document.getElementById("loading_status").textContent = "";
            prepareFs(xhr.response);
        }
    }
    xhr.send();
}

function prepareFs(zipData) {
    var Buffer = BrowserFS.BFSRequire('buffer').Buffer;

    BrowserFS.configure({
        fs: "MountableFileSystem",
        options: {
            "/zip": {
                fs: "ZipFS",
                options: {
                    // Wrap as Buffer object.
                    zipData: Buffer.from(zipData)
                }
            }
        }
    }, function (e) {
        if (e) {
            // An error occurred.
            throw e;
        }

        // Otherwise, BrowserFS is ready to use!
        var fs = BrowserFS.BFSRequire('fs');
        fs.readdir('/', function (e, contents) {
            var diskBuffer = fs.readFileSync("zip/" + config["img_filename"]).buffer;
            loadv86(diskBuffer);
        });
    });
}

function loadv86(diskBuffer) {
    var emulator = window.emulator = new V86Starter({
        memory_size: config["ram"] * 1024 * 1024,
        vga_memory_size: config["vram"] * 1024 * 1024,
        screen_container: document.getElementById("screen_container"),
        bios: {
            url: config['bios_url']
        },
        vga_bios: {
            url: config['vbios_url'],
        },
        hda: {
            buffer: diskBuffer,
        },
        autostart: true,
    });
}

function showIntro() {
    var showdownConv = new showdown.Converter();
    var introUrl = config["document"];
    if (!introUrl)
        introUrl = "document/pending.md";
    $.get(introUrl,
        function (data) {
            var htmlContent = showdownConv.makeHtml(data);
            $("#introduction").html(htmlContent);
        });
}

$(document).ready(function () {
    var machineId = getUrlVars()["machine"];
    var remote_url = "v86-machine/" + machineId + ".json"
    config = $.ajax({
        type: "GET",
        url: remote_url,
        async: false,
        dataType: "json"
    }).responseJSON;
    showIntro();
    loadFS();
    var displayCanvas = document.getElementById("display_canvas");
    displayCanvas.onclick = function () {
        displayCanvas.requestPointerLock = displayCanvas.requestPointerLock || displayCanvas.mozRequestPointerLock;
        displayCanvas.requestPointerLock();
    }
});
