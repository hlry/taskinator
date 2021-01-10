var taskIdCounter = 0;

var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var pageContentEl = document.querySelector("#page-content");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var tasks = [];


var taskFormHandler = function (event) {
  event.preventDefault();
  var taskNameInput = document.querySelector("input[name='task-name']").value;
  var taskTypeInput = document.querySelector("select[name='task-type']").value;

  // check if input values are empty strings
  if (!taskNameInput || !taskTypeInput) {
    alert("You need to fill out the task form!");
    return false;
  }

  // reset form fields for next task to be entered
  document.querySelector("input[name='task-name']").value = "";
  document.querySelector("select[name='task-type']").selectedIndex = 0;

  // check if task is new or one being edited by seeing if it has a data-task-id attribute
  var isEdit = formEl.hasAttribute("data-task-id");

  // has data attribute, so get task id and call function to complete edit process
  if (isEdit) {
    var taskId = formEl.getAttribute("data-task-id");
    completeEditTask(taskNameInput, taskTypeInput, taskId);
  }
  // no data attribute, so create object as normal and pass to createTaskEl function
  else {
    var taskDataObj = {
      name: taskNameInput,
      type: taskTypeInput,
      status: "to do"
    };

    createTaskEl(taskDataObj);
  }
};

var createTaskEl = function (taskDataObj) {
  // create list item
  var listItemEl = document.createElement("li");
  listItemEl.className = "task-item";

  // add task id as a custom attribute
  listItemEl.setAttribute("data-task-id", taskIdCounter);

  //add draggable attribute
  listItemEl.setAttribute("draggable", "true");

  // create div to hold task info and add to list item
  var taskInfoEl = document.createElement("div");
  // give it a class name
  taskInfoEl.className = "task-info";

  // add HTML content to div
  taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
  listItemEl.appendChild(taskInfoEl);

  var taskActionsEl = createTaskActions(taskIdCounter);

  // add entire list item to list
  tasksToDoEl.appendChild(listItemEl);
  listItemEl.appendChild(taskActionsEl);

  // add id to task data object 
  taskDataObj.id = taskIdCounter;
  // add object to tasks array - adds content to end of array
  tasks.push(taskDataObj);

  // save to localStorage
  saveTasks()

  // increase task counter for next unique id
  taskIdCounter++;
};

var createTaskActions = function (taskId) {
  // create container to hold elements
  var actionContainerEl = document.createElement("div");
  actionContainerEl.className = "task-actions";
  // create edit button
  var editButtonEl = document.createElement("button");
  editButtonEl.textContent = "Edit";
  editButtonEl.className = "btn edit-btn";
  editButtonEl.setAttribute("data-task-id", taskId);
  actionContainerEl.appendChild(editButtonEl);
  // create delete button
  var deleteButtonEl = document.createElement("button");
  deleteButtonEl.textContent = "Delete";
  deleteButtonEl.className = "btn delete-btn";
  deleteButtonEl.setAttribute("data-task-id", taskId);
  actionContainerEl.appendChild(deleteButtonEl);
  // create  change status dropdown
  var statusSelectEl = document.createElement("select");
  statusSelectEl.className = "select-status";
  statusSelectEl.setAttribute("name", "status-change");
  statusSelectEl.setAttribute("data-task-id", taskId);
  actionContainerEl.appendChild(statusSelectEl);
  // create status options
  var statusChoices = ["To Do", "In Progress", "Completed"];

  for (var i = 0; i < statusChoices.length; i++) {
    // create option element
    var statusOptionEl = document.createElement("option");
    statusOptionEl.textContent = statusChoices[i];
    statusOptionEl.setAttribute("value", statusChoices[i]);

    // append to select
    statusSelectEl.appendChild(statusOptionEl);
  }

  return actionContainerEl;
};

var taskButtonHandler = function (event) {
  // get target element from event
  var targetEl = event.target;

  // edit button was clicked
  if (targetEl.matches(".edit-btn")) {
    var taskId = targetEl.getAttribute("data-task-id");
    editTask(taskId);
  }
  // delete button was clicked
  else if (targetEl.matches(".delete-btn")) {
    var taskId = targetEl.getAttribute("data-task-id");
    deleteTask(taskId);
  }
};

