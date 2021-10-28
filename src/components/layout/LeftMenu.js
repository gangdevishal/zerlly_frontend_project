import React from "react";
import { NavLink } from "react-router-dom";
import { Menu } from "antd";
import { useTranslation, Trans } from 'react-i18next';

const LeftMenu = (props) => {
  const { t, i18n } = useTranslation();

  return (
    <Menu
      mode={"horizontal"}
      defaultSelectedKeys={["/dashboard"]}
      selectedKeys={[props.location.pathname]}
      className="left-menu-div"
    >
      <Menu.Item
        key={`/dashboard`}
      >
        <NavLink to="/dashboard" className="nav-text">
        {t("header.board_menu")}
        </NavLink>
      </Menu.Item>
      <Menu.Item
        key={`/sales-calender`}
      >
        <NavLink to="/sales-calender" className="nav-text">
        {t("header.calendar_menu")}
        </NavLink>
      </Menu.Item>
      <Menu.Item
        key={`/organizations`}
      >
        <NavLink to="/organizations" className="nav-text">
        {t("header.organization_menu")}
        </NavLink>
      </Menu.Item>
      <Menu.Item
        key={`/contacts`}
      >
        <NavLink to="/contacts" className="nav-text">
        {t("header.contact_menu")}
        </NavLink>
      </Menu.Item>
      <Menu.Item
        key={`/deals`}
      >
        <NavLink to="/deals" className="nav-text">
        {t("header.deal_menu")}
        </NavLink>
      </Menu.Item>
      <Menu.Item
        key={`/cancellations`}
      >
        <NavLink to="/cancellations" className="nav-text">
        {t("header.cancellation_menu")}
        </NavLink>
      </Menu.Item>
      <Menu.Item
        key={`/reports`}
      >
        <NavLink to="/reports" className="nav-text">
        {t("header.report_menu")}
        </NavLink>
      </Menu.Item>
    </Menu>
  );
};
export default LeftMenu;
