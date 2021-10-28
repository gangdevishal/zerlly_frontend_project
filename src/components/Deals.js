import React, { Fragment, useState, useRef ,useEffect } from "react";
import Layout from "./layout";
import { Helmet } from "react-helmet-async";
import {
  Row,
  Col,
  Divider,
  Table,
  Tooltip ,
  Badge,  
  Input,
  Form,
  Button
} from "antd";
import "./css/deal.css";
import DealDetailModal from "./DealDetailModal";
import DealAddModal from "./DealAddModal";
import DealFilterModal from "./DealFilterModal";
import DeleteModal from "./DeleteModal";
import { useDispatch, useSelector } from "react-redux";
import { getDealFields } from "../redux/actions/custom_table_field";
import { getDeals, getDeal, getNotes, getLogs, filterDeal, updateDealAction, importDeal } from "../redux/actions/deal";
import {PlusCircleIcon, TrashIcon, CSVIcon, DownloadIcon, FillFilterIcon, FilterIcon} from './Icons';
import moment from "moment-timezone";
import { useTranslation, Trans } from 'react-i18next';
import * as XLSX from 'xlsx';
import { queryStringParse } from "../utils/helpers";


function Deals(props) {
  const { location } = props;
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const [visibleDealDetailModal, setVisibleDealDetailModal] = useState(false);
  const [visibleDealAddModal, setVisibleDealAddModal] = useState(false);
  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false);
  
  const [visibleDealFilterModal, setVisibleDealFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState(false);

  const [referenceId, setReferenceId] = useState('');

  const inputOpenFileRef = useRef(null);
  const hiddenLoadMoreBtnRef = useRef(null);
  const [filterForm] = Form.useForm();

  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const deals_fields = useSelector((state) => (state.custom_table_field && state.custom_table_field.deals) || []);
  const deal_data = useSelector((state) => (state.deal && state.deal.list) || []);
  const pagination = useSelector((state) => (state.deal && state.deal.pagination) || "");
  const filter_fields = useSelector((state) => (state.deal && state.deal.filter_fields) || "");
  const contact_new_deal = useSelector((state) => (state.contact && state.contact.new_deal) || "");

  let queryString = queryStringParse(props.location.search);
  let search_keyword = queryString && queryString.search_keyword ? queryString.search_keyword : '';
  search_keyword = (['@','$','!'].includes(search_keyword.toString().charAt(0))) ? search_keyword.toString().slice(1) : search_keyword;

  useEffect(() => {
    if(queryString['search_keyword']){
      let param = {
        user_id:current_user_id,
        deal_user:current_user_id,
        sort_by:"updated_at",
        order_by:"desc",
        timezone: moment.tz.guess(true),
        main_search_keyword: search_keyword,
      };
      dispatch(getDeals(param));
      setActiveFilter(false);
    }
    else if(queryString['clearsearch']) {
      reloadPage();
    }
  }, [search_keyword]);

  useEffect(() => {
    dispatch(getDealFields());  
    if(!queryString['search_keyword']) {
      let queryString = queryStringParse(props.location.search);
      let dealId = queryString && queryString.dealId ? queryString.dealId : '';      
      let param = {};
      if(dealId) {
        param = {
          referenceId:dealId
        };
        setActiveFilter(false);
      }
      else {
        param = {
          user_id:current_user_id,
          deal_user:current_user_id,
          sort_by:"updated_at",
          order_by:"desc",
          timezone: moment.tz.guess(true)
        };
      }    
      dispatch(getDeals(param));
    }
    onScroll();

    if(contact_new_deal) {
      setVisibleDealAddModal(true);
    }
  }, [referenceId]);

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

  const columns = deals_fields.map((col,index) => {
    return {
      title: col.column_name,
      dataIndex: col.column_slug,
      key: col.column_slug,
      ellipsis: true,
      filterDropdown:!col.is_filterable ? false : ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (      
        <Form
          name="dealFilterForm"
          className="dealFilterForm"
          form={filterForm}
        >
          <Form.Item
            name="search"
          >
            <Input
              placeholder={`Search ${col.column_name}`}
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])} 
              onPressEnter={() => confirm()} 
            />
          </Form.Item>
          <Divider />
          <div className="filterBtnGrp">
            <Button type="link" onClick={() => {clearFilters();filterForm.resetFields();}} >
              Reset
            </Button>
            <Button type="primary" htmlType="submit" className="login-form-button" onClick={() => confirm()}>
              Filter
            </Button>
          </div>
        </Form>
        ),
      onFilter: (value, record) => record[col.column_slug] ? record[col.column_slug].toString().toLowerCase().includes(value.toLowerCase())
          : '',
      sorter: !col.is_sortable ? false : (a, b) => {
        let first_col  = a[col.column_slug] ? a[col.column_slug] : '';
        let second_col = b[col.column_slug] ? b[col.column_slug] : '';
        return first_col.localeCompare(second_col);
      },
      render: (value, row, index) => { 
        if(col.column_slug == 'stage'){
          return (
            <span className="dealbadge">
              <Badge color={row["stage_color"]} text={row["stage"]} size="default" />
            </span>
           );
        }
        else if(col.column_slug == 'phone'){
          return value ? (<a onClick={(e)=>{ e.stopPropagation()}} href={`tel:${value}`}>{value}</a>) : value;
        }
        else if(col.column_slug == 'email') {
          return value ? (<a onClick={(e)=>{ e.stopPropagation()}} href={`mailto:${value}`}>{value}</a>) : value;
        }
        else{
          return value;
        }        
      }
    }
  });

  const uniqueObjects = [...new Map(deal_data.map(item => [item._id, item])).values()]
  const data = uniqueObjects.map((row,row_index) => {    
    row.key = row_index;
    return row;
  });
  const showOpenFileDlg = () => {
    inputOpenFileRef.current.click()
  }

  // handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    console.log("file::",file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(data);
    };
    reader.readAsBinaryString(file);
  }

  // process CSV data
  const processData = async(dataString) => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/); 
    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
      if (headers && row.length == headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] == '"')
              d = d.substring(1, d.length - 1);
            if (d[d.length - 1] == '"')
              d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }
 
        // remove the blank rows
        if (Object.values(obj).filter(x => x).length > 0) {
          list.push(obj);
        }
      }
    }
 
    // prepare columns list from headers
    const columns = headers.map(c => ({
      name: c,
      selector: c,
    }));

    console.log("columns:",columns,"list:",list);
 
    let formData = {
      user:current_user_id,
      rows:list
    }
    await dispatch(importDeal(formData));
    reloadPage();  
    inputOpenFileRef.current.value = '';
  }

  const openDealDetailModal = (dealId) => {
    let param = {
      _id: dealId,      
      other:{
        user: current_user_id,
        timezone: moment.tz.guess(true)
      }      
    };
    dispatch(getDeal(param));
    dispatch(getLogs({ deal_id: dealId, timezone: moment.tz.guess(true) }));
    dispatch(getNotes({ deal_id: dealId, timezone: moment.tz.guess(true) }));
    setVisibleDealDetailModal(true);
  }

  const reloadPage = () => {
    let param = {
      user_id:current_user_id,
      deal_user:current_user_id,
      sort_by:"updated_at",
      order_by:"desc",
      timezone: moment.tz.guess(true)
    };
    dispatch(getDeals(param));
    setActiveFilter(false);
  }

  const handleDealAction = async(deal_id,action,reason) => {
    console.log("deal_id,action,reason::",deal_id,action,reason);
    let formData = {
      user: current_user_id,
      deal: deal_id,
      action: action,
      reason: reason,
    };
    console.log("formData:", formData);
    await dispatch(updateDealAction(formData));
    let param1 = {
      user_id:current_user_id,
      deal_user:current_user_id,
      sort_by:"updated_at",
      order_by:"desc",
      timezone: moment.tz.guess(true)
    };
    dispatch(getDeals(param1));
    let param = {
      _id: deal_id,
      other:{
        user: current_user_id,
        timezone: moment.tz.guess(true)
      }
    };
    await dispatch(getDeal(param));
  };

  const loadMore = () => {
    let current_page = + pagination.currentPage;
    let total_page = pagination.totalPages;
    console.log('current_page:',current_page,'total_page:',total_page);
    if(current_page < total_page){    
      if(filter_fields && activeFilter) {
        let param = {
          formField: filter_fields,
          other: {
            sort_by: "updated_at",
            order_by: "desc",
            current_page: parseInt(current_page + 1),
            timezone: moment.tz.guess(true)
          },
        }; 
        dispatch(filterDeal(param, false));
      }
      else {
        let param = {
          user_id:current_user_id,
          deal_user:current_user_id,
          sort_by:"updated_at",
          order_by:"desc",
          current_page:parseInt(current_page + 1),
          timezone: moment.tz.guess(true)
        };
        if(search_keyword) {
          param['main_search_keyword'] = search_keyword;
        }
        dispatch(getDeals(param));
      }
    }
  }

  const setDealIdFromNotification = (dealId) => {
    setReferenceId(dealId);
  }
  return (
    <Fragment>
      <Helmet>
        <title>Deals</title>
      </Helmet>
      <Layout setDealIdFromNotificationFunc={setDealIdFromNotification} location={location}>
        <Row className="deal">
          <Col span={24} className="deal_top_action">
            <span className="deal_other_action">
              <div
                className="othr_act"
                onClick={() => setVisibleDealAddModal(true)}
              >
                <PlusCircleIcon />
              </div>
              <Divider type="vertical" />
              <div
                className="othr_act"
                onClick={() => setVisibleDealFilterModal(true)}
              >
                {activeFilter ? (
                  <FillFilterIcon height="22" width="20" />
                ) : (
                  <FilterIcon height="17" width="17" />
                )}{" "}
              </div>
              <button ref={hiddenLoadMoreBtnRef} onClick={loadMore} style={{display:'none'}} />
            </span>
            <span className="deal_import_action">
              <Tooltip
                className="imp_act"
                placement="topLeft"
                title={t("deal.import_csv_file", "Import CSV File")}
              >
                <span onClick={showOpenFileDlg}>
                  <DownloadIcon width={20} height={22} />
                </span>
                <input
                  type="file"
                  ref={inputOpenFileRef}
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
              </Tooltip>
              <Tooltip
                className="imp_act"
                placement="topLeft"
                title={t("deal.download_sample_csv", "Download Sample CSV")}
              >
                <a href="sample/deals_import_sample.xlsx" download>
                  <CSVIcon width={20} height={22} />
                </a>
              </Tooltip>
            </span>
          </Col>
        </Row>
        <Row className="deal-table-row">
          <DealDetailModal
            handleDealActionFunc={handleDealAction} 
            reloadPageFunc={reloadPage}
            visible={visibleDealDetailModal}
            visibleFunc={setVisibleDealDetailModal}
          />
          <DealAddModal
            reloadPageFunc={reloadPage}
            visible={visibleDealAddModal}
            visibleFunc={setVisibleDealAddModal}
          />
          <DeleteModal
            visible={visibleDeleteModal}
            visibleFunc={setVisibleDeleteModal}
          />
          <DealFilterModal
            reloadPageFunc={reloadPage}
            setActiveFilterFunc={setActiveFilter}
            visible={visibleDealFilterModal}
            visibleFunc={setVisibleDealFilterModal}
          />
          {/* <Col span={24}>
            <div>
              Pagination : {JSON.stringify(pagination)}
            </div>
            <div>
              Latest Records : {deal_data.length}
            </div>
          </Col> */}
          <Col span={24} className="tbl-col">
            <Table
              className="deal-tbl"
              pagination={false}
              scroll={{ x: true, y: "calc(100vh - 220px)" }}
              columns={columns}
              dataSource={data}
              showSorterTooltip={false}
              onRow={(r) => ({
                onClick: () => {
                  console.log(r);
                  openDealDetailModal(r._id);
                },
              })}
            />
          </Col>
        </Row>
      </Layout>
    </Fragment>
  );
}

export default Deals;
