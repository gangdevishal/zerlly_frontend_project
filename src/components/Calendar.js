import React, { Component } from "react";
import Layout from "./layout";
import RightSidebar from "./RightSidebar";
import { Helmet } from "react-helmet-async";
import { Modal } from "react-bootstrap";
import { getDealFields } from "../redux/actions/custom_table_field";
import {
  getDeals,
  getDeal,
  getNotes,
  getLogs,
  deleteDeal,
  updateDeal,
  getDealLostReasons
} from "../redux/actions/deal";
import { getOrganisations } from "../redux/actions/organisation";
import { getStages } from "../redux/actions/stage";
import { showLoader, hideLoader} from "../redux/actions/loader";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import { connect } from "react-redux";
import "@fullcalendar/timegrid/main.css";
import {
  addDays,
  addMonths,
  endOfMonth,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import moment from "moment-timezone";

export class Calendar extends Component {
  calendarRef = React.createRef();
  constructor(props) {
    super(props);

    this.state = {
      filter_sidebar: false,
      new_sidebar: false,
      detail_sidebar: false,
      sideBarType: "",
      showDeleteModal: false,
      currentMonth: new Date(),
      currentDay: new Date(),
      selectedId: "",
      eventarray: [],
      stageId: "",
      newDAte: "",
      draggable_id: "",
      drop: false,
      enable: false,
      hideCalender: false,
      calenderKey: new Date(),
      activeFilter: false,
      calender_event_title : this.props.auth && this.props.auth.user.calender_event_title ? this.props.auth.user.calender_event_title : "contact_name"
    };

    this.detailDeal.bind(this);
    this.closeSideBar.bind(this);
    this.editSideBar.bind(this);
    this.closeDeleteModal.bind(this);
    this.openDeleteMoal.bind(this);
    this.filterOrg.bind(this);
  }

  componentDidMount = async () => {
    this.setState({ newDAte: this.convertDate(new Date()) });
    var current_user_id =
      this.props.auth && this.props.auth.user._id
        ? this.props.auth.user._id
        : "";
    let param = {
      sort_by: "updated_at",
      order_by: 'desc',
    };
    let param2 = {
      user_id: current_user_id,
      deal_user: current_user_id,      
    };

    let dparam = {
      user_id: current_user_id,
      deal_user: current_user_id,
      sort_by: "updated_at",
      order_by: 'desc',
      page:'calender'
    };
    await this.props.showLoader();
    await this.props.getDeals(dparam);
    await this.props.hideLoader();
    // await this.props.getStages(param2);
    await this.eventarr();
    await this.props.getDealFields();
    await this.props.getOrganisations(param);
    await this.props.getDealLostReasons();

    const btnprev = document.getElementsByClassName("fc-prev-button");
    if (btnprev[0]) {
      btnprev[0].addEventListener("click", () => {
        this.setState({
          currentMonth: subMonths(this.state.currentMonth, 1),
        });
        this.eventarr();
      });
    }

    const nextprev = document.getElementsByClassName("fc-next-button");
    if (nextprev[0]) {
      nextprev[0].addEventListener("click", () => {
        this.setState({
          currentMonth: addMonths(this.state.currentMonth, 1),
        });
        this.eventarr();
      });
    }

    const todaybutton = document.getElementsByClassName("fc-today-button");

    if (todaybutton[0]) {
      todaybutton[0].addEventListener("click", () => {
        this.setState({
          currentMonth: this.state.currentDay,
        });
        this.eventarr();
      });
    }

    const daygrid = document.getElementsByClassName("fc-dayGridMonth-button");
    if (daygrid[0]) {
      daygrid[0].addEventListener("click", () => {
        this.setState({
          currentMonth: this.state.currentDay,
        });
        this.eventarr();
      });
    }

    const weekgrid = document.getElementsByClassName("fc-timeGridWeek-button");
    if (weekgrid[0]) {
      weekgrid[0].addEventListener("click", () => {
        this.setState({
          currentMonth: "none",
        });
        this.eventarr();
      });
    }

    const dgrid = document.getElementsByClassName("fc-timeGridDay-button");
    if (dgrid[0]) {
      dgrid[0].addEventListener("click", () => {
        this.setState({
          currentMonth: "none",
        });
        this.eventarr();
      });
    }

    var containerEl = document.getElementById("calender-backlog");

    // initialize the external events
    // -----------------------------------------------------------------

    if (containerEl) {
      new Draggable(containerEl, {
        itemSelector: ".backlog-event",
      });
    }
  };

  componentDidUpdate = async (prevProps) => {
    if (prevProps.deals !== this.props.deals) {
      await this.eventarr();
    }
    setTimeout(() => {
      this.changeWeekendBackgrounColor();      
    }, 500);
  };
  eventarr = () => {
    // if (this.props.deals && this.props.deals.length > 0) {
    var arraydata = [];
    var currentMonth = new Date();
    var monthStart = startOfMonth(currentMonth).getDate();
    var differnce = new Date().getDate() - monthStart;
    this.props.deals.forEach((item, ij) => {
      let new_follow_up = moment(item.follow_up, "DD-MM-YYYY").format(
        "YYYY-MM-DD"
      );

      let new_follow_up_2 = moment(
        item.follow_up,
        "DD-MM-YYYY HH:mm:ss"
      ).format("YYYY-MM-DDTHH:mm:ss");

      var date = new Date(new_follow_up_2);
        if (
          this.state.currentMonth.toString() ===
          this.state.currentDay.toString()
        ) {
          if (
            new Date(new_follow_up) >= new Date() ||
            new_follow_up === this.state.newDAte
          ) {
            arraydata.push({
              id: item._id,
              title: item[this.state.calender_event_title],
              start: subDays(date, differnce),
              display: "block",
              borderColor: item.stage_color,
            });
          }
        } else {
          if (
            new Date(new_follow_up) >= new Date() ||
            new_follow_up === this.state.newDAte
          ) {
            arraydata.push({
              id: item._id,
              title: item[this.state.calender_event_title],
              start: date,
              display: "block",
              borderColor: item.stage_color,
            });
          }
        }
    });
    this.setState({ eventarray: arraydata });
    // }
  };
  detailDeal = (e) => {
    this.setState({ deal: false });
    this.setState((prevState) => ({
      detail_sidebar: e.target.checked,
      sideBarType: !prevState.sideBarType
        ? "detail_deal"
        : prevState.sideBarType !== "detail_deal"
        ? "detail_deal"
        : "",
    }));
  };

  closeSideBar = (e) => {
    this.setState({ deal: false });
    this.setState((prevState) => ({
      sideBarType: "",
      selectedId: "",
    }));
  };

  editSideBar = (e) => {
    this.setState({ deal: false });
    this.setState((prevState) => ({
      sideBarType: "edit_deal",
    }));
  };
  closeDeleteModal = (e) => {
    this.setState({ deal: false });
    this.setState({ showDeleteModal: false });
  };

  openDeleteMoal = (e) => {
    this.setState({ deal: false });
    this.setState({ showDeleteModal: true });
  };

  detailOrg = (id) => async (e) => {
    this.setState({ deal: false });
    var current_user = this.props.auth ? this.props.auth.user._id : "";
    this.setState({
      sideBarType: "detail_deal",
      selectedId: id,
    });

    let param = {
      _id: id,
      user: current_user,
    };
    await this.props.getDeal(param);
    await this.props.getLogs({ deal_id: id, timezone: moment.tz.guess(true) });
    await this.props.getNotes({ deal_id: id, timezone: moment.tz.guess(true) });
  };
  renderDayCellContent = (dayRenderInfo) => {
    var currentMonth = new Date();
    var monthStart = startOfMonth(currentMonth).getDate();
    var monthEnd = endOfMonth(currentMonth).getDate();
    var differnce = new Date().getDate() - monthStart;
    //console.log(monthEnd)

    var date = dayRenderInfo.date.getDate() + differnce;
    var year = new Date().getFullYear();
    var month = new Date().getMonth();
    var days = '';
    if (date > monthEnd) {
      var dayNumber = dayRenderInfo.date.getDate() + differnce - monthEnd;

      days = new Date(`${year}-0${month + 2}-${dayNumber}`);
      var next = true;
    } else {
      dayNumber = date;
      days = new Date(`${year}-0${month + 1}-${dayNumber}`);
    }

    var dayName = "";
    if (dayNumber === new Date().getDate()) {
      var today = true;
      dayName = getDayName(days);
    }
    // else if(dayRenderInfo.isPast){
    //   dayName = "Backlogs";
    // }
    else {
      dayName = getDayName(days);
    }
    return (
      <>
        <span
          style={{ color: today ? "red" : next ? "#d3d3d3" : null }}
          className={`day-name ${(dayName == 'SUN') ? 'custom_sunday' : (dayName == 'SAT') ? 'custom_saturday' : ''}`}
        >
          {dayName}
        </span>
        <span
          style={{ color: today ? "red" : next ? "#d3d3d3" : null }}
          className="day-text"
        >
          {dayNumber}
        </span>
      </>
    );
  };
  renderDayCellContentNext = (dayRenderInfo) => {
    var dayNumber = dayRenderInfo.date.getDate();
    var dayName = "";
    dayName = getDayName(dayRenderInfo.date);
    if (dayNumber === new Date().getDate()) {
      dayName = "Today";
    } else {
    }
    dayName = getDayName(dayRenderInfo.date);
    return (
      <>
        <span className={`day-name ${(dayName == 'SUN') ? 'custom_sunday' : (dayName == 'SAT') ? 'custom_saturday' : ''}`}>{dayName}</span>
        <span className="day-text">{dayNumber}</span>
      </>
    );
  };
  convertDate = (inputFormat) => {
    const pad = (s) => {
      return s < 10 ? "0" + s : s;
    };
    var d = new Date(inputFormat);
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join("-");
  };

  onDrop = async (info) => {
    this.setState({ drop: true });

    this.setState({ draggable_id: info.draggedEl.id });
    var current_user = this.props.auth ? this.props.auth.user._id : "";
    console.log("infoinfo:", info);
    let param = {
      _id: info.draggedEl.id,
      user: current_user,
    };
    await this.props.getDeal(param);
    if (
      this.state.currentMonth.toString() === this.state.currentDay.toString()
    ) {
      var currentMonth = new Date();
      var monthStart = startOfMonth(currentMonth).getDate();
      var differnce = info.date.getDate() - monthStart;
      var day = addDays(new Date(), differnce);
    } else {
      day = info.date;
    }

    if (this.props.single) {
      const deal = this.props.single;
      let get_follow_up_time = moment(deal.follow_up).format("HH:mm:ss");
      const formdata = {
        data: {
          contact_name: deal.contact_name,
          est_close_date: deal.est_close_date,
          follow_up: this.convertDate(day) + " " + get_follow_up_time,
          organization: deal.organization,
          responsible: deal.responsible,
          stage: deal.stage,
          user: deal.user,
          value: deal.value,
        },
        _id: deal._id,
      };
      var drop = true;
      await this.props.updateDeal(formdata, drop);
      this.setState({ calenderKey: new Date() });
    }
  };

  handleEventChange = async (changeInfo) => {
    this.setState({ drop: false });
    var current_user = this.props.auth ? this.props.auth.user._id : "";

    let param = {
      _id: changeInfo.event.id,
      user: current_user,
    };
    await this.props.getDeal(param);
    if (
      this.state.currentMonth.toString() === this.state.currentDay.toString()
    ) {
      var currentMonth = new Date();
      var monthStart = startOfMonth(currentMonth).getDate();
      var differnce = changeInfo.event.start.getDate() - monthStart;
      var day = addDays(new Date(), differnce);
    } else {
      day = changeInfo.event.start;
    }
    console.log("changeInfo:", changeInfo.event.start);
    if (this.props.single) {
      const deal = this.props.single;
      let get_follow_up_time = moment(changeInfo.event.start).format(
        "HH:mm:ss"
      );
      const formdata = {
        data: {
          contact_name: deal.contact_name,
          est_close_date: deal.est_close_date,
          follow_up: this.convertDate(day) + " " + get_follow_up_time,
          organization: deal.organization,
          responsible: deal.responsible,
          stage: deal.stage,
          user: deal.user,
          value: deal.value,
        },
        _id: deal._id,
      };
      this.props.updateDeal(formdata);
    }
  };

  filterOrg = (e) => {
    this.setState({ drop: false });

    this.setState((prevState) => ({
      sideBarType: !prevState.sideBarType
        ? "filter_deal"
        : prevState.sideBarType !== "filter_deal"
        ? "filter_deal"
        : "",
    }));
  };

  activateFilter = (filter_status) => {
    console.log("this.props.auth:",this.props.auth);
    var current_user_id = this.props.auth && this.props.auth.user._id ? this.props.auth.user._id : "";
    document.querySelectorAll(".fc-filterbtn-button").forEach(function (el) {
      if (filter_status) {
        el.style.setProperty("color", "#fff", "important");
        el.style.setProperty("background-color", "#73777b", "important");
      } else {
        el.style.setProperty("color", "", "important");
        el.style.setProperty("background-color", "", "important");        
      }
    });
  };

  changeWeekendBackgrounColor = () => {

    var daydivs = document.querySelectorAll('.calender-section span.day-name');
    if(daydivs && daydivs.length > 0){
      [].forEach.call(daydivs, function(daydiv) {
        if(daydiv.innerText == 'SUN' || daydiv.innerText == 'SAT'){
          daydiv.classList.add("weekend_text_color");
          let nel = daydiv.closest('td.fc-daygrid-day');
          if(nel && !nel.classList.contains('fc-day-disabled')){
            nel.classList.remove("fc-day-today");
            nel.classList.add("weekend_background");
            let ael = daydiv.nextElementSibling;
            ael.classList.add("weekend_text_color");
          }          
        }
        else{
          if (daydiv.classList.contains("weekend_text_color")) {
            daydiv.classList.remove("weekend_text_color");        
          }
          let nel = daydiv.closest('td.fc-daygrid-day');
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
  }

  render() {
    return (
      <>
        <Helmet>
          <title>Sales Calender</title>
        </Helmet>
        <Layout title="SalesCalender">
          <div className="container-fluid newScroll">
            <div className="row d-flex">
              <div
                className={this.state.sideBarType ? "col-10" : "col-12"}
                style={{ zIndex: 0 }}
              >
                <div
                  id="calender-backlog"
                  className={"background-white calender-backlog setScroll"}
                >
                  <div className="title">Backlogs</div>
                  <hr />
                  <div className={`item ${this.props.deals.length > 0 ? 'calender-backlog-item' : ''}`}>
                    {this.props.deals &&
                    this.props.deals.length > 0 &&
                    this.props.deals.filter(
                      (deal) =>
                        new Date(
                          moment(deal.follow_up, "DD-MM-YYYY").format(
                            "YYYY-MM-DD"
                          )
                        ) < this.state.currentDay &&
                        this.state.newDAte !==
                          moment(deal.follow_up, "DD-MM-YYYY").format(
                            "YYYY-MM-DD"
                          )
                    ).length > 0 ? (
                      this.props.deals.map(
                        (deal, index) =>
                            new Date( moment(deal.follow_up, "DD-MM-YYYY").format("YYYY-MM-DD")) < this.state.currentDay && this.state.newDAte !== moment(deal.follow_up, "DD-MM-YYYY").format("YYYY-MM-DD") ? (
                              <div
                                className="mt-1 backlog-event-up"
                                key={index}
                              >
                                <span
                                  id={deal._id}
                                  style={{ borderColor: `${deal.stage_color}` }}
                                  onClick={this.detailOrg(deal._id)}
                                  data-event={
                                    '{"title" :"' +
                                    deal[this.state.calender_event_title] +
                                    " " +
                                    moment(
                                      deal.follow_up,
                                      "DD-MM-YYYY HH:mm:ss"
                                    ).format("HH:mm") +
                                    '","id":"' +
                                    deal._id +
                                    '","borderColor":"' +
                                    deal.stage_color +
                                    '","display":"block"}'
                                  }
                                  className="backlog-event orange-left-border"
                                >
                                  <span>
                                    <img
                                      height={15}
                                      className="mr-1 ml-1"
                                      src="assets/img/deal_icon.svg"
                                      alt="deal"
                                    />
                                  </span>
                                  {deal[this.state.calender_event_title]}
                                </span>
                              </div>
                            ) : null
                      )
                    ) : (
                      <h6>No Backlogs are Available</h6>
                    )}
                  </div>
                </div>
                <div className="calender-section">
                  <FullCalendar
                    ref={this.calendarRef}
                    key={this.state.calenderKey}
                    renderEventContent={true}
                    height="1050px"
                    initialView="dayGridMonth"
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    customButtons={{
                      filterbtn: {
                        text: "Filters",
                        click: this.filterOrg,
                      },
                    }}
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay filterbtn",
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
                    dayCellContent={
                      this.state.currentMonth.toString() ===
                      this.state.currentDay.toString()
                        ? this.renderDayCellContent
                        : this.renderDayCellContentNext
                    }
                    editable={true}
                    eventContent={renderEventContent} // custom render function
                    eventClick={this.handleEventClick}
                    eventChange={this.handleEventChange} // called for drag-n-drop/resize
                    eventRemove={this.handleEventRemove}
                    eventClassNames={"event-design"}
                    showNonCurrentDates={false}
                    drop={this.onDrop}
                    events={this.state.eventarray}
                    eventTimeFormat={{
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12:false
                    }}
                  />
                </div>
              </div>
              <RightSidebar
                editSideBarFunc={this.editSideBar}
                closeSideBarFunc={this.closeSideBar}
                sideBarType={this.state.sideBarType}
                selectedId={this.state.selectedId}
                activateFilter={this.activateFilter}
                pageFrom={'calender'}
              />
            </div>
          </div>
          <Modal
            show={this.state.showDeleteModal}
            onHide={this.closeDeleteModal}
            centered
            aria-labelledby="contained-modal-title-vcenter"
            size="sm"
            closeButton
          >
            <Modal.Body>
              <div className="delete-popup">
                <div className="close-icon" onClick={this.closeDeleteModal}>
                  <i className="fa fa-times" />
                </div>
                <div className="delete-popup-img" />
                <div className="delete-popup-heading">Delete Permanently</div>
                <div className="delete-popup-subheading">
                  Are you sure you want permanently delete this event from your
                  list?
                </div>
                <div className="mt-3">
                  <button
                    className="btn btn-sm btn-orange"
                    onClick={this.closeDeleteModal}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </Layout>
      </>
    );
  }

  // handlers for user actions
  // ------------------------------------------------------------------------------------------

  handleDateSelect = (selectInfo) => {
    let calendarApi = selectInfo.view.calendar;
    let title = prompt("Please enter a new title for your event");

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent(
        {
          // will render immediately. will call handleEventAdd
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay,
        },
        true
      ); // temporary=true, will get overwritten when reducer gives new events
    }
  };

  handleEventClick = (clickInfo) => {
    this.setState({ drop: false });
    this.setState({
      sideBarType: "detail_deal",
      selectedId: clickInfo.event.id,
    });
    var current_user = this.props.auth ? this.props.auth.user._id : "";

    let param = {
      _id: clickInfo.event.id,
      user: current_user,
    };
    this.props.getDeal(param);
    this.props.getLogs({
      deal_id: clickInfo.event.id,
      timezone: moment.tz.guess(true),
    });
    this.props.getNotes({
      deal_id: clickInfo.event.id,
      timezone: moment.tz.guess(true),
    });
  };

  handleDates = (rangeInfo) => {};

  handleEventAdd = (addInfo) => {};

  handleEventRemove = (removeInfo) => {};
}

function renderEventContent(eventInfo) {
  // console.log("eventInfo:",eventInfo);
  return (
    <>
      <span
        className="event_datax"
        data-deal_id={eventInfo.event._def.publicId}
      >
        <img
          height="15"
          className="mr-1 ml-1"
          src="assets/img/deal_icon.svg"
          alt="deal"
        />
      </span>{" "}
      <span className="event-title">{eventInfo.event.title}</span>
      <span className="ml-1 event-date">{eventInfo.timeText}</span>
    </>
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
});
const mapDispatchToProps = {
  getDealFields,
  getDeals,
  getDeal,
  getLogs,
  getNotes,
  deleteDeal,
  updateDeal,
  getOrganisations,
  getStages,
  getDealLostReasons,
  showLoader,
  hideLoader
};
export default connect(mapStateToProps, mapDispatchToProps)(Calendar);
