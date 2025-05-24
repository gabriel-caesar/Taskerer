import { useEffect, useState, useContext } from 'react';
import { MdCancel } from 'react-icons/md';
import { SiLazyvim } from 'react-icons/si';
import { FaTrash, FaArrowRight } from 'react-icons/fa';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { userContext } from '../App';
import unknownImage from '../../assets/unknown-user-image.png';
import sleepingFace from '../../assets/sleeping-face.png';
import SignUpForm from './SignUpForm';
import ProfileDetails from './ProfileDetails';
import Modal from '../reusable_components/Modal';
import AddTaskForm from './AddTaskForm';

export default function LeftPanel() {
  // reading the context passed by App.jsx
  const {
    userLogged,
    setUserLogged,
    dispatchCurrentUser,
    currentUserLoggedIn,
    setCurrentSelectedTask,
    setLoadingSelection,
    isPastDue,
    isTaskConcluded,
  } = useContext(userContext);

  const [openSignInForm, setOpenSignInForm] = useState(false);
  const [openAddTaskForm, setOpenTaskForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState(''); // error state for incorrect inputs
  const [openProfileDetails, setOpenProfileDetails] = useState(false);
  const [userSigned, setUserSigned] = useState(false); // track if user's signed
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

  async function handleTaskDeletion(selectedTask) {
    const updatedTasks = currentUserLoggedIn.tasks.filter(
      // filtering the old array
      (task) => task.id !== selectedTask.id
    );

    // find the updated user
    const currentUser = { ...currentUserLoggedIn, tasks: updatedTasks };

    dispatchCurrentUser({
      // update the currentUserLoggedIn
      type: 'set_current_user',
      payload: {
        user: currentUser,
      },
    });

    const userRef = doc(db, 'users', currentUserLoggedIn.uid); // getting the database reference
    await updateDoc(userRef, { tasks: updatedTasks }); // sending the update to firebase

    setOpenModalTask(false); // closes the task deletion modal
    if (selectedTask.selected) setCurrentSelectedTask(''); // if the deleted task was seletected, unselect the deleted task
  }

  async function handleSelectedTask(selectedTask) {
    setLoadingSelection(true); // loading between task selection
    try {
      // it works similar to forEach()
      const updatedTasks = currentUserLoggedIn.tasks.map((task) => {
        // toggling the selected prop of a task
        if (task === selectedTask) {
          // if this is the clicked task, toggle its 'selected' state
          return { ...task, selected: !task.selected };
        } else {
          // otherwise, make sure it's unselected
          return { ...task, selected: false };
        } // do this for every task
      });

      // find the updated user
      const currentUser = { ...currentUserLoggedIn, tasks: updatedTasks };

      dispatchCurrentUser({
        // update the currentUserLoggedIn
        type: 'set_current_user',
        payload: {
          user: currentUser,
        },
      });

      const thisTaskBeingSelected = updatedTasks.find(
        // find the task that is selected
        (task) => task.selected
      );

      setCurrentSelectedTask(thisTaskBeingSelected); // update the selected task

      const userRef = doc(db, 'users', currentUserLoggedIn.uid); // getting the database reference
      await updateDoc(userRef, { tasks: updatedTasks }); // sending the update to firebase

    } catch (error) {
      throw new Error(`Couldn't select task. ${error.message}`);
    } finally {
      setLoadingSelection(false);
    }
  }

  // using useEffect() to change (openSignUpForm) as user is logged
  useEffect(() => {
    setOpenSignInForm(false);
    // if the account logged in doesnt have a username, pop the form right away
    if (userLogged) {
      if (currentUserLoggedIn.username === 'Empty') {
        setOpenProfileDetails(true); // popping the profile form
      }
    }
  }, [userLogged, currentUserLoggedIn]);

  // prevent the error feedback to remain in the add task form
  // when the user closes and opens it back again
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
          <p className='bg-blue-200 text-gray-800 h-6 w-auto max-w-30 truncate justify-center flex rounded-sm pl-5 pr-3 absolute z-10 left-11 top-1 font-bold'>
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
            yesText={'Yes'}
            noText={'No'}
            className={`bg-blue-200 p-2`}
          />
        )}
        {openSignInForm && (
          <SignUpForm
            logged={userLogged}
            signed={userSigned}
            setLogged={setUserLogged}
            setSigned={setUserSigned}
          />
        )}

        {openProfileDetails && <ProfileDetails />}

        {userLogged ? (
          <div className='p-2'>
            <button
              className='rounded-sm bg-blue-500 px-2 text-white hover:bg-blue-200 hover:text-black hover:cursor-pointer duration-150 transition-all'
              onClick={() => {
                setOpenTaskForm(!openAddTaskForm);
              }}
            >
              {openAddTaskForm ? 'Go Back' : 'Add Header Task'}
            </button>

            {openAddTaskForm && (
              <userContext.Consumer>
                {({
                  dispatchCurrentUser,
                  currentUserLoggedIn,
                  uniqueId,
                }) => (
                  <AddTaskForm
                    currentUserLoggedIn={currentUserLoggedIn}
                    dispatchCurrentUser={dispatchCurrentUser}
                    uniqueId={uniqueId}
                    errorCode={errorCode}
                    setErrorCode={setErrorCode}
                    setOpenTaskForm={setOpenTaskForm}
                    loading={loading}
                    setLoading={setLoading}
                  />
                )}
              </userContext.Consumer>
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
                  <div key={task.id} className='relative'>
                    <div
                      className={`bg-blue-100 rounded-sm px-2 py-1 flex justify-between items-center mb-2 hover:bg-blue-200 transition-colors hover:cursor-pointer ${task.selected && 'bg-blue-500'}`}
                      onClick={() => handleSelectedTask(task)}
                    >
                      <h4 className='flex justify-center items-center'>
                        {(isPastDue(
                          format(parseISO(task.dueDate), 'MM/dd/yyyy')
                        ) && !isTaskConcluded(task)) && (
                          <FaExclamationCircle className='text-red-500 mr-2 font-bold' />
                        )}
                        {isTaskConcluded(task) && (
                          <FaCheckCircle className='text-green-400 mr-2' />
                        )}
                        {task.taskName}
                      </h4>
                    </div>
                    {openModalTask !== task.id ? (
                      <button
                        onClick={() => setOpenModalTask(task.id)}
                        className='hover:cursor-pointer hover:text-red-500 transition-colors text-2xl text-blue-300 absolute right-1 top-1 z-10'
                      >
                        <MdCancel />
                      </button>
                    ) : (
                      <Modal
                        noFunction={() => setOpenModalTask('')}
                        yesFunction={() => handleTaskDeletion(task)}
                        yesText={<FaTrash />}
                        noText={<FaArrowRight />}
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
