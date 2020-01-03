//Document is the DOM can be accessed in the console with document.window.
// Tree is from the top, html, body, p etc.

//Problem: User interaction does not provide the correct results.
//Solution: Add interactivity so the user can manage daily tasks.
//Break things down into smaller steps and take each step at a time.


//Event handling, uder interaction is what starts the code execution.

var taskInput=document.getElementById("autocomplete");//Add a new task.
var addButton=document.getElementsByTagName("button")[0];//first button
var incompleteTaskHolder=document.getElementById("incomplete-tasks");//ul of #incomplete-tasks


//New task list item
var createNewTaskElement=function(taskString){

	var listItem=document.createElement("li");

	//label
	var label=document.createElement("label");//label
	//button.delete
	var deleteButton=document.createElement("button");//delete button

	label.innerText=taskString;
	

	//Each elements, needs appending
	deleteButton.innerText="Delete";
	deleteButton.className="delete";

	//and appending.
	listItem.appendChild(label);
	listItem.appendChild(deleteButton);
	return listItem;
}

var addTask=function(){
	console.log("Add Task...");
	//Create a new list item with the text from the #new-task:
	var listItem=createNewTaskElement(taskInput.value);

	//Append listItem to incompleteTaskHolder
	incompleteTaskHolder.appendChild(listItem);
	bindTaskEvents(listItem, taskCompleted);
	taskInput.value="";

}

//Delete task.
var deleteTask=function(){
		console.log("Delete Task...");

		var listItem=this.parentNode;
		var ul=listItem.parentNode;
		//Remove the parent list item from the ul.
		ul.removeChild(listItem);

}

//Mark task completed
var taskCompleted=function(){
		console.log("Complete Task...");
	//Append the task list item to the #completed-tasks
	var listItem=this.parentNode;
	completedTasksHolder.appendChild(listItem);
				bindTaskEvents(listItem, taskIncomplete);
}


var taskIncomplete=function(){
		console.log("Incomplete Task...");
//Mark task as incomplete.
	//When the checkbox is unchecked
		//Append the task list item to the #incomplete-tasks.
		var listItem=this.parentNode;
	incompleteTaskHolder.appendChild(listItem);
			bindTaskEvents(listItem,taskCompleted);
}

//The glue to hold it all together.

//Set the click handler to the addTask function.
addButton.addEventListener("click",function(){
	if (taskInput.value !=""){
		addTask();
		}
});

var bindTaskEvents=function(taskListItem,checkBoxEventHandler){
	console.log("bind list item events");
//select ListItems children
	var deleteButton=taskListItem.querySelector("button.delete");
			//Bind deleteTask to delete button.
			deleteButton.onclick=deleteTask;
			//Bind taskCompleted to checkBoxEventHandler
}

//cycle over incompleteTaskHolder ul list items
	//for each list item
	for (var i=0; i<incompleteTaskHolder.children.length;i++){

		//bind events to list items chldren(tasksCompleted)
		bindTaskEvents(incompleteTaskHolder.children[i],taskCompleted);
	}








// Issues with usabiliy don't get seen until they are in front of a human tester.

//prevent creation of empty tasks.

//Shange edit to save when you are in edit mode.