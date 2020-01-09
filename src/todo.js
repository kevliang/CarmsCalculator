//Document is the DOM can be accessed in the console with document.window.
// Tree is from the top, html, body, p etc.

//Problem: User interaction does not provide the correct results.
//Solution: Add interactivity so the user can manage daily tasks.
//Break things down into smaller steps and take each step at a time.


//Event handling, uder interaction is what starts the code execution.

var taskInput = document.getElementById("autocomplete");//Add a new task.
var addButton = document.getElementById("addbutton");//first button
var calculateButton = document.getElementById("calculate");//first button
var incompleteTaskHolder = document.getElementById("incomplete-tasks");//ul of #incomplete-tasks

$("#incomplete-tasks").sortable({
    scroll: false,
    update: function (event, ui) {
        var sortArr = [];
        $($("#incomplete-tasks li[data-location]")).each(function () {
            sortArr.push($(this).attr("data-location"));
        });
        map.markers.sort(function (a, b) {
            return sortArr.indexOf(a.airport.LocationID) - sortArr.indexOf(b.airport.LocationID);
        });
        map.markerDistance();
        updateLabelText();
    }
});
$("#incomplete-tasks").disableSelection();

//New task list item
var createNewTaskElement = function (taskString) {
    var listItem = document.createElement("li");
    //label
    var label = document.createElement("label");//label
    //button.delete
    var deleteButton = document.createElement("button");//delete button
    label.className = "mb-0";
    label.innerText = taskString;
    //Each elements, needs appending
    deleteButton.innerText = "Delete";
    deleteButton.className = "delete";
    //and appending.
    listItem.appendChild(label);
    listItem.appendChild(deleteButton);
    return listItem;
};

var addTask = function () {
    console.log("Add Task...");
    //Create a new list item with the text from the #new-task:
    var listItem = createNewTaskElement(taskInput.value);
    //Append listItem to incompleteTaskHolder
    incompleteTaskHolder.appendChild(listItem);
    bindTaskEvents(listItem, taskCompleted);
    taskInput.value = "";
    addMarker($(listItem));
};

//Delete task.
var deleteTask = function () {
    console.log("Delete Task...");
    var listItem = this.parentNode;
    var ul = listItem.parentNode;
    //Remove the parent list item from the ul.
    ul.removeChild(listItem);
    var index;
    for (var i in map.markers) {
        if (map.markers[i].airport.LocationID == listItem.getAttribute("data-location")) {
            index = i;
        }
    }
    map.markers.splice(index, 1);
    map.markerDistance();
    updateLabelText();
};

//Mark task completed
var taskCompleted = function () {
    console.log("Complete Task...");
    //Append the task list item to the #completed-tasks
    var listItem = this.parentNode;
    completedTasksHolder.appendChild(listItem);
    bindTaskEvents(listItem, taskIncomplete);
};


var taskIncomplete = function () {
    console.log("Incomplete Task...");
    //Mark task as incomplete.
    //When the checkbox is unchecked
    //Append the task list item to the #incomplete-tasks.
    var listItem = this.parentNode;
    incompleteTaskHolder.appendChild(listItem);
    bindTaskEvents(listItem, taskCompleted);
};

//The glue to hold it all together.

//Set the click handler to the addTask function.
addButton.addEventListener("click", function () {
    if (taskInput.value != "") {
        addTask();
    }
});

var bindTaskEvents = function (taskListItem, checkBoxEventHandler) {
    console.log("bind list item events");
    //select ListItems children
    var deleteButton = taskListItem.querySelector("button.delete");
    //Bind deleteTask to delete button.
    deleteButton.onclick = deleteTask;
    //Bind taskCompleted to checkBoxEventHandler
};

//cycle over incompleteTaskHolder ul list items
//for each list item
for (var i = 0; i < incompleteTaskHolder.children.length; i++) {
    //bind events to list items chldren(tasksCompleted)
    bindTaskEvents(incompleteTaskHolder.children[i], taskCompleted);
}

//add marker
function addMarker($li) {
    var airport = JSON.parse($('#autocomplete').attr("data-airport")) || {};
    $('#autocomplete').attr("data-airport", "");
    var marker = {
        airport: airport,
        x: airport.x,
        y: airport.y,
        startX: airport.x,
        startY: airport.y,
        fill: '#f47825',
        flying: $('#journeytype').val() == 1,
        current: true
    };
    $li.attr("data-location", airport.LocationID);

    map.markers.push(marker);
    map.currentAirport = airport;
    map.currentMarker = marker;

    map.markerDistance();
    updateLabelText();
}

//on calculate emission button click
calculateButton.addEventListener("click", function () {
    updateEmissionData();
    $("html, body").stop().animate({
        scrollTop: $("#emission-data").position().top
    }, 500);
});

function updateEmissionData() {
    $("#distancebetween [data-distance]").text(map.distance);
    map.calculateEmission();
    $("#co2emission [data-emission]").text(map.emission);
    $("#emission-data").show();
}

//update search label text
function updateLabelText() {
    $("#journeytype").val("1");
    if (map.markers.length <= 0) {
        $("#sort-it [for='autocomplete']").text("I'm starting my CaRMS Tour from");
        $("#journeytype").hide();
    } else {
        $("#sort-it [for='autocomplete']").text("My next city is");
        $("#journeytype").show();
    }
    if (map.markers.length > 1) {
        $("#calculate").show();
    } else {
        $("#calculate").hide();
        $("#emission-data").hide();
    }
    if ($("#emission-data").is(":visible")) {
        updateEmissionData();
    }
}








// Issues with usabiliy don't get seen until they are in front of a human tester.

//prevent creation of empty tasks.

//Shange edit to save when you are in edit mode.