import React, { Fragment, Component } from "react";
import Layout from "./layout";
import { Helmet } from "react-helmet-async";
import { Row, Col, Card, Empty, Badge } from "antd";
import "./css/calender.css";
import { compose } from "redux";
import { getDealFields } from "../redux/actions/custom_table_field";
import {
  getDeals,
  filterDeal,
  getDeal,
  getNotes,
  getLogs,
  deleteDeal,
  updateDeal,
  getDealLostReasons,
  updateDealAction
} from "../redux/actions/deal";
import { getOrganisations } from "../redux/actions/organisation";
import { getStages } from "../redux/actions/stage";
import { showLoader, hideLoader } from "../redux/actions/loader";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import { connect } from "react-redux";
import "@fullcalendar/timegrid/main.css";

import moment from "moment-timezone";
import { withTranslation } from "react-i18next";
import { UserCircleIcon, SixSquareIcon, DealIcon, CoinIcon } from "./Icons";
import DealDetailModal from "./DealDetailModal";
import DealFilterModal from "./DealFilterModal";

export class Calender extends Component {
  calendarRef = React.createRef();
  constructor(props) {
    super(props);

    this.state = {
      backlog_event_arr: [],
      next_event_arr: [],
      calenderKey: new Date(),
      calender_event_title:
        this.props.auth && this.props.auth.user.calender_event_title
          ? this.props.auth.user.calender_event_title
          : "contact_name",
      visibleDealDetailModal: false,
      visibleDealFilterModal: false,
      activeFilter: false,
    };
    this.handleDealAction.bind(this);
    this.reloadPage.bind(this);
    this.setVisibleDealDetailModal.bind(this);
    this.setVisibleDealFilterModal.bind(this);
    this.setActiveFilter.bind(this);
    this.filterCalender.bind(this);
  }

  componentDidMount = async () => {
    var current_user_id =
      this.props.auth && this.props.auth.user._id
        ? this.props.auth.user._id
        : "";
        
    this.props.getDealFields();
    let dparam = {
      user_id: current_user_id,
      deal_user: current_user_id,
      sort_by: "updated_at",
      order_by: "desc",
      page: "calender",
      timezone: moment.tz.guess(true)
    };

    await this.props.getDeals(dparam);
    this.manageCalenderEvents();

    var containerEl = document.getElementById("calender-backlog");
    if (containerEl) {
      new Draggable(containerEl, {
        itemSelector: ".backlog-item",
      });
    }
  };

  componentDidUpdate = async (prevProps) => {
    if (prevProps.deals !== this.props.deals) {
      await this.manageCalenderEvents();
    }
    setTimeout(() => {
      this.changeWeekendBackgrounColor();
    }, 500);
  };

  manageCalenderEvents = () => {
    let backlog_event_arr = [];
    let next_event_arr = [];
    this.props.deals.map((deal, index) => {
      let current_date = moment().format("YYYY-MM-DDTHH:mm:ss");
      let follow_up_date = moment(deal.follow_up, "DD-MM-YYYY HH:mm").format(
        "YYYY-MM-DDTHH:mm:ss"
      );
      // console.log(
      //   "current_date:",
      //   current_date,
      //   "follow_up_date:",
      //   follow_up_date,
      //   "deal.follow_up",
      //   deal.follow_up,
      //   "follow_up_date > current_date:",
      //   follow_up_date > current_date
      // );

      if (follow_up_date > current_date) {
        next_event_arr.push({
          id: deal._id,
          title: deal[this.state.calender_event_title],
          start: follow_up_date,
          display: "flex",
          borderColor: deal.stage_color,
          backgroundColor: "unset",
        });
      } else {
        backlog_event_arr.push(deal);
      }
    });

    this.setState({
      backlog_event_arr: backlog_event_arr,
      next_event_arr: next_event_arr,
    });
  };

