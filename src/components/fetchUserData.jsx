import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';

export async function fetchUserData(setter) {
  try {
    // fetching the users data from database
    const querySnapshot = await getDocs(collection(db, 'users'));
    // actual user data in object structures extracted from (docs) array
    const users = querySnapshot.docs.map(doc => doc.data()); // (.data()) is used to 'open up' the user data
    setter(users);
  } catch (error) {
    throw new Error(`User data fetch failure. ${error.message}`)
  }
}