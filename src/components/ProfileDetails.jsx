import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebase';
import { fetchUserData } from './fetchUserData';

export default function ProfileDetails({ setCurrentUser, currentUser, userData, setUserData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [usernameVal, setUsernameVal] = useState(currentUser.username || 'Empty');
  const [mobilePhone, setMobilePhone] = useState(currentUser.phoneNumber || 'Empty');
  const [profilePhoto, setProfilePhoto] = useState(''); // I don't want to set up a billing account :/

  async function updateTheCurrentUser() {
    await fetchUserData(setUserData); // even though I am updating userData here, this update doesn't get immediatly reflected in this function

    setUserData((prevData) => { // so I have to call setUserData again to work with the most up to date userData
      const user = prevData.find((user) => user.email === currentUser.email);
      setCurrentUser(user);
      localStorage.clear(); 
      localStorage.setItem('current-user', JSON.stringify(user));
      return prevData; // Preserve state
  });
  }

  async function updateUserData() {
    try {
      setIsEditing(!isEditing);
      const userRef = doc(db, 'users', currentUser.uid); // getting the database reference
      await updateDoc(userRef, { // updating the desired user data
        username: usernameVal,
        phoneNumber: mobilePhone,
        profilePhoto: profilePhoto
      });

      await updateTheCurrentUser();
      
    } catch (error) {
      throw new Error (`Couldn't update user data. ${error.message}`);
    }
  }
  
  
  function handleUsernameVal(e) {
    setUsernameVal(e.target.value);
  }
  function handleMobilePhone(e) {
    setMobilePhone(e.target.value);
  }
  function handleProfilePhoto(e) {
    const file = e.target.files[0]; // gets the file that user selected
    if (file) setProfilePhoto(URL.createObjectURL(file)); // creates an URL that points to the file
  }


  return (
    <>
      <form className='bg-blue-200 border-2 border-blue-300 border-solid p-2 flex flex-col'>
        <h3 className='text-center font-bold text-lg text-gray-800 underline mb-2'>Profile Details</h3>
        <label htmlFor='username' className={`flex ${isEditing ? 'flex-col' : 'flex-row'}`}>
          Username:
          {isEditing ? (
            <input
              className='text-sm rounded-sm bg-blue-50 shadow-sm p-1 px-2 mb-2'
              type='text'
              value={usernameVal}
              onChange={(e) => handleUsernameVal(e)}
            />
          ) : (
            <p className='text-blue-600 ml-2 truncate'>{usernameVal}</p>
          )}
        </label>
        <label htmlFor='username' className={`flex ${isEditing ? 'flex-col' : 'flex-row'}`}>
          Phone Number:
          
          {isEditing ? (
            <input
              className='text-sm rounded-sm bg-blue-50 shadow-sm p-1 px-2 mb-2'
              type='number'
              value={mobilePhone}
              onChange={(e) => handleMobilePhone(e)}
            />
          ) : (
            <p className='text-blue-600 ml-2 truncate'>{mobilePhone}</p>
          )}
        </label>
        <label htmlFor='username' className={`flex ${isEditing ? 'flex-col' : 'flex-row'}`}>
          Profile Photo:
          
          {isEditing ? (
            <input
              className='text-sm rounded-sm file:bg-blue-50 bg-blue-300 file:px-2 shadow-sm hover:opacity-75 transition-opacity hover:cursor-pointer mb-8 '
              type='file'
              onChange={(e) => handleProfilePhoto(e)}
            />
          ) : (
            <p className='text-blue-600 ml-2 mb-4 truncate'>{profilePhoto ? 'Active Photo' : 'No Photo'}</p>
          )}
        </label>
        <button
          className='flex justify-center items-center rounded-sm text-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-400 hover:text-black hover:cursor-pointer transition-colors'
          onClick={() => updateUserData()}
          type='button'
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </form>
    </>
  );
}
