import { Component } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import DisplayErrorToUser from './DisplayErrorToUser';
import { fetchUserData } from './fetchUserData';
import Loading from './Loading';

export default class AddTaskForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      taskName: props.taskName,
      dueDate: props.dueDate,
      desc: props.desc,
      selected: false,
    };

    this.addTaskToUserObject = this.addTaskToUserObject.bind(this);
    this.handleDate = this.handleDate.bind(this);
    this.handleTaskName = this.handleTaskName.bind(this);
    this.handleDesc = this.handleDesc.bind(this);
    this.updateTheCurrentUser = this.updateTheCurrentUser.bind(this);
  }

  handleTaskName(e) {
    this.setState({ taskName: e.target.value });
  }

  handleDate(e) {
    this.setState({ dueDate: e.target.value });
  }

  handleDesc(e) {
    this.setState({ desc: e.target.value });
  }

  async updateTheCurrentUser() {
    await fetchUserData(this.props.setUserData); // even though I am updating userData here, this update doesn't get immediatly reflected in this function

    this.props.setUserData((prevData) => {
      // so I have to call setUserData again to work with the most up to date userData
      const user = prevData.find(
        (user) => user.email === this.props.currentUser.email
      );
      this.props.setCurrentUser(user);
      localStorage.clear(); // clear the old data
      localStorage.setItem('current-user', JSON.stringify(user)); // upload the new data
      return prevData; // Preserve state
    });
  }

  // main function which adds the task
  async addTaskToUserObject() {
    const { taskName, dueDate, desc, selected } = this.state; // destructurig the state
    const { currentUser } = this.props; // argument brought from parent component
    this.props.setLoading(true); // loading starts

    try {

      // checks for name duplication
      const duplicateName = currentUser.tasks.some(task => task.taskName === taskName);
      if (duplicateName) {
        this.props.setErrorCode('Duplicate task name.');
        return;
      }

      // storing the new task object in a variable
      const newTask = {
        taskName: taskName,
        dueDate: dueDate,
        desc: desc,
        selected: selected,
      }

      // updating the task in the state
      this.setState(newTask);

      // user reference
      const userRef = doc(db, 'users', this.props.currentUser.uid);

      await updateDoc(userRef, {
        // inserting the new task within the user's tasks array
        tasks: [...currentUser.tasks, this.state],
      });

      await this.updateTheCurrentUser(); // after updating the tasks array, this function updates the whole user because of that change

      // closing the form after successfully adding the task
      this.props.setOpenTaskForm(false);
    } catch (error) {
      this.props.setErrorCode(error.code);
      throw new Error(`Unable to save task in the cloud. ${error.message}`);
    } finally {
      this.props.setLoading(false); // loading stops
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
                  type='text'
                  className={`text-sm rounded-sm ${this.props.errorCode === '' ? 'bg-blue-50' : 'bg-red-400'} shadow-sm p-1 px-2 mb-2`}
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
