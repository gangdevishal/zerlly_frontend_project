import React, { Component } from "react";
import Layout from "./layout";
import RightSidebar from "./RightSidebar";
import { Modal } from 'react-bootstrap';
import { Helmet } from "react-helmet-async";
import {connect} from "react-redux";
import { getOrganisationFields } from "../redux/actions/custom_table_field";
import { getOrganisations, getOrganisation, getNotes, getLogs, deleteOrganisation, paginateRecords,importOrganization,  filterOrganisation } from "../redux/actions/organisation";
import { queryStringParse } from "../utils/helpers";
import Pagination from './Pagination';
import moment from 'moment-timezone';
import * as XLSX from 'xlsx';
import { showLoader, hideLoader} from "../redux/actions/loader";

class Organisations extends Component {
  constructor(props){
    super(props);

    this.state = {
      filter_sidebar:false,
      new_sidebar:false,
      detail_sidebar:false,
      sideBarType:'',
      selectedId:'',
      showDeleteModal:false,
      defaultSort:'desc',
      defaultSortColumn:"updated_at",
      referenceId:'',
      activeFilter:false,
      columns:[],
      data:[],
      current_user_id:(this.props.auth && this.props.auth._id) ? this.props.auth._id : ''
    }

    this.filterOrg.bind(this);
    this.newOrg.bind(this);
    this.detailOrg.bind(this);
    this.closeSideBar.bind(this);    
    this.editSideBar.bind(this);    
    this.closeDeleteModal.bind(this);    
    this.openDeleteMoal.bind(this);
    this.confirmDelete.bind(this);
    this.sortTbl.bind(this);
    this.paginate.bind(this);

    this.inputOpenFileRef = React.createRef()
    this.listInnerRef = React.createRef()
  }

  showOpenFileDlg = () => {
    this.inputOpenFileRef.current.click()
  }

  paginate = (pageNumber) => (e) => {
    e.preventDefault();
    // Call Pagination
    let pagination_param = { current_page:pageNumber };
    this.props.paginateRecords(pagination_param);
  };

  componentDidMount = async () =>{
    await this.props.showLoader();
    let param = {
      user_id:this.state.current_user_id,
      sort_by:this.state.defaultSortColumn,
      order_by:this.state.defaultSort
    };
    await this.props.getOrganisations(param);
    await this.props.hideLoader();
    await this.props.getOrganisationFields();
    this.setState({ referenceId:"" });
  }

  componentDidUpdate = (prevProps, prevState) =>{
    let getQueryString  =  queryStringParse(this.props.location.search);
    let referenceId     = getQueryString.redirectId;
    // console.log("referenceId:",referenceId);
    // console.log("Outside this.state.referenceId:",this.state.referenceId);

    if (referenceId && prevProps.organisation !== this.props.organisations && this.state.referenceId === '') {
      // console.log("Inside this.state.referenceId:",this.state.referenceId);
      this.setState({ referenceId:referenceId });
      (async() => {
        let param = {
          sort_by: this.state.defaultSortColumn,
          order_by: this.state.defaultSort,
          referenceId:referenceId
        };
        await this.props.getOrganisations(param);
      })()
    }
  }

  filterOrg = (e) => {    
    this.setState(prevState => ({
      filter_sidebar: !prevState.filter_sidebar,
      sideBarType:(!prevState.sideBarType) ? 'filter_org' : (prevState.sideBarType !== 'filter_org' ? 'filter_org' : '')
    }));
  }

  newOrg = (e) => {    
    this.setState(prevState => ({
      new_sidebar: !prevState.new_sidebar,
      sideBarType:(!prevState.sideBarType) ? 'new_org' : (prevState.sideBarType !== 'new_org' ? 'new_org' : '')
    }));
  }

  detailOrg = (id) => async(e) => {
    console.log(`id:${id}`);
    this.setState((prevState,prevProps) => {
      return {
        sideBarType:(prevState.selectedId !== id) ? 'detail_org' : '',
        selectedId:(prevState.selectedId !== id) ? id : '',
      }
    });
    if(this.state.selectedId !== id){
      let param = {
        _id: id,
      };
      await this.props.getOrganisation(param);
      await this.props.getLogs({org_id:id, timezone:moment.tz.guess(true)});    
      await this.props.getNotes({org_id:id, timezone:moment.tz.guess(true)});
    }        
  }

  closeSideBar = (e) => {    
    this.setState(prevState => ({
      sideBarType:'',
      selectedId:'',
    }));
  }

  editSideBar = (e) => {    
    this.setState(prevState => ({
      sideBarType:'edit_org'
    }));
  }

  closeDeleteModal = (e) => {
    this.setState({ showDeleteModal: false });
  }

  openDeleteMoal = (e) => {
    this.setState({ showDeleteModal: true });
  }

  setHeaderButton = () =>{
    return (
      <>
      <span style={{ cursor:"pointer" }} className="add ml-2" onClick={this.newOrg}>
        <img height="17" src={`assets/img/org_add_btn.svg`} alt="" />
      </span>
      <span style={{ cursor:"pointer" }} className="delete ml-2" onClick={this.openDeleteMoal}>
        <img height="17" src={`assets/img/delete_icon.svg`} alt="" />
      </span>     
      </>
    )
  }

