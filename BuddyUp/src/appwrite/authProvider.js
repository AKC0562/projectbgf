import { ID } from "appwrite";
import {account} from './client'

const authProvider = {

    async register({email,password,name}){
        const user = await account.create({
            userId: ID.unique(),
            email,
            password,
            name,
        })
        return user
    },
    async login ({email, password}){
        return await account.createEmailPasswordSession({
            email,
            password,
        })
    },
    async logout(){
        await account.deleteSession({
            sessionId: "current",
        })
        return true
    },
    async getCrrentUser(){
        try {
            return await account.get()
        } catch (error) {
            if(error?.code === 401){
                return null
            }
            throw error
        }
    },
    async setEmailVerification(url){
        return await account.createEmailVerification({
            url,
        })
    }
}

export default authProvider