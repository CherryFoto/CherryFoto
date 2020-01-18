import React, { Component } from "react";
import UploadPhotoDialog from "./UploadPhotoDialog";
import placeholderImg from "./placeholder.png"
import "./App.css";
import { AppBar, Toolbar, Typography, Button, ButtonGroup, Card, CardMedia } from "@material-ui/core";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      image: placeholderImg
    };
  }

  updateFilesState = files => {
    this.setState({ 
      files: files,  
      image: window.URL.createObjectURL(files[0])
    });
  }

  render() {
    return (
      <div>
        <AppBar position="static" className={"appBar"}>
          <Toolbar>
            <Typography variant="h5" style={{ flexGrow: 1 }}>
              🍒 CherryFoto
            </Typography>
            <UploadPhotoDialog files={this.state.files} updateFilesState={this.updateFilesState}/>
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
            <Button variant="contained" color="primary">Invert</Button>
            <Button variant="contained" color="primary">Grayscale</Button>
            <Button variant="contained" color="primary">Warm</Button>
            <Button variant="contained" color="primary">Cool</Button>
            <Button variant="contained" color="primary">Modulo</Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}

export default App;
