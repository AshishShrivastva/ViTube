import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    status: boolean;
    userData: null | object;
}

const initialState: AuthState = {
    status: false,
    userData: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<object>) => {
            state.status = true;
            state.userData = action.payload;
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;