  confirmDelete = async(e) => {
    await this.props.deleteOrganisation(this.state.selectedId);
    this.setState({ showDeleteModal: false, sideBarType:'', selectedId:'' });
    if(this.props.filter_fields  && this.state.activeFilter){    
      let param = {
        formField:this.props.filter_fields,
        other:{sort_by:this.state.defaultSortColumn,order_by:this.state.defaultSort},
      };    
      this.props.filterOrganisation(param, false);
    }
    else{
      let param = {user_id:this.state.current_user_id,sort_by:this.state.defaultSortColumn,order_by:this.state.defaultSort};
      this.props.getOrganisations(param);
    }
    this.scrollToTop();
  }

  sortTbl = (column_slug) => async(e) => {
    this.setState((prevState,prevProps) => {
      return {
        defaultSort: prevState.defaultSort == 'desc' ? 'asc' : 'desc',
        defaultSortColumn: column_slug,
      }
    })
    
    if(this.props.filter_fields && this.state.activeFilter){    
      let param = {
        formField:this.props.filter_fields,
        other:{sort_by:column_slug, order_by:this.state.defaultSort == 'desc' ? 'asc' : 'desc'},
      };    
      this.props.filterOrganisation(param, false);
    }
    else{
      let param = {
        user_id:this.state.current_user_id,
        sort_by:column_slug,
        order_by:this.state.defaultSort == 'desc' ? 'asc' : 'desc',
      }
      this.props.getOrganisations(param);
    }
    this.scrollToTop();
  }
  activateFilter = (filter_status) => {
    this.scrollToTop();
    this.setState({ activeFilter:filter_status });
  }

  // process CSV data
  processData = async(dataString) => {
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
 
    this.setState({  data:list, columns:columns, activeFilter:false });

    var current_user_id = (this.props.auth && this.props.auth._id) ? this.props.auth._id : '';
    let formData = {
      user:current_user_id,
      rows:list
    }
    await this.props.importOrganization(formData);    

    let param = {user_id:this.state.current_user_id,sort_by:this.state.defaultSortColumn,order_by:this.state.defaultSort};
    await this.props.getOrganisations(param);   
    this.scrollToTop();
    this.inputOpenFileRef.current.value = '';
  }
 
