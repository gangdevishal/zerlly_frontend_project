import React, { useEffect } from "react";
import { connect } from 'react-redux';
import { message } from 'antd';

const Alert = ({alerts}) => {
    useEffect(() => {
        if(alerts){
            if(alerts.alertType == 'success'){
                message.success(alerts.msg);
            }
            if(alerts.alertType == 'danger'){
                message.error(alerts.msg);
            }
            if(alerts.alertType == 'warning'){
                message.warning(alerts.msg);
            }
        }
        
    }, [alerts])
    return (
        alerts !== null &&
        alerts.length > 0 &&
        1==2 &&
        alerts.map((alert) => (
            <div style={{"marginTop":"10px"}} key={alert.id} className={`alert alert-${alert.alertType}`}>
            {alert.msg}
            </div>
        ))
    )
}

const mapStateToProps = (state) => ({ alerts: state.alert });
export default connect(mapStateToProps)(Alert);
