import { useContext, useState } from 'react';
import { userContext } from './App';

function ProgressWheel() {
  const { currentSelectedTask } = useContext(userContext);
  const [radius, setRadius] = useState(110);
  const [C, setC] = useState(2 * Math.PI * radius);

  function progress() {
    const completedSubTasks = currentSelectedTask.subTasks.filter(
      (subtask) => subtask.completed
    ).length;
    const totalSubTasks = currentSelectedTask.subTasks.length;
    const progressValue = Math.floor(
      (parseInt(completedSubTasks) * 100) / parseInt(totalSubTasks)
    );
    return progressValue;
  }

  function offset() {
    return C - (progress() / 100) * C;
  }

  function color() {
    return progress() === 100 ? '#94c4f4' : '#BFDCFF';
  }

  function fontSize() {
    return currentSelectedTask.subTasks.length < 1 ? '1.5rem' : '2.5rem';
  }

  return (
    <>
      <h1 className='font-bold text-2xl underline mb-4 text-black'>
        Progress Wheel
      </h1>
      <div className='relative shadow-2xl rounded-b-full'>
        <svg
          className='flex items-center justify-center'
          width={250}
          height={250}
        >
          <circle
            cx={radius + 15}
            cy={radius + 15}
            strokeWidth='12px'
            r={radius}
            stroke='#398dfa'
            style={{
              fill: color(),
              strokeDasharray: C,
              strokeDashoffset: offset(),
              transition: 'fill 0.8s ease, stroke-dashoffset 0.8s ease',
            }}
          />
          <text
            x='50%'
            y='50%'
            textAnchor='middle'
            style={{
              fontSize: fontSize(),
              fontFamily: 'Tahoma, system-ui',
            }}
          >
            {currentSelectedTask.subTasks.length < 1
              ? 'No sub-tasks yet'
              : progress() + '%'}
          </text>
        </svg>
        {currentSelectedTask.subTasks.length >= 1 && (
          <p
            className={`absolute top-32 right-10 transition-colors duration-800 ${progress() === 100 ? 'text-black' : 'text-blue-200'}`}
          >
            Header task completed
          </p>
        )}
      </div>
    </>
  );
}

export default ProgressWheel;
