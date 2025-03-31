import { useState, useEffect } from 'react';
import taskererBg from '../assets/taskerer-bg.png';
import { GoPencil } from 'react-icons/go';
import { format } from 'date-fns';
import { IoTrashBin } from 'react-icons/io5';
import SubTaskForm from './SubTaskForm';

export default function RightPanel({
  userData,
  setUserData,
  currentSelectedTask,
  setCurrentSelectedTask,
}) {
  const [currentUserLoggedIn, setCurrentUserLoggedIn] = useState(
    JSON.parse(localStorage.getItem('current-user')) || ''
  );
  const [openSubTaskForm, setOpenSubTaskForm] = useState(false);
  const [errorCode, setErrorCode] = useState('');

  // handle dueDate edge cases and prevent crashing
  function handleDates(date) {
    if (date === '') {
      return (date = '');
    } else {
      return format(new Date(date), 'MM/dd/yyyy');
    }
  }

  function addSubTask() {}

  return (
    <div
      id='right-panel'
      className='flex justify-center items-center w-3/4 h-11/12 m-auto my-shadow rounded-sm relative'
    >
      {!currentSelectedTask ? (
        <img src={taskererBg} alt='taskerer-logo' className='w-lg opacity-50' />
      ) : (
        <>
          <button className='hover:bg-blue-400 rounded-sm p-1 text-2xl ml-4 hover:cursor-pointer hover:text-black transition-colors absolute top-1 right-1'>
            {<GoPencil />}
          </button>
          <div className='w-10/12 h-10/12'>
            <nav className='flex justify-between border-b-blue-200 border-b-2'>
              <h1 className='text-4xl tracking-widest font-bold pb-2 flex justify-start items-center text-gray-800'>
                {currentSelectedTask.taskName}
              </h1>
              <span className='bg-blue-200 rounded-sm h-10 font-bold flex justify-center items-center px-2 text-sm'>
                Due in {handleDates(currentSelectedTask.dueDate)}
              </span>
            </nav>

            <p className='bg-gray-200 rounded-sm p-2 mt-4 text-md text-gray-800'>
              {currentSelectedTask.desc}
            </p>

            <button
              onClick={() => setOpenSubTaskForm(!openSubTaskForm)}
              className='rounded-sm bg-blue-500 px-2 text-white hover:bg-blue-200 hover:text-black hover:cursor-pointer duration-150 transition-all mt-10'
            >
              {openSubTaskForm ? 'Go Back' : 'Add Sub-Task'}
            </button>

            {openSubTaskForm && (
              <SubTaskForm
                errorCode={errorCode}
                setErrorCode={setErrorCode}
                setUserData={setUserData}
                currentUserLoggedIn={currentUserLoggedIn}
                setCurrentUserLoggedIn={setCurrentUserLoggedIn}
                currentSelectedTask={currentSelectedTask}
              />
            )}

            <section className='mt-4'>
              <div className='bg-gray-200 rounded-sm px-2 flex justify-between w-1/2 py-1'>
                <div className='flex'>
                  <input type='checkbox' className='mr-2 scale-120' />
                  <h1>Sub-Task name</h1>
                </div>
                <button className='text-xl hover:cursor-pointer hover:text-blue-500 transition-colors'>
                  <IoTrashBin />
                </button>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
