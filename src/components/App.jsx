import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import RightPanel from './RightPanel';
import { fetchUserData } from './fetchUserData';

export default function App() {
  const [userData, setUserData] = useState([]);
  // getting the selected task from localStorage as initial value
  const [currentSelectedTask, setCurrentSelectedTask] = useState(
    JSON.parse(localStorage.getItem('current-user')).tasks.find(task => task.selected)
  );

  useEffect(() => {
    fetchUserData(setUserData);
  }, []);

  return (
    <main className='flex h-screen'>
      <Navbar
        userData={userData}
        setUserData={setUserData}
        currentSelectedTask={currentSelectedTask}
        setCurrentSelectedTask={setCurrentSelectedTask}
      />
      <RightPanel
        userData={userData}
        setUserData={setUserData}
        currentSelectedTask={currentSelectedTask}
        setCurrentSelectedTask={setCurrentSelectedTask}
      />
    </main>
  );
}
