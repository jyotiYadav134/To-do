import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./App.css";

const initialColumns = {
  pending: { name: "Pending", items: [] },
  onProcess: { name: "On Process", items: [] },
  onHold: { name: "On Hold", items: [] },
  completed: { name: "Completed", items: [] },
};

function App() {
  const [columns, setColumns] = useState(initialColumns);
  const [taskText, setTaskText] = useState("");

  // Add task to Pending
  const addTask = () => {
    if (!taskText.trim()) return;
    const newTask = { id: Date.now().toString(), content: taskText };
    setColumns({
      ...columns,
      pending: {
        ...columns.pending,
        items: [...columns.pending.items, newTask],
      },
    });
    setTaskText("");
  };

  // Handle drag and drop
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // Prevent moving tasks from Completed
    if (source.droppableId === "completed") return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];

    const sourceItems = [...sourceCol.items];
    const destItems = [...destCol.items];

    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceCol, items: sourceItems },
      [destination.droppableId]: { ...destCol, items: destItems },
    });
  };

  // Calculate progress
  const totalTasks =
    columns.pending.items.length +
    columns.onProcess.items.length +
    columns.onHold.items.length +
    columns.completed.items.length;
  const progress =
    totalTasks === 0
      ? 0
      : Math.round((columns.completed.items.length / totalTasks) * 100);

  return (
    <div className="App">
      <h1>To-Do Board</h1>

      <div className="input-section">
        <input
          type="text"
          placeholder="Add new task..."
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
        />
        <button onClick={addTask}>Add</button>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}>
          {progress}%
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          {Object.entries(columns).map(([id, column]) => (
            <div className="column" key={id}>
              <h2>{column.name}</h2>
              <Droppable droppableId={id}>
                {(provided) => (
                  <div
                    className="droppable"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {column.items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className={`task ${
                              id === "completed" ? "completed-task" : ""
                            }`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {item.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;
