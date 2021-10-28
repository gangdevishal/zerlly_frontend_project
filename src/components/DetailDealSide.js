import React, { useState, Fragment, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tab, Tabs, Modal } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { addNotes,updateDealAction, getDeal, getDeals, getDealLostReasons, filterDeal, getLogs } from "../redux/actions/deal";
import { convertToSlug, log_keys, note_keys } from "../utils/helpers";
import moment from 'moment-timezone';

function DetailDealSide({
  editSideBarFunc,
  closeSideBarFunc,
}) {
  const [tab, setTab] = useState("1");
  const dispatch = useDispatch();  
  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  ); 
  const detail = useSelector(
    (state) => (state.deal && state.deal.single) || ""
  );
  const filter_fields = useSelector(
    (state) => (state.deal && state.deal.filter_fields) || ""
  );
  const edit = useSelector(
    (state) => (state.deal && state.deal.edit) || ""
  );
  const logs = useSelector(
    (state) => (state.deal.logs && state.deal.logs) || []
  );
  const deal_fields = useSelector(
    (state) =>
      (state.custom_table_field && state.custom_table_field.deals) || []
  );
  const notes = useSelector(
    (state) =>
      (state.deal && state.deal.notes) || []
  );
  const lost_reasons = useSelector((state) => state.deal.lost_reasons);
  
  let initNoteField = {
    user: current_user_id,
    notes_type:'deal',
  };
  const [noteField, setNoteField] = useState(initNoteField);
  const [lostReasonModal, setLostReasonModal] = useState(false);
  const [lostReasonData, setLostReasonData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {    
    dispatch(getDealLostReasons());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNoteField({ ...noteField, [name]: value });
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();    
    if(!noteField.description.trim()){
      return 1;
    }

    var formData = {
      user:noteField.user,
      notes_type:noteField.notes_type,
      deal:detail._id,
      organization:(edit.organization && typeof edit.organization == 'object' && edit.organization.value) ? edit.organization.value : edit.organization,
      contact:(edit.contact_name && typeof edit.contact_name == 'object' && edit.contact_name.value) ? edit.contact_name.value : edit.contact_name,
      description:noteField.description,
    };
    var query_param = {
      timezone:moment.tz.guess(true)
    }
    console.log("handleNoteSubmit:", formData);
    dispatch(addNotes(formData,query_param));
    setNoteField({ ...noteField, description: '' });
  };

  const hanldeDealAction = async(type) => {
    let formData = {
      user:current_user_id,
      deal:detail._id,
      action:type,
      reason:''
    };
    console.log("formData:",formData);
    await dispatch(updateDealAction(formData));
    
    let param = {
      _id: detail._id,
      user:current_user_id
    };
    await dispatch(getDeal(param));
    await dispatch(getLogs({
      deal_id: detail._id,
      timezone: moment.tz.guess(true),
    }));

    if(filter_fields){
      console.log("filter");
      await dispatch(filterDeal(filter_fields, false));
    }
    else{
      let param2 = {
        user_id:current_user_id,
        deal_user:current_user_id,
        sort_by:"updated_at",
        order_by:-1,page:'calender'
      };
      await dispatch(getDeals(param2));
    }
    closeSideBarFunc();    
  }

  const openLostReasonMoal = async(type) => {
    setLostReasonModal(true);
    let newLostData = { ...lostReasonData,type:type };
    setLostReasonData(newLostData);
  }

  const closeLostReasonModal = (e) => {
    setLostReasonModal(false);
  }

  const handleLostDealReason = (e) => {
    const {name,value} = e.target;
    let newLostData = { ...lostReasonData, [name]:value  };
    setLostReasonData(newLostData);
  }

  const submitLostDealReason = async(e) => {
   console.log("lostReasonData:",lostReasonData);
   let error = {};
   if(!lostReasonData.lost_reason_text){
    error['lost_reason_text'] = 'Lost Reason Required!';
   }
   else{
    let formData = {
      user:current_user_id,
      deal:detail._id,
      action:lostReasonData.type,
      reason:lostReasonData.lost_reason_text
    };

    console.log("formData:",formData);
    await dispatch(updateDealAction(formData));
    
    let param = {
      _id: detail._id,
      user:current_user_id
    };
    await dispatch(getDeal(param));
    await dispatch(getLogs({
      deal_id: detail._id,
      timezone: moment.tz.guess(true),
    }));

    if(filter_fields){
      console.log("filter");
      await dispatch(filterDeal(filter_fields,false));
    }
    else{
      let param2 = {
        user_id:current_user_id,
        deal_user:current_user_id,
        sort_by:"updated_at",
        order_by:-1
      };
      await dispatch(getDeals(param2));
    }
    setLostReasonModal(false);
    setLostReasonData({});
   }
   setErrors(error);
  }

  return (
    <>
      <div className="w-100 side-main deal">
        <div
          className="title p-3"
          style={{ fontSize: "14px", fontWeight: "700" }}
        >
          <span  className="detail-heading">
            {deal_fields && deal_fields.length > 0
              ? detail[convertToSlug(deal_fields[0].column_name)]
              : null}
          </span>
          <span className="float-right edit-close">
            {/* { (detail && detail.user === current_user_id) ? (
              <i
                onClick={() => editSideBarFunc()}
                className="fas fa-pen grey mr-2"
                style={{ cursor: "pointer" }}
              />
            )  : null  } */}
            <i
                onClick={() => editSideBarFunc()}
                className="fas fa-pen grey mr-2"
                style={{ cursor: "pointer" }}
              />
            <i
              className="fas fa-times grey"
              onClick={() => closeSideBarFunc()}
              style={{ cursor: "pointer" }}
            />
          </span>
        </div>
        <div className="tab-grid">
          <Tabs
            style={{ fontSize: "14px", padding: "2px 10px 0px  10px" }}
            activeKey={tab}
            onSelect={(key) => setTab(key)}
          >
            <Tab
              style={{ fontSize: "12px", lineHeight: "25px" }}
              className="p-2 tabDetail"
              eventKey="1"
              title="Details"
            >
              {deal_fields && deal_fields.length > 0
                ? deal_fields.map((deal) => (
                    <Fragment key={deal._id}>
                      <div className="d-flex align-items-center mb-10">
                        <div className="d-flex flex-column font-weight-bold w-50">
                          <span className="text-muted">{deal.column_name}</span>
                        </div>
                        <div className="text-dark text-break w-50">
                          {
                            (
                              deal.column_slug && deal.column_slug === 'stage' && detail["stage_color"]) 
                              ? 
                              (
                                <>
                                  <div className="round round-sm" style={{ backgroundColor: `${detail["stage_color"]}` }}>
                                  </div> 
                                  {detail[deal.column_slug]}
                                </>
                              ) : 
                              (deal.column_slug && deal.column_slug === 'phone' && detail[deal.column_slug]) ? 
                              (
                                <a href={ `tel:${detail[deal.column_slug]}`}>{detail[deal.column_slug]}</a>
                              )
                              : 
                              (deal.column_slug && deal.column_slug === 'email' && detail[deal.column_slug]) ? 
                              (
                                <a href={ `mailto:${detail[deal.column_slug]}`}>{detail[deal.column_slug]}</a>
                              )
                              :
                              /*(deal.column_slug && deal.column_slug === 'responsible') ? 
                              (
                                <div className="d-flex align-items-center">
                                  { 
                                    detail["user_photo"] 
                                    ? (<img src={detail["user_photo"]} className="img-responsive img-thumbnail mr-1" style={{ height:"30px", width:"30px", borderRadius:"50%" }}/> ) 
                                    : null 
                                  } {
                                    detail[deal.column_slug]
                                  }
                                </div>
                              )*/ 
                              detail[deal.column_slug]                            
                          }
                        </div>
                      </div>
                    </Fragment>
                  ))
                : null}

                <div className="card sls-right">
                <div className="card-body">
                  <h6 className="card-title">Deal Action</h6>
                  <div className="card-text">
                    <div className="d-flex">
                    { detail['is_deal_won'] && detail['is_deal_won']==1  ? (
                      <>
                      <button
                        type="button"
                        className="btn sales-action-btn btn-warning mt-1"
                        onClick={(e) => hanldeDealAction("deal_pending")}
                        style={{width:"50%"}}
                      >
                        <i className="fas fa-minus-circle fa-black-outline" />{" "}
                        Pending
                      </button>
                        &nbsp;&nbsp;
                        <button
                          type="button"
                          className="btn sales-action-btn btn-danger mt-1"
                          onClick={(e) => openLostReasonMoal("deal_cancel")}
                          style={{width:"50%"}}
                        >
                          <i className="fas fa-ban fa-white-outline" />{" "}
                          Cancel Deal
                        </button>
                        </>
                    ): detail['is_deal_won']==0  ? (
                      <>
                      <button
                        type="button"
                        className="btn sales-action-btn btn-success mt-1"
                        onClick={(e) => hanldeDealAction("deal_won")}
                        style={{width:"50%"}}
                      >
                        <i className="fas fa-thumbs-up fa-white-outline" /> Won
                        Deal
                      </button>
                      &nbsp;&nbsp;
                      <button
                        type="button"
                        className="btn sales-action-btn btn-warning mt-1"
                        onClick={(e) => hanldeDealAction("deal_pending")}
                        style={{width:"50%"}}
                      >
                        <i className="fas fa-minus-circle fa-black-outline" />{" "}
                        Pending
                      </button>
                      </>
                    ) : detail['is_deal_won'] && detail['is_deal_won']==3  ? (
                      <>
                      <button
                        type="button"
                        className="btn sales-action-btn btn-danger mt-1"
                        onClick={(e) => hanldeDealAction("deal_remove")}
                        style={{width:"100%"}}
                      >
                        <i className="fas fa-trash fa-white-outline" /> Remove Deal
                      </button>
                      </>
                    ) : (
                      <>
                      <button
                        type="button"
                        className="btn sales-action-btn btn-success mt-1"
                        onClick={(e) => hanldeDealAction("deal_won")}
                        style={{width:"50%"}}
                      >
                        <i className="fas fa-thumbs-up fa-white-outline" /> Won
                        Deal
                      </button>
                      &nbsp;&nbsp;
                      <button
                        type="button"
                        className="btn sales-action-btn btn-outline-secondary mt-1"
                        onClick={(e) => openLostReasonMoal("deal_lost")}
                        style={{width:"50%"}}
                      >
                        <i className="fas fa-thumbs-down fa-grey-outline" />{" "}
                        Lost Deal
                      </button>
                      </>
                    )}
                    </div>
                    <span>
                    { (detail['is_deal_won'] === 0) ? `Status: This deal is lost.` : (detail['is_deal_won'] === 1) ? `Status: This deal is won.` : (detail['is_deal_won'] === 3) ? 'Status: This deal is cancelled.' : 'Status: This deal is pending.' }</span>
                  </div>
                </div>
              </div>

                { detail['is_deal_won'] && detail['is_deal_won']==8  ? (
                  <div className="card sls-right">
                    <div className="card-body">
                      <h6 className="card-title">Deal Action</h6>
                      <div className="card-text">
                        <div className="d-flex">
                          <button
                            type="button"
                            className="btn sales-action-btn btn-outline-secondary mt-1"
                            onClick={(e) => hanldeDealAction("deal_pending")}
                            style={{width:"100%"}}
                          >
                            <i className="fas fa-thumbs-down fa-grey-outline" />{" "}
                            Change to Pending
                          </button>
                        </div>
                        <span>
                        { (detail['is_deal_won'] === 0) ? `Status: This deal is lost.` : (detail['is_deal_won'] === 1) ? `Status: This deal is won.` : 'Status: This deal is pending.' }</span>
                      </div>
                    </div>
                  </div>
                ) : null }
                

              <div className="mt-2 notesection">
                <h6>Notes</h6>
                <hr />
                {notes && notes.length > 0
                ? notes.map((note) => (
                  <Fragment key={note._id}>
                    <div className="card mt-2">
                      <div className="card-header">
                        <div className="d-flex align-items-center mb-10">
                          {/* <i
                            className="fas fa-user-friends fa-grey-outline mr-2"
                            style={{ fontSize: 15 }}
                          /> */}
                          <span className="mr-2" style={{ marginLeft:"-10px" }}><img alt="" height="16px" src={`assets/img/notes/${note_keys[note.notes_type]['icon']}`} /></span>
                          <span className="text-muted font-weight-bold">
                            {(note.title) ? note.title : note_keys[note.notes_type]['title']}
                          </span>
                          <span
                            className="text-muted font-weight-bold float-right"
                            style={{
                              right: "0",
                              position: "absolute",
                              padding: "8px",
                            }}
                          >
                            <Link to={`/${note_keys[note.notes_type]['link']}?redirectId=${note.ref_id}`}>
                              <div className="linked" />
                            </Link>
                          </span>
                        </div>
                      </div>
                      <div className="card-body p-2">
                        <div className="d-flex align-items-center mb-10">
                          <i
                            className="fas fa-user fa-grey-outline mr-1"
                            style={{ fontSize: 10 }}
                          />
                          <span className="text-muted font-weight-bold">
                            {note.sender}
                          </span>
                          <span
                            className="text-muted float-right"
                            style={{
                              right: "0",
                              position: "absolute",
                              padding: "8px",
                              fontSize: "9px",
                              color: " #9CA0A4",
                            }}
                          >
                            {note.created_at}
                          </span>
                        </div>
                        <p>
                          {note.notes}
                        </p>
                      </div>
                    </div>
                  </Fragment>
                )) : (
                  <p className="text-center">No any notes found</p>
                )}
              </div>
              <div className="addNote">
                <form onSubmit={handleNoteSubmit}>
                  <div className="d-flex align-items-center mb-10">
                    {/* <input
                      type="text"
                      placeholder="Write a note..."
                      className="form-control"
                      name="notes"
                      onChange={handleChange}
                      value={noteField.notes}
                    /> */}

                    <textarea placeholder="Write a note..."
                      // rows="1"
                      className="form-control"
                      name="description"
                      onChange={handleChange}
                      value={noteField.description} />
                    <div onClick={handleNoteSubmit} className="round round-md ml-2 addNoteBtn" style={{ cursor:"pointer" }}
                    > <i className="fa fa-paper-plane" />
                    </div>
                  </div>
                </form>
              </div>
            </Tab>

            <Tab
              style={{ fontSize: "12px", lineHeight: "25px" }}
              className="p-2 tabLog"
              eventKey="2"
              title="Log"
            >
              <div className="main-timeline">
                {logs && logs.length > 0
                  ? logs.map((log) => (
                      <Fragment key={log._id}>
                        <div className="timeline">
                          <div className="timeline-content">
                            <div
                              className="d-flex"
                              style={{ marginBottom: "10px" }}
                            >
                              {/* <i
                                className="fas fa-user-circle fa-grey-outline mr-2 icon-timeline"
                                style={{ fontSize: 25 }}
                              /> */}
                              <span className="mr-2 icon-timeline log_icon_circle">
                                <img alt="" src={`assets/img/logs/${log_keys[log.action]['icon']}`} />
                              </span>
                              <div
                                className="d-flex flex-column"
                                style={{ lineHeight: "1.5" }}
                              >
                                <span className="text-muted font-weight-bold">
                                  {log_keys[log.action]['title']}
                                </span>
                                <span className="text-muted">
                                  {log.description} <br/>
                                  {log.username}
                                </span>
                                <span className="text-muted">
                                {log.created_at}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    ))
                  : (<p className="text-center">No logs found</p>)}                
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
      <Modal
        show={lostReasonModal}
        onHide={closeLostReasonModal}
        centered
        aria-labelledby="contained-modal-title-vcenter"
        size="sm"
      >
        <Modal.Body>
          <div className="delete-popup">
            <div className="close-icon" onClick={closeLostReasonModal}>
              <i className="fa fa-times" />
            </div>
            <div className="org-form">
              <div className="form-group">
                <label htmlFor="">Select any one lost reason</label>
                <select
                  onChange={handleLostDealReason}
                  className="form-control"
                  name="lost_reason_text"
                  id="lost_reason_text"
                >
                  <option value="">Select Lost Reason</option>
                  {lost_reasons &&
                    lost_reasons.length > 0 &&
                    lost_reasons.map((reason) => (
                      <option key={reason._id} value={reason._id}>
                        {reason.title}
                      </option>
                    ))}
                </select>
                <span className="text-danger">
                  {errors["lost_reason_text"]}
                </span>
              </div>
            </div>
            <div className="mt-3 d-flex align-items-center justify-content-center">
              <button
                className="btn btn-sm btn-orange"
                onClick={submitLostDealReason}
              >
                <i className="fas fa-thumbs-down" /> Lost Deal
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DetailDealSide;
