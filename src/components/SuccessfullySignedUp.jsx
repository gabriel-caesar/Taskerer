export default function SuccessfullySignedUp({ sign }) {
  return (
    <>
      {sign && (
        <div className='rounded-sm bg-green-300 text-gray-700 text-base my-2 w-auto px-6 text-center mr-1'>
          Successfully signed up. Now you can log in!
        </div>
      )}
    </>
  );
}
