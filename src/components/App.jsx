import { useEffect, useState, createContext, useReducer } from 'react';
import Navbar from './Navbar';
import RightPanel from './RightPanel';
import { fetchUserData } from './fetchUserData';

// refactoring the logic to accept context
// this enhances the code by avoiding prop-drilling
// and helps the state being updated in only place
// instead of diverging it through Navbar and RightPanel
export const userContext = createContext({
  userData: [],
  setUserData: () => {},
  currentSelectedTask: {},
  setCurrentSelectedTask: () => {},
  loadingSelection: false,
  setLoadingSelection: () => {},
});

// reducer function
function userDataReducer(state, action) {
  switch (action.type) {
    case 'initialize_data':
      return action.payload; // this becomes the new userData (used on fetchUserData)

    case 'update_tasks_array':
      return state.map((user) =>
        user.uid === action.payload.uid
          ? { ...user, tasks: action.payload.tasks }
          : user
      );

    case 'update_profile_details':
      return state.map((user) =>
        user.uid === action.payload.uid
          ? {
              ...user,
              username: action.payload.username,
              phoneNumber: action.payload.phoneNumber,
            }
          : user
      );

      case 'add_user':
        return [...state, action.payload ];
        

    default:
      return state;
  }
}

function currentUserReducer(state, action) {
  switch (action.type) {
    case 'set_current_user':
      localStorage.setItem('current-user', JSON.stringify(action.payload.user)); // setting the localStorage
      return action.payload.user; // assigning the updated user object to currentUserLoggedIn state

    default:
      return state;
  }
}

export default function App() {
  // using reducer to centralize userData, because this piece of information
  // is shared and manipulated around major part of the program
  const [userData, dispatchUserData] = useReducer(userDataReducer, []);
  const [currentUserLoggedIn, dispatchCurrentUser] = useReducer(
    currentUserReducer,
    JSON.parse(localStorage.getItem('current-user'))
  );
  // getting the selected task from localStorage as initial value
  const [local, setLocal] = useState(
    JSON.parse(localStorage.getItem('current-user')) || ''
  );
  const [currentSelectedTask, setCurrentSelectedTask] = useState(
    local !== '' && local.tasks.find((task) => task.selected)
  );
  const [loadingSelection, setLoadingSelection] = useState(false); // loading between task selection

  useEffect(() => {
    // as fetchUserData() returns a promise, the code awaits it
    // and only then the payload can read it
    const dataReader = async () => {
      const data_of_user = await fetchUserData();
      dispatchUserData({ type: 'initialize_data', payload: data_of_user });
    };

    dataReader();
  }, []);

  return (
    <main className='flex h-screen'>
      <userContext.Provider
        value={{
          userData,
          dispatchUserData,
          currentUserLoggedIn,
          dispatchCurrentUser,
          currentSelectedTask,
          setCurrentSelectedTask,
          loadingSelection,
          setLoadingSelection,
        }}
      >
        <Navbar />
        <RightPanel />
      </userContext.Provider>
    </main>
  );
}
