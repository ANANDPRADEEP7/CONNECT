import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { userApi } from "../../Endpoints/Api/user/userApi";
import { adminApi } from "../../Endpoints/Api/Admin/adminApi";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isRiderActive?: "pending" | "active" | "declined" | "none";
  isBlocked?: boolean;
  phonenumber?: string;
  authProvider?: "local" | "google";
  bio?: string;
  govId?: string;
  vehicleImage?: string;
  pucImage?: string;
  rcImage?: string;
  rejectionReason?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  admin: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  admin: null,
  isLoading: true, // Start loading since we will fetch session on load
  isInitialized: false,
};

// Thunk to fetch user & admin session on reload
export const checkAuthSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { dispatch }) => {
    try {
      const isAdminRoute = window.location.pathname.startsWith("/admin");

      if (isAdminRoute) {
        try {
          const adminRes = await adminApi.getMe();
          if (adminRes?.admin) {
            dispatch(setAdmin(adminRes.admin));
          }
        } catch (error) {
          // Ignore 401s or other errors on initial load
        }
      } else {
        try {
          const userRes = await userApi.getMe();
          if (userRes?.user) {
            dispatch(setUser(userRes.user));
          }
        } catch (error) {
          // Ignore errors
        }
      }
    } catch (error) {
      console.error("Failed to check auth session", error);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ── User ──────────────────────────────────────────────
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },

    // ── Admin ─────────────────────────────────────────────
    setAdmin(state, action: PayloadAction<AuthUser>) {
      state.admin = action.payload;
    },
    clearAdmin(state) {
      state.admin = null;
    },

    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthSession.fulfilled, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(checkAuthSession.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      });
  },
});

export const { setUser, clearUser, setAdmin, clearAdmin, setAuthLoading } = authSlice.actions;

export default authSlice.reducer;