  changeWeekendBackgrounColor = () => {
    var daydivs = document.querySelectorAll(".calender-section span.day-name");
    if (daydivs && daydivs.length > 0) {
      [].forEach.call(daydivs, function (daydiv) {
        if (daydiv.innerText == "SUN" || daydiv.innerText == "SAT") {
          daydiv.classList.add("weekend_text_color");
          let nel = daydiv.closest("td.fc-daygrid-day");
          if (nel && !nel.classList.contains("fc-day-disabled")) {
            nel.classList.remove("fc-day-today");
            nel.classList.add("weekend_background");
            let ael = daydiv.nextElementSibling;
            ael.classList.add("weekend_text_color");
          }
        } else {
          if (daydiv.classList.contains("weekend_text_color")) {
            daydiv.classList.remove("weekend_text_color");
          }
          let nel = daydiv.closest("td.fc-daygrid-day");
          if (nel && nel.classList.contains("weekend_background")) {
            nel.classList.remove("fc-day-today");
            nel.classList.remove("weekend_background");
          }
          let ael = daydiv.nextElementSibling;
          if (ael && ael.classList.contains("weekend_text_color")) {
            ael.classList.remove("weekend_text_color");
          }
        }
      });
    }
  };

  onDrop = async (info) => {
    console.log("drop::", info, "info.draggedEl.id:", info.draggedEl.id);
    let dealId = info.draggedEl.id;
    let calDate = info.date;
    let current_user = this.props.auth ? this.props.auth.user._id : "";

    let param = {
      _id: dealId,
      other:{
        user: current_user,
        timezone: moment.tz.guess(true)
      }
    };
    await this.props.getDeal(param);

    if (this.props.single) {
      const deal = this.props.single;
      let get_follow_up_time = moment(deal.follow_up).format("HH:mm:ss");
      let new_follow_date = this.convertDate(calDate) + " " + get_follow_up_time;
      let new_final_follow_up = moment(new_follow_date);
      console.log('new_follow_date:',new_follow_date,'|new_final_follow_up:',new_final_follow_up);
      const formdata = {
        data: {
          contact_name: deal.contact_name,
          est_close_date: deal.est_close_date,
          follow_up: new_final_follow_up,
          organization: deal.organization,
          responsible: deal.responsible,
          stage: deal.stage,
          user: deal.user,
          value: deal.value,
        },
        _id: deal._id,
        timezone: moment.tz.guess(true)
      };

      await this.props.updateDeal(formdata);
      this.setState({ calenderKey: new Date() });
    }
  };

  handleEventChange = async (changeInfo) => {
    console.log("handleEventChange::", changeInfo);
    let dealId = changeInfo.event.id;
    let calDate = changeInfo.event.start;
    let current_user = this.props.auth ? this.props.auth.user._id : "";

    let param = {
      _id: dealId,
      other:{
        user: current_user,
        timezone: moment.tz.guess(true)
      }
    };
    await this.props.getDeal(param);

    if (this.props.single) {
      const deal = this.props.single;
      // let get_follow_up_time = moment(deal.follow_up).format("HH:mm:ss");
      // let new_follow_date = this.convertDate(calDate) + " " + get_follow_up_time;
      let new_final_follow_up = moment(calDate);
      const formdata = {
        data: {
          contact_name: deal.contact_name,
          est_close_date: deal.est_close_date,
          // follow_up: this.convertDate(calDate) + " " + get_follow_up_time,
          follow_up: new_final_follow_up,
          organization: deal.organization,
          responsible: deal.responsible,
          stage: deal.stage,
          user: deal.user,
          value: deal.value,
        },
        _id: deal._id,
        timezone: moment.tz.guess(true)
      };
      await this.props.updateDeal(formdata);
      // this.setState({ calenderKey: new Date() });
    }
  };

  convertDate = (inputFormat) => {
    const pad = (s) => {
      return s < 10 ? "0" + s : s;
    };
    var d = new Date(inputFormat);
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join("-");
  };

  openDealDetailModal = (dealId) => {
    // let dealId = clickInfo.event.id;
    var current_user_id = this.props.auth ? this.props.auth.user._id : "";

    // dispatch(getOrganisations({ sort_by: "updated_at", order_by: "desc" }));
    let param = {
      _id: dealId,
      other:{
        user: current_user_id,
        timezone: moment.tz.guess(true)
      }
    };
    this.props.getDeal(param);
    this.props.getLogs({ deal_id: dealId, timezone: moment.tz.guess(true) });
    this.props.getNotes({ deal_id: dealId, timezone: moment.tz.guess(true) });
    this.setVisibleDealDetailModal(true);
  };

  setVisibleDealDetailModal = (value) => {
    this.setState({
      visibleDealDetailModal: value,
    });
  };

  setVisibleDealFilterModal = (value) => {
    this.setState({
      visibleDealFilterModal: value,
    });
  };

