import { useState } from "react";
import QRCode from "react-qr-code";

export const baseUrl = "http://localhost:3000/survey-dojo";

function SurveyPage() {
  const [numberOfOptions, setNumberOfOptions] = useState("");
  const [surveyId, setSurveyId] = useState("");
  const [results, setResults] = useState({});

  const generateQRcode = () => {
    fetch('/generate-qr-code', {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({numberOptions: parseInt(numberOfOptions)})
    }).then(response => response.text())
    .then((id) => typeof(id) === "string" && setSurveyId(id))
  };

  const seeResults = () => {
    fetch('/results?surveyId=' + surveyId, {
      method: 'get',
      headers: {'Content-Type':'application/json'},
    }).then(response => response.json()).then((results) => results && setResults(results));
  };

  return <div id="surveyPage">
    <input onChange={e => setNumberOfOptions(e.currentTarget.value)} placeholder="Number of options" type="number"/>
    <button onClick={generateQRcode}>Generate QR code</button>
    <button onClick={seeResults}>See results</button>
    {surveyId !== "" && <div id="qrCode"><QRCode value={baseUrl + "/" + surveyId} /></div>}
    {surveyId !== "" &&  process.env.NODE_ENV === 'development' && baseUrl + "/" + surveyId}
    <div>{typeof(results.numberVotes) === "number" && "Number of votes : " + results.numberVotes}</div>
    <br/>
    <div>{results.votes && Object.entries(results.votes)
     .sort((a,b) => b[1] - a[1])
     .map(entry => <div>{entry[0] + " : " + entry[1]}</div>)
    }</div>
  </div>;
}

export default SurveyPage;