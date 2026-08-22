import {ID} from 'appwrite'
import { Storage } from 'appwrite'
import env from '../config/config'


const storageProvider = {
    async uploadFile(file, permissions = []){
        const uploadedFile = await Storage.createFile(
            env.appwriteBucketId,
            ID.unique(),
            file,
            permissions
        )
        return uploadedFile
    },
    async deleteFile(fileId){
        await Storage.deleteFile(
            env.appwriteBucketId,
            fileId
        )
        return true
    },
    getFilePreview(fileId){
        return Storage.getFilePreview(
            env.appwriteBucketId,
            fileId
        )
    }
}

export default storageProvider