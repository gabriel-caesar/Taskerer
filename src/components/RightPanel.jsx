import { useEffect, useState, useContext } from 'react';
import { GoPencil } from 'react-icons/go';
import { format } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { userContext } from './App';
import ProgressWheel from './ProgressWheel';
import Loading from './Loading';
import taskererBg from '../assets/taskerer-bg.png';
import DisplayErrorToUser from './DisplayErrorToUser';
import AddSubTask from './AddSubTask';

export default function RightPanel() {
  // reading the context passed by App.jsx
  const {
    userData,
    dispatchCurrentUser,
    dispatchUserData,
    currentSelectedTask,
    currentUserLoggedIn,
    loadingSelection,
    setCurrentSelectedTask,
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
      return format(new Date(date), 'MM/dd/yyyy');
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
        subTasks: [ ...currentSelectedTask.subTasks ],
        selected: true,
      };

      // storing the updated tasks array in a variable
      const updatedTasks = currentUserLoggedIn.tasks.map((task) =>
        task.taskName === currentSelectedTask.taskName
          ? { ...editedTask }
          : task
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

      const thisTaskBeingSelected = updatedTasks.find(
        // find the task that is selected
        (task) => task.selected
      );

      setCurrentSelectedTask(thisTaskBeingSelected); // update the selected task

      const userRef = doc(db, 'users', currentUserLoggedIn.uid); // user reference from database
      await updateDoc(userRef, { tasks: updatedTasks }); // inserting the new task within the user's tasks array

      dispatchUserData({
        // update the userData
        type: 'update_tasks_array',
        payload: {
          uid: currentUserLoggedIn.uid,
          tasks: updatedTasks,
        },
      });

      setEdit(false); // closing the edit form after the change is complete
    } catch (error) {
      throw new Error(`Unable to edit task. ${error.message}`);
    } finally {
    }
  }

  // closes the edit form everytime the user select another task while with the edit form opened
  useEffect(() => {
    setEdit(false);
  }, [currentSelectedTask]);

  // dispatch (in editTask()) updates userData, which triggers this effect
  // and then React re-renders the page, reflecting the
  // updated edited task immediately
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('current-user'));

    dispatchCurrentUser({
      // update the currentUserLoggedIn
      type: 'set_current_user',
      payload: {
        user: currentUser,
      },
    });
  }, [userData]);

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
                <h1 className='text-4xl tracking-widest font-bold pb-2 flex justify-start items-center text-gray-800'>
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
                <span className='bg-blue-200 rounded-sm h-10 font-bold flex justify-center items-center px-2 text-sm text-center'>
                  Due in {handleDates(currentSelectedTask.dueDate)}
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
                  onKeyDown={(e) => e.key === 'Enter' && editTask()}
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

            <div id='subtasks-and-progress-container' className='flex justify-between my-10'>
              {/* SUB-TASK CONTAINER */}
              <div
                id='subtask-container'
                className='flex flex-col items-center bg-blue-200 rounded-sm w-3/6 h-70 border-2 border-blue-400 overflow-auto shadow-xl'
              >
                <AddSubTask />
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
