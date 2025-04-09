import { useState } from 'react';
import taskererBg from '../assets/taskerer-bg.png';
import { GoPencil } from 'react-icons/go';
import { format } from 'date-fns';
import DisplayErrorToUser from './DisplayErrorToUser';
import { fetchUserData } from './fetchUserData';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function RightPanel({
  userData,
  setUserData,
  currentSelectedTask,
  setCurrentSelectedTask,
}) {
  const [currentUserLoggedIn, setCurrentUserLoggedIn] = useState(
    JSON.parse(localStorage.getItem('current-user')) || ''
  );
  const [errorCode, setErrorCode] = useState('');
  const [edit, setEdit] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // handle dueDate edge cases and prevent crashing
  function handleDates(date) {
    if (date === '') {
      return (date = '');
    } else {
      return format(new Date(date), 'MM/dd/yyyy');
    }
  }

  function editTaskName(e) {
    setNewTaskName(e.target.value);
  }

  function editDueDate(e) {
    setNewDueDate(e.target.value);
  }

  function editDescription(e) {
    setNewDesc(e.target.value);
  }

  async function updateTheCurrentUser() {
      await fetchUserData(setUserData); // even though I am updating userData here, this update doesn't get immediatly reflected in this function
  
      setUserData((prevData) => {
        // so I have to call setUserData again to work with the most up to date userData
        const user = prevData.find(
          (user) => user.email === currentUserLoggedIn.email
        );
        setCurrentUserLoggedIn(user);
        localStorage.clear(); // clear the old data
        localStorage.setItem('current-user', JSON.stringify(user)); // upload the new data
        return prevData; // Preserve state
      });
    }

  async function editTask() {
    try {

      // storing the edited task object in a variable
      const editedTask = {
        taskName: newTaskName,
        dueDate: newDueDate,
        desc: newDesc,
      }
      
      currentUserLoggedIn.tasks.filter(
        (task) => task.taskName !== currentSelectedTask.taskName
      );

      const afterEdit = currentUserLoggedIn.tasks.map(task =>
        task.taskName === currentSelectedTask.taskName ? { ...task, ...editedTask } : task
      );
      

      // user reference
      const userRef = doc(db, 'users', currentUserLoggedIn.uid);

      await updateDoc(userRef, {
        tasks: [...currentUserLoggedIn.tasks, ...afterEdit] // inserting the new task within the user's tasks array
      });

      await updateTheCurrentUser(); // after updating the tasks array, this function updates the whole user because of that change

      
    } catch (error) {
      throw new Error(`Unable to edit task. ${error.message}`);
    } finally {
    }
  }

  return (
    <div
      id='right-panel'
      className='flex justify-center items-center w-3/4 h-11/12 m-auto my-shadow rounded-sm relative'
    >
      {!currentSelectedTask ? (
        <img src={taskererBg} alt='taskerer-logo' className='w-lg opacity-50' />
      ) : (
        <>
          <button
            onClick={() => {
              setEdit(!edit);
            }}
            className='hover:bg-blue-400 rounded-sm p-1 text-2xl ml-4 hover:cursor-pointer hover:text-black transition-colors absolute top-1 right-1'
          >
            {<GoPencil />}
          </button>
          <div className='w-10/12 h-10/12 overflow-auto'>
            <nav className='flex justify-between border-b-blue-200 border-b-2'>
              {edit ? (
                <>
                  <input
                    type='text'
                    value={newTaskName}
                    className='bg-blue-200 rounded-sm shadow-sm mb-2 px-2 text-lg'
                    onChange={(e) => editTaskName(e)}
                    placeholder='New Task Name...'
                    onKeyDown={(e) => e.key === 'Enter' && editTask()}
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
              <p className='bg-gray-200 rounded-sm p-2 mt-4 text-md text-gray-800'>
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
          </div>
        </>
      )}
    </div>
  );
}