// edit task identified by taskID - called in taskButtonHandler
var editTask = function (taskId) {
  // get task list item element
  var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

  // get content from task name and type
  var taskName = taskSelected.querySelector("h3.task-name").textContent;
  var taskType = taskSelected.querySelector("span.task-type").textContent;

  // write values of taskname and taskType to form to be edited
  document.querySelector("input[name='task-name']").value = taskName;
  document.querySelector("select[name='task-type']").value = taskType;

  // update form's button to reflect editing a task rather than creating a new one
  document.querySelector("#save-task").textContent = "Save Task";
  // set data attribute to the form with a value of the task's id so it knows which one is being edited
  formEl.setAttribute("data-task-id", taskId);
};

// delete task identified by taskID - called in taskButtonHandler
var deleteTask = function (taskId) {
  var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
  taskSelected.remove();

  // create new array to hold updated list of tasks
  var updatedTaskArr = [];

  // loop through current tasks
  for (var i = 0; i < tasks.length; i++) {
    // if tasks[i].id doesn't match the value of taskId, let's keep that task and push it into the new array
    if (tasks[i].id !== parseInt(taskId)) {
      updatedTaskArr.push(tasks[i]);
    }

    // save tasks to localStorage
    saveTasks()
  }

  // reassign tasks array to be the same as updatedTaskArr
  tasks = updatedTaskArr;
};

var completeEditTask = function (taskName, taskType, taskId) {
  // find the matching task list item
  var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

  // set new values
  taskSelected.querySelector("h3.task-name").textContent = taskName;
  taskSelected.querySelector("span.task-type").textContent = taskType;

  // loop through tasks array and task object with new content
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(taskId)) {
      tasks[i].name = taskName;
      tasks[i].type = taskType;
    }
  };

  // save tasks to localStorage
  saveTasks()

  // remove data attribute from form
  formEl.removeAttribute("data-task-id");
  // update formEl button to go back to saying "Add Task" instead of "Edit Task"
  document.querySelector("#save-task").textContent = "Add Task";

};

var taskStatusChangeHandler = function (event) {
  // find task list item based on event.target's data-task-id attribute
  var taskId = event.target.getAttribute("data-task-id");

  // find the parent task item element based on the id
  var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

  // get the currently selected option's value and convert to lowercase
  var statusValue = event.target.value.toLowerCase();

  if (statusValue === "to do") {
    tasksToDoEl.appendChild(taskSelected);
  } else if (statusValue === "in progress") {
    tasksInProgressEl.appendChild(taskSelected);
  } else if (statusValue === "completed") {
    tasksCompletedEl.appendChild(taskSelected);
  }

  // update tasks in tasks array
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(taskId)) {
      tasks[i].status = statusValue;
    }
  }

  // save tasks to localStorage
  saveTasks()
};

var dragTaskHandler = function (event) {
  if (event.target.matches("li.task-item")) {
    var taskId = event.target.getAttribute("data-task-id");
    event.dataTransfer.setData("text/plain", taskId);
  }
  // var taskId = event.target.getAttribute("data-task-id");
  // event.dataTransfer.setData("text/plain", taskId);
  // var getId = event.dataTransfer.getData("text/plain");
  // console.log("getId:", getId, typeof getId);
}

// defines the drop zone area
var dropZoneDragHandler = function (event) {
  var taskListEl = event.target.closest(".task-list");
  if (taskListEl) {
    event.preventDefault();
    taskListEl.setAttribute("style", "background: rgba(68, 233, 255, 0.7); border-style: dashed;");
  }
};

