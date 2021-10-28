import React, { Fragment, useState, useRef, useEffect } from "react";
import "./css/contact_detail_modal.css";
import {
  Modal,
  Button,
  Tabs,
  Row,
  Col,
  Comment,
  Tooltip,
  Timeline,
  Avatar,
  Input,
  Collapse,
  Menu,
  Dropdown,
  Badge,
  Form,
  Select,
  DatePicker
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
  TrashIcon,
  InfoIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarExclamationIcon,
  CalendarCheckIcon,
  CoinIcon,
  UserCircleIcon,
  EllipsisVIcon,
  PaperplaneIcon
} from "./Icons";
import { useSelector, useDispatch } from "react-redux";
import { addNotes, deleteContact, updateContact, getContact } from "../redux/actions/contact";
import DeleteModal from "./DeleteModal";
const { Panel } = Collapse;


function ContactDetailModal(props) {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const [editForm] = Form.useForm();

  const [noteField, setNoteField] = useState('');
  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false);
  const [visibleDealLostReasonModal, setVisibleDealLostReasonModal] = useState(false);
  const [editableColumn, setEditableColumn] = useState('');


  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const contact_fields = useSelector(
    (state) =>
      (state.custom_table_field && state.custom_table_field.contacts) || []
  );
  const detail = useSelector(
    (state) => (state.contact && state.contact.single) || ""
  );
  const edit = useSelector(
    (state) => (state.contact && state.contact.edit) || ""
  );
  const notes = useSelector(
    (state) =>
      (state.contact && state.contact.notes) || []
  );
  const logs = useSelector(
    (state) => (state.contact.logs && state.contact.logs) || []
  );

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
      notes_type:'contact',      
      contact:detail._id,
      organization:(edit.organization && typeof edit.organization == 'object' && edit.organization.value) ? edit.organization.value : edit.organization,
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
    await dispatch(deleteContact(detail._id));
    props.visibleFunc(false);
    setVisibleDeleteModal(false);
    await props.reloadPageFunc();
  }

  const onEditFinish = async(form_values) => {
    console.log("Received values of form: ", form_values);
    let form_data = {user: current_user_id};
    for (const cnt1 of contact_fields) {
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
    };
    await dispatch(updateContact(formData));
    await props.reloadPageFunc();
    let param = {
      _id: (detail && detail._id) ? detail._id : '',
    };
    await dispatch(getContact(param));
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
        onCancel={() => {props.visibleFunc(false); setEditableColumn('');}}
        width={1000}
        className="contact_modal"
        destroyOnClose={true}
      >
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Contact" key="1">
            <Row>
              <Col
                xs={24}
                sm={9}
                md={9}
                lg={9}
                className="contact_left_section"
              >
                <DeleteModal
                  title="Delete Contact"
                  description="Are you sure you want to delete this contact?"
                  visible={visibleDeleteModal}
                  visibleFunc={setVisibleDeleteModal}
                  confirmDeleteAction={confirmDelete}
                />
                {contact_fields &&
                  contact_fields.length > 0 &&
                  contact_fields.map((contact, index) => (
                    <Row key={index}>
                      <Col xs={8} sm={3} md={3} lg={3}>
                        <Tooltip
                          title={contact.column_name}
                          placement="rightTop"
                        >
                          <span>
                            {setIcon(
                              contact.column_slug,
                              contact.column_name,
                              detail
                            )}
                          </span>
                        </Tooltip>
                      </Col>
                      <Col xs={16} sm={21} md={21} lg={21}>
                        {editableColumn && editableColumn == contact.column_slug ? (
                          editColumnDetail(contact, edit, editForm, onEditFinish)
                        ) : (
                          <div onDoubleClick={() => contact.is_editable ? setEditableColumn(contact.column_slug) : setEditableColumn('')}>
                            {detail[contact.column_slug] ? (contact.column_slug == 'email' ? (<a href={`mailto:${detail[contact.column_slug]}`}>{detail[contact.column_slug]}</a>)  : (contact.column_slug == 'phone' ? (<a href={`tel:${detail[contact.column_slug]}`}>{detail[contact.column_slug]}</a>) : detail[contact.column_slug])) : '-'}
                          </div>
                        )}                        
                      </Col>
                    </Row>
                  ))}
              </Col>
              <Col
                xs={24}
                sm={15}
                md={15}
                lg={15}
                className="contact_right_section"
              >
                <Row>
                  <Col span={24}>
                    <Dropdown
                      overlay={contact_action_menu(setVisibleDeleteModal)}
                      placement="bottomRight"
                      trigger={["click"]}
                    >
                      <span className="contact_action_bar">
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
                            content={
                              <Fragment>
                                <div className="comment-ribbon">
                                  <div className="ricon">
                                    {setNoteRibbonIcon(note.notes_type)}
                                  </div>
                                  <span>{note.title}</span>
                                </div>
                                <p>{note.notes}</p>
                              </Fragment>
                            }
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
                        placeholder="Make notes about this contact..."
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
            <Row className="contact_log_timeline">
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

const contact_action_menu = (setVisibleDeleteModal) => (
  <Menu>
    <Menu.Item key="ca1" icon={<TrashIcon />} onClick={() => setVisibleDeleteModal(true)}>
      Delete Contact
    </Menu.Item>
  </Menu>
);

const setIcon = (column_slug, column_name, detail) => {
  let icon = "";
  switch (column_slug) {
    case "organization":
    case "organization_no":
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
    case "country":
      icon = <FlagIcon />;
      break;
    case "industry":
      icon = <BriefCaseIcon />;
      break;
    case "cluster":
      icon = <UsersIcon />;
      break;
    default:
      icon = <InfoIcon height={20} width={20} />;
  }
  return icon;
};

const setLogIcon = (action) => {
  let icon = "";
  switch (action) {
    case "contact_created":
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
    case "contact_created":
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

const setNoteRibbonIcon = (notes_type) => {
  let icon = "";
  switch (notes_type) {
    case "organization":
      icon = <BuildingIcon />;
      break;
    case "contact":
      icon = <UserIcon height={20} width={20} />;
      break;
    case "deal":
      icon = <DollarIcon />;
      break;
    default:
      icon = <PenIcon />;
  }
  return icon; 
}

const editColumnDetail = (contact, edit, editForm, onEditFinish) => (
  <Form
    form={editForm}
    layout="vertical"
    className="contact_edit_form"
    onFinish={onEditFinish}
  >
    {(() => {
      let column_type = contact.column_type.toLowerCase();
      let column_slug = contact.column_slug;
      let edit_value =  ['choice','inherit'].includes(column_type) ?  edit[contact.column_slug]["value"] : edit[contact.column_slug];
      editForm.setFieldsValue({
        [column_slug]: edit_value ? edit_value : '' ,
      });
      switch (column_type) {
        case "text":
        case "phone":
          return (
            <Form.Item
              // label={contact.column_name}
              name={contact.column_slug}
              rules={[
                {
                  required: contact.is_required,
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
              // label={contact.column_name}
              name={contact.column_slug}
              rules={[
                {
                  required: contact.is_required,
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
              // label={contact.column_name}
              name={contact.column_slug}
              rules={[
                {
                  required: contact.is_required,
                  message: "Field Required!",
                },
              ]}
              hasFeedback
            >
              <Input onBlur={() => editForm.submit()} />
            </Form.Item>
          );
        case "choice":
        case "inherit": 
          return (
            <Form.Item
              // label={contact.column_name}
              name={contact.column_slug}
              rules={[
                {
                  required: contact.is_required,
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
                {contact.values && contact.values.length > 0
                  ? contact.values.map((data, index) => (
                      <Select.Option
                        data-ref={data.ref}
                        key={`${index}_${contact._id}`}
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
        case "date":
          return (
            <Form.Item
              // label={contact.column_name}
              name={contact.column_slug}
              rules={[
                {
                  required: contact.is_required,
                  message: "Field Required!",
                },
              ]}
              hasFeedback
            >
              <DatePicker onBlur={() => editForm.submit()} className="dt-picker" format={"YYYY-MM-DD"} />
            </Form.Item>
          );
        default:
          return "";
      }
    })()}
  </Form>
);

export default ContactDetailModal;
