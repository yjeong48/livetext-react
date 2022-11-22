import axios from "axios";
import React, { Component } from "react";
import PropagateLoader from "react-spinners/PropagateLoader";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

class App extends Component {
  allowedFileTypes = "image/png, image/jpg, image/jpeg";

  state = {
    selectedFile: null,
    targetLang: "",
    translatedText: "",
    isLoading: false,
    preview: null,
    crop: {
      unit: "%",
      width: 0,
      height: 0,
    },
  };

  onLanguageChange = (event) => {
    console.log(event.target.value);
    this.setState({ targetLang: event.target.value });
  };

  onFileChange = (event) => {
    this.setState({
      crop: {
        unit: "%",
        width: 0,
        height: 0,
      },
    });
    this.setState({ translatedText: "" });

    if (event.target.files && event.target.files.length > 0) {
      const initialImage = event.target.files[0];
      this.setState({ selectedFile: initialImage });
      const imageReader = new FileReader();
      imageReader.readAsDataURL(initialImage);
      imageReader.addEventListener("load", () =>
        this.setState({ preview: imageReader.result })
      );
    }
  };

  onImageLoaded = (image) => {
    this.imageRef = image;
  };

  onCropComplete = (crop) => {
    this.userCrop(crop);
  };

  onCropChange = (crop) => {
    this.setState({ crop });
  };

  async userCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        this.state.selectedFile.name
      );
    }
  }

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement("canvas");
    const pixelRatio = window.devicePixelRatio;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
        const newImage = new File([blob], blob.name, { type: blob.type });
        this.setState({ selectedFile: newImage });
        console.log(this.state.selectedFile);
      });
    });
  }

  onFileUpload = () => {
    this.setState({ translatedText: "" });
    this.setState({ isLoading: true });
    const formData = new FormData();

    formData.append(
      "file",
      this.state.selectedFile,
      this.state.selectedFile.name
    );

    formData.append("targetLang", this.state.targetLang);

    // details of the uploaded file
    console.log(this.state.selectedFile);

    axios
      .post("https://livetext-flask.herokuapp.com/translate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        this.setState({ isLoading: false });
        this.setState({ translatedText: response.data });
      })
      .catch((error) => {
        if (error.response) {
          // server responded with status code
          this.setState({ isLoading: false });
          this.setState({ translatedText: "Something went wrong :(" });
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // request was made but no response was received
          this.setState({ isLoading: false });
          this.setState({ translatedText: "Something went wrong :(" });
          console.log(error.request);
        } else {
          // error in request made
          this.setState({ isLoading: false });
          this.setState({ translatedText: "Something went wrong :(" });
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
  };

  render() {
    return (
      <div style={{ textAlign: "center" }}>
        <h1>- OCR Cloud-Based Machine Learning Project -</h1>
        <h3>Translate text from any image to Korean</h3>
        <div>
          <label for="language">Translate to: </label>
          <select
            select
            type=""
            value={this.state.targetLang}
            onChange={this.onLanguageChange}
          >
            <option value="en">English</option>
            <option value="zh-Hans">Chinese</option>
            <option value="da">Danish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="el">Greek</option>
            <option value="it">Italian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="pt">Portuguese</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        <p></p>
        <div>
          <input
            type="file"
            accept={this.allowedFileTypes}
            onChange={this.onFileChange}
          />
          <button onClick={this.onFileUpload} disabled={this.state.isLoading}>
            Translate!
          </button>
        </div>
        <p></p>
        <ReactCrop
          src={this.state.preview}
          crop={this.state.crop}
          onImageLoaded={this.onImageLoaded}
          onComplete={this.onCropComplete}
          onChange={this.onCropChange}
          crossorigin={null}
        />
        <div>
          <p>Translated text: </p>
          <PropagateLoader loading={this.state.isLoading} color="#36d7b7" />
          <p>{this.state.translatedText}</p>
        </div>
      </div>
    );
  }
}

export default App;
