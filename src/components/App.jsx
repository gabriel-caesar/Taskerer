import { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from './Navbar';
import RightPanel from './RightPanel';

export default function App() {
  const [userData, setUserData] = useState([]);
  // getting the selected task from localStorage as initial value
  const [currentSelectedTask, setCurrentSelectedTask] = useState(
    JSON.parse(localStorage.getItem('current-user')).tasks.find(task => task.selected) || ''
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // fetching the users data from database
        const querySnapshot = await getDocs(collection(db, 'users'));
        // actual user data in object structures extracted from (docs) array
        const users = querySnapshot.docs.map((doc) => doc.data()); // (.data()) is used to 'open up' the user data
        setUserData(users);
        console.log(users);
      } catch {
        throw new Error(`User data fetch failure.`);
      }
    };

    fetchUserData();
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
