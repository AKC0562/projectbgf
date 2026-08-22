import { ID, Query } from "appwrite";
import env from "../config/config"
import { tablesDb } from "./client";


const companionProvider = {
    async createProfile({userId, ...profileData}){
        return await tablesDb.createRow({
            databaseId: env.appwriteDatabaseId,
            tableId: env.appwriteCompanionsTableId,
            row: ID.unique(),
            data: {
                userId,
                ...profileData
            }
        })
    },
    async getById(companionId){
        return await tablesDb.getRow({
            databaseId:env.appwriteDatabaseId,
            tableId: env.appwriteCompanionsTableId,
            rowId:companionId
        })
    },
    async getByUserId(userId){
        const response =  await tablesDb.getRow({
            databaseId:env.appwriteDatabaseId,
            tableId: env.appwriteCompanionsTableId,
            queries:[
                Query.equal("userId",userId),
                Query.limit(1),
            ]
        })
        return response.rows[0] || null
    } ,
    async getAll(){
        const response = await tablesDb.listRows({
            databaseId:env.appwriteDatabaseId,
            tableId: env.appwriteCompanionsTableId,
            queries:[
                Query.equal("isactive",true)
            ]
        })
        return response.rows
    },
    async updateProfile(companionid, data){
        return await tablesDb.updateRow({
            databaseId: env.appwriteDatabaseId,
            tableId:env.appwriteCompanionsTableId,
            rowId: companionid, data
        })
    },
    async deleteProfile(companionId){
        return await tablesDb.deleteRow({
            databaseId:env.appwriteDatabaseId,
            tableId:env.appwriteCompanionsTableId,
            rowId: companionId
        })
    }
}

export default companionProvider