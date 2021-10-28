import React, { Fragment, useState, useEffect, useRef } from "react";
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
  Button,
  Space
} from "antd";
import "./css/organization.css";
import { useTranslation, Trans } from 'react-i18next';
import OrganizationDetailModal from "./OrganizationDetailModal";
import OrganizationAddModal from "./OrganizationAddModal";
import OrganizationFilterModal from "./OrganizationFilterModal";
import DeleteModal from "./DeleteModal";
import {PlusCircleIcon, TrashIcon, CSVIcon, DownloadIcon, FilterIcon, FillFilterIcon, UserIcon} from './Icons';
import { getOrganisationFields } from "../redux/actions/custom_table_field";
import { getOrganisations, getOrganisation, getNotes, getLogs, importOrganization, filterOrganisation, setNewContact } from "../redux/actions/organisation";
import { useDispatch, useSelector, connect } from "react-redux";
import moment from 'moment-timezone';
import * as XLSX from 'xlsx';
import { queryStringParse } from "../utils/helpers";


function Organizations(props) {
  const { location } = props;
  const { t, i18n } = useTranslation();

  const [visibleOrganizationDetailModal, setVisibleOrganizationDetailModal] = useState(false);
  const [visibleOrganizationAddModal, setVisibleOrganizationAddModal] = useState(false);
  const [visibleOrganizationFilterModal, setVisibleOrganizationFilterModal] = useState(false);
  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState(false);

  const inputOpenFileRef = useRef(null);
  const hiddenLoadMoreBtnRef = useRef(null);
  const [filterForm] = Form.useForm();

  let queryString = queryStringParse(props.location.search);
  let search_keyword = queryString && queryString.search_keyword ? queryString.search_keyword : '';
  search_keyword = (['@','$','!'].includes(search_keyword.toString().charAt(0))) ? search_keyword.toString().slice(1) : search_keyword;

  useEffect(() => {
    console.log("queryString['search_keyword']:",queryString['search_keyword'],"search_keyword:",search_keyword);
    if(queryString['search_keyword']){
      let param = {
        user_id: props.auth && props.auth._id ? props.auth._id : "",
        sort_by: "updated_at",
        order_by: "desc",
        main_search_keyword: search_keyword,
      };
      props.getOrganisations(param);
      setActiveFilter(false);
    }
    else if(queryString['clearsearch']) {
      reloadPage();
    }
  }, [search_keyword]);
 
  useEffect(async() => {
    console.log("queryString:",queryString);
    props.getOrganisationFields();
    if(!queryString['search_keyword']) {
      let param = {
        user_id:(props.auth && props.auth._id) ? props.auth._id : '',
        sort_by:"updated_at",
        order_by:"desc"
      };
      await props.getOrganisations(param);
    }    
    onScroll();
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

  let custom_columns = props.organisation_fields;
  let new_column = {
    column_name:"Action",
    column_slug:"new_contact_add",
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
      width: '12%',
      filterDropdown: !col.is_filterable ? false :  ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (      
      <Form
        name="orgFilterForm"
        className="orgFilterForm"
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
        if(col.column_slug == 'new_contact_add') {
          return (<Button type="link" onClick={(e)=>{ e.stopPropagation(); createNewContact(row["_id"]);}}>
            <UserIcon height="18" width="18" /><span style={{'position': 'absolute', 'top': '13px','left': '30px'}}><PlusCircleIcon height="15" width="18" /></span> 
          </Button>);
        }
        else{
          return value;
        }        
      }
    }
  });

  let custom_data = props.organisations.map((item) => {
    return {
      ...item,
      new_contact_add:true
    }
  });
  const uniqueObjects = [...new Map(custom_data.map(item => [item._id, item])).values()]
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
 
    var current_user_id = (props.auth && props.auth._id) ? props.auth._id : '';
    let formData = {
      user:current_user_id,
      rows:list
    }
    await props.importOrganization(formData);
    reloadPage();  
    inputOpenFileRef.current.value = '';
  }

  const openOrganizationDetailModal = (orgId) => {
    let param = {
      _id: orgId,
    };
    props.getOrganisation(param);
    props.getLogs({org_id:orgId, timezone:moment.tz.guess(true)});    
    props.getNotes({org_id:orgId, timezone:moment.tz.guess(true)});
    setVisibleOrganizationDetailModal(true);
  }

  const reloadPage = () => {
    let param = {
      user_id:(props.auth && props.auth._id) ? props.auth._id : '',
      sort_by:"updated_at",
      order_by:"desc"
    };
    props.getOrganisations(param);
    setActiveFilter(false);
  }

  const loadMore = () => {
    let current_page = + props.pagination.currentPage;
    let total_page = props.pagination.totalPages;
    console.log('current_page:',current_page,'total_page:',total_page,"search_keyword:",search_keyword);
    if(current_page < total_page){
      if(props.filter_fields && activeFilter) {
        let param = {
          formField: props.filter_fields,
          other: {
            sort_by: "updated_at",
            order_by: "desc",
            current_page: parseInt(current_page + 1),
          },
        }; 
        props.filterOrganisation(param, false);
      }
      else {
        let param = {
          user_id:(props.auth && props.auth._id) ? props.auth._id : '',
          sort_by:"updated_at",
          order_by:"desc",
          current_page:parseInt(current_page + 1)
        };
        if(search_keyword) {
          param['main_search_keyword'] = search_keyword;
        }
        props.getOrganisations(param);
      }      
    }
  }

  const createNewContact = async(org_id) => {
    console.log("org_id:",org_id);
    let param = {
      _id: org_id,
    };
    await props.getOrganisation(param);
    await props.setNewContact(org_id);
    props.history.push("/contacts");
  }

  return (
    <Fragment>
      <Helmet>
        <title>Organizations</title>
      </Helmet>
      <Layout location={location}>        
        <Row className="organization">
          <Col span={24} className="org_top_action">
            <span className="org_other_action">
              <div className="othr_act" onClick={() => setVisibleOrganizationAddModal(true)}><PlusCircleIcon /></div>
              <Divider type="vertical" />
              <div className="othr_act" onClick={() => setVisibleOrganizationFilterModal(true)}>{activeFilter ? <FillFilterIcon height="22" width="20" /> : <FilterIcon height="17" width="17" /> } </div>
              <button ref={hiddenLoadMoreBtnRef} onClick={loadMore} style={{display:'none'}} />
            </span>
            <span className="org_import_action">
              <Tooltip className="imp_act" placement="topLeft" title={t("organization.import_csv_file","Import CSV File")}>
                <span onClick={showOpenFileDlg}><DownloadIcon width={20} height={22} /></span>  
                <input type="file" ref={inputOpenFileRef} style={{display:"none"}} onChange={handleFileUpload} />
              </Tooltip>
              <Tooltip className="imp_act" placement="topLeft" title={t("organization.download_sample_csv","Download Sample CSV")}>
                <a href="sample/organizations_import_sample.xlsx" download ><CSVIcon width={20} height={22} /></a>              
              </Tooltip>         
            </span>
          </Col>
        </Row>
        <Row className="org-table-row">
          <OrganizationDetailModal reloadPageFunc={reloadPage} visible={visibleOrganizationDetailModal} visibleFunc={setVisibleOrganizationDetailModal} />
          <OrganizationAddModal reloadPageFunc={reloadPage} visible={visibleOrganizationAddModal} visibleFunc={setVisibleOrganizationAddModal} />
          <OrganizationFilterModal reloadPageFunc={reloadPage} setActiveFilterFunc={setActiveFilter} visible={visibleOrganizationFilterModal} visibleFunc={setVisibleOrganizationFilterModal} />
          <DeleteModal visible={visibleDeleteModal} visibleFunc={setVisibleDeleteModal} />
          {/* <Col span={24}>
              <div>
                Pagination : {JSON.stringify(props.pagination)}
              </div>
              <div>
                Latest Records : {props.organisations.length}
              </div>
          </Col> */}
          <Col span={24} className='tbl-col'>
            <Table
              className="org-tbl"
              pagination={false}
              scroll={{ x: true, y: "calc(100vh - 220px)" }}
              columns={columns}
              dataSource={data}
              showSorterTooltip={false}
              onRow={(r) => ({
                onClick: () => {
                  console.log(r); 
                  openOrganizationDetailModal(r._id)
                }
              })}
            />
          </Col>
          
        </Row>
      </Layout>
    </Fragment>
  );
}

const mapStateToProps = state => ({ 
  organisation_fields: (state.custom_table_field && state.custom_table_field.organisations) || [], 
  organisations: (state.organisation && state.organisation.list) || [],
  pagination: (state.organisation && state.organisation.pagination) || "",
  auth:(state.auth && state.auth.user) || '',
  filter_fields:(state.organisation && state.organisation.filter_fields) || ""
});
const mapDispatchToProps = {
  getOrganisationFields, getOrganisations, getOrganisation, getLogs, getNotes,filterOrganisation,importOrganization, setNewContact
};
export default connect(mapStateToProps,mapDispatchToProps)(Organizations) ;
