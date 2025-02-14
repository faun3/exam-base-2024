import {Op} from 'sequelize'
import models from '../../models/index.mjs'

const getUserProfile = async (req, res, next) => {
    try {
        const user = await models.User.findByPk(req.params.uid)
        if (user) {
            res.status(200).json(user)
        } else {
            res.status(404).json({message: 'User not found'})
        }
    } catch (err) {
        next(err)
    }
}

const suggestUser = async (req, res, next) => {
    try {
        const users = await models.User.findAll({
            where: {
                email: {
                    [Op.like]: `%${req.query.partial}%`
                }
            },
            attributes: ['id', 'email'],
            limit: 5
        })
        res.status(200).json(users)
    } catch (err) {
        next(err)
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const user = await models.User.findByPk(req.params.uid)
        if (user) {
            const callingUser = req.user;

            const isCallingUserAdmin = callingUser.type === 'admin';
            const isAffectedUserNotAdmin = user.type !== 'admin';

            if (isCallingUserAdmin && isAffectedUserNotAdmin) {
                await user.destroy();
            }

            res.status(200).json({message: 'User deleted'})
        } else {
            res.status(404).json({message: 'User not found'})
        }
    } catch (err) {
        next(err)
    }
}

const getRegularUsers = async (req, res, next) => {
    try {
        const users = await models.User.findAll({
            where: {
                type: 'regular'
            }
        })
        res.status(200).json(users)
    } catch (err) {
        next(err)
    }
}

export default {
    getUserProfile,
    suggestUser,
    deleteUser,
    getRegularUsers
}
