import React, { Fragment, useState, useRef,useEffect } from "react";
import "./css/deal_detail_modal.css";
import {
  Modal,
  Row,
  Col,
  Badge,
  Comment,
  Tooltip,
  Timeline,
  Avatar,
  Input,
  Menu,
  Dropdown,
  Tabs,
  Form,
  Select,
  DatePicker,
  InputNumber
} from "antd";
import moment from "moment-timezone";
import {
  BuildingIcon,
  BriefCaseIcon,
  UsersIcon,
  MapPinIcon,
  FlagIcon,
  UserIcon,
  DollarIcon,
  PlusCircleIcon,
  PenIcon,
  CommentAltIcon,
  CircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CoinIcon,
  CalendarExclamationIcon,
  CalendarCheckIcon,
  UserCircleIcon,
  ThumbsUpIcon,
  TrashIcon,
  ThumbsDownIcon,
  InfoIcon,
  GeometraIcon,
  EkalKyllIcon,
  SPROJSYIcon,
  EllipsisVIcon,
  PaperplaneIcon
} from "./Icons";
import { useSelector, useDispatch } from "react-redux";
import { getStages, updateStage, deleteDealStage, sortSalesboardCard, setFilterFields as setStageFilterFields, filterSalesboardDeal } from "../redux/actions/stage";
import { addNotes,updateDeal, getDeal, getDeals, getDealLostReasons, filterDeal, getLogs } from "../redux/actions/deal";
import { getContactsOfOrganization } from "../redux/actions/custom_table_field";
import DeleteModal from "./DeleteModal";
import DealLostReasonModal from "./DealLostReasonModal";

