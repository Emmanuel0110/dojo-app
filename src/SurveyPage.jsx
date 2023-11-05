import { useState } from "react";
import QRCode from "react-qr-code";
import { baseUrl } from "./App";

function SurveyPage() {
  const [numberOfOptions, setNumberOfOptions] = useState("");
  const [surveyId, setSurveyId] = useState("");
  const [results, setResults] = useState({});

  const generateQRcode = () => {
    fetch(baseUrl + 'generate-qr-code', {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({numberOptions: parseInt(numberOfOptions)})
    }).then(response => response.text())
    .then((id) => typeof(id) === "string" && setSurveyId(id))
  };

  const seeResults = () => {
    fetch(baseUrl + 'results?surveyId=' + surveyId, {
      method: 'get',
      headers: {'Content-Type':'application/json'},
    }).then(response => response.json()).then((results) => results && setResults(results));
  };

  return <div id="surveyPage">
    <input onChange={e => setNumberOfOptions(e.currentTarget.value)} placeholder="Number of options" type="number"/>
    <button onClick={generateQRcode}>Generate QR code</button>
    <button onClick={seeResults}>See results</button>
    {surveyId !== "" && <div id="qrCode"><QRCode value={window.location.href + (window.location.href.endsWith("/") ? "" : "/") + surveyId} /></div>}
    {surveyId !== "" &&  process.env.NODE_ENV === 'development' && window.location.href + (window.location.href.endsWith("/") ? "" : "/") + surveyId}
    <div>{typeof(results.numberVotes) === "number" && "Number of votes : " + results.numberVotes}</div>
    <br/>
    <div>{results.votes && Object.entries(results.votes)
     .sort((a,b) => b[1] - a[1])
     .map((entry, index) => <div key={index}>{entry[0] + " : " + entry[1]}</div>)
    }</div>
  </div>;
}

export default SurveyPage;