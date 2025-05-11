import { doc, updateDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { db } from '../firebase';
import { userContext } from './App';

export default function ProfileDetails() {
  // reading context from App.jsx file
  const {
    currentUserLoggedIn,
    dispatchCurrentUser,
    dispatchUserData
  } = useContext(userContext);

  const [isEditing, setIsEditing] = useState(false);
  const [usernameVal, setUsernameVal] = useState(currentUserLoggedIn.username);
  const [mobilePhone, setMobilePhone] = useState(
    currentUserLoggedIn.phoneNumber || 'Empty'
  );

  async function updateUserData() {
    try {
      setIsEditing(!isEditing);

      const updatedDetails = { username: usernameVal, phoneNumber: mobilePhone };

      const currentUser = { // creating a reference for an updated currentUserLoggedIn version
        ...currentUserLoggedIn,
        ...updatedDetails
      }

      // updating currentUserLoggedIn
      dispatchCurrentUser({
        type: 'set_current_user',
        payload: {
          user: currentUser
        }
      })

      const userRef = doc(db, 'users', currentUserLoggedIn.uid); // getting the database reference
      await updateDoc(userRef, { ...updatedDetails }); // updating the firebase

      // updating userData
      dispatchUserData({
        type: 'update_profile_details',
        payload: {
          username: usernameVal,
          phoneNumber: mobilePhone
        }
      })

    } catch (error) {
      throw new Error(`Couldn't update user data. ${error.message}`);
    }
  }

  function handleUsernameVal(e) {
    if (e.target.value.length <= 11) setUsernameVal(e.target.value);
  }

  function handleMobilePhone(e) {
    if (e.target.value.length <= 10) setMobilePhone(e.target.value);
  }

  return (
    <>
      <form className='bg-blue-200 border-2 border-blue-300 border-solid p-2 flex flex-col'>
        <h3 className='text-center font-bold text-lg text-gray-800 underline mb-2'>
          Profile Details
        </h3>
        <label
          htmlFor='username'
          className={`flex ${isEditing ? 'flex-col' : 'flex-row'}`}
        >
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
        <label
          htmlFor='username'
          className={`flex ${isEditing ? 'flex-col' : 'flex-row'}`}
        >
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
        <button
          className='flex justify-center items-center rounded-sm text-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-400 hover:text-black hover:cursor-pointer transition-colors mt-4'
          onClick={() => updateUserData()}
          type='button'
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </form>
    </>
  );
}
