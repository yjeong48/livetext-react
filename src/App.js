import axios from 'axios';
import React,{Component} from 'react';

class App extends Component {
	state = {
	// Initially, no file is selected
	selectedFile: null,
	target_lang: ""
	};

	// After choosing target language
	onLanguageChange = event => {
		console.log(event.target.value)
		this.setState({ target_lang: event.target.value});
		};

	// After selecting file from pop up
	onFileChange = event => {
	this.setState({ selectedFile: event.target.files[0] });	
	};
	
	// After clicking the translate button
	onFileUpload = () => {
	
	const formData = new FormData();
	formData.append(
		"file",
		this.state.selectedFile,
		this.state.selectedFile.name
	);

	formData.append(
		"target_lang",
		this.state.target_lang
	)
	
	// Details of the uploaded file
	console.log(this.state.selectedFile);
	
	// Request made to the backend api
	axios.post("https://livetext-flask.herokuapp.com/translate", formData, {
		headers: {
		  "Content-Type": "multipart/form-data",
		},
	  })
	.then(response => this.setState({ translated_text: response.data}))
	.catch(function (error) {
		console.log(error)
	})
	}
	
	//Display translated text
	translated = () => {
		return (
			<div>
				<p>Translated text: </p>
				<p>{this.state.translated_text}</p>
			</div>
		)
	}
	
	render() {
	return (
		<div style={{textAlign:"center"}}>
			<h1>
			- OCR Cloud-Based Machine Learning Project -
			</h1>
			<h3>
			Translate text from any image to Korean
			</h3>
			<div>
				<label for="language">Translate to:</label>
				<select select type="" value={this.state.target_lang} onChange={this.onLanguageChange}>
					<option value="en">English</option>
					<option value="ko">Korean</option>
					<option value="el">Greek</option>
					<option value="fr">French</option>
					<option value="it">Italian</option>
					<option value="de">German</option>
					<option value="ja">Japanese</option>
				</select>
            </div>
			<p></p>
			<div>
				<input type="file" onChange={this.onFileChange} />
				<button onClick={this.onFileUpload}>
				Translate!
				</button>
			</div>
		{this.translated()}
		</div>
	);
	}
}

export default App;


