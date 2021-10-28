import React, { Fragment, useState, useEffect } from "react";
import Layout from "./layout";
import { Helmet } from "react-helmet-async";
import Board from "@lourenci/react-kanban";
import "@lourenci/react-kanban/dist/styles.css";
import "./css/dashboard.css";
import {
  getDealFields,
  getContactsOfOrganization,
} from "../redux/actions/custom_table_field";
import {
  getStages,
  updateStage,
  sortSalesboardCard,
  setFilterFields as setStageFilterFields,
  filterSalesboardDeal,
} from "../redux/actions/stage";
import {
  getDeal,
  getNotes,
  getLogs,
  emptyDealSingle,
  getDealLostReasons,
  setFilterFields,
  updateDealAction
} from "../redux/actions/deal";
import { useDispatch, useSelector } from "react-redux";
import { getOrganisations } from "../redux/actions/organisation";
import { showLoader, hideLoader } from "../redux/actions/loader";
import moment from "moment-timezone";
import DealDetailModal from "./DealDetailModal";
import { Empty, Button } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import {SortIcon, SixSquareIcon, UserCircleIcon, FillFilterIcon, FilterIcon} from './Icons'
import DealFilterModal from "./DealFilterModal";

function Dashboard(props) {
  const { location } = props;
  const { t, i18n } = useTranslation();

  const [visibleDealDetailModal, setVisibleDealDetailModal] = useState(false);
  const [sideBarType, setsideBarType] = useState("");
  const [selectedId, setselectedId] = useState("");
  const [selectedCardId, setselectedCardId] = useState("");
  const [sortDefaultStageCard, setDefaultSortStageCard] = useState("asc");
  const [stageData, setStageData] = useState({});
  const [visibleDealFilterModal, setVisibleDealFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState(false);
  const dispatch = useDispatch();
  const current_user_id = useSelector(
    (state) =>
      (state.auth && state.auth.user && state.auth.user._id) ||
      "6049b3346b97097bbec90451"
  );
  const stages = useSelector((state) => state.stage.temp_list);
  const stage_card_count = useSelector((state) => state.stage.card_count);
  const filter_fields = useSelector(
    (state) => (state.stage && state.stage.filter_fields) || ""
  );
  const board = {
    columns: stages,
  };

  useEffect(() => {
    (async () => {
      dispatch(showLoader());
      let param = {
        user_id: current_user_id,
        deal_user: current_user_id,
        sort: sortDefaultStageCard,
      };
      dispatch(getStages(param));
      dispatch(getDealFields());
      dispatch(getDealLostReasons());
      dispatch(emptyDealSingle());
      dispatch(hideLoader());
    })();
  }, []);

  async function handleCardMove(_card, source, destination) {

    // Check Stage Position
    let sourceStage = stages.filter(function (e) {
      return e.id === source.fromColumnId;
    });
    let destinationStage = stages.filter(function (e) {
      return e.id === destination.toColumnId;
    });
    let dealId = _card.deal_id;
    console.log("sourceStage:",sourceStage,"destinationStage:",destinationStage);
    console.log("source:",source,"destination:",destination);
    let formData = {
      user: current_user_id,
      deal: dealId,
      stage: { ref: "stage", value: destination.toColumnId },
      stage_title: destinationStage && destinationStage.length > 0 ? destinationStage[0]['title'] : '',
    };
    await dispatch(updateStage(formData));
    if (filter_fields && activeFilter) {
      await dispatch(filterSalesboardDeal(filter_fields,false));
    } else {
      let param = {
        user_id: current_user_id,
        deal_user: current_user_id,
        sort: sortDefaultStageCard,
      };
      await dispatch(getStages(param));
    }
  }

  const sortStageCard = (id) => {
    console.log("selectedId:", selectedId);
    if (sortDefaultStageCard === "asc") {
      setDefaultSortStageCard("desc");
    } else {
      setDefaultSortStageCard("asc");
    }
    console.log("id:", id);
    let param = {
      sort_by: "organization",
      order_by: sortDefaultStageCard,
      stage_id: id,
    };
    dispatch(sortSalesboardCard(param));
  };
  const filterStageCard = (id) => {
    if (sideBarType && sideBarType == "filter_salesboard") {
      setsideBarType("");
      setselectedCardId("");
      setStageData({});
    } else {
      setsideBarType("filter_salesboard");
      setselectedCardId("");
      setStageData({ ref: "stage", value: id });
    }
  };

  const openDealDetailModal = (dealId) => {
    dispatch(getDealFields());
    dispatch(getOrganisations({ sort_by: "updated_at", order_by: "desc" }));
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
      user_id: current_user_id,
      deal_user: current_user_id,
      sort: sortDefaultStageCard,
    };
    dispatch(getStages(param));
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
    let params = {
      user_id: current_user_id,
      deal_user: current_user_id,
    };
    await dispatch(getStages(params));
    let param = {
      _id: deal_id,
      other:{
        user: current_user_id,
        timezone: moment.tz.guess(true)
      }
    };
    await dispatch(getDeal(param));
  };
  return (
    <Fragment>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <Layout location={location}>
        <DealDetailModal handleDealActionFunc={handleDealAction} reloadPageFunc={reloadPage} visible={visibleDealDetailModal} visibleFunc={setVisibleDealDetailModal} />
        <DealFilterModal
            modal_title={'Filter Salesboard'}
            pageFrom={'salesboard'}
            reloadPageFunc={reloadPage}
            setActiveFilterFunc={setActiveFilter}
            visible={visibleDealFilterModal}
            visibleFunc={setVisibleDealFilterModal}
          />
        {stages && stage_card_count > 0 && stages.length > 0 ? (
          <Board
            onCardDragEnd={handleCardMove}
            renderColumnHeader={({ id, title, color, total_card }) => (
              <div className="react-kanban-column-header">
                <span
                  className="round round-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="board_title">{title} ({total_card})</span>
                <span className="filter_sort">
                  <div onClick={() => sortStageCard(id)}>
                    <SortIcon height="13" width="13" />
                  </div>
                  <div onClick={() => setVisibleDealFilterModal(true)}>
                    {/* <FilterIcon /> */}
                    {activeFilter ? (
                      <FillFilterIcon height="15" width="15" />
                    ) : (
                      <FilterIcon height="15" width="15" />
                    )}
                  </div>
                </span>
              </div>
            )}
            renderCard={({
              id,
              deal_id,
              contact_name,
              organization,
              value,
              responsible,
              user_photo,
            }) => (
              <div
                className="react-kanban-card "
                onClick={() => openDealDetailModal(deal_id)}
              >
                <div className="react-kanban-card__title">
                  <span style={{display:'inline-flex'}}><SixSquareIcon /></span>
                  <span className="heading">{contact_name}</span>
                </div>
                <div className="react-kanban-card__description">
                  <div className="label_first">
                    <span className="title">{t("board.organization","Organization")}</span>
                    <span className="value">{organization}</span>
                  </div>
                  <div className="second_third_label">
                    <div className="label_second">
                      <span className="title">{t("board.sales","Sales")}</span>
                      <span className="sales value">                        
                        {
                          (user_photo) ? (<img src={user_photo} alt="avtar" />) : (<div style={{lineHeight: '10px', marginRight:'5px'}}><UserCircleIcon /></div> )
                        }
                        {responsible}
                      </span>
                    </div>
                    <div className="label_third">
                      <span className="title">{t("board.value","Value")}</span>
                      <span className="value">{value}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          >
            {board}
          </Board>
        ) : (
          <Fragment>
            <Empty
             className="no_salesboard_deal"
              image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
              imageStyle={{
                height: 60,
              }}
              description={
                <span>
                  {t('board.no_salesboard_deal','No any deal found')}
                </span>
              }
            >
              <Button type="primary" onClick={() => setVisibleDealFilterModal(true)}>{t('board.apply_filter','Apply Filter')}</Button>
            </Empty>
          </Fragment>
        )}
      </Layout>
    </Fragment>
  );
}
export default Dashboard;
