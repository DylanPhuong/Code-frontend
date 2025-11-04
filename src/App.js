// import AppRoutes from './js/routes/AppRoutes';
// import { useEffect } from 'react';
// import { ToastContainer, Bounce } from '../src/js/ImportComponents/Imports';
// import { BrowserRouter as Router } from "react-router-dom";
// import { socket } from '../src/js/Ultils/Socket/Socket';

// function App() {
//   useEffect(() => {

//   })

//   useEffect(() => {
//     socket.connect();
//     return () => {
//       socket.disconnect()
//     };
//   }, []);
//   return (
//     <>
//       <Router>
//         <div className='app-container'>
//           <AppRoutes />
//         </div>

//         <ToastContainer
//           position="top-center"
//           autoClose={3000}
//           hideProgressBar
//           newestOnTop
//           closeOnClick={false}
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="colored"
//           transition={Bounce}
//         />

//       </Router>
//     </>
//   );
// }

// export default App;

// src/App.js
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, Bounce } from './js/ImportComponents/Imports';
import { socket } from './js/Ultils/Socket/Socket';
import DashboardLayout from './js/Layout/DashboardLayout';

function App() {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect()
    };
  }, []);

  return (
    <>
      <Router>
        <Routes>
          {/* Tất cả routes đều render DashboardLayout */}
          <Route path="/*" element={<DashboardLayout />} />
        </Routes>
      </Router>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </>
  );
}

export default App;