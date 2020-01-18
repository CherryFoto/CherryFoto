import React, { Component } from "react";
import UploadPhotoDialog from "./UploadPhotoDialog";
import "./App.css";
import { AppBar, Toolbar, Typography, Button, Modal, Card } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import UploadButton from "./UploadButton";


class App extends Component {
  render() {
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" style={{ flexGrow: 1 }}>
            🍒 CherryFoto
          </Typography>
          <UploadPhotoDialog />
        </Toolbar>
      </AppBar>
    );
  }
}

export default App;
