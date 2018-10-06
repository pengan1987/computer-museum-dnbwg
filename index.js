function processJson(data) {
    console.log(data);
    var machineList = data.machines;
    var base = $("#base-cell");
    var machineListContainer = $("#machine-list");
    for (i = 0; i < machineList.length; i++) {
        var machine = machineList[i];
        var clone = base.clone();
        var title = machine.name + " - " + machine.year;
        var playerlink = "player.html?machine=" + machine.id;
		if (machine.emularity){
			playerlink = "emularity.html?machine=" + machine.id;
		}
        clone.show();
        clone.attr("id", machine.id);
        clone.find("a").attr("href", playerlink);
        clone.find("figcaption").text(title)
        clone.find(".figure-img").attr("src", machine.image)
        machineListContainer.append(clone);
    }
}

$(document).ready(function () {
    console.log("ready!");
    $.getJSON("machines.json", processJson);
});

