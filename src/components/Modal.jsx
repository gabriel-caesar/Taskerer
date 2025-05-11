export default function Modal({
  yesFunction,
  noFunction,
  text,
  className,
  yesText,
  noText,
}) {
  return (
    <div className={className}>
      <h1 className='mb-2 text-center'>{text}</h1>
      <div className='flex justify-center items-center'>
        <button
          className='rounded-sm mr-2 bg-blue-800 px-2 py-1 text-white hover:bg-blue-300 hover:text-black hover:cursor-pointer duration-150 transition-all'
          onClick={yesFunction}
        >
          {yesText}
        </button>
        <button
          className='rounded-sm bg-blue-800 px-2 py-1 text-white hover:bg-blue-300 hover:text-black hover:cursor-pointer duration-150 transition-all'
          onClick={noFunction}
        >
          {noText}
        </button>
      </div>
    </div>
  );
}
