import React, { Fragment, useState, useEffect, useRef } from "react";
import Layout from "./layout";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { getCancelDeals, appendCancelRecords, deleteCancelDeal } from "../redux/actions/deal";
import { getUsers } from "../redux/actions/user";
import { DateStaticRanges } from "../utils/helpers";
import moment from "moment";
import { showLoader, hideLoader } from "../redux/actions/loader";
import { Row, Col, Card, Typography, Select, DatePicker, Space, Table } from "antd";
import "./css/cancellation.css";
import { useTranslation, Trans } from 'react-i18next';
import { queryStringParse } from "../utils/helpers";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

function Cancellations(props) {
  const { location } = props;
  const { t, i18n } = useTranslation();

  const dispatch = useDispatch();
  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const cancel_deals = useSelector(
    (state) =>
      (state.deal && state.deal.cancel_deals && state.deal.cancel_deals.list) ||
      []
  );
  const pagination = useSelector(
    (state) =>
      (state.deal &&
        state.deal.cancel_deals &&
        state.deal.cancel_deals.pagination) ||
      ""
  );
  const users = useSelector((state) => state.user.list);


  const columns = [
    {
      title: t("cancellation.organisation","Organisation"),
      dataIndex: "organization",
      key: "organization",
      ellipsis: true,
      sorter: (a, b) => a.organization.localeCompare(b.organization),
    },
    {
      title: t("cancellation.contact","Contact"),
      dataIndex: "contact_name",
      key: "contact_name",
      ellipsis: true,
      sorter: (a, b) => a.contact_name.localeCompare(b.contact_name),
    },
    {
      title: t("cancellation.email","Email"),
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      sorter: (a, b) => a.contact_name.localeCompare(b.contact_name),
      render: (value, row, index) => { 
        return value ? (<a onClick={(e)=>{ e.stopPropagation()}} href={`mailto:${value}`}>{value}</a>) : value;
      }
    },
    {
      title: t("cancellation.phone","Phone"),
      dataIndex: "phone",
      key: "phone",
      ellipsis: true,
      sorter: (a, b) => a.contact_name.localeCompare(b.contact_name),
      render: (value, row, index) => { 
        return value ? (<a onClick={(e)=>{ e.stopPropagation()}} href={`tel:${value}`}>{value}</a>) : value;
      }
    },
    {
      title: t("cancellation.reason","Reason"),
      dataIndex: "lost_reason",
      key: "lost_reason",
      ellipsis: true,
      sorter: (a, b) => a.lost_reason.localeCompare(b.lost_reason),
    },
    {
      title: t("cancellation.value","Value"),
      dataIndex: "value",
      key: "value",
      ellipsis: true,
      sorter: (a, b) => a.value.localeCompare(b.value),
    },
    {
      title: t("cancellation.cancelled","Cancelled"),
      dataIndex: "action_date_time",
      key: "action_date_time",
      ellipsis: true,
      sorter: (a, b) => a.action_date_time.localeCompare(b.action_date_time),
    },
  ];

  const data = cancel_deals.map((row,row_index) => {    
    row.key = row_index;
    return row;
  });

  const [defaultSort, setdefaultSort] = useState("asc");
  const [defaultSortColumn, setdefaultSortColumn] = useState("");
  const [filterData, setFilterData] = useState({
    responsible: current_user_id,
    date_range:''
  });
  const hiddenLoadMoreBtnRef = useRef(null);

  let queryString = queryStringParse(props.location.search);
  let search_keyword = queryString && queryString.search_keyword ? queryString.search_keyword : '';

  useEffect(() => {
    if(queryString['search_keyword']){
      let param = {
        deal_user: filterData.responsible,
        timezone: moment.tz.guess(true),
        sort_by: defaultSortColumn,
        order_by: defaultSort,
        date_range: filterData.date_range,
        main_search_keyword: search_keyword,
      };
      dispatch(getCancelDeals(param));
    }
    else if(queryString['clearsearch']) {
      filterCancelDeal();
    }
  }, [search_keyword]);


  useEffect(() => {
    dispatch(getUsers());
    onScroll();
  }, []);

  useEffect(() => {
    filterCancelDeal();
  }, [filterData]);

  const filterCancelDeal = async() => {
    let param = {
      deal_user: filterData.responsible,
      timezone: moment.tz.guess(true),
      sort_by: defaultSortColumn,
      order_by: defaultSort,
      date_range: filterData.date_range
    };
    await dispatch(getCancelDeals(param));
    dispatch(hideLoader());
    // scrollToTop();
  };

  const manageFilter = (name, value) => {
    // const { name, value } = e.target;
    setFilterData({ ...filterData, [name]: value });
  }

  const onScroll = () => {
    console.log('onScroll:');
    var tableContent = document.querySelector("div.ant-table-body");
    if(tableContent) {
      tableContent.addEventListener('scroll', (event) => {
        let scrollTop = event.target.scrollTop;
        let clientHeight = event.target.clientHeight;
        let scrollHeight = event.target.scrollHeight;
        if (scrollTop + clientHeight === scrollHeight) {
           // load more data
          console.log('Reached bottom');
          hiddenLoadMoreBtnRef.current.click();
        }
      });
    } 
  }

  const handleDate = (date) => {
    let new_date = [];
    for (const dt of date) {
      if(dt){
        new_date.push(moment(dt,"DD-MM-YYYY").format("YYYY-MM-DD"));
      }
    }
    let date_var = new_date.length > 0 ? new_date : "";
    setFilterData({ ...filterData, date_range: date_var });
  };

  const loadMore = () => {
    let current_page = + pagination.currentPage;
    let total_page = pagination.totalPages;
    console.log('current_page:',current_page,'total_page:',total_page);
    if(current_page < total_page){          
      let param = {
        deal_user: filterData.responsible,
        timezone: moment.tz.guess(true),
        sort_by: defaultSortColumn,
        order_by: defaultSort,
        date_range: filterData.date_range,
        current_page:parseInt(current_page + 1)
      };
      if(search_keyword) {
        param['main_search_keyword'] = search_keyword;
      }
      dispatch(getCancelDeals(param));
    }
  }
  return (
    <Fragment>
      <Helmet>
        <title>Cancellations</title>
      </Helmet>
      <Layout location={location}>
        <Row className="cancellation-table-row">
          <Col span={24} className="tbl-col-action">
            <Row>
              <Col xs={24} sm={12} md={12} lg={5} style={{ padding: "15px" }}>
                <button ref={hiddenLoadMoreBtnRef} onClick={loadMore} style={{display:'none'}} />
                <Title level={5}>{t("cancellation.users","Users")}</Title>
                <Select
                  showSearch
                  notFoundContent={t("cancellation.no_data_available","No data available")}
                  name="responsible"
                  className="custom-select"
                  value={filterData.responsible}
                  style={{
                    width: 200,
                  }}
                  placeholder="Select User"
                  optionFilterProp="children"
                  onChange={(val) => manageFilter("responsible", val)}
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
              <Col xs={24} sm={12} md={12} lg={5} style={{ padding: "15px" }}>
                <Title level={5}>{t("cancellation.cancelled_date_range","Cancelled Date Range")}</Title>
                <RangePicker
                  className="custom-select"
                  ranges={DateStaticRanges}
                  format={`DD-MM-YYYY`}
                  onChange={(dates, dateStrings) => {
                    console.log("dates:", dates, "dateStrings:", dateStrings);
                    handleDate(dateStrings);
                  }}
                />
              </Col>
            </Row>
          </Col>
          <Col span={24} className="tbl-col">
            <Table
              className="cancel-tbl"
              pagination={false}
              scroll={{ x: true, y: "calc(100vh - 300px)" }}
              columns={columns}
              dataSource={data}
              showSorterTooltip={false}
            />
          </Col>
        </Row>
      </Layout>
    </Fragment>
  );
}

export default Cancellations;
