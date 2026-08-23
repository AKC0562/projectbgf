import {
  useEffect,
  useState,
} from "react";

import authService from "../services/authService";
import userService from "../services/userService";
import companionService from "../services/companionService";
import UserContext from "./UserContext";

export function UserProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --------------------------------
  // LOAD CURRENT USER
  // --------------------------------
  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser =
        await authService.getCurrentUser();

      if (!currentUser) {
        setAuthUser(null);
        setProfile(null);
        setRole(null);
        return;
      }

      setAuthUser(currentUser);

      /*
       * First check User table.
       */
      try {
        const userProfile =
          await userService.getById(
            currentUser.$id
          );

        if (userProfile) {
          setProfile(userProfile);
          setRole("user");
          return;
        }
      } catch {
        // User profile nahi mila.
        // Companion profile check karenge.
      }

      /*
       * Then check Companion table.
       */
      try {
        const companionProfile =
          await companionService.getByUserId(
            currentUser.$id
          );

        if (companionProfile) {
          setProfile(companionProfile);
          setRole("companion");
          return;
        }
      } catch {
        // Companion profile bhi nahi mila.
      }

      /*
       * Auth account exists,
       * but profile doesn't exist yet.
       */
      setProfile(null);
      setRole(null);

    } catch (error) {
      setAuthUser(null);
      setProfile(null);
      setRole(null);

      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // INITIAL AUTH CHECK
  // --------------------------------
  useEffect(() => {
    loadUser();
  }, []);

  // --------------------------------
  // REGISTER
  // --------------------------------
  const register = async ({
    email,
    password,
    name,
    role,
    profileData = {},
  }) => {
    try {
      setLoading(true);
      setError(null);

      /*
       * 1. Create Appwrite Auth account
       */
      const createdUser =
        await authService.register({
          email,
          password,
          name,
        });

      /*
       * 2. Login immediately
       */
      await authService.login({
        email,
        password,
      });

      /*
       * 3. Create role-specific profile
       */
      let createdProfile;

      if (role === "user") {
        createdProfile =
          await userService.createProfile({
            userId: createdUser.$id,
            name,
            email,
            role,
            ...profileData,
          });
      }

      if (role === "companion") {
        createdProfile =
          await companionService.createProfile({
            userId: createdUser.$id,
            name,
            email,
            ...profileData,
          });
      }

      if (!createdProfile) {
        throw new Error(
          "Invalid account role."
        );
      }

      setAuthUser(createdUser);
      setProfile(createdProfile);
      setRole(role);

      return {
        user: createdUser,
        profile: createdProfile,
        role,
      };

    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // LOGIN
  // --------------------------------
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

      /*
       * Check User profile
       */
      try {
        const userProfile =
          await userService.getById(
            currentUser.$id
          );

        if (userProfile) {
          setProfile(userProfile);
          setRole("user");

          return {
            user: currentUser,
            profile: userProfile,
            role: "user",
          };
        }
      } catch {
        // Continue to companion
      }

      /*
       * Check Companion profile
       */
      try {
        const companionProfile =
          await companionService.getByUserId(
            currentUser.$id
          );

        if (companionProfile) {
          setProfile(companionProfile);
          setRole("companion");

          return {
            user: currentUser,
            profile: companionProfile,
            role: "companion",
          };
        }
      } catch {
        // No profile found
      }

      throw new Error(
        "Profile not found for this account."
      );

    } catch (error) {
      setAuthUser(null);
      setProfile(null);
      setRole(null);

      setError(error);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // LOGOUT
  // --------------------------------
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await authService.logout();

      setAuthUser(null);
      setProfile(null);
      setRole(null);

    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // UPDATE PROFILE
  // --------------------------------
  const updateProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);

      if (!authUser?.$id) {
        throw new Error(
          "User is not authenticated."
        );
      }

      let updatedProfile;

      if (role === "user") {
        updatedProfile =
          await userService.updateProfile(
            authUser.$id,
            data
          );
      }

      if (role === "companion") {
        updatedProfile =
          await companionService.updateProfile(
            authUser.$id,
            data
          );
      }

      setProfile(updatedProfile);

      return updatedProfile;

    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // DELETE PROFILE
  // --------------------------------
  const deleteProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!authUser?.$id) {
        throw new Error(
          "User is not authenticated."
        );
      }

      if (role === "user") {
        await userService.deleteProfile(
          authUser.$id
        );
      }

      if (role === "companion") {
        await companionService.deleteProfile(
          authUser.$id
        );
      }

      setProfile(null);
      setRole(null);

    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    authUser,
    profile,
    role,

    user: {
      auth: authUser,
      profile,
    },

    loading,
    error,

    isAuthenticated: Boolean(authUser),

    isUser: role === "user",
    isCompanion: role === "companion",

    register,
    login,
    logout,

    updateProfile,
    deleteProfile,

    refreshUser: loadUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}