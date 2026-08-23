import { ID, Query } from "appwrite";
import { tablesDB } from "./client";
import env from "../config/config";

const bookingProvider = {
    async create(data){
        return await tablesDB.createRow({
            databaseId:env.appwriteDatabaseId,
            tableId: env.appwriteBookingTableId,
            rowId: ID.unique(),
            data
        })
    },
    async getById(bookingId){
        return await tablesDB.getRow({
            databaseId:env.appwriteDatabaseId,
            tableId:env.appwriteBookingTableId,
            rowId:bookingId
        })
    },
    async getByClientId(clientId){
        const response = await tablesDB.listRows({
            databaseId:env.appwriteDatabaseId,
            tableId: env.appwriteBookingTableId,
            queries:[
                Query.equal("clientId",clientId)
            ]
        })
        return response.rows;
    },
    async getByCompanionId(companionId){
        const response = await tablesDB.listRows({
            databaseId:env.appwriteDatabaseId,
            tableId:env.appwriteBookingTableId,
            rowId:companionId
        })
        return response.rows
    },
    async updateStatus(bookingId,status){
        return await tablesDB.updateRow({
            databaseId:env.appwriteDatabaseId,
            tableId:env.appwriteBookingTableId,
            rowId:bookingId,
            data:{
                status
            }
        })
    },
    async updatePaymentStatus(bookinId, paymentStatus){
        return await tablesDB.updateRow({
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
