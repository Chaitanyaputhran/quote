import { useState } from "react";
import "./App.css";
import QuoteManager from "./QuoteManager";
import UploadQuote from "./UploadQuote"; // Import UploadQuote

function App() {
  const [screen, setScreen] = useState("home");

  const renderScreen = () => {
    switch (screen) {
      case "quote":
        return (
          <div>
            <h1>Quote</h1>
            <button onClick={() => setScreen("quote-generate")}>Generate Quote</button>
            <button onClick={() => setScreen("quote-view")}>View Quote</button>
          </div>
        );
      case "quote-generate":
        return <QuoteManager />;
      case "quote-view":
        return <UploadQuote />; // Navigate to UploadQuote when "View Quote" is clicked
      case "bill":
        return (
          <div>
            <h1>Bill</h1>
            <button onClick={() => setScreen("bill-view")}>View Bill</button>
          </div>
        );
      case "bill-view":
        return <h1>View Bill - Dummy Text</h1>;
      case "expense":
        return <h1>View Expense - Dummy Text</h1>;
      default:
        return (
          <div>
            <h1>Welcome</h1>
            <button onClick={() => setScreen("quote")}>Quote</button>
            <button onClick={() => setScreen("bill")}>Bill</button>
            <button onClick={() => setScreen("expense")}>Expense</button>
          </div>
        );
    }
  };

  return (
    <div className="container">
      {renderScreen()}
      <div className="back-container">
        <button className="back-button" onClick={() => setScreen("home")}>
          Back
        </button>
      </div>
    </div>
  );
}

export default App;
