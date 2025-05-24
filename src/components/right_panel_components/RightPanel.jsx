import { useEffect, useState, useContext } from 'react';
import { GoPencil } from 'react-icons/go';
import { BsExclamationCircle } from 'react-icons/bs';
import { FaCheckCircle } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { userContext } from '../App';
import ProgressWheel from '../reusable_components/ProgressWheel';
import Loading from '../reusable_components/Loading';
import taskererBg from '../../assets/taskerer-bg.png';
import DisplayErrorToUser from '../reusable_components/DisplayErrorToUser';
import SubTaskFunctions from './SubTaskFunctions';

export default function RightPanel() {
  // reading the context passed by App.jsx
  const {
    dispatchCurrentUser,
    currentSelectedTask,
    currentUserLoggedIn,
    userLogged,
    loadingSelection,
    setCurrentSelectedTask,
    isPastDue,
    isTaskConcluded,
  } = useContext(userContext);

  const [errorCode, setErrorCode] = useState('');
  const [edit, setEdit] = useState(false);
  const [newTaskName, setNewTaskName] = useState(
    currentSelectedTask && currentSelectedTask.taskName
  );
  const [newDueDate, setNewDueDate] = useState(
    currentSelectedTask && currentSelectedTask.dueDate
  );
  const [newDesc, setNewDesc] = useState(
    currentSelectedTask && currentSelectedTask.desc
  );
  const currentTaskDueDate = currentSelectedTask
    ? format(parseISO(currentSelectedTask.dueDate), 'MM/dd/yyyy')
    : '';

  // this function updates the 'to be edited' input fields
  // with the most up to date data from the current selected task
  function enableEditForm() {
    setEdit(!edit);
    setNewTaskName(currentSelectedTask.taskName);
    setNewDueDate(currentSelectedTask.dueDate);
    setNewDesc(currentSelectedTask.desc);
  }

  function handleTaskName(e) {
    if (e.target.value.length <= 20) {
      setNewTaskName(e.target.value);
    }
  }

  // handle dueDate edge cases and prevent crashing
  function handleDates(date) {
    if (date === '') {
      return (date = '');
    } else {
      return format(new Date(parseISO(date)), 'MM/dd/yyyy');
    }
  }

  function editDueDate(e) {
    setNewDueDate(e.target.value);
  }

  function editDescription(e) {
    setNewDesc(e.target.value);
  }

  async function editTask() {
    try {
      // storing the edited task object in a variable
      const editedTask = {
        taskName: newTaskName,
        dueDate: newDueDate,
        desc: newDesc,
        subTasks: [...currentSelectedTask.subTasks],
        selected: true,
        id: currentSelectedTask.id,
      };

      // storing the updated tasks array in a variable
      const updatedTasks = currentUserLoggedIn.tasks.map((task) =>
        task.id === currentSelectedTask.id ? { ...editedTask } : task
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

      const userRef = doc(db, 'users', currentUserLoggedIn.uid); // user reference from database
      await updateDoc(userRef, { tasks: updatedTasks }); // inserting the new task within the user's tasks array

      setEdit(false); // closing the edit form after the change is complete
    } catch (error) {
      throw new Error(`Unable to edit task. ${error.message}`);
    }
  }

  // closes the edit form everytime the user select another task while with the edit form opened
  useEffect(() => {
    setEdit(false);
  }, [currentSelectedTask]);


  useEffect(() => {
    // centralized userLogged to use here as a condition
    // to make RightPanel re-render so when the user first
    // logs in and has a selected task from last session
    // it will display it immediately
    if (currentUserLoggedIn !== null) {
      setCurrentSelectedTask(
        currentUserLoggedIn.tasks.find((task) => task.selected)
      );
    } 
    // currentUserLoggedIn is a dependency to help the app re-render when a task is edited
  }, [userLogged, currentUserLoggedIn]);

  return (
    <div
      id='right-panel'
      className='flex justify-center items-center w-3/4 h-11/12 m-auto my-shadow rounded-sm relative'
    >
      {/* LOADING BETWEEN TASK SELECTION */}
      {loadingSelection ? (
        <Loading />
      ) : !currentSelectedTask ? (
        <img src={taskererBg} alt='taskerer-logo' className='w-lg opacity-50' />
      ) : (
        <>
          <button
            onClick={() => {
              enableEditForm();
            }}
            className='hover:bg-blue-400 rounded-sm p-1 text-2xl ml-4 hover:cursor-pointer hover:text-black transition-colors absolute top-1 right-1'
          >
            {<GoPencil />}
          </button>
          <div
            className='w-10/12 h-10/12 overflow-auto px-2'
            id='right-panel-content'
          >
            <nav className='flex justify-between border-b-blue-200 border-b-2'>
              {edit ? (
                <>
                  <input
                    type='text'
                    value={newTaskName}
                    className='bg-blue-200 rounded-sm shadow-sm mb-2 px-2 text-lg'
                    placeholder='New Task Name...'
                    onKeyDown={(e) => e.key === 'Enter' && editTask()}
                    onChange={(e) => handleTaskName(e)}
                  />
                  <DisplayErrorToUser error={errorCode} />
                </>
              ) : (
                <h1 className='text-4xl tracking-widest font-bold pb-2 flex justify-center items-center text-gray-800'>
                  {isTaskConcluded(currentSelectedTask) && (
                    <FaCheckCircle className='text-green-400 mr-2' />
                  )}
                  {currentSelectedTask.taskName}
                </h1>
              )}

              {edit ? (
                <input
                  type='date'
                  value={newDueDate}
                  className='bg-blue-200 rounded-sm p-2 mb-2'
                  onChange={(e) => editDueDate(e)}
                  onKeyDown={(e) => e.key === 'Enter' && editTask()}
                />
              ) : (
                <span
                  className={`${isPastDue(currentTaskDueDate) && !isTaskConcluded(currentSelectedTask) ? 'bg-red-400' : 'bg-blue-200'} rounded-sm h-10 font-bold flex justify-center items-center px-2 text-sm text-center`}
                >
                  {isPastDue(currentTaskDueDate) &&
                    !isTaskConcluded(currentSelectedTask) && (
                      <BsExclamationCircle className='mr-2 text-xl' />
                    )}
                  {isPastDue(currentTaskDueDate) &&
                  !isTaskConcluded(currentSelectedTask)
                    ? 'Past due'
                    : 'Due in'}{' '}
                  {handleDates(currentSelectedTask.dueDate)}
                </span>
              )}
            </nav>

            {edit ? (
              <label className='flex flex-col text-lg font-bold mt-4'>
                Edit your Description:
                <textarea
                  className='rounded-sm bg-blue-200 p-2 text-md font-normal'
                  rows={8}
                  placeholder='New Task Description...'
                  value={newDesc}
                  onChange={(e) => editDescription(e)}
                ></textarea>
              </label>
            ) : (
              <p
                id='task-desc'
                className='bg-gray-200 rounded-sm p-2 mt-4 text-md text-gray-800 max-h-50 overflow-y-auto overflow-x-hidden break-words'
              >
                {currentSelectedTask.desc}
              </p>
            )}

            {edit && (
              <button
                className='rounded-sm bg-blue-500 px-2 text-white hover:bg-blue-200 hover:text-black hover:cursor-pointer duration-150 transition-all mt-4 text-xl py-2'
                onClick={() => editTask()}
              >
                Save Changes
              </button>
            )}

            <div
              id='subtasks-and-progress-container'
              className='flex justify-between my-10'
            >
              {/* SUB-TASK CONTAINER */}
              <div
                id='subtask-container'
                className='flex flex-col items-center bg-blue-200 rounded-sm w-3/6 h-70 border-2 border-blue-400 overflow-auto shadow-xl'
              >
                <SubTaskFunctions />
              </div>

              {/* PROGRESS WHEEL */}
              <div className='flex flex-col justify-center items-center px-20'>
                <ProgressWheel />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
