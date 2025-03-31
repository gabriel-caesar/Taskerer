import { useEffect, useState } from 'react';
import { MdCancel } from 'react-icons/md';
import { SiLazyvim } from 'react-icons/si';
import { fetchUserData } from './fetchUserData';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import unknownImage from '../assets/unknown-user-image.png';
import sleepingFace from '../assets/sleeping-face.png';
import SignUpForm from './SignUpForm';
import ProfileDetails from './ProfileDetails';
import Modal from './Modal';
import AddTaskForm from './AddTaskForm';

export default function Navbar({ userData, setUserData, currentSelectedTask, setCurrentSelectedTask }) {
  const [openSignInForm, setOpenSignInForm] = useState(false);
  const [openAddTaskForm, setOpenTaskForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState(''); // error state for incorrect inputs
  const [openProfileDetails, setOpenProfileDetails] = useState(false);
  // if there's a current user logged in, fetch that user from localStorage, otherwise, false!
  const [userLogged, setUserLogged] = useState(
    JSON.parse(localStorage.getItem('current-user')) ? true : false
  );
  // track if user's signed
  const [userSigned, setUserSigned] = useState(false);
  // if there's a current user logged in, fetch that user from localStorage, otherwise, empty object!
  const [currentUserLoggedIn, setCurrentUserLoggedIn] = useState(
    JSON.parse(localStorage.getItem('current-user')) || {}
  );
  const [openModal, setOpenModal] = useState(false); // Log out Modal
  const [openModalTask, setOpenModalTask] = useState(''); // Task deletion Modal

  // opens and closes the sign up/in form
  function handleSignUp() {
    setOpenSignInForm(!openSignInForm);
  }

  // auto-explanatory
  function handleLogOut() {
    localStorage.clear(); // clears the current user
    window.location.reload(); // reloads the page
  }

  async function updateTheCurrentUser() {
    await fetchUserData(setUserData); // even though I am updating userData here, this update doesn't get immediatly reflected in this function

    setUserData((prevData) => {
      // so I have to call setUserData again to work with the most up to date userData
      const user = prevData.find(
        (user) => user.email === currentUserLoggedIn.email
      );
      setCurrentUserLoggedIn(user);
      localStorage.clear();
      localStorage.setItem('current-user', JSON.stringify(user));
      return prevData; // Preserve state
    });
  }

  async function updateUserData(updatedTasksArray) {
    try {
      const userRef = doc(db, 'users', currentUserLoggedIn.uid); // getting the database reference
      await updateDoc(userRef, {
        // updating the desired user data inside firestore
        tasks: updatedTasksArray,
      });

      await updateTheCurrentUser(); // await for the current user state and local storage to be updated
    } catch (error) {
      throw new Error(`Couldn't update user data. ${error.message}`);
    }
  }

  function handleTaskDeletion(selectedTask) {
    const filteredArray = currentUserLoggedIn.tasks.filter(
      (task) => task.taskName !== selectedTask.taskName
    );
    updateUserData(filteredArray); // calling the function that will update tasks array
    setOpenModalTask(false); // closes the task deletion modal
    if (selectedTask.selected) setCurrentSelectedTask(''); // if the deleted task was seletected, unselect the deleted task
  }

  async function handleSelectedTask(selectedTask) {

    // it works similar to forEach()
    const updatedUserTasks = currentUserLoggedIn.tasks.map((task) => {
      if (task === selectedTask) {
        // if this is the clicked task, toggle its 'selected' state
        return { ...task, selected: !task.selected };
      } else {
        // otherwise, make sure it's unselected
        return { ...task, selected: false };
      } // do this for every task
    });

    // find the task that is selected and update the state of (currentSelectedTask)
    const thisTaskBeingSelected = updatedUserTasks.find(task => task.selected);
    setCurrentSelectedTask(thisTaskBeingSelected);

    updateUserData(updatedUserTasks); // updating the user's tasks array
  }

  // using useEffect() to change (openSignUpForm) as user is logged
  useEffect(() => {
    setOpenSignInForm(false);
    // if the account logged in doesnt have a username, pop the form right away
    if (userLogged) {
      if (currentUserLoggedIn.username === '') {
        setOpenProfileDetails(true); // popping the profile form
      }
    }
  }, [userLogged, currentUserLoggedIn]);

  useEffect(() => {
    setErrorCode('');
  }, [openAddTaskForm]);

  return (
    <nav className='h-screen overflow-auto bg-blue-50 w-2/10 py-4' id='navbar'>
      <section className='flex justify-between px-4 relative border-b-1 border-gray-300 pb-5'>
        <div
          className={`flex ${userLogged ? 'hover:cursor-pointer' : 'hover:cursor-not-allowed'} hover:opacity-75 transition-opacity`}
          onClick={
            userLogged
              ? () => setOpenProfileDetails(!openProfileDetails)
              : () => {}
          }
        >
          <img src={unknownImage} alt='user-image' className='w-9 z-20' />
          <p className='bg-blue-200 text-gray-800 h-6 w-auto max-w-20 truncate justify-center flex rounded-sm pl-5 pr-3 absolute z-10 left-11 top-1 font-bold'>
            {userLogged ? currentUserLoggedIn.username : 'User'}
          </p>
          {userLogged && (
            <p className='absolute bg-gray-200 left-12 text-sm rounded-sm w-18 text-center top-6 z-0'>
              {openProfileDetails ? 'Collapse' : 'Expand'}
            </p>
          )}
        </div>

        {!userLogged ? (
          <button
            onClick={handleSignUp}
            className='rounded-sm bg-blue-500 px-2 text-white hover:bg-blue-200 hover:text-black hover:cursor-pointer duration-150'
          >
            Sign Up/In
          </button>
        ) : (
          <button
            className='rounded-sm bg-blue-500 px-2 text-white hover:bg-blue-200 hover:text-black hover:cursor-pointer duration-150'
            onClick={() => {
              setOpenModal(!openModal);
            }}
          >
            Log Out
          </button>
        )}
      </section>

      <section>
        {openModal && (
          <Modal
            yesFunction={() => handleLogOut()}
            noFunction={() => setOpenModal(false)}
            text={`Are you sure you want to Log Out?`}
            className={`bg-blue-200 p-2`}
          />
        )}
        {openSignInForm && (
          <SignUpForm
            setCurrentUser={setCurrentUserLoggedIn}
            userData={userData}
            setUserData={setUserData}
            logged={userLogged}
            signed={userSigned}
            setLogged={setUserLogged}
            setSigned={setUserSigned}
          />
        )}

        {openProfileDetails && (
          <ProfileDetails
            setCurrentUser={setCurrentUserLoggedIn}
            userData={userData}
            currentUser={currentUserLoggedIn}
            setUserData={setUserData}
          />
        )}
        {userLogged ? (
          <div className='p-2'>
            <button
              className='rounded-sm bg-blue-500 px-2 text-white hover:bg-blue-200 hover:text-black hover:cursor-pointer duration-150 transition-all'
              onClick={() => {
                setOpenTaskForm(!openAddTaskForm);
              }}
            >
              {openAddTaskForm ? 'Go Back' : 'Add Task'}
            </button>

            {openAddTaskForm && (
              <AddTaskForm
                currentUser={currentUserLoggedIn}
                setCurrentUser={setCurrentUserLoggedIn}
                setUserData={setUserData}
                errorCode={errorCode}
                setErrorCode={setErrorCode}
                setOpenTaskForm={setOpenTaskForm}
                loading={loading}
                setLoading={setLoading}
              />
            )}

            <div className='flex flex-col mt-4'>
              {currentUserLoggedIn.tasks.length === 0 ? (
                <>
                  <p className='text-center text-xl mt-20 mb-4 w-11/12 opacity-50'>
                    No Tasks to be shown.
                  </p>
                  <SiLazyvim className='opacity-50 text-4xl m-auto' />
                </>
              ) : (
                currentUserLoggedIn.tasks.map((task) => (
                  <div key={task.taskName} className='relative'>
                    <div
                      className={`bg-blue-100 rounded-sm px-2 py-1 flex justify-between items-center mb-2 hover:bg-blue-200 transition-colors hover:cursor-pointer ${task.selected && 'bg-blue-500'}`}
                      onClick={() => handleSelectedTask(task)}
                    >
                      <h4>{task.taskName}</h4>
                    </div>
                    {openModalTask !== task.taskName ? (
                      <button
                        onClick={() => setOpenModalTask(task.taskName)}
                        className='hover:cursor-pointer hover:text-red-500 transition-colors text-2xl text-blue-300 absolute right-1 top-1 z-10'
                      >
                        <MdCancel />
                      </button>
                    ) : (
                      <Modal
                        noFunction={() => setOpenModalTask(false)}
                        yesFunction={() => handleTaskDeletion(task)}
                        className={`absolute -top-1 right-2`}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center'>
            <p className='text-center text-xl mt-20 w-11/12 opacity-50'>
              Please, Log In to see your tasks.
            </p>
            {!openSignInForm && (
              <img
                src={sleepingFace}
                alt='sleeping-face'
                className='w-16 opacity-50 mt-8'
              />
            )}
          </div>
        )}
      </section>
    </nav>
  );
}
