import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { baseUrl } from "./App";

function SurveyPage() {
  const [numberOfOptions, setNumberOfOptions] = useState("");
  const [surveyId, setSurveyId] = useState("");
  const [results, setResults] = useState({numberVotes: 0, votes:{}});
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [listOfOptions, setListOfOptions] = useState("");

  // TODO : try SSE
  // useEffect(() => {
  //   const sse = new EventSource(baseUrl + 'events');
  //   function getRealtimeData(numberVotes) {
  //     setResults(results => ({...results, numberVotes}));
  //   }
  //   sse.onmessage = e => getRealtimeData(JSON.parse(e.data));
  //   sse.onerror = e => {
  //     console.log(e);
  //     sse.close();
  //   }
  //   return () => {
  //     sse.close();
  //   };
  // }, []);

  // const updateState = useCallback(async () => {
  //   const response = await fetch(baseUrl + 'events?surveyId=' + surveyId);
  //   const numberVotes = await response.json();
  //   setResults(results => ({...results, numberVotes}));
  // }, []);
  useEffect(() => {
    let myInterval;
    if (qrCodeVisible) {
      myInterval = setInterval(async () => {
        const response = await fetch(baseUrl + "events?surveyId=" + surveyId);
        const { numberVotes } = await response.json();
        setResults((results) => ({ ...results, numberVotes }));
      }, 2000);
    } else {
      clearInterval(myInterval);
    }
  }, [qrCodeVisible, surveyId]);

  const generateQRcode = () => {
    if (parseInt(numberOfOptions) >= 2) {
      fetch(baseUrl + "generate-qr-code", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numberOptions: parseInt(numberOfOptions) }),
      })
        .then((response) => response.text())
        .then((id) => {
          if (typeof id === "string") {
            setSurveyId(id);
            setQrCodeVisible(true);
          }
        });
    }
  };

  const seeResultsOrQrCode = () => {
    setQrCodeVisible((qrCodeVisible) => !qrCodeVisible);
    fetch(baseUrl + "results?surveyId=" + surveyId, {
      method: "get",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((results) => {
        if (results) {
          setResults(results);
          setListOfOptions((listOfOptions) =>
            listOfOptions.replace(/\s\d+\s-\s([A-Z])\s/g, (match, group) => ` ${results.votes[group] || 0} - ${group} `)
          );
        }
      });
  };

  const updateNumberOfOption = (e) => {
    setNumberOfOptions(e.currentTarget.value.trim().split("\n").filter(line => line.trim() !== "").length.toString());
    setListOfOptions(e.currentTarget.value);
  };

  return (
    <div id="surveyPage">
      <div id="subjectList" className="white-rounded-corners">
        <textarea
          name="textarea"
          onChange={updateNumberOfOption}
          placeholder="Copy the vote options here..."
          value={listOfOptions}
        ></textarea>
      </div>
      <div id="qrCodeArea" className="white-rounded-corners">
        {surveyId === "" ? (
          <div>
            <Form.Control
              onChange={(e) => setNumberOfOptions(e.currentTarget.value)}
              placeholder="Number of options"
              type="number"
              value={numberOfOptions}
            />
            <br />
            <Button variant="primary" onClick={generateQRcode}>
              Generate QR code
            </Button>
          </div>
        ) : (
          <div>
            <div id="qrCode">
              <QRCode
                style={{ width: "100%", height: qrCodeVisible ? "100%" : 0 }}
                value={window.location.href + (window.location.href.endsWith("/") ? "" : "/") + surveyId}
              />
            </div>
            <br />
            {process.env.NODE_ENV === "development" &&
              window.location.href + (window.location.href.endsWith("/") ? "" : "/") + surveyId}
            <Button variant="primary" onClick={seeResultsOrQrCode}>
              {qrCodeVisible ? "See results" : "See QR-code"}
            </Button>
          </div>
        )}
        {typeof results.numberVotes === "number" && results.numberVotes !== 0 && (
          <div>
            <br />
            <div>{"Number of votes : " + results.numberVotes}</div>
            <br />
          </div>
        )}
        <div>
          <table>
            {!qrCodeVisible &&
              Object.entries(results.votes).map((entry, index) => (
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
      <div id="githubIconArea">
        <a href="https://github.com/Emmanuel0110/dojo-app">
          <div className="githubIcon"></div>
        </a>
      </div>
    </div>
  );
}

export default SurveyPage;
