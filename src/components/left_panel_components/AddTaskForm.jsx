import { Component } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import DisplayErrorToUser from '../reusable_components/DisplayErrorToUser';
import Loading from '../reusable_components/Loading';

export default class AddTaskForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.uniqueId(),
      taskName: '',
      dueDate: '',
      desc: '',
      subTasks: [],
      selected: false,
    };

    this.addTaskToUserObject = this.addTaskToUserObject.bind(this);
    this.handleDate = this.handleDate.bind(this);
    this.handleTaskName = this.handleTaskName.bind(this);
    this.handleDesc = this.handleDesc.bind(this);
  }

  handleTaskName(e) {
    if (e.target.value.length <= 20) {
      this.setState({ taskName: e.target.value });
    }
  }

  handleDate(e) {
    this.setState({ dueDate: e.target.value });
  }

  handleDesc(e) {
    this.setState({ desc: e.target.value });
  }

  // main function which adds the task
  async addTaskToUserObject() {
    const { taskName, dueDate, desc, selected, id } = this.state; // destructurig the state
    const {
      currentUserLoggedIn,
      dispatchCurrentUser,
      setLoading,
      setOpenTaskForm,
      setErrorCode,
    } = this.props; // arguments brought from parent component

    setLoading(true); // loading starts

    try {
      // checks for name duplication
      const duplicateName = currentUserLoggedIn.tasks.some(
        (task) => task.taskName === taskName
      );
      if (duplicateName) {
        setErrorCode('Duplicate task name.');
        return;
      }

      // preventing empty input fields
      const emptyInputFields = taskName === '' || dueDate === '' || desc === '';
      if (emptyInputFields) {
        setErrorCode('Found input fields empty.')
        return;
      }
      
      // preventing white-spaces
      const whiteSpaces = /^\s+/.test(taskName) === true || /^\s+/.test(desc);
      if (whiteSpaces) {
        setErrorCode('Found white-spaces before any word.')
        return;
      }

      // storing the new task object in a variable
      const newTask = {
        taskName: taskName,
        dueDate: dueDate,
        desc: desc,
        subTasks: [],
        selected: selected,
        id: id,
      };

      this.setState(newTask); // updating the task in the state

      const updatedTasks = [...currentUserLoggedIn.tasks, this.state]; // creating the updated tasks array

      // find the updated user
      const currentUser = { ...currentUserLoggedIn, tasks: updatedTasks };

      dispatchCurrentUser({
        // update the currentUserLoggedIn
        type: 'set_current_user',
        payload: {
          user: currentUser,
        },
      });

      // user reference
      const userRef = doc(db, 'users', currentUserLoggedIn.uid); // user reference from database
      await updateDoc(userRef, { tasks: updatedTasks }); // inserting the new task within the user's tasks array

      // closing the form after successfully adding the task
      setOpenTaskForm(false);
    } catch (error) {
      setErrorCode(error.code);
      throw new Error(`Unable to save task in the cloud. ${error.message}`);
    } finally {
      setLoading(false); // loading stops
    }
  }

  render() {
    return (
      <>
        {this.props.loading ? (
          <div className='flex justify-center items-center'>
            <Loading />
          </div>
        ) : (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className='bg-blue-200 border-2 border-blue-300 border-solid p-2 flex flex-col mt-4'
            >
              <label className='task-name flex flex-col'>
                Task Name
                <input
                  autoFocus
                  placeholder='Study...'
                  type='text'
                  className={`text-sm rounded-sm ${this.props.errorCode === '' ? 'bg-blue-50' : 'bg-red-400'} shadow-sm p-1 px-2 mb-2`}
                  value={this.state.taskName}
                  onChange={(e) => this.handleTaskName(e)}
                />
              </label>

              <label className='flex flex-col'>
                Due date
                <input
                  type='date'
                  className={`text-sm rounded-sm ${this.props.errorCode === '' ? 'bg-blue-50' : 'bg-red-400'} shadow-sm p-1 px-2 mb-2`}
                  onChange={(e) => this.handleDate(e)}
                />
              </label>

              <label className='desc flex flex-col'>
                Description
                <textarea
                  placeholder='From 7-9pm...'
                  name='desc'
                  id='add-task-desc'
                  rows={6}
                  className={`text-sm rounded-sm ${this.props.errorCode === '' ? 'bg-blue-50' : 'bg-red-400'} shadow-sm p-1 px-2 mb-2`}
                  onChange={(e) => this.handleDesc(e)}
                ></textarea>
              </label>

              {/* feedback box */}
              <DisplayErrorToUser error={this.props.errorCode} />

              <button
                onClick={() => {
                  this.addTaskToUserObject();
                }}
                className='rounded-sm bg-blue-500 px-2 text-white hover:bg-blue-300 hover:text-black hover:cursor-pointer duration-150 mt-2'
              >
                Create Task
              </button>
            </form>
          </>
        )}
      </>
    );
  }
}
