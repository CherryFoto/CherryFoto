import React, { Component } from "react";
import { DropzoneArea } from "material-ui-dropzone";
import "./App.css";
import { Button, Divider } from "@material-ui/core";

class UploadPhoto extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }
  handleChange(files) {
    this.setState({
      files: files
    });
  }
  handleSubmit(files) {}

  render() {
    return (
      <div style={{flex: 1}}>
        <DropzoneArea onChange={this.handleChange.bind(this)} />
        <Button onClick={this.handleSubmit.bind(this)}>Filter</Button>
      </div>
    );
  }
}

export default UploadPhoto;
