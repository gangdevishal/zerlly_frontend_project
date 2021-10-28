import React, { Fragment, useState } from "react";
import { Modal, Button, Space } from "antd";
import "./css/delete_modal.css";

function DeleteModal(props) {
  let title = props.title ? props.title : "Delete XXXXXX";
  let description = props.description ? props.description :  "Are you sure you want to delete this XXXXXX?";
  let confirmDeleteAction = props.confirmDeleteAction ? props.confirmDeleteAction : '';
  return (
    <Fragment>
      <Modal
        title={title}
        visible={props.visible}
        onCancel={() => props.visibleFunc(false)}
        centered
        footer={false}
        destroyOnClose={true}
        width={400}
      >
        <span>{description}</span>

        <div className="btns-delete">
        <Button
            type="text"
            className="delete_cancel_btn"
            onClick={() => props.visibleFunc(false)}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            className="delete_submit_btn"
            onClick={confirmDeleteAction}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </Fragment>
  );
}

export default DeleteModal;
