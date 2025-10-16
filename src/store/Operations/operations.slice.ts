import { createSlice } from '@reduxjs/toolkit';
import type { OperationsState } from './operations.types';

const initialState: OperationsState = {};

const operationsStateSlice = createSlice({
    initialState,
    name: 'operationsState',
    reducers: {
        clearOperationsState: () => initialState,
    },
});

export default operationsStateSlice.reducer;
export const { clearOperationsState } = operationsStateSlice.actions;
