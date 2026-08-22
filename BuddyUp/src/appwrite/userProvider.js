// import {  Query } from "appwrite";
import {tablesDB} from './client'
import env from "../config/config"

const userProvider = {
    async createProfile({userId, ...profileData}){

        return await tablesDB.createRow({
            databaseId: env.appwriteDatabaseId,
            tableId:env.appwriteUserTableId,
            rowId: userId,

            data: profileData,
        })
       
        },
        async getById(userId){
            return await tablesDB.getRow({
                databaseId:env.appwriteDatabaseId,
                tableId:env.appwriteUserTableId,
                rowId: userId,
            })
        },
        async updateProfile(userId, data){
            return await tablesDB.updateRow({
                databaseId:env.appwriteDatabaseId,
                tableId:env.appwriteUserTableId,
                rowId: userId,
                data:data
            })

        },
        async deleteProfile(userId){
            return await tablesDB.deleteRow({
                databaseId:env.appwriteDatabaseId,
                tableId:env.appwriteUserTableId,
                rowId: userId
            })
        }
    }


export default userProvider