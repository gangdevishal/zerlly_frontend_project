import React, { Fragment, useState, useEffect } from "react";
import Layout from "./layout";
import { Helmet } from "react-helmet-async";
import "./css/report.css";

import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";
import FusionCharts from "fusioncharts";
import charts from "fusioncharts/fusioncharts.charts";
import ReactFusioncharts from "react-fusioncharts";
import ReactFusioncharts2 from "react-fusioncharts";
import ReactFusioncharts3 from "react-fusioncharts";
import ReactFusioncharts4 from "react-fusioncharts";

import {
  getWonLostDealValues,
  getPendingValuesWithStages,
  getCancelledDealValues,
  getNetDealValues,
} from "../redux/actions/report";
import { getUsers } from "../redux/actions/user";
import { useDispatch, useSelector } from "react-redux";
import { DateStaticRanges } from "../utils/helpers";
import moment from "moment";
import { showLoader, hideLoader } from "../redux/actions/loader";
import { Row, Col, Card, Typography, Select, DatePicker, Space } from "antd";
import { useTranslation, Trans } from 'react-i18next';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

function Reports(props) {
  const { location } = props;
  const { t, i18n } = useTranslation();

  // Resolves charts dependancy
  charts(FusionCharts);
  FusionTheme(FusionCharts);

  const thisYear = new Date().getFullYear();
  const years = Array.from(new Array(5), (val, index) => thisYear - index);
  const dispatch = useDispatch();

  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const pending_report = useSelector(
    (state) => state.report.pending_deal_values || []
  );
  const won_lost_report = useSelector(
    (state) => state.report.won_lost_deal_values || []
  );
  const cancelled_report = useSelector(
    (state) => state.report.cancelled_deal_values || []
  );
  const net_report = useSelector((state) => state.report.net_deal_values || []);
  const theme = useSelector((state) => state.theme);
  const users = useSelector((state) => state.user.list);

  const [pendingFilerData, setPendingFilerData] = useState({
    responsible: current_user_id,
  });
  const [wonLostFilerData, setWonLostFilerData] = useState({
    responsible: current_user_id,
    date_range: "",
  });
  const [cancelledFilerData, setCancelledFilerData] = useState({
    responsible: current_user_id,
    year: thisYear,
  });
  const [netFilerData, setNetFilerData] = useState({
    responsible: current_user_id,
    year: thisYear,
  });
  const [inputDKey] = useState(Date.now());
  const [firstChartKey] = useState(Date.now());
  const [secondChartKey] = useState(Date.now());
  const [thirdChartKey] = useState(Date.now());
  const [fourthChartKey] = useState(Date.now());

  useEffect(() => {
    dispatch(showLoader());
    dispatch(getUsers());
  }, []);

  useEffect(() => {
    (async () => {
      let param = {
        user_id: current_user_id,
        sort: "asc",
        responsible: pendingFilerData.responsible,
      };
      console.log("param::", param);
      await dispatch(getPendingValuesWithStages(param));
      dispatch(hideLoader());
    })();
  }, [pendingFilerData]);

  useEffect(() => {
    (async () => {
      let param = {
        user_id: current_user_id,
        sort: "asc",
        responsible: wonLostFilerData.responsible,
        date_range: wonLostFilerData.date_range,
      };
      console.log("param::", param);
      await dispatch(getWonLostDealValues(param));
      dispatch(hideLoader());
    })();
  }, [wonLostFilerData]);

  useEffect(() => {
    (async () => {
      let param = {
        user_id: current_user_id,
        sort: "asc",
        responsible: cancelledFilerData.responsible,
        year: cancelledFilerData.year,
      };
      console.log("param::", param);
      await dispatch(getCancelledDealValues(param));
      dispatch(hideLoader());
    })();
  }, [cancelledFilerData]);

  useEffect(() => {
    (async () => {
      let param = {
        user_id: current_user_id,
        sort: "asc",
        responsible: netFilerData.responsible,
        year: netFilerData.year,
      };
      console.log("param::", param);
      await dispatch(getNetDealValues(param));
      dispatch(hideLoader());
    })();
  }, [netFilerData]);

  const manageFilter =  (name, value) => {
    // const { name, value } = e.target;
    setPendingFilerData({ ...pendingFilerData, [name]: value });
  };

  const manageFilter2 = (name, value) => {
    // const { name, value } = e.target;
    setWonLostFilerData({ ...wonLostFilerData, [name]: value });
  };

  const manageFilter3 = (name, value) => {
    // const { name, value } = e.target;
    setCancelledFilerData({ ...cancelledFilerData, [name]: value });
  };

  const manageFilter4 = (name, value) => {
    // const { name, value } = e.target;
    setNetFilerData({ ...netFilerData, [name]: value });
  };

  const handleDate = (date) => {
    let new_date = [];
    for (const dt of date) {
      if(dt){
        new_date.push(moment(dt,"DD-MM-YYYY").format("YYYY-MM-DD"));
      }
    }
    let date_var = new_date.length > 0 ? new_date : "";
    setWonLostFilerData({ ...wonLostFilerData, date_range: date_var });
  };

  return (
    <Fragment>
      <Helmet>
        <title>Reports</title>
      </Helmet>
      <Layout location={location}>
        <Row>
          <Col span={24} className="chart_section">
            <Row>
              <Col span={24} className="report-main">
                <Row>
                  <Col span={24} style={{ padding: "15px 15px 0 15px" }}>
                    <Title level={5}>{t("report.users","Users")}</Title>
                    <Select
                      showSearch
                      notFoundContent={t("report.no_data_available","No data available")}
                      name="responsible"
                      className="custom-select"
                      value={pendingFilerData.responsible}
                      style={{ width: 200 }}
                      placeholder="Select User"
                      optionFilterProp="children"
                      onChange={(value) => manageFilter("responsible",value)}
                      onSearch={(val) => console.log("search:", val)}
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      <Option value="">Select All</Option>
                      {users.map((user, index) => (
                        <Option key={user._id} value={user._id}>
                          {current_user_id == user._id
                            ? `${user.username} (YOU)`
                            : user.username}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <ReactFusioncharts
                      key={firstChartKey}
                      type="column3d"
                      width="100%"
                      height="450"
                      dataFormat="JSON"
                      dataSource={{
                        chart: {
                          "maxLabelHeight": "50",
                          caption:t("report.pending_caption","Pending Deal Values Analysis"),
                          subcaption:t("report.pending_subcaption","All Pending Deal's Values") ,
                          xaxisname: t("report.pending_xaxisname","Stages"),
                          yaxisname:t("report.pending_yaxisname","Total pending deal values in stage") ,
                          formatnumberscale: "1",
                          plottooltext:t("report.pending_plottooltext","Total <b>$seriesName</b> Values <b>$dataValue</b> For $label Stage"),
                          theme: "fusion",
                          drawcrossline: "1",
                          showValues: "1",
                          canvasTopPadding: "20",
                          placevaluesinside: "0",
                          alignCaptionWithCanvas: "0",
                          valueFontBold: "1",
                          valueFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          bgColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.lightDarkBG
                              ? theme.latest_theme.lightDarkBG
                              : ""
                          }`,
                          baseFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          toolTipBgColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.lightDarkBG
                              ? theme.latest_theme.lightDarkBG
                              : ""
                          }`,
                          xAxisNameFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          yAxisNameFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          yAxisNameFontBold: "1",
                          xAxisNameFontBold: "1",
                        },
                        data: pending_report,
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={24} className="report-main">
                <Row>
                  <Col xs={24} sm={12} md={12} lg={5} style={{ padding: "15px 15px 0 15px" }}>
                    <Title level={5}>{t("report.users","Users")}</Title>
                    <Select
                      showSearch
                      notFoundContent={t("report.no_data_available","No data available")}
                      name="responsible"
                      className="custom-select"
                      value={wonLostFilerData.responsible}
                      style={{
                        width: 200,
                      }}
                      placeholder="Select User"
                      optionFilterProp="children"
                      onChange={(val) => manageFilter2("responsible",val)}
                      onSearch={(val) => console.log("search:", val)}
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      <Option value="">Select All</Option>
                      {users.map((user, index) => (
                        <Option key={user._id} value={user._id}>
                          {current_user_id == user._id
                            ? `${user.username} (YOU)`
                            : user.username}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={5} style={{ padding: "15px 15px 0 15px" }}>
                    <Title level={5}>{t("report.won_lost_date_range","Won/Lost Date Range")}</Title>
                    <RangePicker
                      className="custom-select"
                      ranges={DateStaticRanges}
                      format={`DD-MM-YYYY`}
                      onChange={(dates, dateStrings) => {
                        console.log(
                          "dates:",
                          dates,
                          "dateStrings:",
                          dateStrings
                        );
                        handleDate(dateStrings);
                      }}
                      placeholder={[t("report.start_date",'Start date'),t("report.end_date",'End date')]}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <ReactFusioncharts2
                      key={secondChartKey}
                      type="column3d"
                      width="100%"
                      height="450"
                      dataFormat="JSON"
                      dataSource={{
                        chart: {
                          "maxLabelHeight": "50",
                          caption: t("report.won_caption","Won/Lost Deal Values Analysis"),
                          subcaption: t("report.won_subcaption","All Won And Lost Deal's Values"),
                          xaxisname: t("report.won_xaxisname","Deal Status"),
                          yaxisname: t("report.won_yaxisname","Total Deal Values"),
                          decimals: "1",
                          formatnumberscale: "1",
                          plottooltext: t("report.won_plottooltext","Total <b>$label</b> Values <b>$dataValue</b>"),
                          theme: "fusion",
                          showValues: "1",
                          canvasTopPadding: "20",
                          placevaluesinside: "0",
                          alignCaptionWithCanvas: "0",
                          valueFontBold: "1",
                          valueFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          bgColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.lightDarkBG
                              ? theme.latest_theme.lightDarkBG
                              : ""
                          }`,
                          baseFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          toolTipBgColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.lightDarkBG
                              ? theme.latest_theme.lightDarkBG
                              : ""
                          }`,
                          xAxisNameFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          yAxisNameFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          yAxisNameFontBold: "1",
                          xAxisNameFontBold: "1",
                        },
                        data: won_lost_report,
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={24} className="report-main">
                <Row>
                  <Col xs={24} sm={12} md={12} lg={5} style={{ padding: "15px 15px 0 15px" }}>
                    <Title level={5}>{t("report.users","Users")}</Title>
                    <Select
                      showSearch
                      notFoundContent={t("report.no_data_available","No data available")}
                      name="responsible"
                      className="custom-select"
                      value={cancelledFilerData.responsible}
                      style={{
                        width: 200,
                      }}
                      placeholder="Select User"
                      optionFilterProp="children"
                      onChange={(val) => manageFilter3("responsible",val)}
                      onSearch={(val) => console.log("search:", val)}
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      <Option value="">Select All</Option>
                      {users.map((user, index) => (
                        <Option key={user._id} value={user._id}>
                          {current_user_id == user._id
                            ? `${user.username} (YOU)`
                            : user.username}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={5} style={{ padding: "15px 15px 0 15px" }}>
                    <Title level={5}>{t("report.years","Years")}</Title>
                    <Select
                      showSearch
                      notFoundContent={t("report.no_data_available","No data available")}
                      name="year"
                      className="custom-select"
                      value={cancelledFilerData.year}
                      style={{
                        width: 200,
                      }}
                      placeholder="Select Year"
                      optionFilterProp="children"
                      onChange={(val) => manageFilter3("year",val)}
                      onSearch={(val) => console.log("search:", val)}
                    >
                      {years.map((year, index) => (
                        <Option key={`year${index}`} value={year}>
                          {year}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <ReactFusioncharts3
                      key={thirdChartKey}
                      type="column3d"
                      width="100%"
                      height="450"
                      dataFormat="JSON"
                      dataSource={{
                        chart: {
                          "maxLabelHeight": "50",
                          caption: t("report.cancelled_caption","Cancelled Deal Values Analysis"),
                          subcaption: t("report.cancelled_subcaption","All Cancelled Deal's Values "),
                          xaxisname: t("report.cancelled_xaxisname","Months"),
                          yaxisname: t("report.cancelled_yaxisname","Total Deal Values"),
                          formatnumberscale: "1",
                          plottooltext:t("report.cancelled_plottooltext","Total <b>$seriesName</b> Values <b>$dataValue</b> For $label Month"),
                          theme: "fusion",
                          drawcrossline: "1",
                          showValues: "1",
                          canvasTopPadding: "20",
                          placevaluesinside: "0",
                          alignCaptionWithCanvas: "0",
                          valueFontBold: "1",
                          valueFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          bgColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.lightDarkBG
                              ? theme.latest_theme.lightDarkBG
                              : ""
                          }`,
                          baseFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          toolTipBgColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.lightDarkBG
                              ? theme.latest_theme.lightDarkBG
                              : ""
                          }`,
                          xAxisNameFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          yAxisNameFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          yAxisNameFontBold: "1",
                          xAxisNameFontBold: "1",
                        },
                        data: cancelled_report,
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={24} className="report-main">
                <Row>
                  <Col xs={24} sm={12} md={12} lg={5} style={{ padding: "15px 15px 0 15px" }}>
                    <Title level={5}>{t("report.users","Users")}</Title>
                    <Select
                      showSearch
                      notFoundContent={t("report.no_data_available","No data available")}
                      name="responsible"
                      className="custom-select"
                      value={netFilerData.responsible}
                      style={{
                        width: 200,
                      }}
                      placeholder="Select User"
                      optionFilterProp="children"
                      onChange={(val) => manageFilter4("responsible",val)}
                      onSearch={(val) => console.log("search:", val)}
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      <Option value="">Select All</Option>
                      {users.map((user, index) => (
                        <Option key={user._id} value={user._id}>
                          {current_user_id == user._id
                            ? `${user.username} (YOU)`
                            : user.username}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={5} style={{ padding: "15px 15px 0 15px" }}>
                    <Title level={5}>{t("report.years","Years")}</Title>
                    <Select
                      showSearch
                      notFoundContent={t("report.no_data_available","No data available")}
                      name="year"
                      className="custom-select"
                      value={netFilerData.year}
                      style={{
                        width: 200,
                      }}
                      placeholder="Select Year"
                      optionFilterProp="children"
                      onChange={(val) => manageFilter4("year",val)}
                      onSearch={(val) => console.log("search:", val)}
                    >
                      {years.map((year, index) => (
                        <Option key={`year${index}`} value={year}>
                          {year}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <ReactFusioncharts4
                      key={fourthChartKey}
                      type="column3d"
                      width="100%"
                      height="450"
                      dataFormat="JSON"
                      dataSource={{
                        chart: {
                          "maxLabelHeight": "50",
                          caption: t("report.net_caption","Net Deal Values Analysis"),
                          subcaption: t("report.net_subcaption","All Net Deal's Values "),
                          xaxisname: t("report.net_xaxisname","Months"),
                          yaxisname: t("report.net_yaxisname","Total Deal Values"),
                          formatnumberscale: "1",
                          plottooltext:
                            "Total <b>$seriesName</b> Values <b>$dataValue</b> For $label Month",
                          theme: "fusion",
                          drawcrossline: "1",
                          showValues: "1",
                          canvasTopPadding: "20",
                          placevaluesinside: "0",
                          alignCaptionWithCanvas: "0",
                          valueFontBold: "1",
                          valueFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          bgColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.lightDarkBG
                              ? theme.latest_theme.lightDarkBG
                              : ""
                          }`,
                          baseFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          toolTipBgColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.lightDarkBG
                              ? theme.latest_theme.lightDarkBG
                              : ""
                          }`,
                          xAxisNameFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          yAxisNameFontColor: `${
                            theme &&
                            theme.latest_theme &&
                            theme.latest_theme.text
                              ? theme.latest_theme.text
                              : ""
                          }`,
                          yAxisNameFontBold: "1",
                          xAxisNameFontBold: "1",
                        },
                        data: net_report,
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </Layout>
    </Fragment>
  );
}

export default Reports;
