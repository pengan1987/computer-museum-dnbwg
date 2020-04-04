function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var Module = {
  preRun: [],
  postRun: [
    function () {
      init_drag_and_drop();
    },
  ],
  print: (function () {
    return function (text) {
      text = Array.prototype.slice.call(arguments).join(' ');
      console.log(text);
    };
  })(),
  printErr: function (text) {
    text = Array.prototype.slice.call(arguments).join(' ');
    console.error(text);
  },
  canvas: (function () {
    var canvas = document.getElementById('canvas');
    canvas.addEventListener("webglcontextlost", function (e) { alert('FIXME: WebGL context lost, please reload the page'); e.preventDefault(); }, false);
    return canvas;
  })(),
  setStatus: function (text) {
    console.log("status: " + text);
  },
  monitorRunDependencies: function (left) {
    console.log("monitor run deps: " + left);
  },
};
window.onerror = function (event) {
  console.log("onerror: " + event);
};
function id(id) {
  return document.getElementById(id);
}
function init_drag_and_drop() {
  id('canvas').addEventListener('dragenter', load_dragenter, false);
  id('canvas').addEventListener('dragleave', load_dragleave, false);
  id('canvas').addEventListener('dragover', load_dragover, false);
  id('canvas').addEventListener('drop', load_drop, false);
}
function load_dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}
function load_dragleave(e) {
  e.stopPropagation();
  e.preventDefault();
}
function load_dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}
function load_drop(e) {
  e.stopPropagation();
  e.preventDefault();
  load_file(e.dataTransfer.files);
}
function load_file(files) {
  if (files.length > 0) {
    let file = files[0];
    if (file.size < (1024 * 1024)) {
      let reader = new FileReader();
      reader.onload = function (loadEvent) {
        console.log('file loaded!')
        let content = loadEvent.target.result;
        if (content) {
          console.log('content length: ' + content.byteLength);
          let uint8Array = new Uint8Array(content);
          let res = Module['ccall']('emsc_load_data',
            'int',
            ['string', 'array', 'number'],  // name, data, size
            [file.name, uint8Array, uint8Array.length]);
          if (res == 0) {
            console.warn('emsc_loadfile() failed!');
          }
        }
        else {
          console.warn('load result empty!');
        }
      };
      reader.readAsArrayBuffer(file);
    }
    else {
      console.warn('ignoring dropped file because it is too big')
    }
  }
}

var emulator_server = "http://dnbwg.cdn.bcebos.com/tinyemu/"

window.onload = function (event) {
  var machineTypes = { "cpc464": "cpc", "cpc6128": "cpc" }
  var machineKey = getParameterByName("type");
  var machineScript = window.document.createElement('script');
  machineScript.src = emulator_server + machineTypes[machineKey] + ".js";
  window.document.body.appendChild(machineScript);
  this.showIntroduction(machineKey);
}

function showIntroduction(machineKey) {
  var docs = {"cpc464":"document/cpc464.md"}
  
  var introUrl = "document/pending.md";
  if (docs[machineKey]) {
    introUrl = docs[machineKey];
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