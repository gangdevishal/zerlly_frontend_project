import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunkMiddleware from "redux-thunk";
import rootReducer from "./reducers";
import { createLogger } from "redux-logger";
const loggerMiddleware = createLogger();

let middleware = [thunkMiddleware];

if (process.env.REACT_APP_NODE_ENV !== "production") {
  middleware = [...middleware, loggerMiddleware];
}

console.log("APP_ENV", process.env.REACT_APP_NODE_ENV);
const composeEnhancers =
  process.env.REACT_APP_NODE_ENV !== "production"
    ? composeWithDevTools(applyMiddleware(...middleware))
    : applyMiddleware(...middleware);

export const store = createStore(rootReducer, composeEnhancers);
