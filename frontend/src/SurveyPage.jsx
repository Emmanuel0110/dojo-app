import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import QRCode from "react-qr-code";
import { baseUrl } from "./App";

function SurveyPage() {
  const [numberOfOptions, setNumberOfOptions] = useState("");
  const [surveyId, setSurveyId] = useState("");
  const [results, setResults] = useState({});
  const [qrCodeVisible, setQrCodeVisible] = useState(true);

  const generateQRcode = () => {
    if (parseInt(numberOfOptions) >= 2) {
      fetch(baseUrl + "generate-qr-code", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numberOptions: parseInt(numberOfOptions) }),
      })
        .then((response) => response.text())
        .then((id) => typeof id === "string" && setSurveyId(id));
    }
  };

  const seeResultsOrQrCode = () => {
    setQrCodeVisible(qrCodeVisible => !qrCodeVisible);
    fetch(baseUrl + "results?surveyId=" + surveyId, {
      method: "get",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((results) => results && setResults(results));
  };

  return (
    <div id="surveyPage">
      <div id="subjectList" className="white-rounded-corners">
      <textarea name="textarea" placeholder="Copy the vote options here..."></textarea>
      </div>
      <div id="qrCodeArea" className="white-rounded-corners">
        {surveyId === "" ? (
          <div>
            <Form.Control
              onChange={(e) => setNumberOfOptions(e.currentTarget.value)}
              placeholder="Number of options"
              type="number"
            />
            <br />
            <Button variant="primary" onClick={generateQRcode}>
              Generate QR code
            </Button>
          </div>
        ) : (
          <div>
            <div id="qrCode">
              <QRCode style={{width: "100%", height: qrCodeVisible ? "100%": 0}} value={window.location.href + (window.location.href.endsWith("/") ? "" : "/") + surveyId} />
            </div>
            <br />
            {process.env.NODE_ENV === "development" &&
              window.location.href + (window.location.href.endsWith("/") ? "" : "/") + surveyId}
            <Button variant="primary" onClick={seeResultsOrQrCode}>
              {qrCodeVisible ? "See results" : "See QR-code"}
            </Button>
          </div>
        )}
        {typeof results.numberVotes === "number" && <div>
          <br/>
            <div>{"Number of votes : " + results.numberVotes}</div>
          <br/>
        </div>}
        <div>
          <table>
            {results.votes &&
              Object.entries(results.votes)
                .map((entry, index) => (
                  <tr key={index}>
                    <td style={{ width: "20px" }}>{entry[0]}</td>
                    <td>
                      <div
                        style={{
                          backgroundColor: "grey",
                          width: `${entry[1] * (200 / Math.max(...Object.values(results.votes)))}px`,
                          height: "30px",
                          color: "white",
                        }}
                      >
                        {entry[1]}
                      </div>
                    </td>
                  </tr>
                ))}
          </table>
        </div>
      </div>
    </div>
  );
}

export default SurveyPage;
