import storageProvider from "../appwrite/storageProvider";

const storageService = {
  async uploadProfileImage(file) {
    return await storageProvider.uploadProfileImage(
      file
    );
  },

  getFilePreview(fileId) {
    return storageProvider.getFilePreview(fileId);
  },

  async deleteFile(fileId) {
    return await storageProvider.deleteFile(fileId);
  },
};

export default storageService;