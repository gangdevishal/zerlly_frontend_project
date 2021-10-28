import { combineReducers } from "redux";

import auth from "./authentication";
import alert from './alert';
import user from './user';
import setting from './setting'
import stage from "./stage";
import custom_table_field from "./custom_table_field";
import organisation from "./organisation";
import contact from "./contact";
import deal from "./deal";
import notification from "./notification";
import theme from "./theme";
import report from "./report";
import loader from "./loader";

const appReducer = combineReducers({
  auth,
  alert,
  user,
  setting,
  stage,
  custom_table_field,
  organisation,
  contact,
  deal,
  notification,
  theme,
  report,
  loader
})

const rootReducer = (state, action) => {
  if (action.type === 'AUTH_LOGOUT') {
    return appReducer(undefined, action)
  }
  return appReducer(state, action)
}

export default rootReducer;