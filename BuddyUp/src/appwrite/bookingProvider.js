import { ID, Query } from "appwrite";
import { tablesDb } from "./client";
import env from "../config/config";

const bookingProvider = {
    async create(data){
        return await tablesDb.createRow({
            databaseId:env.appwriteDatabaseId,
            tableId: env.appwriteBookingTableId,
            rowId: ID.unique(),
            data
        })
    },
    async getById(bookingId){
        return await tablesDb.getRow({
            databaseId:env.appwriteDatabaseId,
            tableId:env.appwriteBookingTableId,
            rowId:bookingId
        })
    },
    async getByClientId(clientId){
        const response = await tablesDb.listRows({
            databaseId:env.appwriteDatabaseId,
            tableId: env.appwriteBookingTableId,
            queries:[
                Query.equal("clientId",clientId)
            ]
        })
        return response.rows;
    },
    async getByCompanionId(companionId){
        const response = await tablesDb.listRows({
            databaseId:env.appwriteDatabaseId,
            tableId:env.appwriteBookingTableId,
            rowId:companionId
        })
        return response.rows
    },
    async updateStatus(bookingId,status){
        return await tablesDb.updateRow({
            databaseId:env.appwriteDatabaseId,
            tableId:env.appwriteBookingTableId,
            rowId:bookingId,
            data:{
                status
            }
        })
    },
    async updatePaymentStatus(bookinId, paymentStatus){
        return await tablesDb.updateRow({
            databaseId:env.appwriteDatabaseId,
            tableId:env.appwriteBookingTableId,
            rowId:bookinId,
            data:{
                paymentStatus
            }
        })
    }
}

export default bookingProvider
