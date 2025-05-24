import { useState, createContext, useReducer } from 'react';
import LeftPanel from './left_panel_components/LeftPanel';
import RightPanel from './right_panel_components/RightPanel';
import { isBefore, format } from 'date-fns';

// refactoring the logic to accept context
// this enhances the code by avoiding prop-drilling
// and helps the state being updated in only place
// instead of diverging it through LeftPanel and RightPanel
export const userContext = createContext(null);

// currentUserLoggedIn reducer function
function currentUserReducer(state, action) {
  switch (action.type) {
    case 'set_current_user':
      localStorage.setItem('current-user', JSON.stringify(action.payload.user)); // setting the localStorage
      return action.payload.user; // assigning the updated user object to currentUserLoggedIn state

    default: // default case that returns the currentUserLoggedIn itself
      return state;
  }
}

export default function App() {
  // using reducer to centralize currentUserLoggedIn, because this piece of information
  // is shared and manipulated around major part of the program
  const [currentUserLoggedIn, dispatchCurrentUser] = useReducer(
    currentUserReducer,
    JSON.parse(localStorage.getItem('current-user'))
  );

  // getting the selected task from localStorage as initial value
  const local = JSON.parse(localStorage.getItem('current-user')) || ''
  const [currentSelectedTask, setCurrentSelectedTask] = useState(
    local !== '' && local.tasks.find((task) => task.selected)
  );
  const [loadingSelection, setLoadingSelection] = useState(false); // loading between task selection
  const [userLogged, setUserLogged] = useState(
    JSON.parse(localStorage.getItem('current-user')) || ''
  );

  // checks if the task is past due or not
  function isPastDue(date) {
    const present = new Date(); // today's date
    // comparison function from date-fns
    // is the first date before the second?
    return date !== ''
      ? isBefore(
          date,
          format(present, 'MM/dd/yyyy') // already ISO
        )
      : false;
  }

  // checks if the header task is concluded
  function isTaskConcluded(task) {
    if (
      task.subTasks.every((subtask) => subtask.completed === true) &&
      task.subTasks.length >= 1
    ) {
      return true;
    }
    return false;
  }

  // unique id generator
  function uniqueId() {
    let id = [];
    let counter = 0;
    for (let i = 0; i < 20; i++) {
      if (counter % 2 === 0) {
        id.push(Math.floor(Math.random() * 10)); // generating numbers from 0 to 9
        counter++;
      } else {
        id.push(String.fromCharCode(Math.floor(Math.random() * 26) + 97)); // generating letters from a to z
        counter++;
      }
    }
    return id.join(''); // turning the array into string
  }

  return (
    <main className='flex h-screen'>
      <userContext.Provider
        value={{
          currentUserLoggedIn,
          dispatchCurrentUser,
          currentSelectedTask,
          setCurrentSelectedTask,
          userLogged,
          setUserLogged,
          loadingSelection,
          setLoadingSelection,
          isPastDue,
          isTaskConcluded,
          uniqueId,
        }}
      >
        <LeftPanel />
        <RightPanel />
      </userContext.Provider>
    </main>
  );
}
