// In frontend/src/App.jsx
// import { Loader } from "@react-three/drei";
// import { Leva } from "leva";
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext'; // 👈 Must be imported
// import Screen from "./components/HomeScreen/Screen"
// import LoginPage from './pages/LoginPage';
// import SignupPage from './pages/SignupPage';

// // This component protects your chat page
// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useAuth();
  
//   if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background: '#28282B', color: 'white'}}>Loading authentication...</div>; 
  
//   // If the user is not logged in, redirect them to the /login page
//   return user ? children : <Navigate to="/login" />;
// };


// function App() {
//   // Use useAuth to get the current user status for redirection logic
//   const { user } = useAuth(); 
  
//   return (
//     <BrowserRouter>
//       <Loader />
//       <Leva hidden/>
//       <Routes>
//         {/* Placeholder: You must create the actual LoginPage and SignupPage components */}
//         <Route path="/login" element={user ? <Navigate to="/" /> : <div>Login Page Placeholder</div>} /> 
//         <Route path="/signup" element={user ? <Navigate to="/" /> : <div>Signup Page Placeholder</div>} />
        
//         {/* The main Screen (your 3D chat) is protected */}
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               {/* Screen.jsx will now render the Canvas, Experience, and UI */}
//               <Screen /> 
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;






// src/App.jsx (FINAL CORRECTED VERSION)

// Removed unused imports from old App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Screen from "./components/HomeScreen/Screen"
import LoginPage from './pages/LoginPage'; // 👈 ACTUAL PAGE
import SignupPage from './pages/SignupPage'; // 👈 ACTUAL PAGE
import {Leva} from "leva";

// Component to wrap routes that require a logged-in user
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background: '#28282B', color: 'white'}}>Loading authentication...</div>; 
  
  // If the user is not logged in, redirect them to the /login page
  return user ? children : <Navigate to="/login" />;
};


function App() {
  const { user } = useAuth(); 
  
  return (
    <BrowserRouter>
      {/* Leva and Loader are kept, but should be outside Routes if they cover the whole screen */}
      {/* <Loader /> */} 
      {/* <Leva hidden/> */}
      
      <Routes>
        <Route 
          path="/login" 
          // If logged in, redirect to home. Otherwise, show login page.
          element={user ? <Navigate to="/" /> : <LoginPage />} 
        /> 
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/" /> : <SignupPage />} 
        />
        
        {/* The main Screen (your 3D chat) is protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {/* Screen.jsx now contains the Canvas and UI components */}
              <Screen /> 
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

