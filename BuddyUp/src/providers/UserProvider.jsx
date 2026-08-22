import {
  createContext,
  useEffect,
  useState,
} from "react";

import authService from "../services/authService";
import userService from "../services/userService";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  // LOAD CURRENT USER
  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Appwrite Auth user
      const currentUser =
        await authService.getCurrentUser();

      if (!currentUser) {
        setAuthUser(null);
        setProfile(null);
        return;
      }

      setAuthUser(currentUser);

      // Appwrite $id is our user identity
      const userProfile =
        await userService.getById(
          currentUser.$id
        );

      setProfile(userProfile);

    } catch (error) {

      setAuthUser(null);
      setProfile(null);
      setError(error)
      throw error

    } finally {
      setLoading(false);
    }
  };

  // INITIAL USER CHECK

  useEffect(() => {
    loadUser();
  }, []);

  // REGISTER
  const register = async ({
    email,
    password,
    name,
    profileData = {},
  }) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Create Appwrite Auth account
      const createdUser =
        await authService.register({
          email,
          password,
          name,
        });
      // 2. Login after registration
      await authService.login({
        email,
        password,
      });

      // 3. Create profile in User table
      const createdProfile =
        await userService.createProfile({
          userId: createdUser.$id,
          ...profileData,
        });

      setAuthUser(createdUser);
      setProfile(createdProfile);

      return {
        user: createdUser,
        profile: createdProfile,
      };

    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

 //Login
  const login = async ({
    email,
    password,
  }) => {
    try {
      setLoading(true);
      setError(null);

      await authService.login({
        email,
        password,
      });


      const currentUser =
        await authService.getCurrentUser();

      setAuthUser(currentUser);

      // Profile table  data
      const userProfile =
        await userService.getById(
          currentUser.$id
        );

      setProfile(userProfile);

      return {
        user: currentUser,
        profile: userProfile,
      };

    } catch (error) {
      setAuthUser(null);
      setProfile(null);

      setError(error);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await authService.logout();

      setAuthUser(null);
      setProfile(null);

    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // UPDATE PROFILE

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);

      if (!authUser?.$id) {
        throw new Error(
          "User is not authenticated."
        );
      }

      const updatedProfile =
        await userService.updateProfile(
          authUser.$id,
          data
        );

      setProfile(updatedProfile);

      return updatedProfile;

    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // DELETE PROFILE
 
  const deleteProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!authUser?.$id) {
        throw new Error(
          "User is not authenticated."
        );
      }

      await userService.deleteProfile(
        authUser.$id
      );

      setProfile(null);

    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // Auth user
    authUser,

    // Database profile
    profile,

    // Combined convenience value
    user: {
      auth: authUser,
      profile,
    },

    loading,
    error,

    isAuthenticated: Boolean(authUser),

    // Auth actions
    register,
    login,
    logout,

    // Profile actions
    updateProfile,
    deleteProfile,

    // Refresh
    refreshUser: loadUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
