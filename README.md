# Taskerer (task tracker app)

### Live demo:
https://taskerer.netlify.app/

### Testing:
Open the live demo website, click the `Sign Up/In` button, enter an email and a password and **Sign Up** if not already or **Log In**.

By clicking `Expand` under the user icon, you can update your profile details when the dropdown shows up. You can also close it by clicking in it again (`Collapse`).

By clicking `Add Header Task` you create one by filling the fields requested.

Deleting header tasks can be done by clicking the `X` circle that is rendered for each task on the **Left Panel**.

You can edit your header task by clicking the **Pencil Icon** in the right-top corner on the **Right Panel** when a header task is selected.

Lastly create sub-tasks under a header task by clicking the blue button `Add sub-task` when a task is selected (to delete a sub-task follows the same pattern as for header tasks).


# Key Features:

- **Firebase authentication (login, signup)**
  - **Login Logic:**
    > `src/components/left_panel_components/SignUpForm.jsx`
      - **Line 57**
  - **Signup Logic:** 
    >`src/components/left_panel_components/SignUpForm.jsx`
      - **Line 127**

---

- **CRUD for header tasks**
  - **Create:**
      > src/components/left_panel_components/AddTaskForm.jsx
      - **Line 41**
  - **Read**
      > src/components/App.jsx
      - It reads from `currentUserLoggedIn`

  - **Update**
      > src/components/right_panel_components/RightPanel.jsx
      - **Line 75**

  - **Delete**
      > src/components/left_panel_components/LeftPanel.jsx
      - **Line 50**
---

- **CRUD for sub-tasks**
  - **Found in:**
    > src/components/right_panel_components/SubTaskFunctions.jsx
      - **As from line 50**

---

- **Firebase integration**
    > src/firebase.js

---

- **React + useReducer + Context API for state management**
    > src/components/App.jsx

    
