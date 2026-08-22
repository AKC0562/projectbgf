import bookingProvider from "../appwrite/bookingProvider";

const bookingServices = {
    async create(data){
        return await bookingProvider.create(data)
    },
    async getById(bookingId){
        return await bookingProvider.getById(bookingId)
    },
    async getByClientId(clientId){
        return await bookingProvider.getByClientId(clientId)
    },
    async getByCompanionId(companionId){
        return await bookingProvider.getByCompanionId(companionId)
    },
    async updateStatus(bookingId, status){
        return await bookingProvider.updateStatus(bookingId,status)
    },
    async updatepaymentStatus(bookigId, paymentStatus){
        return await bookingProvider.updatePaymentStatus(bookigId,paymentStatus)
    }
}

export default bookingServices