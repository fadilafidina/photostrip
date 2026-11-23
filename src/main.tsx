import { createRoot } from "react-dom/client";
import { Router, Route, Switch } from "wouter";
import App from "./App";
import "./index.css";

// Honor vite's BASE_PATH so /kidcore works under a sub-path deploy too.
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <Router base={base}>
    <Switch>
      <Route path="/kidcore" nest>
        <App key="kidcore" theme="kidcore" />
      </Route>
      <Route>
        <App key="classic" theme="classic" />
      </Route>
    </Switch>
  </Router>,
);