function DealDetailModal(props) {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const [editForm] = Form.useForm();

  // console.log("DealDetailModal props:",props);
  const [noteField, setNoteField] = useState('');
  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false);
  const [visibleDealLostReasonModal, setVisibleDealLostReasonModal] = useState(false);
  const [currentDealAction, setCurrentDealAction] = useState('');
  const [editableColumn, setEditableColumn] = useState('');

  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const deal_fields = useSelector(
    (state) =>
      (state.custom_table_field && state.custom_table_field.deals) || []
  );
  const detail = useSelector(
    (state) => (state.deal && state.deal.single) || ""
  );
  const edit = useSelector(
    (state) => (state.deal && state.deal.edit) || ""
  );
  const notes = useSelector(
    (state) =>
      (state.deal && state.deal.notes) || []
  );
  const logs = useSelector(
    (state) => (state.deal.logs && state.deal.logs) || []
  );

  useEffect(() => {
    console.log("useEffect");
    if(edit.organization) {
      let param = { organization:edit.organization };
      dispatch(getContactsOfOrganization(param));
    }    
  }, [edit.organization]);

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();      
    }, 100);
  }, [notes]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) { messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }) }
  }

  const handleNoteChange = (e) => {
    const { name, value } = e.target;
    setNoteField(value);
    console.log("dd:",value);
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();    
    if(!noteField.trim()){
      return 1;
    }
    var formData = {
      user:current_user_id,
      notes_type:'deal',
      deal:detail._id,
      organization:(edit.organization && typeof edit.organization == 'object' && edit.organization.value) ? edit.organization.value : edit.organization,
      contact:(edit.contact_name && typeof edit.contact_name == 'object' && edit.contact_name.value) ? edit.contact_name.value : edit.contact_name,
      description:noteField,
    };
    var query_param = {
      timezone:moment.tz.guess(true)
    }
    console.log("handleNoteSubmit:", formData);
    dispatch(addNotes(formData,query_param));
    setNoteField('');
  };

  const confirmDelete = async(e) => {
    let param = {
      user:current_user_id,
      deal_id: detail._id,
    };
    await dispatch(deleteDealStage(param));
    props.visibleFunc(false);
    setVisibleDeleteModal(false);
    await props.reloadPageFunc();
  }

  const onEditFinish = async(form_values) => {
    console.log("Received values of form: ", form_values);
    let form_data = {user: current_user_id};
    for (const cnt1 of deal_fields) {
      Object.keys(form_values).forEach((key, index) => {
          // console.log(`${key}: ${form_values[key]}`);
          let getValue = form_values[cnt1.column_slug] ? form_values[cnt1.column_slug] : "";
          if(key == cnt1.column_slug) {
            if(['choice','inherit'].includes(cnt1.column_type.toLocaleLowerCase())){
              let ref =  '';
              if(cnt1.column_slug == 'organization'){
                ref = 'organization';
              }
              else if(cnt1.column_slug == 'contact_name'){
                ref = 'contact';
              }
              else if(cnt1.column_slug == 'responsible'){
                ref = 'user';
              }
              else {
                ref = cnt1.column_slug;
              }
              form_data[cnt1.column_slug] = getValue ? {ref:ref, value:getValue} : "";
            }
            else{
              form_data[cnt1.column_slug] = form_values[cnt1.column_slug];
            } 
          }
      });
    }
    console.log("final:", form_data);
    var formData = {
      data: form_data,
      _id: (detail && detail._id) ? detail._id : '',
      timezone: moment.tz.guess(true)
    };
    await dispatch(updateDeal(formData));
    await props.reloadPageFunc();
    let param = {
      _id: (detail && detail._id) ? detail._id : '',
      other:{
        user: current_user_id,
        timezone: moment.tz.guess(true)
      }
    };
    await dispatch(getDeal(param));    
    setEditableColumn('');
  }

  return (
    <Fragment>
      <Modal
        title={false}
        footer={false}
        visible={props.visible}
        centered
        onOk={() => props.visibleFunc(false)}
        onCancel={() => {
          props.visibleFunc(false);
          setEditableColumn("");
        }}
        width={1000}
        className="deal_modal"
        destroyOnClose={true}
      >
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Deal" key="1">
            <Row>
              <Col xs={24} sm={9} md={9} lg={9} className="deal_left_section">
                <DeleteModal
                  title="Delete Deal"
                  description="Are you sure you want to delete this deal?"
                  visible={visibleDeleteModal}
                  visibleFunc={setVisibleDeleteModal}
                  confirmDeleteAction={confirmDelete}
                />
                <DealLostReasonModal
                  currentDealAction={currentDealAction}
                  handleDealActionFunc={props.handleDealActionFunc}
                  visible={visibleDealLostReasonModal}
                  visibleFunc={setVisibleDealLostReasonModal}
                />
                {deal_fields &&
                  deal_fields.length > 0 &&
                  deal_fields.map((deal, index) => (
                    <Row key={index}>
                      <Col xs={8} sm={3} md={3} lg={3}>
                        <Tooltip title={deal.column_name} placement="rightTop">
                          <span>
                            {setIcon(
                              deal.column_slug,
                              deal.column_name,
                              detail
                            )}
                          </span>
                        </Tooltip>
                      </Col>
                      <Col xs={16} sm={21} md={21} lg={21}>
                        {editableColumn && editableColumn == deal.column_slug && !["label"].includes(deal.column_type.toLowerCase()) ? (
                          editColumnDetail(
                            deal,
                            edit,
                            editForm,
                            onEditFinish, current_user_id)
                        ) : (
                          <div
                            onDoubleClick={() =>
                              deal.is_editable ? setEditableColumn(deal.column_slug)  : setEditableColumn('')
                            }
                          >
                            {
                              detail[deal.column_slug]
                              ? setColumnDetail(deal.column_slug, detail[deal.column_slug]) 
                              : "-"}
                          </div>
                        )}
                      </Col>
                    </Row>
                  ))}
                <Row className="first_plan_row">
                  <Col span={24} className="first_plan">
                    <div style={{ marginRight: "5px",display:'inline-flex' }}><GeometraIcon /></div>
                    <div className="plan_title">Trial</div>
                    <div className="plan_date">2021-06-13</div>
                  </Col>
                </Row>
                <Row className="first_plan_row">
                  <Col span={24} className="first_plan">
                    <div style={{ marginRight: "5px",display:'inline-flex' }}><EkalKyllIcon /></div>
                    <div className="plan_title">Monthly</div>
                    <div className="plan_date">2021-06-13</div>
                  </Col>
                </Row>
                <Row className="first_plan_row">
                  <Col span={24} className="first_plan">
                    <div style={{ marginRight: "5px",display:'inline-flex' }}><SPROJSYIcon /></div>
                    <div className="plan_title">Yearly</div>
                    <div className="plan_date">2022-06-13</div>
                  </Col>
                </Row>
              </Col>
              <Col
                xs={24}
                sm={15}
                md={15}
                lg={15}
                className="deal_right_section"
              >
                <Row>
                  <Col span={24}>
                    <Dropdown
                      overlay={deal_action_menu(
                        setVisibleDeleteModal,
                        setVisibleDealLostReasonModal,
                        props.handleDealActionFunc,
                        setCurrentDealAction,
                        detail
                      )}
                      placement="bottomRight"
                      trigger={["click"]}
                    >
                      <span className="deal_action_bar">
                        <EllipsisVIcon />
                      </span>
                    </Dropdown>
                  </Col>
                </Row>
                <Row className="note_messages">
                  <Col span={24}>
                    <div className="comment_section">
                      {notes &&
                        notes.length > 0 &&
                        notes.map((note, index) => (
                          <Comment
                            key={index}
                            className={
                              current_user_id == note.sender_id
                                ? "right-message"
                                : "left-message"
                            }
                            author={
                              <a>
                                {current_user_id == note.sender_id
                                  ? "You"
                                  : note.sender}
                              </a>
                            }
                            avatar={
                              <Avatar
                                src={note.sender_photo}
                                alt={note.sender}
                              />
                            }
                            content={<p>{note.notes}</p>}
                            datetime={
                              <Tooltip
                                title={moment(note.created_at).format(
                                  "YYYY-MM-DD HH:mm:ss"
                                )}
                              >
                                <span>{moment(note.created_at).fromNow()}</span>
                              </Tooltip>
                            }
                          />
                        ))}
                      <div className="ant-comment" ref={messagesEndRef} />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span={24} className="note_input">
                    <form onSubmit={handleNoteSubmit}>
                      <Input
                        placeholder="Make notes about this deal..."
                        value={noteField}
                        suffix={
                          <Tooltip title="Send Note">
                            <span onClick={handleNoteSubmit} className="sent_note_btn"><PaperplaneIcon /></span>
                          </Tooltip>
                        }
                        onChange={handleNoteChange}
                      />
                    </form>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Log" key="2">
            <Row className="deal_log_timeline">
              <Col span={24} className="timeline_full_section">
                <Timeline mode="alternate">
                  {logs &&
                    logs.length > 0 &&
                    logs.map((log, index) => (
                      <Timeline.Item dot={setLogIcon(log.action)} key={index}>
                        <h3>{setLogText(log.action)}</h3>
                        <div>{log.description}</div>
                        <div>
                          {current_user_id == log.user._id
                            ? "You"
                            : log.username}
                        </div>
                        <div>{log.created_at}</div>
                        {log.action == "note_add" && (
                          <Comment
                            className="log-notes-comment"
                            content={<p>{log.note_message}</p>}
                          />
                        )}
                      </Timeline.Item>
                    ))}
                </Timeline>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </Fragment>
  );
}

