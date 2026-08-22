import companionProvider from "../appwrite/companionProvider";

const companionService = {
    async createProfile(data){
        return await companionProvider.createProfile(data)
    },
    async getByID(companionId){
        return await companionProvider.getById(companionId)
    },
    async getByUserId(userId){
        return await companionProvider.getByUserId(userId)
    },
    async getAll(){
        return await companionProvider.getAll()
    },
    async updateProfile (companionId, data){
        return await companionProvider.updateProfile(companionId, data)
    },
    async deleteProfie(companionId){
        return await companionProvider.deleteProfile(companionId)
    }
}

export default companionService