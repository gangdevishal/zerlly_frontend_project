import React, { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  // console.log('location',location);
  const getNavLinkClass = (path) => {
    if(location.pathname === path){
      return "nav-item active";
    }
    else{
      return "nav-item";
    }
  };

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <>
      <ul
        className={`navbar-nav sidebar sidebar-dark accordion toggled`}
        id="accordionSidebar"
      >
        <Link
          className="sidebar-brand d-flex align-items-center justify-content-center"
          to="/"
        >
          <div className="sidebar-brand-icon">
            <img
              alt="Logo"
              src="assets/img/logo.png"
              className="max-h-55px long-img"
            />
            <img
              alt="Logo"
              src="assets/img/logo_v1.png"
              className="max-h-55px short-img"
            />
          </div>
        </Link>

        <li className={getNavLinkClass("/dashboard")}>
          <NavLink className="nav-link" exact to="/dashboard">
            <img alt="icon" className="mr-2" src={`assets/img/salesboard_icon.svg`}/>
            <span>Sales Board</span>
          </NavLink>
        </li>

        <li className={getNavLinkClass("/sales-calender")}>
          <NavLink className="nav-link" to="/sales-calender">
            <img alt="icon" className="mr-2"  src={`assets/img/salesboard_calender_icon.svg`}/>
            <span>Sales Calender</span>
          </NavLink>
        </li>
        <li className={getNavLinkClass("/organisations")}>
          <NavLink className="nav-link" to="/organisations">
            <img alt="icon" className="mr-2"  src={`assets/img/organisation_icon.svg`}/>
            <span>Organizations</span>
          </NavLink>
        </li>

        <li className={getNavLinkClass("/contacts")}>
          <NavLink className="nav-link" to="/contacts">
            <img alt="icon" className="mr-2"  src={`assets/img/contact_icon.svg`}/>
            <span>Contacts</span>
          </NavLink>
        </li>

        {/* Nav Item - Tables */}
        <li className={getNavLinkClass("/deals")}>
          <NavLink className="nav-link" to="/deals">
            <img alt="icon" className="mr-2"  src={`assets/img/deal_icon.svg`}/>
            <span>Deals</span>
          </NavLink>
        </li>

        <li className={getNavLinkClass("/reports")}>
          <NavLink className="nav-link" to="/reports">
            <img alt="icon" className="mr-2"  src={`assets/img/chart_icon.svg`}/>
            <span>Reports</span>
          </NavLink>
        </li>

        <li className={getNavLinkClass("/cancels")}>
          <NavLink className="nav-link" to="/cancels">
            <img alt="icon" className="mr-2"  src={`assets/img/cancel_subscription.svg`}/>
            <span>Cancels</span>
          </NavLink>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider d-none d-md-block" />
        {/* Sidebar Toggler (Sidebar) */}
        <div className="text-center d-none d-md-inline">
          <button className="rounded-circle border-0" id="sidebarToggle" />
        </div>
      </ul>
    </>
  );
}

export default Sidebar;