const deal_action_menu = (setVisibleDeleteModal, setVisibleDealLostReasonModal,handleDealAction,setCurrentDealAction,deal) => ( 
  <Menu>
    {(() => {
      let deal_status = deal.is_deal_won;
        switch(deal_status) {
          // Lost
          case 0:
            return (
              <>
              <Menu.Item key="da1" icon={<ThumbsUpIcon />} onClick={() => handleDealAction(deal._id,'deal_pending','')} >
                Mark as Pending
              </Menu.Item>
              <Menu.Item key="da2" icon={<ThumbsDownIcon />} onClick={() => { handleDealAction(deal._id,'deal_won','') }}>
                Mark as Won
              </Menu.Item>
              </>
            );

          // Won
          case 1:
            return (
              <>
              <Menu.Item key="da3" icon={<ThumbsUpIcon />} onClick={() => handleDealAction(deal._id,'deal_pending','')} >
                Mark as Pending
              </Menu.Item>
              <Menu.Item key="da4" icon={<ThumbsDownIcon />} onClick={() =>{ setVisibleDealLostReasonModal(true); setCurrentDealAction('deal_cancel'); }}>
                Mark as Cancelled
              </Menu.Item>
              </>
            );

          // Pending
          case 2:
            return (
              <>
              <Menu.Item key="da5" icon={<ThumbsUpIcon />} onClick={() => handleDealAction(deal._id,'deal_won','')} >
                Mark as Won
              </Menu.Item>
              <Menu.Item key="da6" icon={<ThumbsDownIcon />} onClick={() => {setVisibleDealLostReasonModal(true); setCurrentDealAction('deal_lost') ; }}>
                Mark as Lost
              </Menu.Item>
              </>
            );
          default:
            return (
              <>
              <Menu.Item key="da7" icon={<ThumbsUpIcon />} onClick={() => handleDealAction(deal._id,'deal_won','')} >
                Mark as Won
              </Menu.Item>
              <Menu.Item key="da8" icon={<ThumbsDownIcon />} onClick={() => {setVisibleDealLostReasonModal(true); setCurrentDealAction('deal_lost') ; }}>
                Mark as Lost
              </Menu.Item>
              </>
            );
        }
    })()}

    <Menu.Item key="da9" icon={<TrashIcon />} onClick={() => setVisibleDeleteModal(true)}>
      Delete Deal
    </Menu.Item>
  </Menu>
);
const setIcon = (column_slug, column_name,detail) => {
  let icon = "";
  switch (column_slug) {
    case "organization":
      icon = <BuildingIcon />;
      break;
    case "contact_name":
      icon = <UserIcon height={20} width={20} />;
      break;
    case "phone":
      icon = <PhoneIcon />;
      break;
    case "email":
      icon = <EnvelopeIcon />;
      break;
    case "stage":
      icon = (
        <span className="dealbadge">
          <Badge color={detail["stage_color"]} text="" size="default" />
        </span>
      );
      break;
    case "follow_up":
      icon = <CalendarExclamationIcon />;
      break;
    case "est_close_date":
      icon = <CalendarCheckIcon />;
      break;
    case "value":
      icon = <CoinIcon />;
      break;
    case "responsible":
      icon = <UserCircleIcon height={20} width={20} />;
      break;
    default:
      icon = <InfoIcon height={20} width={20} />;
  }
  return icon;
};

