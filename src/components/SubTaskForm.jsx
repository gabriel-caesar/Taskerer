import { useState } from 'react';
import Loading from './Loading';
import { fetchUserData } from './fetchUserData';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function SubTaskForm({
  errorCode,
  setErrorCode,
  setUserData,
  currentUserLoggedIn,
  setCurrentUserLoggedIn,
  currentSelectedTask,
}) {
  const [subTask, setSubTask] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubTask(e) {
    setSubTask({
      subTaskName: e.target.value,
      completed: false,
    });
  }

  async function updateTheCurrentUser() {
    await fetchUserData(setUserData); // even though I am updating userData here, this update doesn't get immediatly reflected in this function

    setUserData((prevData) => {
      // so I have to call setUserData again to work with the most up to date userData
      const user = prevData.find((user) => user.email === currentUser.email);
      setCurrentUserLoggedIn(user);
      localStorage.clear(); // clear the old data
      localStorage.setItem('current-user', JSON.stringify(user)); // upload the new data
      return prevData; // Preserve state
    });
  }

  async function saveSubTask() {
    // [...currentUser.tasks, {...task, subTasks: [...subtasks, newSubTask]}]
    setLoading(true);
    try {
      const userTasks = currentUserLoggedIn.tasks.map((task) => {
        if (task.taskName === currentSelectedTask.taskName) {
          // if the task is found, access its subTasks array and update it
          return {
            ...task,
            subTasks: [...task.subTasks, subTask],
          };
        }
        return task; // if the task is not the one it is looking for, just return it
      });

      const userRef = doc(db, 'users', currentUserLoggedIn.uid);

      await updateDoc(userRef, {
        tasks: userTasks,
      });
    } catch (error) {
      throw new Error(`Couldn't add new sub-task. ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='bg-blue-200 p-2 mt-4 w-1/2 rounded-sm'>
      <h1 className='font-bold mb-2'>Add your Sub-Task</h1>
      {loading ? (
        <Loading />
      ) : (
        <div className='bg-gray-200 rounded-sm px-2 flex justify-between w-auto py-1'>
          <div className='flex'>
            <label htmlFor='sub-task'>
              <input
                type='text'
                className={`text-sm rounded-sm ${errorCode === '' ? 'bg-blue-50' : 'bg-red-400'} shadow-sm p-1 px-2`}
                onChange={(e) => handleSubTask(e)}
              />
            </label>
          </div>
          <button
            onClick={() => saveSubTask()}
            className='rounded-sm bg-blue-500 px-2 text-white hover:bg-blue-200 hover:text-black hover:cursor-pointer duration-150 transition-all'
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