  setActiveFilter = (value) => {
    this.setState({
      activeFilter: value,
    });
    document.querySelectorAll(".fc-filterbtn-button").forEach(function (el) {
      if (value) {
        el.style.setProperty("color", "#fff", "important");
        el.style.setProperty("background-color", "#73777b", "important");
      } else {
        el.style.setProperty("color", "", "important");
        el.style.setProperty("background-color", "", "important");
      }
    });
  };

  reloadPage = () => {
    var current_user_id =
      this.props.auth && this.props.auth.user._id
        ? this.props.auth.user._id
        : "";

    if(this.state.activeFilter) {
      let param = {
        formField: this.props.filter_fields,
        other: {
          sort_by: "updated_at",
          order_by: "desc",
          timezone: moment.tz.guess(true),
          page:'calender'
        },
      };
      this.props.filterDeal(param,false);
    }
    else {
      let dparam = {
        user_id: current_user_id,
        deal_user: current_user_id,
        sort_by: "updated_at",
        order_by: "desc",
        page: "calender",
        timezone: moment.tz.guess(true)
      };
      this.props.getDeals(dparam);
    }    
  };

  handleDealAction = async (deal_id, action, reason) => {
    console.log("deal_id,action,reason::", deal_id, action, reason);
    var current_user_id =
      this.props.auth && this.props.auth.user._id
        ? this.props.auth.user._id
        : "";

    let formData = {
      user: current_user_id,
      deal: deal_id,
      action: action,
      reason: reason,
    };
    console.log("formData:", formData);
    this.props.updateDealAction(formData);

    let dparam = {
      user_id: current_user_id,
      deal_user: current_user_id,
      sort_by: "updated_at",
      order_by: "desc",
      page: "calender",
      timezone: moment.tz.guess(true)
    };
    this.props.getDeals(dparam);

    let param = {
      _id: deal_id,
      other:{
        user: current_user_id,
        timezone: moment.tz.guess(true)
      }
    };
    this.props.getDeal(param);
  };

  filterCalender = () => {
    this.setVisibleDealFilterModal(true);
  }