var dropTaskHandler = function (event) {
  event.preventDefault();
  var id = event.dataTransfer.getData("text/plain");
  var draggableElement = document.querySelector("[data-task-id='" + id + "']");
  var dropZoneEl = event.target.closest(".task-list");
  // dropZone.removeAttribute("style");

  // set status of task based on dropZone id
  var statusSelectEl = draggableElement.querySelector("select[name='status-change']");
  var statusType = dropZoneEl.id;

  // switch (statusType) {
  //   case "tasks-to-do":
  //     statusSelectEl.selectedIndex = 0;
  //     break;
  //   case "tasks-in-progress":
  //     statusSelectEl.selectedIndex = 1;
  //     break;
  //   case "tasks-completed":
  //     statusSelectEl.selectedIndex = 2;
  //     break;
  //   default:
  //     console.log("Something went wrong!");
  // }
  if (statusType === "tasks-to-do") {
    statusSelectEl.selectedIndex = 0;
  }
  else if (statusType === "tasks-in-progress") {
    statusSelectEl.selectedIndex = 1;
  }
  else if (statusType === "tasks-completed") {
    statusSelectEl.selectedIndex = 2;
  }
  dropZoneEl.removeAttribute("style");
  dropZoneEl.appendChild(draggableElement);

  // loop through tasks array to find and update the updated task's status
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(id)) {
      tasks[i].status = statusSelectEl.value.toLowerCase();
    }
  }
  // save tasks to localStorage
  saveTasks()
};

var dragLeaveHandler = function (event) {
  var taskListEl = event.target.closest(".task-list");
  if (taskListEl) {
    event.target.closest(".task-list").removeAttribute("style");
  }
  // if (taskListEl) {
  //   event.preventDefault();
  //   taskListEl.setAttribute("style", "background: rgba(68, 233, 255, 0.7); border-style: dashed;");
  // }
}

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

var loadTasks = function () {
  var savedTasks = localStorage.getItem("tasks");
  // console.log(tasks);
  if (savedTasks === null) {
    tasks = [];
    return false;
  }
  savedTasks = JSON.parse(savedTasks);
  // loop through savedTasks array
  for (i = 0; i < savedTasks.length; i++) {
    // pass each task object into the `createTaskEl()` function
    createTaskEl(savedTasks[i]);
  }
  // for (i = 0; i < tasks.length; i++) {
  //   task[i].setAttribute(id) = taskIDCounter;
  //   console.log(tasks[i]);
  //   var listItemEl = document.createElement("li");
  //   listItemEl.className = task - item;
  //   listItemEl.setAttribute("data-task-id") = task[i].id;
  //   listItemEl.setAttribute(draggable) = true;
  //   var taskInfoEl = document.createElement("div");
  //   taskInfoEl.className = task - taskInfoEl;
  //   taskInfoEl.innerHTML = "<h3 class='task-name'>" + tasks[i].name + "</h3><span class='task-type'>" + tasks[i].type + "</span>";
  //   tasksInfoEl.appendChild(listItemEl);

  //   var taskActionsEl = createTaskActions(tasks[i].id);
  //   taskActionsEl.appendChild(listItemEl);
  //   console.log(listItemEl);

  //   if (tasks[i].statusValue === "to do") {
  //     listItemEl.querySelector("select[name='status-change']").selectedIndex = 0;
  //     listItemEl.appendChild(tasksToDoEl);
  //   } else if (tasks[i].statusValue === "in progress") {
  //     listItemEl.querySelector("select[name='status-change']").selectedIndex = 1;
  //     listItemEl.appendChild(tasksInProgressEl);
  //   } else if (tasks[i].statusValue === "completed") {
  //     listItemEl.querySelector("select[name='status-change']").selectedIndex = 2;
  //     listItemEl.appendChild(tasksCompletedEl);
  //     taskIdCounter = taskIdCounter++
  //   }
  //   console.log(listItemEl)
  // }
}

loadTasks();

// Create a new task
formEl.addEventListener("submit", taskFormHandler);

// for edit and delete buttons
pageContentEl.addEventListener("click", taskButtonHandler);

// for changing the status
pageContentEl.addEventListener("change", taskStatusChangeHandler);

// for dragging
pageContentEl.addEventListener("dragstart", dragTaskHandler);
pageContentEl.addEventListener("dragover", dropZoneDragHandler);
pageContentEl.addEventListener("drop", dropTaskHandler);
pageContentEl.addEventListener("dragleave", dragLeaveHandler);

