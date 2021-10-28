import React, {useEffect, useState, useRef} from "react";
import { Link } from "react-router-dom";
import { authLogout } from "../../redux/actions/authentication";
import { getNotifications, getUnreadNotifications } from "../../redux/actions/notification";
import {useSelector, useDispatch} from "react-redux";
import moment from 'moment-timezone';

import $ from 'jquery';
import { Fragment } from "react";

import Toggle from "../themes/Toggler"
import { applyTheme } from '../../redux/actions/theme';
import { darkTheme, lightTheme } from '../themes/Themes';

function Header({page_title,counter,setHeaderButtonFunc}) {
  const state = useSelector((state) => state.auth);
  const [opened, setOpened] = useState(false);
  const wrapperRef = useRef(null);
  const dispatch = useDispatch();
  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  ); 
  const notifications = useSelector(
    (state) => (state.notification && state.notification.list) || []
  );
  const unread_notifications = useSelector(
    (state) => (state.notification && state.notification.unread_count) || ""
  );
  const { username, photo } = (state.user) ? state.user : '';
  const detail = useSelector(
    (state) => (state.deal && state.deal.single) || ""
  );
  const stages = useSelector((state) => state.stage.temp_list);
  const organization_notes = useSelector((state) => state.organisation.notes);
  const contact_notes = useSelector((state) => state.contact.notes);
  const deal_notes = useSelector((state) => state.deal.notes);
  const latest_theme = useSelector((state) => state.theme.latest_theme.mode);

  // handle click event of logout button
  const handleLogout = () => {
    dispatch(authLogout());
  };
  useEffect(() => {
    $("#sidebarToggleTop").on("click",function () {
      $(".sidebar").toggleClass("mini-sidebar");
    }); 
    return () => { 
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, false);
    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, []);

  useEffect(() => {
    // Get Notifications : Start
    let param = {
      user:current_user_id
    }
    dispatch(getUnreadNotifications(param));
    // Get Notifications : End
  }, [stages,organization_notes,contact_notes,deal_notes]);

  const displayNotification = (e) => {
    console.log("moment.tz.guess(true)",moment.tz.guess(true));
    let param = {
      user:current_user_id,
      timezone:moment.tz.guess(true)
    }
    dispatch(getNotifications(param));
  };

  const handleClickOutside = event => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setOpened(false);
    }
  };

  const toggleTheme = () => {
    let new_theme = (latest_theme == 'light') ? darkTheme : lightTheme;
    dispatch(applyTheme(new_theme));
  }
  return (
    <nav className="navbar navbar-expand navbar-light background-white topbar mb-4 static-top shadow header">
      {/* Sidebar Toggle (Topbar) */}
      <button
        id="sidebarToggleTop"
        className="btn btn-link d-md-none rounded-circle mr-3"
      ><i className="fa fa-bars" /></button>
      {/* Topbar Search */}
      <div className="d-inline-flex top-header-title">
        <h5>{page_title} {(counter==0 || counter > 0) ?  `(${counter})` : null} {(setHeaderButtonFunc) ? setHeaderButtonFunc(detail) : ''}</h5>
      </div>
      {/* Topbar Navbar */}
      <ul className="navbar-nav ml-auto">
        {/* Nav Item - Search Dropdown (Visible Only XS) */}
        <li className="nav-item d-flex align-items-center">
          <Toggle theme={latest_theme} toggleTheme={toggleTheme} />
        </li>
        <li className="nav-item dropdown no-arrow mx-1">
          <Link to="#" ref={wrapperRef} className="nav-link dropdown-toggle" onClick={()=> { setOpened(!opened); displayNotification(); }} id="alertsDropdown" role="button" aria-haspopup="true" aria-expanded="false">
            <i className="fas fa-bell fa-fw" />
            {/* Counter - Alerts */}
            {
              (unread_notifications) ? (<span className="badge badge-danger badge-counter">{unread_notifications}</span>) : null
            }            
          </Link>
          {/* Dropdown - Alerts */}
          {opened && 
          (<div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in show">
            <h6 className="dropdown-header">
              Notifications
            </h6>
            <div className="setScroll">
              <div style={{ maxHeight:"230px",overflow:"auto" }}>
                {
                  (notifications && notifications.length > 0) ? 
                    notifications.map((noti,index)=>(
                      <Fragment key={index}>
                        <span className="dropdown-item d-flex align-items-center" style={{ cursor:"pointer" }}>
                          <div className="mr-3">
                            <div className="icon-circle" style={{backgroundColor:"#ecc2b1"}}>
                              <i className="fas fa-bullhorn text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="small text-gray-500">{noti.created_at}</div>
                            <span className="font-weight-bold">{noti.messsage}</span>
                          </div>
                        </span>
                      </Fragment>
                    ))
                    : (
                      <div className="dropdown-item d-flex align-items-center" href="#">
                        <div className="small text-gray-500">No notification available</div>
                      </div>
                    )
                }
              </div>
            </div>
            
            <span className="dropdown-item text-center small text-gray-500"></span>
          </div>)
          }
        </li>

        {/* <div className="topbar-divider d-none d-sm-block" /> */}
        {/* Nav Item - User Information */}
        <li className="nav-item dropdown no-arrow">
          <Link
            className="nav-link dropdown-toggle"
            to="#"
            id="userDropdown"
            role="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <span className="mr-2 d-inline d-lg-inline text-gray-600 small">
              {(username) ? username : ''}
            </span>
            <img
              className="img-profile rounded-circle"
              src={ (photo) ? photo : "assets/img/undraw_profile.svg" }
              alt=""
            />
          </Link>
          {/* Dropdown - User Information */}
          <div
            className="dropdown-menu dropdown-menu-right shadow animated--grow-in"
            aria-labelledby="userDropdown"
          >
            <Link className="dropdown-item" to="/profile">
              <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400" />
              Profile
            </Link>

            <Link className="dropdown-item" to="/settings">
              <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400" />
              Notification Settings
            </Link>

            <div className="dropdown-divider" />
            <Link className="dropdown-item" to="#" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400" />
              Logout
            </Link>
          </div>
        </li>
      </ul>
    </nav>
  );
}


 export default Header;

