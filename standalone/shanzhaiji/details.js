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
    if (!machineId) {
        machineId = 14852;
    }
    for (i = 0; i < machineList.length; i++) {
        var machine = machineList[i];
        if (machine.model_list_page_id == machineId) {
            processMachineConfig(machine);
        }
    }
}

function processMachineConfig(machine) {
    if (machine.valid_imgs_image) {
        $("#valid_imgs_image").attr('src', 'images/'+machine.valid_imgs_image);
        $("#valid_imgs_image").show();
    }

    $("#model_details_name").text(machine.model_details_name);
    $("#long_name").text(machine.long_name);
    $("#price").text(machine.price);
    $("#network").text(machine.network);
    $("#date").text(machine.date);
    $("#size").text(machine.size);
    $("#weight").text(machine.weight);
    $("#accessories").text(machine.accessories);
    $("#standby_time").text(machine.standby_time);
    $("#call_time").text(machine.call_time);
    $("#language").text(machine.language);
    $("#display").text(machine.display);
    $("#ringtone").text(machine.ringtone);
    $("#audio_playback").text(machine.audio_playback);
    $("#video_playback").text(machine.video_playback);
    $("#camera").text(machine.camera);
    $("#connectivity").text(machine.connectivity);
    $("#image_format").text(machine.image_format);
    $("#app_platform").text(machine.app_platform);
    $("#namecard").text(machine.namecard);
    $("#power_manager").text(machine.power_manager);
    $("#msg").text(machine.msg);
    $("#clock_alarm").text(machine.clock_alarm);
    $("#builtin_game").text(machine.builtin_game);
    $("#os").text(machine.os);
    $("#wifi").text(machine.wifi);
    $("#java").text(machine.java);
    $("#cpu").text(machine.cpu);
    $("#memory").text(machine.memory);
    $("#battery").text(machine.battery);
    $("#functions").text(machine.functions);
}

$(document).ready(function () {
    $.ajaxSetup({ cache: false });


    $.getJSON("shanzhaiji.json", processMachineJson);

});