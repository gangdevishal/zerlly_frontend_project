import React, { useEffect, useState, useRef } from "react";
import Layout from "./layout";
import { Modal } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { getCancelDeals, appendCancelRecords, deleteCancelDeal } from "../redux/actions/deal";
import { getUsers } from "../redux/actions/user";
import moment from "moment-timezone";
import { DateRangePicker } from "rsuite";
import { DateStaticRanges } from "../utils/helpers";
import { showLoader, hideLoader} from "../redux/actions/loader";

function Cancels() {
  const dispatch = useDispatch();
  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const cancel_deals = useSelector(
    (state) =>
      (state.deal && state.deal.cancel_deals && state.deal.cancel_deals.list) ||
      []
  );
  const cancel_deal_pagination = useSelector(
    (state) =>
      (state.deal &&
        state.deal.cancel_deals &&
        state.deal.cancel_deals.pagination) ||
      ""
  );
  const users = useSelector((state) => state.user.list);

  const [inputDKey, setinputDKey] = useState(Date.now());
  const [defaultSort, setdefaultSort] = useState("asc");
  const [defaultSortColumn, setdefaultSortColumn] = useState("");
  const [selectedId, setselectedId] = useState("");
  const [openDeleteModal, setopenDeleteModal] = useState(false);
  const [filterData, setFilterData] = useState({
    responsible: current_user_id,
    date_range:''
  });
  const listInnerRef = useRef(null);

  useEffect(() => {
    dispatch(showLoader());
    dispatch(getUsers());
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

  const sortTbl = (column_slug) => {
    if (defaultSort == "asc") {
      setdefaultSort("desc");
    } else {
      setdefaultSort("asc");
    }
    setdefaultSortColumn(column_slug);
    let param = {
      deal_user: filterData.responsible,
      timezone: moment.tz.guess(true),
      sort_by: column_slug,
      order_by: defaultSort,
      date_range: filterData.date_range
    };
    dispatch(getCancelDeals(param));
    // scrollToTop();
  };

  const scrollToTop = () => {
    // Scroll to top
    var elmnt = document.getElementById("dataTable");
    elmnt.scrollIntoView();
  };

  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
      // console.log("scrollTop:",scrollTop,"scrollHeight;",scrollHeight,"clientHeight:",clientHeight);
      if (scrollTop + clientHeight === scrollHeight) {
        // TO SOMETHING HERE
        console.log("Reached bottom");
        let current_page = cancel_deal_pagination.currentPage;
        let total_page = cancel_deal_pagination.totalPages;
        console.log(
          "current_page:",
          current_page,
          " | total_page:",
          total_page
        );
        if (current_page < total_page) {
          let pagination_param = {
            deal_user: filterData.responsible,
            timezone: moment.tz.guess(true),
            sort_by: defaultSortColumn,
            order_by: defaultSort,
            date_range: filterData.date_range,
            current_page: parseInt(current_page) + 1,
          };
          dispatch(appendCancelRecords(pagination_param));
        }
      }
    }
  };

  const setHeaderButton = () => {
    return (
      <>
        <span
          style={{ cursor: "pointer" }}
          className="delete ml-2"
          onClick={(e) => setopenDeleteModal(true)}
        >
          <img height="17" src={`assets/img/delete_icon.svg`} alt="delete" />
        </span>
      </>
    );
  };

  const detailDeal = (dealId) => async (e) => {
    console.log("e.target.checked:",e.target.checked, "dealId:",dealId);
    if (e.target.checked) {
      setselectedId(dealId);
    }
    else {
      setselectedId("");
    }    
  }

  const confirmDelete = async (e) => {
    setselectedId("");
    setopenDeleteModal(false);
    await dispatch(deleteCancelDeal(selectedId));
    console.log("selectedId:",selectedId);

    let param = {
      deal_user: filterData.responsible,
      timezone: moment.tz.guess(true),
      sort_by: defaultSortColumn,
      order_by: defaultSort,
      date_range: filterData.date_range,
    };
    await dispatch(getCancelDeals(param));
    // scrollToTop();
  };

  const manageFilter = async(e) => {
    const { name, value } = e.target;
    setFilterData({ ...filterData, [name]: value });
  }

  const handleDate = (date) => {
    let new_date = [];
    for (const dt of date) {
      new_date.push(moment(dt).format("YYYY-MM-DD"));
    }
    let date_var = new_date.length > 0 ? new_date : "";
    setFilterData({ ...filterData, date_range: date_var });
  };

  return (
    <>
      <Helmet>
        <title>Cancels</title>
      </Helmet>
      <Layout
        title="Cancels"
        counter={
          cancel_deal_pagination && cancel_deal_pagination.totalRecords
            ? cancel_deal_pagination.totalRecords
            : 0
        }
        setHeaderButtonFunc={setHeaderButton}
      >
        <div className="container-fluid newScroll">
          <div className="row setScroll">
            <div className={"col-12"} id="main">
            <div className="background-white organization-div">
            <div className="row org-form">
                  <div className="col-md-2 mt-3 mr-3 ml-3">
                    <div className="form-group">
                      <label className="font-weight-bold">
                        Users
                      </label>
                      <select
                        name="responsible"
                        className="form-control"
                        value={filterData.responsible}
                        onChange={manageFilter}
                      >
                        <option value="">Select All</option>
                        {users.map((user, index) => (
                          <option key={user._id} value={user._id}>
                            {current_user_id == user._id
                              ? `${user.username} (YOU)`
                              : user.username}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-2 mt-3 mr-3 ml-3">
                    <div className="form-group">
                      <label className="font-weight-bold">
                        Cancelled Date Range
                      </label>
                      <DateRangePicker
                        key={inputDKey}
                        isoWeek
                        format="YYYY-MM-DD"
                        style={{ width: "100%" }}
                        placement="auto"
                        onChange={(date) => {
                          handleDate(date);
                        }}
                        onClean={(e) => {
                          filterData["date_range"] = "";
                        }}
                        name="date_range"
                        ranges={DateStaticRanges}
                        size="sm"
                        placeholder="DD-MM-YYYY to DD-MM-YYYY"
                        renderValue={(value) => {
                          console.log("value:", value);
                          return `${moment(value[0]).format(
                            "DD-MM-YYYY"
                          )} to ${moment(value[1]).format("DD-MM-YYYY")}`;
                        }}
                      />
                    </div>
                  </div>
                </div>
            </div>
              <div className="background-white organization-div mt-1">
                <div
                  className="table-responsive"
                  onScroll={onScroll}
                  ref={listInnerRef}
                >
                  <table
                    className="table table-hover table-fixed org-table"
                    id="dataTable"
                    width="100%"
                    cellSpacing={0}
                  >
                    <thead style={{ color: " #333333" }}>
                      <tr>
                        <th width="3%" className="text-center">
                          <label className="checkbox-label mb-0">
                            <input type="checkbox" />
                            <span className="geekmark" />
                          </label>
                        </th>
                        <th width="10%">
                          Organization
                          <span
                            onClick={(e) => sortTbl("organization")}
                            style={{ cursor: "pointer" }}
                          >
                            <i className="fa fa-fw fa-sort" />
                          </span>
                        </th>
                        <th width="10%">
                          Contact Name
                          <span
                            onClick={(e) => sortTbl("contact_name")}
                            style={{ cursor: "pointer" }}
                          >
                            <i className="fa fa-fw fa-sort" />
                          </span>
                        </th>
                        <th width="10%">
                          Phone
                          <span
                            onClick={(e) => sortTbl("phone")}
                            style={{ cursor: "pointer" }}
                          >
                            <i className="fa fa-fw fa-sort" />
                          </span>
                        </th>
                        <th width="10%">
                          Email
                          <span
                            onClick={(e) => sortTbl("email")}
                            style={{ cursor: "pointer" }}
                          >
                            <i className="fa fa-fw fa-sort" />
                          </span>
                        </th>
                        <th width="10%">
                          Reason for Cancellation
                          <span
                            onClick={(e) => sortTbl("lost_reason")}
                            style={{ cursor: "pointer" }}
                          >
                            <i className="fa fa-fw fa-sort" />
                          </span>
                        </th>
                        <th width="10%">
                          Value
                          <span
                            onClick={(e) => sortTbl("value")}
                            style={{ cursor: "pointer" }}
                          >
                            <i className="fa fa-fw fa-sort" />
                          </span>
                        </th>
                        <th width="10%">
                          Date/Time
                          <span
                            onClick={(e) => sortTbl("action_date_time")}
                            style={{ cursor: "pointer" }}
                          >
                            <i className="fa fa-fw fa-sort" />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ color: " #696D71" }}>
                      {cancel_deals && cancel_deals.length > 0 ? (
                        cancel_deals.map((deal, index) => (
                          <tr
                            key={index}
                            style={{ borderBottom: "1px solid #e1e4e6" }}
                            className={
                                selectedId === deal._id
                                  ? `highlight-row`
                                  : ``
                              }
                          >
                            <td className="text-center">
                              <label className="checkbox-label mb-0">
                                <input
                                  type="checkbox"
                                  onChange={detailDeal(deal._id)}
                                  checked={selectedId === deal._id}
                                />
                                <span className="geekmark" />
                              </label>
                            </td>
                            <td>{deal.organization}</td>
                            <td>{deal.contact_name}</td>
                            <td>
                              {deal.phone ? (
                                <a href={`tel:${deal.phone}`}>{deal.phone} </a>
                              ) : null}
                            </td>
                            <td>
                              {deal.email ? (
                                <a href={`mailto:${deal.email}`}>
                                  {deal.email}{" "}
                                </a>
                              ) : null}
                            </td>
                            <td>{deal.lost_reason}</td>
                            <td>{deal.value}</td>
                            <td>{deal.action_date_time}</td>
                          </tr>
                        ))
                      ) : (
                        <tr style={{ borderBottom: "1px solid #e1e4e6" }}>
                          <td className="text-center" colSpan="20">
                            No Records Are Available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Modal
                  show={openDeleteModal}
                  onHide={() => setopenDeleteModal(false)}
                  centered
                  aria-labelledby="contained-modal-title-vcenter"
                  size="sm"
                >
                  <Modal.Body>
                    <div className="delete-popup">
                      <div
                        className="close-icon"
                        onClick={() => setopenDeleteModal(false)}
                      >
                        <i className="fa fa-times" />
                      </div>
                      <div className="delete-popup-img" />
                      <div className="delete-popup-heading">
                        Delete Permanently
                      </div>
                      <div className="delete-popup-subheading">
                        Are you sure you want permanently delete these Deal(s)
                        from your list?
                      </div>
                      <div className="mt-3">
                        <button
                          className="btn btn-sm btn-orange"
                          onClick={() => confirmDelete()}
                        >
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  </Modal.Body>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default Cancels;