const setLogIcon = (action) => {
  let icon = "";
  switch (action) {
    case "deal_created":
      icon = <PlusCircleIcon />;
      break;
    case "edit_detail":
      icon = <PenIcon />;
      break;
    case "deal_status_change":
      icon = <CircleIcon />;
      break;
    case "note_add":
      icon = <CommentAltIcon />;
      break;
    default:
      icon = <PenIcon />;
  }
  return icon;  
}

const setLogText = (action) => {
  let text = "";
  switch (action) {
    case "deal_created":
      text = "Created";
      break;
    case "edit_detail":
      text = "Edited";
      break;
    case "deal_status_change":
      text = "Stage Changed";
      break;
    case "note_add":
      text = "Comment";
      break;
    default:
      text = "Other";
  }
  return text;  
}

const editColumnDetail = (deal, edit, editForm, onEditFinish, current_user_id) => (
  <Form
    form={editForm}
    layout="vertical"
    className="deal_edit_form"
    onFinish={onEditFinish}
  >
    {(() => {
      let column_type = deal.column_type.toLowerCase();
      let column_slug = deal.column_slug;
      let dateFormat = column_slug == "follow_up" ? `DD-MM-YYYY HH:mm` : `DD-MM-YYYY`;
      let edit_value =  ['choice','inherit'].includes(column_type) ?  edit[deal.column_slug]["value"] : edit[deal.column_slug];
      if(['date'].includes(column_type)) {
        // edit_value = moment.utc(edit_value, `YYYY-MM-DD HH:mm:ss`).local();
        edit_value = moment(edit_value,`YYYY-MM-DD HH:mm:ss`);
        editForm.setFieldsValue({
          [column_slug]: edit_value ? moment(edit_value) : moment(),
        });
      } 
      else {
        editForm.setFieldsValue({
          [column_slug]: edit_value ? edit_value : '',
        });
      }     
      console.log("column_type::",column_type,"column_slug:",column_slug,"edit_value:",edit_value);
      switch (column_type) {
        case "text":
        case "phone":
          return (
            <Form.Item
              // label={deal.column_name}
              name={deal.column_slug}
              rules={[
                {
                  required: deal.is_required,
                  message: "Field Required!",
                },
              ]}
              hasFeedback 
            >
              <Input onBlur={() => editForm.submit()} />
            </Form.Item>
          );
        case "email":
          return (
            <Form.Item
              // label={deal.column_name}
              name={deal.column_slug}
              rules={[
                {
                  required: deal.is_required,
                  message: "Field Required!",
                },
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
              ]}
              hasFeedback
            >
              <Input onBlur={() => editForm.submit()} />
            </Form.Item>
          );
        case "number":
          return (
            <Form.Item
              // label={deal.column_name}
              name={deal.column_slug}
              rules={[
                {
                  required: deal.is_required,
                  message: "Field Required!",
                },
              ]}
              hasFeedback
            >
              <InputNumber style={{width:'100%'}} min={1} onBlur={() => editForm.submit()} />
            </Form.Item>
          );
        case "choice":
          return (
            <Form.Item
              // label={contact.column_name}
              name={deal.column_slug}
              rules={[
                {
                  required: deal.is_required,
                  message: "Field Required!",
                },
              ]}
              hasFeedback
            >
              <Select
                showSearch
                filterOption={(input, option) => {
                  return (
                    option.key.toLowerCase().indexOf(input.toLowerCase()) >=
                      0 ||
                    option.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  );
                }}
                onBlur={() => editForm.submit()}
              >
                {deal.values && deal.values.length > 0
                  ? deal.values.map((data, index) => (
                      <Select.Option
                        data-ref={data.ref}
                        key={`${index}_${deal._id}`}
                        value={data.value}
                        title={data.label}
                      >
                        {data.label}
                      </Select.Option>
                    ))
                  : null}
              </Select>
            </Form.Item>
          );
        case "inherit": 
          return (
            <Form.Item
              // label={contact.column_name}
              name={deal.column_slug}
              rules={[
                {
                  required: deal.is_required,
                  message: "Field Required!",
                },
              ]}
              hasFeedback
            >
              <Select
                showSearch
                filterOption={(input, option) => {
                  return (
                    option.key.toLowerCase().indexOf(input.toLowerCase()) >=
                      0 ||
                    option.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  );
                }}
                onBlur={() => editForm.submit()}
              >
                {deal.values && deal.values.length > 0
                  ? deal.values.map((data, index) => (
                      <Select.Option
                        data-ref={data.ref}
                        key={`${index}_${deal._id}`}
                        value={data.value}
                        title={data.label}
                      >
                        {current_user_id == data.value ? `${data.label} (YOU)` : data.label}
                      </Select.Option>
                    ))
                  : null}
              </Select>
            </Form.Item>
          );
        case "date":
          return (
            <Form.Item
              // label={deal.column_name}
              name={deal.column_slug}
              rules={[
                {
                  required: deal.is_required,
                  message: "Field Required!",
                },
              ]}
              hasFeedback
            >
              <DatePicker
                isoWeek
                className="dt-picker"
                format={dateFormat}
                showTime={deal.column_slug == "follow_up" ? true : false}
                onBlur={() => editForm.submit()}
                // value={edit_value}
              />
            </Form.Item>
          );
        default:
          return "";
      }
    })()}
  </Form>
);

const setColumnDetail = (column_slug, column_value) => (
  <>
    {(() => {
       switch (column_slug) {
        case "email":
          return <a href={`mailto:${column_value}`}>{column_value}</a>;
        case "phone":
          return <a href={`tel:${column_value}`}>{column_value}</a>;        
        default:
          return column_value;
      }
    })()}
  </>
);
export default DealDetailModal;
