import AppRoutes from './js/routes/AppRoutes';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from "react-router-dom";
import { socket } from '../src/js/Ultils/Socket/Socket';

function App() {
  useEffect(() => {

  })

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect()
    };
  }, []);
  return (
    <>
      <Router>
        <div className='app-container'>
          <AppRoutes />
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
      </Router>
    </>
  );
}

export default App;
