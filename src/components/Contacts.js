import React, { Fragment, useState, useRef,useEffect } from "react";
import Layout from "./layout";
import { Helmet } from "react-helmet-async";
import {
  Row,
  Col,
  Divider,
  Table,
  Tooltip ,
  Input,
  Form,
  Button
} from "antd";
import "./css/contact.css";
import ContactDetailModal from "./ContactDetailModal";
import ContactAddModal from "./ContactAddModal";
import ContactFilterModal from "./ContactFilterModal";
import DeleteModal from "./DeleteModal";

import { useTranslation, Trans } from 'react-i18next';
import {PlusCircleIcon, TrashIcon, CSVIcon, DownloadIcon, FillFilterIcon, FilterIcon, PenIcon, CoinIcon} from './Icons';
import { useDispatch, useSelector } from "react-redux";
import { getContacts, getContact, getNotes, getLogs, importContact, filterContact, setNewDeal } from "../redux/actions/contact";
import { getContactFields } from "../redux/actions/custom_table_field";
import moment from 'moment-timezone';
import * as XLSX from 'xlsx';
import { queryStringParse } from "../utils/helpers";


function Contacts(props) {
  const { location } = props;
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const [visibleContactDetailModal, setVisibleContactDetailModal] = useState(false);
  const [visibleContactAddModal, setVisibleContactAddModal] = useState(false);
  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false);
  const [visibleContactFilterModal, setVisibleContactFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState(false);

  const inputOpenFileRef = useRef(null);
  const hiddenLoadMoreBtnRef = useRef(null);
  const [filterForm] = Form.useForm();

  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const contact_fields = useSelector((state) => (state.custom_table_field && state.custom_table_field.contacts) || []);
  const contact_data = useSelector((state) => (state.contact && state.contact.list) || []);
  const pagination = useSelector((state) => (state.contact && state.contact.pagination) || "");
  const filter_fields = useSelector((state) => (state.contact && state.contact.filter_fields) || "");
  const organization_new_contact= useSelector((state) => (state.organisation && state.organisation.new_contact) || "");

  let queryString = queryStringParse(props.location.search);
  let search_keyword = queryString && queryString.search_keyword ? queryString.search_keyword : '';
  search_keyword = (['@','$','!'].includes(search_keyword.toString().charAt(0))) ? search_keyword.toString().slice(1) : search_keyword;
  useEffect(() => {
    if(queryString['search_keyword']){
      let param = {
        user_id:current_user_id,
        sort_by:"updated_at",
        order_by:"desc",
        main_search_keyword: search_keyword,
      };
      dispatch(getContacts(param));
      setActiveFilter(false);
    }
    else if(queryString['clearsearch']) {
      reloadPage();
    }
  }, [search_keyword]);

  useEffect(() => {
    dispatch(getContactFields());
    if(!queryString['search_keyword']) {
      let param = {
        user_id:current_user_id,
        sort_by:"updated_at",
        order_by:"desc"
      };
      dispatch(getContacts(param));
    }
    onScroll();
    if(organization_new_contact) {
      setVisibleContactAddModal(true);
    }
  }, []);

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

  let custom_columns = contact_fields;
  let new_column = {
    column_name:"Action",
    column_slug:"new_deal_add",
    is_filterable:false,
    is_sortable:false,
  };
  custom_columns = [...custom_columns, new_column];
  const columns = custom_columns.map((col,index) => {
    return {
      title: col.column_name,
      dataIndex: col.column_slug,
      key: col.column_slug,
      ellipsis: true,
      sorter: !col.is_sortable ? false : (a, b) => {
        let first_col  = a[col.column_slug] ? a[col.column_slug] : '';
        let second_col = b[col.column_slug] ? b[col.column_slug] : '';
        return first_col.localeCompare(second_col);
      },
      filterDropdown:!col.is_filterable ? false : ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (      
        <Form
          name="contactFilterForm"
          className="contactFilterForm"
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
      render: (value, row, index) => { 
        if(col.column_slug == 'phone'){
          return value ? (<a onClick={(e)=>{ e.stopPropagation()}} href={`tel:${value}`}>{value}</a>) : value;
        }
        else if(col.column_slug == 'email') {
          return value ? (<a onClick={(e)=>{ e.stopPropagation()}} href={`mailto:${value}`}>{value}</a>) : value;
        }
        else if(col.column_slug == 'new_deal_add') {
          return (<Button type="link" onClick={(e)=>{ e.stopPropagation(); createNewDeal(row["_id"]);}}>
            <CoinIcon height="19" width="18" /> <span style={{'position': 'absolute', 'top': '13px','left': '30px'}}> <PlusCircleIcon height="15" width="18" /></span>
            
          </Button>);
        }
        else{
          return value;
        }        
      }
    }
  });
  const uniqueObjects = [...new Map(contact_data.map(item => [item._id, item])).values()]
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
    await dispatch(importContact(formData));
    reloadPage();  
    inputOpenFileRef.current.value = '';
  }

  const openContactDetailModal = (contactId) => {
    let param = {
      _id: contactId,
    };
    dispatch(getContact(param));
    dispatch(getLogs({contact_id:contactId, timezone:moment.tz.guess(true)}));    
    dispatch(getNotes({contact_id:contactId, timezone:moment.tz.guess(true)}));
    setVisibleContactDetailModal(true);
  }

  const reloadPage = () => {
    let param = {
      user_id:current_user_id,
      sort_by:"updated_at",
      order_by:"desc"
    };
    dispatch(getContacts(param));
    setActiveFilter(false);
  }

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
          },
        }; 
        dispatch(filterContact(param, false));
      }
      else {
        let param = {
          user_id:current_user_id,
          sort_by:"updated_at",
          order_by:"desc",
          current_page:parseInt(current_page + 1)
        };
        if(search_keyword) {
          param['main_search_keyword'] = search_keyword;
        }
        dispatch(getContacts(param));
      }
    }
  }

  const createNewDeal = async(contactId) => {
    console.log("contactId:",contactId);
    let param = {
      _id: contactId,
    };    
    await dispatch(getContact(param));
    await dispatch(setNewDeal(contactId));
    props.history.push("/deals");
  }
  return (
    <Fragment>
      <Helmet>
        <title>Contacts</title>
      </Helmet>
      <Layout location={location}>
        <Row className="contact">
          <Col span={24} className="contact_top_action">
            <span className="contact_other_action">
              <div
                className="othr_act"
                onClick={() => setVisibleContactAddModal(true)}
              >
                <PlusCircleIcon />
              </div>
              <Divider type="vertical" />
              <div
                className="othr_act"
                onClick={() => setVisibleContactFilterModal(true)}
              >
                {activeFilter ? (
                  <FillFilterIcon height="22" width="20" />
                ) : (
                  <FilterIcon height="17" width="17" />
                )}{" "}
              </div>
              <button
                ref={hiddenLoadMoreBtnRef}
                onClick={loadMore}
                style={{ display: "none" }}
              />
            </span>
            <span className="contact_import_action">
              <Tooltip
                className="imp_act"
                placement="topLeft"
                title={t("contact.import_csv_file", "Import CSV File")}
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
                title={t("contact.download_sample_csv", "Download Sample CSV")}
              >
                <a href="sample/contacts_import_sample.xlsx" download>
                  <CSVIcon width={20} height={22} />
                </a>
              </Tooltip>
            </span>
          </Col>
        </Row>
        <Row className="contact-table-row">
          <ContactDetailModal
            reloadPageFunc={reloadPage}
            visible={visibleContactDetailModal}
            visibleFunc={setVisibleContactDetailModal}
          />
          <ContactAddModal
            reloadPageFunc={reloadPage}
            visible={visibleContactAddModal}
            visibleFunc={setVisibleContactAddModal}
          />
          <DeleteModal
            visible={visibleDeleteModal}
            visibleFunc={setVisibleDeleteModal}
          />
          <ContactFilterModal
            reloadPageFunc={reloadPage}
            setActiveFilterFunc={setActiveFilter}
            visible={visibleContactFilterModal}
            visibleFunc={setVisibleContactFilterModal}
          />
          {/* <Col span={24}>
              <div>
                Pagination : {JSON.stringify(pagination)}
              </div>
              <div>
                Latest Records : {contact_data.length}
              </div>
          </Col> */}
          <Col span={24} className="tbl-col">
            <Table
              className="contact-tbl"
              pagination={false}
              scroll={{ x: true, y: "calc(100vh - 220px)" }}
              columns={columns}
              dataSource={data}
              showSorterTooltip={false}
              onRow={(r) => ({
                onClick: () => {
                  console.log(r);
                  openContactDetailModal(r._id);
                },
              })}
            />
          </Col>
        </Row>
      </Layout>
    </Fragment>
  );
}

export default Contacts;
