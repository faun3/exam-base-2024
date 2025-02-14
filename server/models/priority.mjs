export default (sequelize, DataTypes) => {
    return sequelize.define('priority', {
        priorityLevel: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'medium'
        }
    })
}
