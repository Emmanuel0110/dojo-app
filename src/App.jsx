
import { Route, Routes } from 'react-router-dom';
import './App.css';
import SurveyForm from './SurveyForm';
import SurveyPage from './SurveyPage';
import Done from './Done';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/done" element={<Done />} />
        <Route path="/:surveyId" element={<SurveyForm />} />
        <Route path="/" element={<SurveyPage/>} />
        <Route path="*" element={<p>There's nothing here: 404!</p>} />
      </Routes>
    </div>
  );
}

export default App;
