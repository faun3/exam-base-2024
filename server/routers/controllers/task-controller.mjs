import models from '../../models/index.mjs'
import {Op} from "sequelize";

const getAllTasksForProject = async (req, res, next) => {
    try {
        const query = {
            where: {
                projectId: req.params.pid
            }
        }
        const filterQuery = {
            where: {
                projectId: req.params.pid
            }
        }
        const count = await models.Task.count({
            ...filterQuery,
            include: {
                model: models.Permission,
                where: {
                    forUser: req.params.uid,
                    type: 'task'
                },
                required: false
            }
        })

        const filterByPriority = req.query.filterByPriority;

        console.log('filterByPriority', filterByPriority);

        let priorityWhereFilter = {
            priorityLevel: {
                [Op.not]: null
            }
        };
        if (filterByPriority && filterByPriority !== '' && (new Set(['low', 'medium', 'high', 'highest'])).has(filterByPriority)) {
            console.log('we filtered', filterByPriority);
            priorityWhereFilter = {
                priorityLevel: filterByPriority
            }
        }

        let data = await models.Task.findAll({
            ...query,
            include: [{
                model: models.Permission,
                where: {
                    forUser: req.params.uid,
                    type: 'task'
                },
                required: false
            }, {
                model: models.User,
                required: false,
                as: 'assignedTo',
                attributes: ['id', 'email']
            }, {
                model: models.Priority,
                required: true,
                as: 'priority',
                attributes: ['priorityLevel'],
                where: priorityWhereFilter
            }
            ]
        })

        if (req.query.sortByPrio === 'true') {
            console.log('WAS TRUE');

            data.sort((a, b) => {
                const prioMap = {
                    lowest: 3,
                    medium: 2,
                    high: 1,
                    highest: 0
                }

                const priorityA = prioMap[a.priority.priorityLevel];
                const priorityB = prioMap[b.priority.priorityLevel];

                return priorityA - priorityB;
            });
        }

        res.status(200).json({data, count})
    } catch (err) {
        next(err)
    }
}

const getOneTaskForProject = async (req, res, next) => {
    try {
        const task = await models.Task.findOne({
            where: {
                id: req.params.tid,
                projectId: req.params.pid
            },
            include: [{
                model: models.Permission,
                where: {
                    forUser: req.params.uid,
                    type: 'task'
                },
                required: false
            }, {
                model: models.User,
                required: false,
                as: 'assignedTo',
                attributes: ['id', 'email']
            }]
        })
        if (task) {
            res.status(200).json(task)
        } else {
            res.status(404).json({message: 'Task not found'})
        }
    } catch (err) {
        next(err)
    }
}

const createOwnedTaskForProject = async (req, res, next) => {
    try {
        const task = await models.Task.create({
            ...req.body,
            projectId: req.params.pid
        })

        await models.Priority.create({
            priorityLevel: req.body.priority ?? 'high',
            taskId: task.id
        })

        await models.Permission.create({
            forResource: task.id,
            forUser: req.params.uid,
            type: 'task',
            rights: ['read', 'write']
        })
        res.status(201).json(task)
    } catch (err) {
        next(err)
    }
}

const updateOwnedTaskForProject = async (req, res, next) => {
    try {
        const task = await models.Task.findOne({
            where: {
                id: req.params.tid,
                projectId: req.params.pid
            }
        })
        if (task) {
            await task.update(req.body)
            res.status(200).json(task)
        } else {
            res.status(404).json({message: 'Task not found'})
        }
    } catch (err) {
        next(err)
    }
}

const deleteOwnedTaskForProject = async (req, res, next) => {
    try {
        const task = await models.Task.findOne({
            where: {
                id: req.params.tid,
                projectId: req.params.pid
            }
        })
        const permission = await models.Permission.findOne({
            where: {
                forResource: req.params.tid,
                forUser: req.params.uid,
                type: 'task'
            }
        })
        if (task && permission) {
            await permission.destroy()
            await task.destroy()
            res.status(204).end()
        } else {
            res.status(404).json({message: 'Task not found'})
        }
    } catch (err) {
        next(err)
    }
}


const assignTaskToUser = async (req, res, next) => {
    try {
        const task = await models.Task.findOne({
            where: {
                id: req.params.tid,
                projectId: req.params.pid
            }
        })

        if (!task) {
            return res.status(404).json({message: 'Task not found'})
        }

        const user = await models.User.findOne({
            where: {
                id: req.body.assignedTo
            }
        })

        if (!user) {
            return res.status(404).json({message: 'User not found'})
        }

        await task.update({assignedToId: req.body.assignedTo})
        res.status(200).json(task)
    } catch (err) {
        next(err)
    }
}

const updateAssignedTaskStatus = async (req, res, next) => {
    try {
        const task = await models.Task.findOne({
            where: {
                id: req.params.tid,
                projectId: req.params.pid
            }
        })

        if (!task) {
            return res.status(404).json({message: 'Task not found'})
        }

        await task.update({status: req.body.status})
        res.status(200).json(task)
    } catch (err) {
        next(err)
    }
}

const updateTaskPriority = async (req, res, next) => {
    try {
        const task = await models.Task.findOne({
            where: {
                id: req.params.taskId,
                projectId: req.params.projectId
            }
        });

        if (!task) {
            res.status(404).json({error: 'The task you are looking for does not exist'});
        }

        const newPriority = req.body.priority;

        const prioritiesSet = new Set(['low', 'medium', 'high', 'highest']);

        if (!newPriority || newPriority === '') {
            res.status(400).json({error: 'New priority missing in request body'});
        }

        if (!prioritiesSet.has(newPriority)) {
            res.status(400).json({error: `Bad status. Status should be one of: [${[...prioritiesSet].join(', ')}]`})
        }

        const tasksPriority = await models.Priority.findOne({
            where: {
                taskId: task.id
            }
        });

        await tasksPriority.update({
            priorityLevel: newPriority
        })

        res.status(200).json({task, priority: tasksPriority})

    } catch (e) {
        next(e);
    }
}

export default {
    getAllTasksForProject,
    getOneTaskForProject,
    createOwnedTaskForProject,
    updateOwnedTaskForProject,
    deleteOwnedTaskForProject,
    assignTaskToUser,
    updateAssignedTaskStatus,
    updateTaskPriority
}
