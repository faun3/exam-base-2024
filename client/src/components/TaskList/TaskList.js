import './TaskList.css'
import React, {useContext, useEffect, useState} from 'react'
import AppContext from '../../state/AppContext'
import {useNavigate, useParams} from 'react-router-dom'
import Task from './Task'

const TaskList = () => {
    const globalState = useContext(AppContext)
    const [tasks, setTasks] = useState([])
    const navigate = useNavigate()
    const params = useParams()

    const [isSortedByHighestPriority, setIsSortedByHighestPriority] = useState(false);

    const [filteredByPriority, setFilteredByPriority] = useState('');

    useEffect(() => {
        globalState.task.getAll(globalState, params.pid, isSortedByHighestPriority.toString(), filteredByPriority)
        globalState.task.emitter.addListener('GET_TASKS_SUCCESS', () => {
            setTasks(globalState.task.data)
        })
    }, [isSortedByHighestPriority, filteredByPriority])

    return (
        <div className='task-list'>
            <h1>Task list</h1>
            <table>
                <thead>
                <tr>
                    <th>
                        Name
                    </th>
                    <th>
                        Description
                    </th>
                    <th>Status</th>
                    <th>
                        <div>
                            <p>Priority</p>
                            <button onClick={async () => {
                                setIsSortedByHighestPriority((prev) => !prev);
                            }}>{isSortedByHighestPriority ? 'By Date Added' : 'By Priority'}</button>
                            {/* ! handling changes with selects */}
                            <select value={filteredByPriority} name="priorityToShow" id="priorityToShow"
                                    onChange={(e) => {
                                        setFilteredByPriority(e.target.value);
                                    }}>
                                <option value="">Filter by priority</option>
                                <option value="low">low</option>
                                <option value="medium">medium</option>
                                <option value="high">high</option>
                                <option value="highest">highest</option>
                            </select>
                        </div>
                    </th>
                </tr>
                </thead>
                <tbody>
                {
                    tasks.map(task => <Task key={task.id} task={task}/>)
                }
                </tbody>
            </table>
            <div className='footer'>
                <button onClick={() => navigate(`/projects/${params.pid}/tasks/new`)}>
                    Create Task
                </button>
            </div>
        </div>
    )
}

export default TaskList
