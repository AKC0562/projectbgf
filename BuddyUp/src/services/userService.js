import userProvider from "../appwrite/userProvider"

const userService = {
    async createProfile (data){
        return await userProvider.createProfile(data)
    },
    async getById (userId){
        return await userProvider.getById(userId)
    },
    async updateProfile(userId,data){
        return await userProvider.updateProfile(userId,data)
    },
    async deleteProfile(userId){
        return await userProvider.deleteProfile(userId)
    }
}

export default userService