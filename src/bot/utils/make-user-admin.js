/* eslint-disable @typescript-eslint/no-var-requires */
import cli from "cli";

const dotenv = require('dotenv-flow');
const Sequelize = require('sequelize');
import appRootPath from 'app-root-path'
const { scopeTypeSeed } = require('@etherealengine/server-core/src/scope/scope-type/scope-type.seed')

dotenv.config({
    path: appRootPath.path,
    silent: true
})
const db = {
    username: process.env.MYSQL_USER ?? 'server',
    password: process.env.MYSQL_PASSWORD ?? 'password',
    database: process.env.MYSQL_DATABASE ?? 'etherealengine',
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: process.env.MYSQL_PORT ?? 3306,
    dialect: 'mysql'
};

db.url = process.env.MYSQL_URL ??
    `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`;

export const makeAdmin = async (userId) => {
    try {
        const sequelizeClient = new Sequelize({
            ...db,
            logging: true,
            define: {
                freezeTableName: true
            }
        });

        await sequelizeClient.sync();

        const User = sequelizeClient.define('user', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV1,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            },
            userRole: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
            }
        });

        const Scope = sequelizeClient.define('scope', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV1,
                allowNull: false,
                primaryKey: true
            },
            userId: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
            },
            type: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            }
        })

        const userMatch = await User.findOne({
            where: {
                id: userId
            }
        });

        if (userMatch != null) {
            userMatch.userRole = 'admin';
            await userMatch.save();
            for(const { type } of scopeTypeSeed.templates) {
                try {
                    const existingScope = await Scope.findOne({ where: { userId: userId, type }})
                    if (existingScope == null)
                        await Scope.create({ userId: userId, type })
                } catch (e) { console.log(e) }
            }

            console.log(`User with id ${userId} made an admin` );
        } else {
            console.log(`User with id ${userId} does not exist`)
        }
    }
    catch (err) {
        console.log(err);
    }
};
