import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { RiHammerFill } from 'react-icons/ri';
import { useContext, useEffect, useState } from 'react';
import { userContext } from '../App';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { MdCancel } from 'react-icons/md';
import { FaTrash, FaArrowRight } from 'react-icons/fa';
import Modal from '../reusable_components/Modal';
import Loading from '../reusable_components/Loading';

function SubTaskFunctions() {
  const {
    setCurrentSelectedTask,
    currentSelectedTask,
    currentUserLoggedIn,
    dispatchCurrentUser,
    uniqueId,
  } = useContext(userContext);

  const [addingSubTask, setAddingSubTask] = useState(false); // opens the form to create a sub-task
  const [subTaskName, setSubTaskName] = useState(''); // sub-task name
  const [openModalTask, setOpenModalTask] = useState(''); // Sub-task deletion Modal
  const [loading, setLoading] = useState(false);

  async function updateTheRoot(updatedTasks, currentUser) {
    try {
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
    } catch (error) {
      throw new Error(`Couldn't update the root. ${error.message}`);
    }
  }

  async function createSubTask() {
    // creates a sub-task
    setLoading(true);
    try {
      const newSubTask = {
        // new sub-task object
        desc: subTaskName,
        id: uniqueId(),
        completed: false,
      };

      // storing the updated tasks array in a variable
      const updatedTasks = currentUserLoggedIn.tasks.map((task) =>
        task.id === currentSelectedTask.id
          ? {
              ...currentSelectedTask,
              subTasks: [...currentSelectedTask.subTasks, newSubTask],
            }
          : task
      );

      // find the updated user
      const currentUser = { ...currentUserLoggedIn, tasks: updatedTasks };

      // update the currentUserLoggedIn and Firestore
      await updateTheRoot(updatedTasks, currentUser);

      setAddingSubTask(false); // close the addingSubTask form
      setSubTaskName(''); // clears the sub-task name input
    } catch (error) {
      throw new Error(`Couldn't create a sub-task. ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompletion(subTaskCompleted) {
    try {
      const updatedSubTask = subTaskCompleted.completed
        ? { ...subTaskCompleted, completed: false }
        : { ...subTaskCompleted, completed: true };

      const subTasksArray = currentSelectedTask.subTasks.map((subtask) =>
        subtask.id === subTaskCompleted.id ? { ...updatedSubTask } : subtask
      );

      // storing the updated tasks array in a variable
      const updatedTasks = currentUserLoggedIn.tasks.map((task) =>
        task.id === currentSelectedTask.id
          ? {
              ...currentSelectedTask,
              subTasks: [...subTasksArray],
            }
          : task
      );

      // find the updated user
      const currentUser = { ...currentUserLoggedIn, tasks: updatedTasks };

      // update the currentUserLoggedIn and Firestore
      await updateTheRoot(updatedTasks, currentUser);
    } catch (error) {
      throw new Error(
        `Couldn't mark the sub-task as completed. ${error.message}`
      );
    }
  }

  async function handleDeletion(subtask) {
    // deletes a sub-task
    setLoading(true); // start loading
    try {
      // filtering the deleted data from the subTasks array
      const subTasks = currentSelectedTask.subTasks.filter(
        (st) => st.id !== subtask.id
      );

      const updatedTasks = currentUserLoggedIn.tasks.map((task) =>
        task.id === currentSelectedTask.id
          ? {
              ...currentSelectedTask,
              subTasks: [...subTasks],
            }
          : task
      );

      // find the updated user
      const currentUser = { ...currentUserLoggedIn, tasks: updatedTasks };

      // update the currentUserLoggedIn and Firestore
      await updateTheRoot(updatedTasks, currentUser);

      setOpenModalTask(false); // closes the task deletion modal
    } catch (error) {
      throw new Error(`Couldn't delete the sub-task. ${error.message}`);
    } finally {
      setLoading(false); // loading stops
    }
  }

  // if the user types something on the sub-task name field, but closes the tab
  // without creating it, the draft is cleared
  useEffect(() => {
    setSubTaskName(''); // clears the sub-task name input
  }, [addingSubTask]);

  return (
    <>
      <nav className={`flex flex-col bg-blue-50 w-full rounded-t-sm mb-4`}>
        <div
          className={`flex justify-between w-full p-2 ${addingSubTask && 'border-b-2 border-blue-400'}`}
        >
          <button
            className='rounded-sm bg-blue-500 px-2 text-white hover:bg-blue-200 hover:text-black hover:cursor-pointer duration-150 transition-all shadow'
            onClick={() => setAddingSubTask(!addingSubTask)}
          >
            {addingSubTask ? 'Go back' : 'Add sub-task'}
          </button>
          <span className='text-3xl text-blue-500'>
            {addingSubTask ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
          </span>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className={`${addingSubTask && 'border-b-2 border-blue-400 p-2'}`}
        >
          {addingSubTask && (
            <>
              <h3 className='font-bold'>Sub-task description</h3>
              <label className='flex justify-between'>
                <input
                  autoFocus
                  className={`text-sm rounded-sm bg-blue-200 shadow-sm p-1 px-2 py-2 my-2 w-3/4`}
                  placeholder='Description...'
                  type='text'
                  value={subTaskName}
                  onChange={(e) => {
                    if (e.target.value.length <= 55)
                      return setSubTaskName(e.target.value);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && createSubTask()}
                />
                <button
                  type='button'
                  onClick={() => createSubTask()}
                  className='rounded-sm bg-blue-500 px-2 h-9 my-2 text-white hover:bg-blue-200 hover:text-black hover:cursor-pointer duration-150 transition-all shadow'
                >
                  Create
                </button>
              </label>
            </>
          )}
        </form>
      </nav>

      <div className='flex justify-center flex-col items-center p-2 w-full'>
        {currentSelectedTask.subTasks.length > 0 ? (
          <>
            {loading ? (
              <Loading />
            ) : (
              currentSelectedTask.subTasks.map((subtask) => {
                return (
                  <div
                    key={subtask.id}
                    className='flex justify-between p-2 w-full bg-blue-50 rounded-sm mb-2'
                  >
                    <span className='flex items-center w-auto'>
                      <input
                        className='shadow size-3.5'
                        type='checkbox'
                        onChange={() => handleCompletion(subtask)}
                        checked={subtask.completed}
                      />

                      <p className='ml-2'>{subtask.desc}</p>
                    </span>
                    {openModalTask !== subtask.id ? (
                      <button
                        onClick={() => setOpenModalTask(subtask.id)}
                        className='hover:cursor-pointer hover:text-red-500 transition-colors text-2xl text-blue-300 right-1 top-1 z-10'
                      >
                        <MdCancel />
                      </button>
                    ) : (
                      <Modal
                        noFunction={() => {
                          setOpenModalTask('');
                        }}
                        yesFunction={() => handleDeletion(subtask)}
                        yesText={<FaTrash />}
                        noText={<FaArrowRight />}
                        className={'flex items-center'}
                      />
                    )}
                  </div>
                );
              })
            )}
          </>
        ) : (
          <>
            <RiHammerFill className='text-3xl opacity-70 text-blue-500' />
            <p className='text-xl opacity-70 text-blue-500 text-center'>
              Add sub-tasks so you can complete your header task
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default SubTaskFunctions;
