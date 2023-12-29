import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { baseUrl } from "./App";

const maxNumberOfPoints = numberOfOptions => Math.floor(numberOfOptions/2);

function SurveyForm() {
  const [numberOfOptions, setNumberOfOptions] = useState(0);
  const [choices, setChoices] = useState([]);
  const {surveyId} = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${baseUrl}numberoptions?surveyId=${surveyId}`, {
      method: 'get',
      headers: {'Content-Type':'application/json'},
     }).then(response => response.json()).then(({numberOptions}) => {
      if(typeof(numberOptions) === "number") setNumberOfOptions(numberOptions);
      setChoices(new Array(Math.floor(numberOptions/2)).fill(''));
     });
  },[]);
  
  const possibleValues = useMemo(() => {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').slice(0, numberOfOptions);
  },[numberOfOptions]);
  

  const handleSubmit = (event) => { 
    event.preventDefault();
    fetch(baseUrl + 'vote', {
     method: 'post',
     headers: {'Content-Type':'application/json'},
     body: JSON.stringify({surveyId , vote: createDict(choices)})
    });
    navigate("/done");
   };

  const createDict = (arr) => {
    return arr.reduce((acc, currentValue, index) => {
      if (charIsLetter(currentValue)) {
        return {...acc, [currentValue.toUpperCase()]: arr.length - index};
      } else return acc;
    }, {});
  } 

  function charIsLetter(char) {
    if (typeof char !== 'string') {
      return false;
    }
    return /^[a-zA-Z]+$/.test(char);
  }

  return <div id="surveyForm" className="white-rounded-corners">
    <form onSubmit={handleSubmit}>
    {Array.from({length: maxNumberOfPoints(numberOfOptions)},(_, index) => index).map((lineNumber) => {
      return <div key={lineNumber}>
        <Form.Select onChange={e => {
          setChoices(choices.map((el, index) => {
            if (index === lineNumber) {
              return e.currentTarget.value;
            } else {
              return el;
            }
          }))
          }}>
          <option value="" disabled selected>{"Choice " + (lineNumber + 1).toString()}</option>
          {possibleValues.map(value => <option value={value} disabled={choices.includes(value)}>{value}</option>)}
        </Form.Select>
        <br/>   
      </div>;
    })}
       <Button type="Submit">Submit</Button>
    </form>
  </div>;
}

export default SurveyForm;
