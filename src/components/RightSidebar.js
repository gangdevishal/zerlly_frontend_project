import React from "react";

import NewOrganisationSide from "./NewOrganisationSide";
import FilterOrganisationSide from "./FilterOrganisationSide";
import DetailOrganisationSide from "./DetailOrganisationSide";
import EditOrganisationSide from "./EditOrganisationSide";

import NewContactSide from "./NewContactSide";
import FilterContactSide from "./FilterContactSide";
import DetailContactSide from "./DetailContactSide";
import EditContactSide from "./EditContactSide";

import NewDealSide from "./NewDealSide";
import FilterDealSide from "./FilterDealSide";
import DetailDealSide from "./DetailDealSide";
import EditDealSide from "./EditDealSide";

import DetailSalesboardSide from "./DetailSalesboardSide";
import FilterSalesboardSide from "./FilterSalesboardSide";

function RightSidebar({selectedStageId,sideBarType,editSideBarFunc,closeSideBarFunc,activateFilter, pageFrom=''}) {
  
  return (
    <>
      {sideBarType ? (
        <nav
          className={`navbar col-2 navbar-expand-md navbar-dark background-white border-grey fixed-right setScroll`}
        >  
          {(() => {
            switch (sideBarType) {
              case "dashboard":
                return <DetailSalesboardSide editSideBarFunc={editSideBarFunc} closeSideBarFunc={closeSideBarFunc} />;
              case "filter_salesboard":
                return <FilterSalesboardSide activateFilter={activateFilter} selectedStageData={selectedStageId} editSideBarFunc={editSideBarFunc} closeSideBarFunc={closeSideBarFunc} />;
              case "new_org":
                return <NewOrganisationSide closeSideBarFunc={closeSideBarFunc} />;
              case "edit_org":
                return <EditOrganisationSide closeSideBarFunc={closeSideBarFunc} />;
              case "filter_org":
                return <FilterOrganisationSide activateFilter={activateFilter} closeSideBarFunc={closeSideBarFunc} />;
              case "detail_org":
                return <DetailOrganisationSide editSideBarFunc={editSideBarFunc} closeSideBarFunc={closeSideBarFunc} />;
              case "new_contact":
                return <NewContactSide closeSideBarFunc={closeSideBarFunc} />;
              case "edit_contact":
                return <EditContactSide closeSideBarFunc={closeSideBarFunc} />;
              case "filter_contact":
                return <FilterContactSide activateFilter={activateFilter} closeSideBarFunc={closeSideBarFunc} />;
              case "detail_contact":
                return <DetailContactSide editSideBarFunc={editSideBarFunc} closeSideBarFunc={closeSideBarFunc} />; 
              case "new_deal":
                return <NewDealSide closeSideBarFunc={closeSideBarFunc} />;
              case "edit_deal":
                return <EditDealSide closeSideBarFunc={closeSideBarFunc} />;
              case "filter_deal":
                return <FilterDealSide activateFilter={activateFilter} closeSideBarFunc={closeSideBarFunc} pageFrom={pageFrom} />;
              case "detail_deal":
                return <DetailDealSide editSideBarFunc={editSideBarFunc} closeSideBarFunc={closeSideBarFunc} />;                  
              default:
                return "";
            }
          })()}
        </nav>
      ) : null}
    </>
  );
}



export default RightSidebar;
