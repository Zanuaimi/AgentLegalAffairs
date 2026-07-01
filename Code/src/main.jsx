import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// createRoot connects React to the <div id="root"> inside index.html.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

/*
BEGINNER DOCUMENTATION:

1. What is an entry file?
This is the first React file that runs when the app opens.

2. What is import?
import lets this file use code from another file or package.

3. What is <App />?
<App /> is a React component. It is the main component for the whole application.

4. What is React.StrictMode?
StrictMode helps developers find possible problems during development. It does not show anything on screen.
*/
