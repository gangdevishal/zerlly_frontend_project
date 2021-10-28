import React, {Fragment} from 'react'
import { Switch } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

import Login from "../components/Login";
import ForgotPassword from "../components/ForgotPassword";
import ResetPassword from "../components/ResetPassword";
//------
import Dashboard from "../components/Dashboard";
import Calender from "../components/Calender";
import Organizations from "../components/Organizations";
import Contacts from "../components/Contacts";
import Deals from "../components/Deals";
import Cancellations from "../components/Cancellations";
import Reports from "../components/Reports";

import NotFound from "../components/PageNotFound";
import Profile from '../components/Profile';
import Settings from '../components/Settings';

function AppRouter() {
  return (
    <Fragment>
      <Switch>      
        <PublicRoute restricted={true} exact path='/' component={Login} />
        <PublicRoute restricted={true} path="/login" component={Login} />
        <PublicRoute restricted={true} path="/forgot-password" component={ForgotPassword} />
        <PublicRoute restricted={true} path="/reset-password/:token" component={ResetPassword} />

        <PrivateRoute path="/dashboard" component={Dashboard} />      
        <PrivateRoute exact={false} path="/sales-calender" component={Calender} />
        <PrivateRoute path="/organizations" component={Organizations} />
        <PrivateRoute path="/contacts" component={Contacts} />
        <PrivateRoute path="/deals" component={Deals} />
        <PrivateRoute path="/cancellations" component={Cancellations} />
        <PrivateRoute path="/reports" component={Reports} />
        <PrivateRoute path="/profile" component={Profile} />
        <PrivateRoute path="/settings" component={Settings} />
        <PublicRoute component={NotFound} />
      </Switch>
    </Fragment>
  );
}

export default AppRouter;
