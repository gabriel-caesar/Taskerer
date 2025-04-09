export default function DisplayErrorToUser({ error }) {
   // Error mapping object
   const errorMessages = {
    'auth/email-already-in-use': 'Email already in use.',
    'auth/invalid-email': 'Invalid Email.',
    'auth/missing-password': 'Missing Password.',
    'auth/missing-email': 'Missing Email.',
    'auth/weak-password': 'Weak Password.',
    'auth/invalid-credential': 'Invalid Account.',
    'invalid-argument': 'Invalid Input(s).',
    'Duplicate task name.': 'There is already a task with this name.',
  };

  // Check if the error exists in the mapping and render it
  return (
    <>
      {errorMessages[error] && (
        <div className='rounded-sm bg-red-300 text-gray-700 text-base my-2 w-auto px-6 text-center mr-1'>
          {errorMessages[error]}
        </div>
      )}
    </>
  );
}