import React, { useState, useEffect } from "react";

const CarHealth = () => {
  const [engineHealth, setEngineHealth] = useState("Good");
  const [batteryHealth, setBatteryHealth] = useState(85); 
  const [tirePressure, setTirePressure] = useState({
    frontLeft: 32,
    frontRight: 31,
    rearLeft: 30,
    rearRight: 30,
  });
  const [fluidLevels, setFluidLevels] = useState({
    oil: 75, 
    coolant: 85,
    brakeFluid: 60,
  });
  const [diagnosticStatus, setDiagnosticStatus] = useState("No issues detected");

  useEffect(() => {
    
    setTimeout(() => {
      setEngineHealth("Warning");
      setBatteryHealth(20);
      setTirePressure({ frontLeft: 30, frontRight: 30, rearLeft: 28, rearRight: 28 });
      setFluidLevels({ oil: 40, coolant: 80, brakeFluid: 55 });
      setDiagnosticStatus("Check engine light on");
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 overflow-y-auto">
        
      <h1 className="text-3xl font-bold text-gray-700 mb-4">Car Health Dashboard</h1>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-4 mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Engine Health</h2>
        <div className={`flex items-center text-xl font-semibold ${engineHealth === "Good" ? "text-green-500" : engineHealth === "Warning" ? "text-orange-500" : "text-red-500"}`}>
          <span className="mr-4">
            {engineHealth === "Good" && "👍"}
            {engineHealth === "Warning" && "⚠️"}
            {engineHealth === "Critical" && "❗"}
          </span>
          <p>{engineHealth}</p>
        </div>
      </div>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-4 mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Battery Health</h2>
        <div className="flex items-center">
          <div className="w-full h-5 bg-gray-200 rounded-full">
            <div
              className="h-full rounded-full"
              style={{
                width: `${batteryHealth}%`,
                backgroundColor: batteryHealth < 20 ? "#EF4444" : "#10B981",
              }}
            />
          </div>
          <p className="ml-4 text-xl">{batteryHealth}%</p>
        </div>
      </div>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-4 mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tire Pressure</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(tirePressure).map((key) => (
            <div key={key} className="p-4 border rounded-lg text-center">
              <p className="text-lg font-semibold">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="text-xl">{tirePressure[key]} psi</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-4 mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Fluid Levels</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.keys(fluidLevels).map((key) => (
            <div key={key} className="p-4 border rounded-lg text-center">
              <p className="text-lg font-semibold">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
              <p className="text-xl">{fluidLevels[key]}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-4 mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">General Diagnostic</h2>
        <div className="p-4 bg-yellow-100 border-yellow-400 border rounded-lg text-yellow-700">
          <p>{diagnosticStatus}</p>
        </div>
      </div>
    </div>
  );
};

export default CarHealth;
