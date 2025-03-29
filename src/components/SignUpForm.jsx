import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { fetchUserData } from './fetchUserData';
import Loading from './Loading';
import DisplayErrorToUser from './DisplayErrorToUser';
import SuccessfullySignedUp from './SuccessfullySignedUp';

export default function SignUpForm({
  setCurrentUser,
  userData,
  setUserData,
  logged,
  signed,
  setLogged,
  setSigned,
}) {
  const [redTheInput, setRedTheInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState('');
  const [credentials, setCredentials] = useState({
    emailVal: '',
    passVal: '',
  });

  // here we fetch the user's data from database so we can update the (userData) to send it to (Navbar.jsx)
  useEffect(() => {
    fetchUserData(setUserData);
  }, [signed, logged]);

  function handleEmailInput(e) {
    setCredentials((prev) => ({
      ...prev,
      emailVal: e.target.value,
    }));
  }

  function handlePassInput(e) {
    setCredentials((prev) => ({
      ...prev,
      passVal: e.target.value,
    }));
  }

  // authenticates if users exists with firestore
  async function tryLoggingIn(autho, email, password) {
    try {
      const user = await signInWithEmailAndPassword(autho, email, password);
      return user;
    } catch (error) {
      setErrorCode(error.code);
      throw new Error(`Couldn't log in. ${error.message}`);
    }
  }

  // log in main function
  async function logIn() {
    setLoading(true); // loading pops-up
    try {
      await tryLoggingIn(auth, credentials.emailVal, credentials.passVal);

      // assigning the current user that logged in to the (currentUserLoggedIn) state
      const user = userData.find((user) => user.email === credentials.emailVal);
      setCurrentUser(user);

      // keeping track of the current user logged in between browser sessions
      localStorage.setItem('current-user', JSON.stringify(user));

      // stating that a user just logged in
      setLogged(true);

      // handling errors
      setErrorCode('');

      setRedTheInput(false);
    } catch (error) {
      // handling errors
      setRedTheInput(true);

      throw new Error(error.message);
    } finally {
      setLoading(false); // loading pops-out
    }
  }

  // saving user to firestore authentication (just checking if the email exists, for example)
  async function createUser(autho, email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        autho,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      setErrorCode(error.code);
      throw new Error(`User creation failed! ${error.message}`);
    }
  }

  // saving new user to firestore collections (handles the log in request)
  async function saveUserToFirestore(user) {
    try {
      // doc(database, collection, documentId)
      const userRef = doc(db, 'users', user.uid); // points where the user data would be stored
      await setDoc(userRef, {
        // stores the user data accordingly
        email: user.email,
        createdAt: serverTimestamp(), // date in standard format
        tasks: [],
        phoneNumber: '',
        uid: user.uid,
        username: '',
        profilePhoto: '',
      });
    } catch (error) {
      throw new Error(
        `Failed to store user data in Firestore. ${error.message}`
      );
    }
  }

  async function signUp() {
    setLoading(true); // loading starts
    try {
      // waits for the user to be created
      const signedUpUser = await createUser(
        auth,
        credentials.emailVal,
        credentials.passVal
      );
      await saveUserToFirestore(signedUpUser);
      // updating the userData state to be able to use it elsewhere
      setSigned(true); // this is used to update the UI based on sign-up status

      setErrorCode(''); // error handling

      setRedTheInput(false); // error handling
    } catch (error) {
      setRedTheInput(true); // error handling

      setSigned(false); // this is used to update the UI based on sign-up status

      throw new Error(`Sign up error. ${error.message}`);
    } finally {
      setLoading(false); // loading stops
    }
  }

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className='bg-gray-200 rounded-sm p-4 w-11/12 m-auto mt-10 flex flex-col justify-center items-center'
      aria-label='signupform'
    >
      <h1 className='text-xl text-blue-500 font-bold mb-4'>Sign Up/In</h1>

      <label>
        Email
        <input
          className={`${redTheInput ? 'bg-red-400' : 'bg-blue-200'} ${signed && 'bg-green-400'} flex rounded-sm text-base p-1 pl-3 w-auto mb-4 duration-150 shadow-sm`}
          type='email'
          value={credentials.emailVal}
          onChange={(e) => handleEmailInput(e)}
          onKeyDown={e => e.key === "Enter" && logIn()}
          disabled={loading ? true : false}
        />
      </label>

      <label>
        Password
        <input
          className={`${redTheInput ? 'bg-red-400' : 'bg-blue-200'} ${signed && 'bg-green-400'} flex rounded-sm text-base p-1 pl-3 w-auto duration-150 shadow-sm`}
          type='password'
          value={credentials.passVal}
          onChange={(e) => handlePassInput(e)}
          onKeyDown={e => e.key === "Enter" && logIn()}
          disabled={loading ? true : false}
        />
      </label>

      {/* feedback box */}
      <SuccessfullySignedUp sign={signed} />

      {/* feedback box */}
      <DisplayErrorToUser error={errorCode} />

      {loading && <Loading />}

      <button
        onClick={() => signUp()}
        className='flex justify-center items-center rounded-sm text-lg bg-blue-500 px-5 py-1 text-white hover:bg-blue-200 hover:text-black hover:cursor-pointer duration-150 mt-4'
        disabled={loading ? true : false}
        type='button'
      >
        Sign Up
      </button>

      <p className='text-lg my-4'>Or</p>

      <button
        onClick={() => logIn()}
        className='flex justify-center items-center rounded-sm text-lg bg-blue-500 px-5 py-1 text-white hover:bg-blue-200 hover:text-black hover:cursor-pointer duration-150'
        disabled={loading ? true : false}
        type='button'
      >
        Log In
      </button>
    </form>
  );
}
