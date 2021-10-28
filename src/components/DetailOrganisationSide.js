import React, { useState, Fragment } from "react";
import { Link } from "react-router-dom";
import { Tab, Tabs } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { addNotes } from "../redux/actions/organisation";
import { convertToSlug, log_keys, note_keys } from "../utils/helpers";
import moment from 'moment-timezone';

function DetailOrganisationSide({
  editSideBarFunc,
  closeSideBarFunc,
}) {
  const [tab, setTab] = useState("1");
  const dispatch = useDispatch();  
  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  ); 
  const detail = useSelector(
    (state) => (state.organisation && state.organisation.single) || ""
  );
  const logs = useSelector(
    (state) => (state.organisation.logs && state.organisation.logs) || []
  );
  const organisation_fields = useSelector(
    (state) =>
      (state.custom_table_field && state.custom_table_field.organisations) || []
  );
  const notes = useSelector(
    (state) =>
      (state.organisation && state.organisation.notes) || []
  );
  
  let initNoteField = {
    user: current_user_id,
    notes_type:'organization',
  };
  const [noteField, setNoteField] = useState(initNoteField);

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
      organization:detail._id,
      description:noteField.description,
    };
    var query_param = {
      timezone:moment.tz.guess(true)
    }
    console.log("handleNoteSubmit:", formData);
    dispatch(addNotes(formData,query_param));
    setNoteField({ ...noteField, description: '' });
  };
  return (
    <>
      <div className="w-100 side-main organization">
        <div
          className="title p-3"
          style={{ fontSize: "14px", fontWeight: "700" }}
        >
          <span  className="detail-heading">
            {organisation_fields && organisation_fields.length > 0
              ? detail[convertToSlug(organisation_fields[0].column_name)]
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
              {organisation_fields && organisation_fields.length > 0
                ? organisation_fields.map((org) => (
                    <Fragment key={org._id}>
                      <div className="d-flex align-items-center mb-10">
                        <div className="d-flex flex-column font-weight-bold w-50">
                          <span className="text-muted">{org.column_name}</span>
                        </div>
                        <div className="text-dark text-break w-50">
                          {detail[org.column_slug]}
                        </div>
                      </div>
                    </Fragment>
                  ))
                : null}

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
    </>
  );
}

export default DetailOrganisationSide;
