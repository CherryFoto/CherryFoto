import React, { Component } from "react";
import UploadPhotoDialog from "./UploadPhotoDialog";
import placeholderImg from "./placeholder.png";
import "./App.css";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  ButtonGroup,
  Card,
  CardMedia
} from "@material-ui/core";
import axios from "axios";
import NoImageSnackbar from "./NoImageSnackbar";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      image: placeholderImg,
      lastUploadedFilename: "",
      isSnackbarOpened: false
    };
  }

  updateFilesState = files => {
    this.setState({
      files: files,
      image: window.URL.createObjectURL(files[0])
    });
  };

  updateLastUploadedFilename = filename => {
    this.setState({ lastUploadedFilename: filename });
  };

  snackbarHandleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({
      isSnackbarOpened: false
    })
  }

  filterOnClick = filter => () => {
    if (this.state.lastUploadedFilename === "") {
      this.setState({
        isSnackbarOpened: true
      })
      return;
    }

    axios
      .get("http://localhost:3001/filterImageLink", {
        params: {
          filename: this.state.lastUploadedFilename,
          filter: filter
        }
      })
      .then(res => {
        setTimeout(() => {
          this.setState({
            image: `http://localhost:3001/filteredImage?filename=${res.data}`
          })
        }, 100)
      });
  };

  render() {
    return (
      <div>
        <AppBar position="static" className={"appBar"}>
          <Toolbar>
            <Typography variant="h5" style={{ flexGrow: 1 }}>
              <span role="img" aria-label="cherry">
                🍒
              </span>
              {" CherryFoto"}
            </Typography>
            <UploadPhotoDialog
              updateFilesState={this.updateFilesState}
              updateLastUploadedFilename={this.updateLastUploadedFilename}
            />
          </Toolbar>
        </AppBar>
        <div>
          <Card className={"mainPhotoCard"}>
            <CardMedia component="img" image={this.state.image} />
          </Card>
        </div>
        <div className={"filterButtonsRow"}>
          <ButtonGroup
            fullWidth
            color="primary"
            aria-label="contained primary button group"
          >
            <Button
              variant="contained"
              color="primary"
              onClick={this.filterOnClick("invert")}
              style={{ marginRight: 20, borderRadius: 4 }}
            >
              Invert
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={this.filterOnClick("grayscale")}
              style={{ marginRight: 10, marginLeft: 10, borderRadius: 4 }}
            >
              Grayscale
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.filterOnClick("sunset")}
              style={{ marginLeft: 20, borderRadius: 4 }}
            >
              Warm
            </Button>
          </ButtonGroup>
          <div style={{ marginBottom: 20 }} />
          <ButtonGroup
            fullWidth
            color="primary"
            aria-label="contained primary button group"
          >
            <Button
              variant="contained"
              color="primary"
              onClick={this.filterOnClick("cool")}
              style={{ marginRight: 20, borderRadius: 4 }}
            >
              Cool
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.filterOnClick("cartoon")}
              style={{ marginRight: 10, marginLeft: 10, borderRadius: 4 }}
            >
              Cartoon
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.filterOnClick("random")}
              style={{ marginLeft: 20, borderRadius: 4 }}
            >
              I'm Feeling Lucky
            </Button>
          </ButtonGroup>
        </div>
        <NoImageSnackbar
          open={this.state.isSnackbarOpened}
          handleClose={this.snackbarHandleClose}
        />
      </div>
    );
  }
}

export default App;
