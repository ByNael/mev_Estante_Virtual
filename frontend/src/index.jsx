import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"

// Cria a raiz React no elemento com id "root" do index.html
const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
