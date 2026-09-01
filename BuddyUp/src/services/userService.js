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
    async updateLocation(userId, locationData) {
        return await userProvider.updateLocation(
            userId,
            locationData
        );
    },
    async deleteProfile(userId){
        return await userProvider.deleteProfile(userId)
    }
}

export default userService