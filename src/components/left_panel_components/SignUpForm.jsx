import { useState, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Loading from '../reusable_components/Loading';
import DisplayErrorToUser from '../reusable_components/DisplayErrorToUser';
import SuccessfullySignedUp from './SuccessfullySignedUp';
import { userContext } from '../App';

export default function SignUpForm({ signed, setLogged, setSigned }) {
  // reading context from App.jsx
  const { dispatchCurrentUser } = useContext(userContext);

  const [redTheInput, setRedTheInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState('');
  const [credentials, setCredentials] = useState({
    emailVal: '',
    passVal: '',
  });

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

  // checks the existence of the requested user within firestore
  async function tryLoggingIn(autho, email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        autho,
        email,
        password
      );
      return userCredential.user.uid;
    } catch (error) {
      setErrorCode(error.code);
      throw new Error(
        `Couldn't log in, user not found within Firestore. ${error.message}`
      );
    }
  }

  // log in main function
  async function logIn() {
    setLoading(true); // loading pops-up
    try {
      // if this function doesn't crash, the user exists within the firestore, it's more like an if condition for existence check
      // then this userCredential will return an object with an accessible uid to get the user from firestore later
      const userId = await tryLoggingIn(
        auth,
        credentials.emailVal,
        credentials.passVal
      );

      const userRef = doc(db, 'users', userId);

      const userSnap = await getDoc(userRef); // not the custom object yet

      const userData = userSnap.data();

      dispatchCurrentUser({
        // updating the currentUserLoggedIn
        type: 'set_current_user',
        payload: {
          user: userData,
        },
      });

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
  async function saveUserToFirestore(newUserObject) {
    try {
      // doc(database, collection, documentId)
      const userRef = doc(db, 'users', newUserObject.uid); // points where the user data would be stored
      await setDoc(userRef, { ...newUserObject }); // creating a new document for the user in firestore
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

      const newUser = {
        email: signedUpUser.email,
        createdAt: serverTimestamp(), // date in standard format
        tasks: [],
        phoneNumber: '',
        uid: signedUpUser.uid,
        username: 'Empty',
      };

      await saveUserToFirestore(newUser); // udpdating firestore

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
          onKeyDown={(e) => e.key === 'Enter' && logIn()}
          disabled={loading ? true : false}
          autoFocus
        />
      </label>

      <label>
        Password
        <input
          className={`${redTheInput ? 'bg-red-400' : 'bg-blue-200'} ${signed && 'bg-green-400'} flex rounded-sm text-base p-1 pl-3 w-auto duration-150 shadow-sm`}
          type='password'
          value={credentials.passVal}
          onChange={(e) => handlePassInput(e)}
          onKeyDown={(e) => e.key === 'Enter' && logIn()}
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
