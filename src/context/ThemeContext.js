import { useState, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import ThemeToggle from "./components/ThemeToggle"; // Import the ThemeToggle
import { useTheme } from "./context/ThemeContext"; // Import the useTheme hook
import "./styles.css";

const App = () => {
  const { darkMode } = useTheme(); // Access darkMode from ThemeContext

  // Load tasks from localStorage or default to an empty array
  const [tasks, setTasks] = useState(
    JSON.parse(localStorage.getItem("tasks")) || []
  );

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  return (
    <div className={darkMode ? "dark-mode" : "light-mode"}>
      <div className="container">
        <h1>Task Manager</h1>
        <ThemeToggle />
        <TaskForm addTask={addTask} />
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
};

export default App;
