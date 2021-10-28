import React, { Component } from 'react'
import { connect } from "react-redux";

class FullPageLoader extends Component {
    render() {
        const { loading } = this.props;
        if (!loading) return null;
        return (
            <div className="loader-container">
                <div className="loader">
                    <img src={`assets/img/loader.gif`} />
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({ loading: state.loader.loading });
export default connect(mapStateToProps)(FullPageLoader);