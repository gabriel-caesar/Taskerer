import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';

export default function App() {
  const [userData, setUserData] = useState([]);
  const [selected, setSelected] = useState(false);

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
    <Navbar
      userData={userData}
      setUserData={setUserData}
      selected={selected}
      setSelected={setSelected}
    />
  );
}
