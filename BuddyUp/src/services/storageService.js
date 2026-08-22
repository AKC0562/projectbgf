import storageProvider from "../appwrite/storageProvider";

const storageService = {
    async uploadProfileImage(file, userId){
        return storageProvider.uploadFile(file)
    },
    async uploadCompanionImage(file, userId){
        return storageProvider.uploadFile(file)
    },
    async deleteFile(fileId){
        return storageProvider.deleteFile(fileId)
    },
    getFilePreview(fileId){
        return storageProvider.getFilePreview(fileId)
    }
}


export default storageService