  render() {
    const { t } = this.props;
    return (
      <Fragment>
        <Helmet>
          <title>Calender</title>
        </Helmet>
        <Layout location={this.props.location}>
          <Row>
            <Col
              xs={24}
              sm={12}
              md={12}
              lg={6}
              className="calendar_backlog_section"
            >
              <DealDetailModal
                handleDealActionFunc={this.handleDealAction}
                reloadPageFunc={this.reloadPage}
                visible={this.state.visibleDealDetailModal}
                visibleFunc={this.setVisibleDealDetailModal}
              />
              <DealFilterModal
                modal_title={'Filter Calendar Deals'}
                pageFrom={'calender'}
                reloadPageFunc={this.reloadPage}
                setActiveFilterFunc={this.setActiveFilter}
                visible={this.state.visibleDealFilterModal}
                visibleFunc={this.setVisibleDealFilterModal}
              />
              <Row>
                <Col span={24} className="backlog-deal">
                  <Card
                    title={t("calendar.backlog")}
                    className="calendar-main-backlog"
                  >
                    <div className="card-container" id="calender-backlog">
                      {this.state.backlog_event_arr.length > 0 ? (
                        this.state.backlog_event_arr.map((deal, index) => (
                          <Card
                            key={deal._id}
                            type="inner"
                            title={
                              <div className="backlog-deal-card-title">
                                <span className="ticon">
                                  <SixSquareIcon />
                                </span>
                                <span className="text">
                                  {deal.contact_name}
                                </span>
                                <span className="dealbadge">
                                  <Badge
                                    color={deal["stage_color"]}
                                    text=""
                                    size="default"
                                  />
                                </span>
                              </div>
                            }
                            className="backlog-item"
                            id={deal._id}
                            data-event={`{
                                "title": "${
                                  deal[this.state.calender_event_title]
                                } ${moment(
                              deal.follow_up,
                              "DD-MM-YYYY HH:mm:ss"
                            ).format("HH:mm")}",
                                "id":"${deal._id}",
                                "borderColor":"${deal.stage_color}",
                                "display":"flex",
                                "backgroundColor":"unset"
                              }`}
                            onClick={() => this.openDealDetailModal(deal._id)}
                          >
                            <span
                              id={deal._id}
                              style={{
                                borderColor: `${deal.stage_color}`,
                                display: "none",
                              }}
                              data-event={`{"title": "${
                                deal[this.state.calender_event_title]
                              } ${moment(
                                deal.follow_up,
                                "DD-MM-YYYY HH:mm:ss"
                              ).format("HH:mm")}","id":"${
                                deal._id
                              }","borderColor":"${
                                deal.stage_color
                              }","display":"flex","backgroundColor":"unset"}`}
                              className="backlog-event"
                            >
                              <span style={{ display: "flex", padding: "5px" }}>
                                <CoinIcon />
                              </span>
                              {deal[this.state.calender_event_title]}
                            </span>
                            <div className="label_first">
                              <span className="title">Organization</span>
                              <span className="value">{deal.organization}</span>
                            </div>
                            <div className="second_third_label">
                              <div className="label_second">
                                <span className="title">Sales</span>
                                <span className="sales value">
                                  <span className="sicon">
                                    {" "}
                                    {deal.user_photo ? (
                                      <img src={deal.user_photo} alt="avtar" />
                                    ) : (
                                      <UserCircleIcon height={25} width={20} />
                                    )}
                                  </span>

                                  {deal.responsible}
                                </span>
                              </div>
                              <div className="label_third">
                                <span className="title">Value</span>
                                <span className="value">{deal.value}</span>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <Empty
                          className="no_calendar_backlog_deal"
                          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                          imageStyle={{
                            height: 60,
                          }}
                          description={
                            <span>
                              No any deal found
                            </span>
                          }
                        >
                        </Empty>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col xs={24} sm={12} md={12} lg={18} className="calendar_section">
              <Row>
                <Col span={24} className="calender-main">
                  <FullCalendar
                    ref={this.calendarRef}
                    key={this.state.calenderKey}
                    firstDay={1}
                    renderEventContent={true}
                    height="1050px"
                    initialView="dayGridMonth"
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    customButtons={{
                      filterbtn: {
                        text: "Filters",
                        click: this.filterCalender,
                      },
                    }}
                    headerToolbar={{
                      left: `prev,next today`,
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay,filterbtn",
                    }}
                    dayMaxEventRows={true}
                    dayMaxEvents={true}
                    views={{
                      dayGridMonth: {
                        dayMaxEvents: 3,
                      },
                      timeGridWeek: {
                        dayMaxEvents: 3,
                      },
                      timeGrid: {
                        dayMaxEvents: 6, // adjust to 6 only for timeGridWeek/timeGridDay
                      },
                    }}
                    editable={true}
                    eventContent={renderEventContent} // custom render function
                    eventClick={(clickInfo) => { this.openDealDetailModal(clickInfo.event.id) }}
                    eventChange={this.handleEventChange} // called for drag-n-drop/resize
                    eventRemove={this.handleEventRemove}
                    eventClassNames={"event-design"}
                    showNonCurrentDates={false}
                    drop={this.onDrop}
                    events={this.state.next_event_arr}
                    eventTimeFormat={{
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }}
                    validRange={{
                      start: new Date()
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Layout>
      </Fragment>
    );
  }
}
function renderEventContent(eventInfo) {
  // console.log("eventInfo:", eventInfo);
  return (
    <Fragment>
      <span
        style={{ display: "flex", marginRight: "3px" }}
        data-deal_id={eventInfo.event._def.publicId}
      >
        <CoinIcon />
      </span>
      <span className="event-title" style={{ marginRight: "2px" }}>{eventInfo.event.title}</span>
      <span className="event-date">
        {eventInfo.timeText}
      </span>
    </Fragment>
  );
}

function getDayName(date) {
  var days = new Array(7);
  days[0] = "SUN";
  days[1] = "MON";
  days[2] = "TUE";
  days[3] = "WED";
  days[4] = "THU";
  days[5] = "FRI";
  days[6] = "SAT";
  var r = days[date.getDay()];
  return r;
}

const mapStateToProps = (state) => ({
  deal_fields:
    (state.custom_table_field && state.custom_table_field.deals) || [],
  deals: (state.deal && state.deal.list) || [],
  drop: (state.deal && state.deal) || [],
  auth: (state.auth && state.auth) || "",
  single: (state.deal && state.deal.edit) || "",
  stage: state.stage && state.stage.list,
  filter_fields:(state.deal && state.deal.filter_fields) || ""
});
const mapDispatchToProps = {
  getDealFields,
  getDeals,
  filterDeal,
  getDeal,
  getLogs,
  getNotes,
  deleteDeal,
  updateDeal,
  getOrganisations,
  getStages,
  getDealLostReasons,
  showLoader,
  hideLoader,
  updateDealAction
};
export default compose(
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(Calender);
