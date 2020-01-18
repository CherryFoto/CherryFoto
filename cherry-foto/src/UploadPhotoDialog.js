import React, { Component } from 'react'
import { DropzoneDialog } from 'material-ui-dropzone'
import UploadButton from "./UploadButton";

// const axios = require('axios');
import axios from 'axios'

export default class UploadPhotoDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      files: []
    };
  }

  handleClose = () => {
    this.setState({
      open: false
    });
  }

  handleSave = files => {
    // Saving files to state for further use and closing Modal.
    let photo = files[0];

    var bodyFormData = new FormData();
    bodyFormData.append('photo', photo); 

    axios({
      method: 'post',
      url: 'http://localhost:3000/upload',
      data: bodyFormData,
      headers: {'Content-Type': 'multipart/form-data' }
      })
      .then(function (response) {
          //handle success
          console.log(response);
      })
      .catch(function (response) {
          //handle error
          console.log(response);
      });

    this.setState({
      files: files,
      open: false
    });
  }

  handleOpen = () => {
    this.setState({
      open: true,
    });
  }

  render() {
    return (
      <div>
        <UploadButton onClick={this.handleOpen} />
        <DropzoneDialog
          open={this.state.open}
          onSave={this.handleSave}
          filesLimit={1}
          acceptedFiles={['image/jpeg', 'image/png']}
          showPreviews={true}
          maxFileSize={5000000}
          onClose={this.handleClose}
        />
      </div>
    );
  }
}