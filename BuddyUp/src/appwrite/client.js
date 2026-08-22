import{Client,Account,TablesDB,Storage} from 'appwrite'
import env from '../config/config'

const client = new Client();

client
.setEndpoint(env.appwriteURL)
.setProject(env.appwriteProjectId)


export const account = new Account(client)
export const tablesDb = new TablesDB(client)
export const storage = new Storage(client)


export default client;