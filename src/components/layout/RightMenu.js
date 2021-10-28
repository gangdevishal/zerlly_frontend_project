import React, {useEffect, useState, useRef} from "react";
import { NavLink } from "react-router-dom";
import { Menu, Grid, Dropdown, Row, Col, Space, Badge, Empty } from "antd";
import {useSelector, useDispatch} from "react-redux";
import { authLogout } from "../../redux/actions/authentication";
import { getNotifications, getUnreadNotifications } from "../../redux/actions/notification";
import moment from 'moment-timezone';
import { useTranslation, Trans } from 'react-i18next';
import { applyTheme } from '../../redux/actions/theme';
import { darkTheme, lightTheme } from '../themes/Themes';
import { BellIcon,MoonIcon,SunIcon,UserIcon,EditIcon,ExternalLinkIcon,ShieldAltIcon,CogIcon,LogoutIcon,PenIcon,CommentAltIcon,CircleIcon } from '../Icons';
const { useBreakpoint } = Grid;

const RightMenu = (props) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const state = useSelector((state) => state.auth);
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

  const handleLogout = () => {
    dispatch(authLogout());
  };
  const { md } = useBreakpoint();

  const toggleTheme = () => {
    let new_theme = (latest_theme == 'light') ? darkTheme : lightTheme;
    dispatch(applyTheme(new_theme));
  }

  return (
    <Menu mode={md ? "horizontal" : "inline"} className="right-menu-div">
      <Menu.Item key={`rm1`}>
        <div className="d-flex" onClick={toggleTheme}>{latest_theme === "dark" ? (<MoonIcon height={17} width={20}/>) : (<SunIcon height={17} width={20}/>)}</div>
      </Menu.Item>
      <Menu.Item key={`rm2`}>
        <Dropdown overlay={notification_menu(notifications,t,props.redirectPageFunc)} trigger={["click"]} onClick={()=> { displayNotification(); }}>
          <Badge className="d-flex" count={unread_notifications} >
            {/* <img src={bellIcon} alt="zellry" /> */}
            <BellIcon height={17} width={20} />
          </Badge>
        </Dropdown>
      </Menu.Item>
      <Menu.Item key={`rm3`}>
        <Dropdown overlay={user_menu(handleLogout,t)} trigger={["click"]}>
         <div className="d-flex"> <UserIcon height={17} width={20}  /></div>
        </Dropdown>
      </Menu.Item>
    </Menu>
  );
};
const notification_menu = (notifications, t, redirectPage) => (
  <Menu className="notification_menu">
    <Menu.Item key="nm1">{t("header.notification_menu")}</Menu.Item>
    <Menu.Divider />
    <Space direction="vertical" className={`notification_area ${!notifications ? 'notification_area_2' : ''}`}>
      {notifications && notifications.length > 0 ? (
        notifications.map((noti, index) => (
          <Menu.Item key={`nm${noti.deal}`} className="notification_menu_item">
            <Row gutter={16}>
              <Col className="gutter-row" span={2}>
                <div style={{paddingTop: '5px'}}>{setNotificationIcon(noti.type)}</div>
              </Col>
              <Col className="gutter-row" span={14}>
                {/* Fredrik Sjöbeck added notes for Julian Schön */}
                {noti.title}
              </Col>
              <Col className="gutter-row" span={6}>
                {/* 2021-06-30 14:00:23 */}
                {noti.created_at}
              </Col>
              <Col className="gutter-row" span={2}>
                <div style={{paddingTop: '5px'}} onClick={(e) => redirectPage(noti.deal)}>
                  <ExternalLinkIcon />
                </div>                
              </Col>
            </Row>
            <Row gutter={16} className="notification_description">
              <Col className="gutter-row" span={2}></Col>
              <Col className="gutter-row" span={22}>
                {noti.message}
                {/* I’ve added a new note for the master of disaster, the weasel of
            lightning, the thunder from down uuuunder! JULIAN SCHÖN! */}
              </Col>
            </Row>
          </Menu.Item>
        ))
      ) : (
        <Row>
          <Col span={24}>
            <Empty description={<span>{t("header.no_notifications","No Notifications")}</span>} />
          </Col>
        </Row>
      )}
    </Space>
  </Menu>
);
const user_menu = (logoutFunc,t) => (
  <Menu className="user_menu">
    <Menu.Item
      key="um1"
      icon={ <div className="d-flex"><UserIcon /></div>}
    >
      <NavLink to="/profile" className="nav-text">
        {t("header.profile_menu")}
      </NavLink>
    </Menu.Item>
    <Menu.Item
      key="um2"
      icon={<div className="d-flex"><CogIcon /></div>}
    >
      <NavLink to="/settings" className="nav-text">
      {t("header.settings_menu")}
      </NavLink>
    </Menu.Item>
    <Menu.Item
      key="um3"
      icon={<div className="d-flex"><ShieldAltIcon /></div>}
    >
      Administration
    </Menu.Item>
    <Menu.Item
      key="um4"
      icon={<div className="d-flex"><LogoutIcon /></div>}
    >
      <NavLink to="#" onClick={logoutFunc} className="nav-text">
      {t("header.logout_menu")}
      </NavLink>
    </Menu.Item>
  </Menu>
);

const setNotificationIcon = (action) => {
  let icon = "";
  switch (action) {
    case "edit_detail":
      icon = <EditIcon />;
      break;
    case "edit_deal_status":
      icon = <CircleIcon />;
      break;
    case "add_deal_note":
      icon = <CommentAltIcon />;
      break;
    default:
      icon = <PenIcon />;
  }
  return icon;  
}
export default RightMenu;
