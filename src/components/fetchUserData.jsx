import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';

export async function fetchUserData() {
  try {
    // fetching the users data from database
    const querySnapshot = await getDocs(collection(db, 'users'));
    // array of users extracted from *getDocs()*
    const users = querySnapshot.docs.map(doc => doc.data()); // (.data()) is used to 'open up' the user data
    // returning the object for the reducer payload
    return users
  } catch (error) {
    throw new Error(`User data fetch failure. ${error.message}`)
  }
}