  // handle file upload
  handleFileUpload = e => {
    const file = e.target.files[0];
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
      this.processData(data);
    };
    reader.readAsBinaryString(file);
  }

  scrollToTop = () => {
    // Scroll to top
    var elmnt = document.getElementById("dataTable");
    elmnt.scrollIntoView();
  }

  onScroll = () => {
    if (this.listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = this.listInnerRef.current;
      // console.log("scrollTop:",scrollTop,"scrollHeight;",scrollHeight,"clientHeight:",clientHeight);
      if (scrollTop + clientHeight === scrollHeight) {
        // TO SOMETHING HERE
        console.log('Reached bottom');
        let current_page = + this.props.pagination.currentPage;
        let total_page = this.props.pagination.totalPages;
        if(current_page < total_page){          
          if(this.props.filter_fields  && this.state.activeFilter){    
            let param = {
              formField:this.props.filter_fields,
              other:{sort_by:this.state.defaultSortColumn,order_by:this.state.defaultSort,current_page:parseInt(current_page+1)},
            };    
            this.props.filterOrganisation(param, false);
          }
          else{
            let param = {user_id:this.state.current_user_id,sort_by:this.state.defaultSortColumn,order_by:this.state.defaultSort,current_page:parseInt(current_page+1)};
            this.props.getOrganisations(param);
          }
        }        
      }
    }
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Organizations</title>
        </Helmet>
        <Layout
          title={`Organizations`}
          counter={(this.props.pagination && this.props.pagination.totalRecords) ? this.props.pagination.totalRecords: 0}
          setHeaderButtonFunc={this.setHeaderButton.bind(this)}
        >
          <div className="container-fluid newScroll">
            <div className="row setScroll">
              <div
                className={this.state.sideBarType ? "col-10" : "col-12"}
                id="main"
              >
                <div className="background-white organization-div">
                  <div className="table-responsive" onScroll={this.onScroll.bind()} ref={this.listInnerRef}>
                    <table
                      className="table table-hover org-table"
                      id="dataTable"
                      width="100%"
                      cellSpacing={0}
                    >
                      <thead style={{ color: " #333333" }}>
                        <tr>

                          {this.props.organisation_fields && this.props.organisation_fields.length > 0 && 1==2  ? (
                            <th width="3%" className="text-center">                             
                              <label className="checkbox-label mb-0"> 
                                <input type="checkbox" /> 
                                <span className="geekmark" /> 
                              </label>
                            </th>
                          ) : null }

                          {this.props.organisation_fields && this.props.organisation_fields.length > 0  ? 
                            this.props.organisation_fields.map((org,index) => (
                              <th width="20%" key={index}>
                                {org.column_name}
                                {
                                  (org.is_sortable) ? (<span onClick={ this.sortTbl(org.column_slug) }  style={{ cursor:"pointer" }}><i className="fa fa-fw fa-sort" /></span>) : null
                                }                                
                              </th>
                            )) : null
                          }

                          <th>
                            <div className="d-inline-flex align-items-center">
                              <img onClick={this.showOpenFileDlg} height="30" data-toggle="tooltip" data-placement="top" title="Import CSV File"  src={`assets/img/import_csv_icon.svg`} alt="add" style={{ cursor:"pointer" }} />
                                <a href="sample/organizations_import_sample.xlsx" download className="ml-2" data-toggle="tooltip" data-placement="top" title="Download Sample CSV"><img height="34" src={`assets/img/csv_download_icon.svg`} alt="icon" /></a>
                            </div>                            
                            <input type="file" ref={this.inputOpenFileRef} style={{display:"none"}} onChange={this.handleFileUpload.bind(this)} />
                          </th>
                          {this.props.organisation_fields && this.props.organisation_fields.length > 0  ? (
                            <>
                              {/* <th colSpan="4" /> */}
                              <th className="text-right">
                                <button
                                  type="button"
                                  className={`btn btn-sm btn-outline-dark org-filter-btn ${this.state.activeFilter ? ' active-filter-btn' : ''}` }
                                  onClick={this.filterOrg}
                                  style={{
                                    color: "#696D71",
                                    border: "2px solid  #696D71",
                                  }}
                                >
                                  Filters
                                </button>
                              </th>
                            </>
                          ) : null }                          
                        </tr>
                      </thead>

                      <tbody style={{ color: " #696D71" }}>
                      {
                        (this.props.organisations && this.props.organisations.length > 0) ? 
                          this.props.organisations.map((org,index)=>(
                            <tr key={index} style={{ borderBottom: "1px solid #e1e4e6", cursor:"pointer" }} className={(this.state.selectedId === org._id) ? `highlight-row`: ``} onClick={this.detailOrg(org._id)}>
                              {
                                1==2 && (
                                  <td className="text-center">
                                  <label className="checkbox-label mb-0"> 
                                    <input type="checkbox" 
                                    checked = { this.state.selectedId === org._id }  
                                    onChange={this.detailOrg(org._id)}/> 
                                    <span className="geekmark" /> 
                                  </label>
                                </td>
                                )
                              }
                              
                              {this.props.organisation_fields.map((org_head,index2) => (                                
                                <td key={index2}>{org[org_head.column_slug]}</td>
                            ))}
                              <td colSpan="5" />
                            </tr>
                          ))
                          : (
                            <tr style={{ borderBottom: "1px solid #e1e4e6" }}>                              
                              <td className="text-center" colSpan="20">No Records Are Available</td>
                            </tr>
                          )
                      }
                      </tbody>
                    </table>
                  </div>
                  
                    {this.props.organisations.length > 0 && this.props.pagination && 1==2 ? (
                      <>
                      <div className="mr-2 d-flex justify-content-end pg-div" style={{ height:"45px" }}>
                        <span className="mr-3 mt-1" style={{ color:"#ee5c23" }}>
                          <small>
                            {this.props.pagination.recordRange}
                          </small>                          
                        </span>
                        <Pagination
                          totalPages={this.props.pagination.totalPages}
                          paginate={this.paginate}
                          currentPage={this.props.pagination.currentPage}
                        />
                      </div>
                      </>
                      
                    ) : null}
                  
                </div>
              </div>
              <RightSidebar
                editSideBarFunc={this.editSideBar}
                closeSideBarFunc={this.closeSideBar}
                sideBarType={this.state.sideBarType}
                selectedId={this.state.selectedId}
                activateFilter={this.activateFilter}
              />
            </div>

            <Modal
              show={this.state.showDeleteModal}
              onHide={this.closeDeleteModal}
              centered
              aria-labelledby="contained-modal-title-vcenter"
              size="sm"
            >
              <Modal.Body>
                <div className="delete-popup">
                  <div className="close-icon" onClick={this.closeDeleteModal}>
                    <i className="fa fa-times" />
                  </div>
                  <div className="delete-popup-img" />
                  <div className="delete-popup-heading">Delete Permanently</div>
                  <div className="delete-popup-subheading">
                    Are you sure you want permanently delete these
                    Organization(s) from your list?
                  </div>
                  <div className="mt-3">
                    <button
                      className="btn btn-sm btn-orange"
                      onClick={this.confirmDelete}
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
          </div>
        </Layout>
      </>
    );
  }
}

const mapStateToProps = state => ({ 
  organisation_fields: (state.custom_table_field && state.custom_table_field.organisations) || [], 
  organisations: (state.organisation && state.organisation.list) || [],
  pagination: (state.organisation && state.organisation.pagination) || "",
  auth:(state.auth && state.auth.user) || '',
  filter_fields:(state.organisation && state.organisation.filter_fields) || ""
});
const mapDispatchToProps = {
  getOrganisationFields, getOrganisations, getOrganisation, getLogs, getNotes, deleteOrganisation, importOrganization, paginateRecords,filterOrganisation, showLoader, hideLoader
};
export default connect(mapStateToProps,mapDispatchToProps)(Organisations);
