import React, { Fragment, useState, useEffect } from "react";
import "./css/deal_add_modal.css";
import { useTranslation, Trans } from "react-i18next";

import {
  Modal,
  Button,
  Tabs,
  Row,
  Col,
  Comment,
  Tooltip,
  Timeline,
  Select,
  Input,
  Collapse,
  Form,
  DatePicker,
  InputNumber
} from "antd";
import moment from "moment-timezone";
import { connect, useSelector, useDispatch } from "react-redux";
import { getContactsOfOrganization } from "../redux/actions/custom_table_field";
import { addDeal, filterDeal, getDeals } from "../redux/actions/deal";
import { setNewDeal } from "../redux/actions/contact";

const { Panel } = Collapse;

function DealAddModal(props) {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const deal_fields = useSelector((state) => (state.custom_table_field && state.custom_table_field.deals) || []);  
  const contact_new_deal= useSelector((state) => (state.contact && state.contact.new_deal) || "");
  const contact_edit = useSelector((state) => (state.contact && state.contact.edit) || "");

  useEffect(() => {
    if(contact_new_deal && contact_edit && contact_new_deal == contact_edit._id ){
      let param = { organization:contact_edit.organization };
      dispatch(getContactsOfOrganization(param));
    }
  }, [contact_new_deal]);

  const onFinish = async(form_values) => {
    console.log("Received values of form: ", form_values);
    let form_data = {user: current_user_id};
    for (const deal1 of deal_fields) {
      let getValue = form_values[deal1.column_slug] ? form_values[deal1.column_slug] : "";
      if(['choice','inherit'].includes(deal1.column_type.toLocaleLowerCase())){
        let ref =  '';
        if(deal1.column_slug == 'organization'){
          ref = 'organization';
        }
        else if(deal1.column_slug == 'contact_name'){
          ref = 'contact';
        }
        else if(deal1.column_slug == 'responsible'){
          ref = 'user';
        }
        else {
          ref = deal1.column_slug;
        }
        form_data[deal1.column_slug] = getValue ? {ref:ref, value:getValue} : "";
      }
      else{
        if(!['label'].includes(deal1.column_type.toLocaleLowerCase())){
          form_data[deal1.column_slug] = form_values[deal1.column_slug];
        }        
      }       
    }
    console.log("final:",form_data);
    await dispatch(addDeal(form_data));
    props.reloadPageFunc();
    closeAddModal();
  };

  const handleChange = (name,value) => {
    // Check if dropdown is organization
    if(name === 'organization'){
      let param = { organization:{ref:'organization', value} };
      dispatch(getContactsOfOrganization(param));
    }
  }

  const closeAddModal = () => {
    props.visibleFunc(false); 
    form.resetFields(); 
    if(contact_new_deal){
      dispatch(setNewDeal(null));      
    }
    let param = { organization:{ref:'organization', value:""} };
    dispatch(getContactsOfOrganization(param));
  }

  return (
    <Fragment>
      <Modal
        title="New Deal"
        visible={props.visible}
        centered
        footer={[
          <Button type="text" className="deal_cancel_btn" onClick={closeAddModal}>
            Cancel
          </Button>,
          <Button type="primary" className="deal_submit_btn" onClick={() => form.submit() }>
            Create
          </Button>,
        ]}
        onCancel={closeAddModal}
        className="deal_add_modal"
        destroyOnClose={true}
      >
        <Row>
          <Col span={24}>
            <Form
              form={form}
              layout="vertical"
              className="deal_add_form"
              onFinish={onFinish}
            >
              {deal_fields && deal_fields.length > 0
              ? 
              deal_fields.map((deal) => (
                <Fragment key={deal._id}>
                {(() => {
                  let column_type = deal.column_type.toLowerCase();
                  let column_slug = deal.column_slug;
                  let setValue = '';
                  if(contact_new_deal) {
                    if(['choice','inherit'].includes(column_type)){
                      if(column_slug == 'organization' && contact_edit.organization && contact_edit.organization.value){
                        setValue = contact_edit.organization.value;
                      }
                      else if(column_slug == 'contact_name' && contact_edit._id){
                        setValue = contact_edit._id;
                      }
                      else if(column_slug == 'responsible' && contact_edit._id){
                        setValue = current_user_id;
                      }
                    }
                    form.setFieldsValue({
                      [column_slug]: setValue,
                    });
                  } 
                  switch (column_type) {
                    case "text":
                    case "phone":
                      return (
                        <Form.Item
                          label={deal.column_name}
                          name={deal.column_slug}
                          rules={[
                            {
                              required: deal.is_required,
                              message: "Field Required!",
                            },
                          ]}
                          hasFeedback
                        >
                          <Input />
                        </Form.Item>
                      );
                    case "email":
                      return (
                        <Form.Item
                          label={deal.column_name}
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
                          <Input />
                        </Form.Item>
                      );
                    case "number":
                      return (
                        <Form.Item
                          label={deal.column_name}
                          name={deal.column_slug}
                          rules={[
                            {
                              required: deal.is_required,
                              message: "Field Required!",
                            },
                            {
                              type: "number",
                              message: "The input is not valid phone",
                            }
                          ]}
                          hasFeedback
                        >
                          <InputNumber style={{width:'100%'}} min={1} />
                        </Form.Item>
                      );
                    case "choice":
                    case "inherit":
                      return (
                        <Form.Item
                          label={deal.column_name}
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
                            onChange={(v) => handleChange(deal.column_slug, v)}
                            filterOption={(input, option) => {
                              return (
                                option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
                                option.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              );                            
                            }}
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
                          label={deal.column_name}
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
                            format={
                              deal.column_slug == "follow_up"
                                ? `DD-MM-YYYY HH:mm`
                                : `DD-MM-YYYY`
                            }
                            showTime={deal.column_slug == "follow_up" ? true : false}
                          />
                        </Form.Item>
                      );
                    default:
                      return "";
                    }
                  })()}
                  </Fragment>
                )
                ) : null}
            </Form>
          </Col>
        </Row>
      </Modal>
    </Fragment>
  );
}

export default DealAddModal;
