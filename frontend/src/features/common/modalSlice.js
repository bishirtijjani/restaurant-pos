import { createSlice } from '@reduxjs/toolkit'

export const modalSlice = createSlice({
    name: 'modal',
    initialState: {
        title: "",  // current title state management
        isOpen : false,   // modal state management for opening closing
        bodyType : "",   // modal content management
        size : "",   // modal size management
        extraObject : {},
        previousModal: null,  // stores the previous modal state when preservePrevious is used
    },
    reducers: {

        openModal: (state, action) => {
            const {title, bodyType, extraObject, size, preservePrevious} = action.payload
            
            // If preservePrevious is true and a modal is currently open, save it
            if (preservePrevious && state.isOpen) {
                state.previousModal = {
                    title: state.title,
                    bodyType: state.bodyType,
                    size: state.size,
                    extraObject: state.extraObject,
                    isOpen: state.isOpen
                }
            }
            
            // Set the new modal state
            state.isOpen = true
            state.bodyType = bodyType
            state.title = title
            state.size = size || 'md'
            state.extraObject = extraObject
        },

        closeModal: (state, action) => {
            // If there's a previous modal saved, restore it
            if (state.previousModal) {
                state.title = state.previousModal.title
                state.bodyType = state.previousModal.bodyType
                state.size = state.previousModal.size
                state.extraObject = state.previousModal.extraObject
                state.isOpen = state.previousModal.isOpen
                state.previousModal = null
            } else {
                // Normal close behavior - close the modal completely
                state.isOpen = false
                state.bodyType = ""
                state.title = ""
                state.extraObject = {}
            }
        },

    }
})

export const { openModal, closeModal } = modalSlice.actions

export default modalSlice.reducer