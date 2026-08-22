const config = {
    appwriteURL: String(import.meta.env.VITE_APPWRITE_ENDPOINT),
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwriteUserTableId: String(import.meta.env.VITE_APPWRITE_USERS_TABLE_ID),
    appwriteCompanionsTableId: String(import.meta.env.VITE_APPWRITE_COMPANIONS_TABLE_ID),
    appwriteBookingTableId: String(import.meta.env.VITE_APPWRITE_BOOKINGS_TABLE_ID),
    appwriteReviewTableId: String(import.meta.env.VITE_APPWRITE_REVIEWS_TABLE_ID),
    appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
}

export default config