import React, { Fragment, useState, useEffect } from "react";
import "./css/deal_lost_reason_modal.css";
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
  Avatar,
  Input,
  Collapse,
  Form,
  Select
} from "antd";
import moment from "moment-timezone";
import { useDispatch, useSelector } from "react-redux";
import { getDealLostReasons } from "../redux/actions/deal";

const { Panel } = Collapse;

function DealLostReasonModal(props) {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();
  console.log("DealLostReasonModal props:",props);
  const dispatch = useDispatch();
  const [lostReason, setlostReason] = useState('');

  const lost_reasons = useSelector((state) => state.deal.lost_reasons);
  const detail = useSelector(
    (state) => (state.deal && state.deal.single) || ""
  );

  useEffect(() => {
    dispatch(getDealLostReasons());
  }, [])

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
    props.handleDealActionFunc(detail._id,props.currentDealAction,values.reason);
    form.resetFields();
    props.visibleFunc(false);
  };

  return (
    <Fragment>
      <Modal
        title="Reason for cancelling"
        visible={props.visible}
        centered
        footer={[
          <Button
            type="text"
            className="lost_reason_cancel_btn"
            onClick={() => props.visibleFunc(false)}
          >
            Cancel
          </Button>,
          <Button
            type="primary"
            className="lost_reason_submit_btn"
            onClick={() => form.submit()}
          >
            Save
          </Button>,
        ]}
        onCancel={() => props.visibleFunc(false)}
        className="lost_reason_add_modal"
        destroyOnClose={true}
        width={300}
      >
        <Row>
          <Col span={24}>
            <Form
              form={form}
              layout="vertical"
              className="lost_reason_add_form"
              onFinish={onFinish}
            >
              <Form.Item
                label="Reason"
                name="reason"
                rules={[
                  {
                    required: true,
                    message: "Please select any reason!",
                  },
                ]}
                hasFeedback
              >
                <Select showSearch value={lostReason}>
                  <Select.Option value="" key={'select'}>
                    Select Lost Reason
                  </Select.Option>
                  {lost_reasons &&
                    lost_reasons.length > 0 &&
                    lost_reasons.map((reason,index) => (
                        <Select.Option key={index} value={reason._id}>
                          {reason.title}
                        </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    </Fragment>
  );
}

export default DealLostReasonModal;
