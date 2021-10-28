import React from "react";
import { NavLink } from "react-router-dom";
import { Menu, Grid } from "antd";
import { useTranslation, Trans } from 'react-i18next';
import {BoardIcon, CalendarIcon, OrganizationIcon, ContactIcon, DealIcon, CancellationIcon, ReportIcon} from '../Icons';

const MenuItemGroup = Menu.ItemGroup;
const { useBreakpoint } = Grid;
const MobileMenu = (props) => {
  const { t, i18n } = useTranslation();
  const { md } = useBreakpoint();
  const screens = useBreakpoint();
  return (
    <Menu
      mode={window.screen.width > 1024 ? "horizontal" : "inline"}
      defaultSelectedKeys={["/dashboard"]}
      selectedKeys={[props.location.pathname]}
      className="left-menu-div"
    >
      <Menu.Item
        key={`/dashboard`}
        icon={
          <BoardIcon
            activate={props.location.pathname == "/dashboard" ? true : false}
          />
        }
      >
        <div className="menu-border" />
        <NavLink to="/dashboard" className="nav-text">
        {t("header.board_menu","Board")} {console.log("screens:",JSON.stringify(screens),"screen.width:",window.screen.width)}
        </NavLink>
      </Menu.Item>
      <Menu.Item
        key={`/sales-calender`}
        icon={
          <CalendarIcon
            activate={
              props.location.pathname == "/sales-calender" ? true : false
            }
          />
        }
      >
        <div className="menu-border" />
        <NavLink to="/sales-calender" className="nav-text">
        {t("header.calendar_menu","Calendar")}
        </NavLink>
      </Menu.Item>
      <MenuItemGroup key="g1" title={t("header.data_divider","Data")}>
        <Menu.Item
          key={`/organizations`}
          icon={
            <OrganizationIcon
              activate={
                props.location.pathname == "/organizations" ? true : false
              }
            />
          }
        >
          <div className="menu-border" />
          <NavLink to="/organizations" className="nav-text">
          {t("header.organization_menu","Organizations")}
          </NavLink>
        </Menu.Item>
        <Menu.Item
          key={`/contacts`}
          icon={
            <ContactIcon
              activate={props.location.pathname == "/contacts" ? true : false}
            />
          }
        >
          <div className="menu-border" />
          <NavLink to="/contacts" className="nav-text">
          {t("header.contact_menu","Contacts")}
          </NavLink>
        </Menu.Item>
        <Menu.Item
          key={`/deals`}
          icon={
            <DealIcon
              activate={props.location.pathname == "/deals" ? true : false}
            />
          }
        >
          <div className="menu-border" />
          <NavLink to="/deals" className="nav-text">
          {t("header.deal_menu","Deals")}
          </NavLink>
        </Menu.Item>
      </MenuItemGroup>
      <MenuItemGroup key="g2" title={t("header.other_divider","Other")}>
      <Menu.Item
        key={`/cancellations`}
        icon={
          <CancellationIcon
            activate={
              props.location.pathname == "/cancellations" ? true : false
            }
          />
        }
      >
        <div className="menu-border" />
        <NavLink to="/cancellations" className="nav-text">
        {t("header.cancellation_menu","Cancellations")}
        </NavLink>
      </Menu.Item>
      <Menu.Item
        key={`/reports`}
        icon={
          <ReportIcon
            activate={props.location.pathname == "/reports" ? true : false}
          />
        }
      >
        <div className="menu-border" />
        <NavLink to="/reports" className="nav-text">
        {t("header.report_menu","Reports")}
        </NavLink>
      </Menu.Item>
      </MenuItemGroup>
    </Menu>
  );
};

export default MobileMenu;
