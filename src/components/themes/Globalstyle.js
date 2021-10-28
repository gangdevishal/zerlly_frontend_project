import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  body {
    background: ${(props) => props.theme.latest_theme.body};
    color: ${(props) => props.theme.latest_theme.text}; 
    // transition: all 0.50s linear;
  }

  .ant-layout,.ant-layout-header,.ant-menu,.ant-dropdown-menu,.ant-drawer-header, .cancellation-table-row .ant-table-body table, .cancellation-table-row .ant-table-header table, .ant-table, .deal-table-row .ant-table-body table, .deal-table-row .ant-table-header table, .contact-table-row .ant-table-body table, .contact-table-row .ant-table-header table,.org-table-row .ant-table-body table, .org-table-row .ant-table-header table, .calendar-main-backlog, .login_page .login_box,.forgot_page .forgot_box,.reset_password_page .reset_box {
    background: ${(props) => props.theme.latest_theme.ant_layout_bg};
  }

  .ant-menu .ant-menu-item-selected, .ant-menu-item-selected a, .ant-menu-item-selected a:hover, .ant-menu-item:hover, .ant-menu-horizontal > .ant-menu-item a:hover, .ant-menu-horizontal > .ant-menu-item a,.ant-dropdown-menu-item, .ant-dropdown-menu-submenu-title, .ant-menu-item a,.ant-typography, .calendar_backlog_section .card-container .ant-card .ant-card-head,.login_page .second_row .column,.forgot_page .second_row .column,.reset_password_page .second_row .column,.ant-modal-body,.ant-empty-description {
    color: ${(props) => props.theme.latest_theme.whiteText}; 
  }

  .ant-menu-item-group-title,.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn, .contact_modal .ant-tabs-tab:hover {
    color: ${(props) => props.theme.latest_theme.lightWhiteText}; 
  }

  .react-kanban-column-header,.calendar-main-backlog > .ant-card-head { 
    background: ${(props) =>
      props.theme.latest_theme.react_kanban_column_header};
  }

  .react-kanban-card__title,.calendar_backlog_section .card-container .ant-card .ant-card-head, .note_messages .ant-comment .comment-ribbon, .deal_left_section .first_plan,.deal_right_section .deal_action_bar, .organization_action_bar, .contact_action_bar {
    background: ${(props) => props.theme.latest_theme.react_kanban_card_title};
  }

  .react-kanban-card__title .heading, .calendar-main-backlog > .ant-card-head > .ant-card-head-wrapper > .ant-card-head-title,h1, h2, h3, h4, h5, h6 {
    color: ${(props) =>
      props.theme.latest_theme.react_kanban_card_title_heading};
  }

  .react-kanban-card, .calendar_backlog_section .card-container .ant-card .ant-card-body {
    background-color: ${(props) => props.theme.latest_theme.background};
  }

  .barsBtn,.barsBtn:after,.barsBtn:before {
    background-color: ${(props) => props.theme.latest_theme.lightWhiteText};
  }
  .barsMenu {
    border-color: ${(props) => props.theme.latest_theme.lightWhiteText};
  }

  .header_right_icon,.svg_icon, .mobile_menu_icon {
    fill:${(props) => props.theme.latest_theme.whiteText};
  }
  .ant-form-item-label > label, .react-kanban-card__description .label_first .title, .react-kanban-card__description .label_second .title, .react-kanban-card__description .label_third .title, .react-kanban-card__description .label_first .value, .react-kanban-card__description .label_second .value, .react-kanban-card__description .label_third .value, .card-container .label_first .title, .card-container .label_second .title, .card-container .label_third .title, .card-container .label_first .value, .card-container .label_second .value, .card-container .label_third .value, a,.ant-modal-header > .ant-modal-title, .ant-modal-close-icon,.ant-tabs,.ant-timeline, .ant-badge-status-text, .event-design .fc-event-main {
    color:${(props) => props.theme.latest_theme.whiteText};
  }

  .chart_section .report-main,.cancellation-table-row > .tbl-col-action > .ant-row, .deal_top_action, .contact_top_action, .org_top_action,.calendar_section .calender-main,.myProfile,.settings-container .notify-section,.settings-container .change-pwd-section, .ant-modal-content,.ant-modal-header,.ant-tabs-nav,.ant-timeline-item-head {
    background:${(props) => props.theme.latest_theme.lightDarkBG};
  }

  .ant-dropdown-menu-item:hover, .ant-dropdown-menu-submenu-title:hover {
    background:${(props) => props.theme.latest_theme.lightDarkHOVER};
  }

  .cancellation-table-row .ant-table-thead > tr > th, .deal-table-row .ant-table-thead > tr > th, .contact-table-row .ant-table-thead > tr > th, .org-table-row .ant-table-thead > tr > th {
      background:${(props) => props.theme.latest_theme.theadBG};
      color:${(props) => props.theme.latest_theme.whiteText};
      border-color:${(props) => props.theme.latest_theme.thBorder};
  }

  .cancellation-table-row .ant-table-tbody > tr > td, .deal-table-row .ant-table-tbody > tr > td, .contact-table-row .ant-table-tbody > tr > td, .org-table-row .ant-table-tbody > tr > td {
    background:${(props) => props.theme.latest_theme.tbodyBG};
    color:${(props) => props.theme.latest_theme.whiteText};
    border-color:${(props) => props.theme.latest_theme.thBorder};
}

.organization_right_section .comment_section .right-message, .timeline_full_section .log-notes-comment,.contact_right_section .comment_section .right-message,.deal_right_section .comment_section .right-message{
  background:${(props) => props.theme.latest_theme.rightMsgBG};
}

.organization_right_section .comment_section .left-message,.contact_right_section .comment_section .left-message,.deal_right_section .comment_section .left-message{
  background:${(props) => props.theme.latest_theme.leftMsgBG};
}
  `;
