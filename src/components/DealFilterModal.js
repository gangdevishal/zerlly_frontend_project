import React, { Fragment, useState } from "react";
import "./css/deal_filter_modal.css";
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
  InputNumber,
  TreeSelect,
} from "antd";
import moment from "moment-timezone";
import { connect, useSelector, useDispatch } from "react-redux";
import { getContactsOfOrganization } from "../redux/actions/custom_table_field";
import { addDeal, filterDeal, getDeals, setFilterFields } from "../redux/actions/deal";
import { getStages, filterSalesboardDeal, setFilterFields as setStageFilterFields } from "../redux/actions/stage";
import { DateStaticRanges } from "../utils/helpers";

const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const { TreeNode } = TreeSelect;

function DealFilterModal(props) {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const [defaultDatevalue, setdefaultDatevalue] = useState([moment(), moment()]);

  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const deal_fields = useSelector((state) => (state.custom_table_field && state.custom_table_field.deals) || []);

  const onFinish = async(form_values) => {
    console.log("Received values of form: ", form_values);
    let form_data = {user: current_user_id};
    for (const deal1 of deal_fields) {
      let getValue = form_values[deal1.column_slug] ? form_values[deal1.column_slug] : "";
      if(['choice','inherit','label'].includes(deal1.column_type.toLocaleLowerCase())){
        let ref =  '';
        if(deal1.column_slug == 'organization'){
          ref = 'organization';
        }
        else if(deal1.column_slug == 'contact_name'){
          ref = 'contact';
        }        
        else {
          ref = deal1.column_slug;
        }
        form_data[deal1.column_slug] = getValue ? {ref:ref, value:getValue} : "";

        if(deal1.column_slug == 'responsible'){
          form_data[deal1.column_slug] = getValue && getValue.length > 0 ? getValue : "";
        }
      }
      else{
        form_data[deal1.column_slug] = form_values[deal1.column_slug] ? form_values[deal1.column_slug] : "";
      }       
    }
    console.log("final:",form_data);

    let param = {
      formField: form_data,
      other: {
        sort_by: "updated_at",
        order_by: "desc",
        timezone: moment.tz.guess(true),
      },
    };

    if(props.pageFrom && props.pageFrom == 'calender'){
      param['other']['page'] = 'calender';
    }

    // 
    if(props.pageFrom && props.pageFrom == 'salesboard') {
      dispatch(filterSalesboardDeal(form_data));        
      dispatch(setStageFilterFields(form_data));
    }
    else {
      dispatch(filterDeal(param));
      dispatch(setFilterFields(form_data));
    }
    props.setActiveFilterFunc(true);
    props.visibleFunc(false);   
  };

  const handleChange = (name,value) => {
    // Check if dropdown is organization
    if(name === 'organization'){
      let param = { organization:{ref:'organization', value} };
      dispatch(getContactsOfOrganization(param));
    }
  }

  const clearAll = async() => {
    props.visibleFunc(false); 
    form.resetFields(); 
    await props.setActiveFilterFunc(false);
    props.reloadPageFunc();
  }

  return (
    <Fragment>
      <Modal
        title={ props.modal_title ? props.modal_title : "Filter Deal"}
        visible={props.visible}
        centered
        footer={[
          <Button type="text" className="deal_cancel_btn" onClick={clearAll}>
            Clear All
          </Button>,
          <Button type="primary" className="deal_submit_btn" onClick={() => form.submit() }>
            Filter
          </Button>,
        ]}
        onCancel={() => {props.visibleFunc(false)}}
        className="deal_filter_modal"
        destroyOnClose={true}
      >
        <Row>
          <Col span={24}>
            <Form
              form={form}
              layout="vertical"
              className="deal_filter_form"
              onFinish={onFinish}
            >
              {deal_fields && deal_fields.length > 0
              ? 
              deal_fields.map((deal) => (
                <Fragment key={deal._id}>
                {(() => {
                  if(!deal.is_filterable) return;
                  let column_type = deal.column_type.toLowerCase();
                  switch (column_type) {
                    case "text":
                    case "phone":
                      return (
                        <Form.Item
                          label={deal.column_name}
                          name={deal.column_slug}
                          rules={[
                            // {
                            //   required: deal.is_required,
                            //   message: "Field Required!",
                            // },
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
                            // {
                            //   required: deal.is_required,
                            //   message: "Field Required!",
                            // },
                            // {
                            //   type: "email",
                            //   message: "The input is not valid E-mail!",
                            // },
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
                            // {
                            //   required: deal.is_required,
                            //   message: "Field Required!",
                            // },
                            // {
                            //   type: "number",
                            //   message: "The input is not valid phone",
                            // }
                          ]}
                          hasFeedback
                        >
                          <InputNumber style={{width:'100%'}} min={1} />
                        </Form.Item>
                      );
                    case "choice":
                    case "label":
                    case "inherit":
                      return (
                        <Form.Item
                          label={deal.column_name}
                          name={deal.column_slug}
                          rules={
                            [
                              // {
                              //   required: deal.is_required,
                              //   message: "Field Required!",
                              // },
                            ]
                          }
                          hasFeedback
                        >
                          {deal.column_slug == "responsible" ? (
                            <TreeSelect
                              showSearch
                              allowClear
                              onChange={(fv) => console.log('value:',fv) }
                              treeCheckable={true}
                            >
                              {deal.values && deal.values.length > 0
                                ? deal.values.map((data, index) => (
                                    <TreeNode
                                      key={data.value}
                                      value={data.value}
                                      title={current_user_id == data.value ? `${data.label} (YOU)` : data.label}
                                    />
                                  ))
                                : null}
                            </TreeSelect>
                          ) : (
                            <Select
                              showSearch
                              onChange={(v) =>
                                handleChange(deal.column_slug, v)
                              }
                              filterOption={(input, option) => {
                                return (
                                  option.key
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0 ||
                                  option.title
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
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
                                      {data.label}
                                    </Select.Option>
                                  ))
                                : null}
                            </Select>
                          )}
                        </Form.Item>
                      );
                    case "date":
                      return (
                        <Form.Item
                          label={deal.column_name}
                          name={deal.column_slug}
                          rules={[
                            // {
                            //   required: deal.is_required,
                            //   message: "Field Required!",
                            // },
                          ]}
                          hasFeedback
                        >
                          {/* <DatePicker
                            isoWeek
                            className="dt-picker"
                            format={
                              deal.column_slug == "follow_up"
                                ? `DD-MM-YYYY HH:mm`
                                : `DD-MM-YYYY`
                            }
                            showTime={deal.column_slug == "follow_up" ? true : false}
                          /> */}
                          <RangePicker
                          className="dt-picker"
                          ranges={DateStaticRanges}
                          format={`DD-MM-YYYY`}
                          onChange={(dates, dateStrings) => {
                            console.log(
                              "dates:",
                              dates,
                              "dateStrings:",
                              dateStrings
                            );
                          }}
                          value={defaultDatevalue}
                          placeholder={[t("report.start_date",'Start date'),t("report.end_date",'End date')]}
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

export default DealFilterModal;
