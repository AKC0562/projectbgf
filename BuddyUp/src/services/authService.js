import authProvider from "../appwrite/authProvider";

const authService = {
    async register(data){
        return authProvider.register(data)
    },
    async login(credentials){
        return authProvider.login(credentials)
    },
    async logout(){
        return authProvider.logout()
    },
    async getCurrentUser(){
        return authProvider.getCrrentUser()
    },
    async sendEmailVerification(url){
        return authProvider.sendEmailVerification(url)
    }
}


export default authService