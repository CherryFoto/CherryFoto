import React, { Component } from "react";
import UploadPhotoDialog from "./UploadPhotoDialog";
import placeholderImg from "./placeholder.png"
import "./App.css";
import { AppBar, Toolbar, Typography, Button, ButtonGroup, Card, CardMedia } from "@material-ui/core";
import axios from "axios";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      image: placeholderImg,
      lastUploadedFilename: ""
    };
  }

  updateFilesState = files => {
    this.setState({ 
      files: files,  
      image: window.URL.createObjectURL(files[0])
    });
  }

  updateLastUploadedFilename = filename => {
    this.setState({ lastUploadedFilename: filename })
  }

  filterOnClick = filter => () => {
    if (this.state.lastUploadedFilename === "") {
      return;
    }
    
    axios.get('http://localhost:3001/filterImageLink', {
        params: {
          filename: this.state.lastUploadedFilename,
          filter: filter
        }
      })
      .then(res => {
        this.setState({
          image: `http://localhost:3001/filteredImage?filename=${res.data}`
        })
      })
  }

  render() {
    return (
      <div>
        <AppBar position="static" className={"appBar"}>
          <Toolbar>
            <Typography variant="h5" style={{ flexGrow: 1 }}>
              <span role="img" aria-label="cherry">🍒</span>
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
          <CardMedia
            component="img"
            image={this.state.image}
          />
        </Card>
        </div>
        <div className={"filterButtonsRow"}>
          <ButtonGroup fullWidth variant="contained" color="primary" aria-label="contained primary button group">
            <Button variant="contained" color="primary" onClick={this.filterOnClick("invert")}>Invert</Button>
            <Button variant="contained" color="primary" onClick={this.filterOnClick("grayscale")}>Grayscale</Button>
            <Button variant="contained" color="primary" onClick={this.filterOnClick("sunset")}>Warm</Button>
            <Button variant="contained" color="primary" onClick={this.filterOnClick("cool")}>Cool</Button>
            <Button variant="contained" color="primary" onClick={this.filterOnClick("modulo")}>Modulo</Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}

export default App;
