import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const BASE_URL =
  "https://db1465cb-65e8-45a7-ad65-e6e95ecaab8e-00-dipkkqto19bh.pike.replit.dev";

/* Asynchronous Thunk */
//Getting Posts from data
export const fetchPostsByUser = createAsyncThunk(
  "posts/fetchByUser",
  async (userId) => {
    const response = await fetch(`${BASE_URL}/posts/user/${userId}`);
    return response.json(); //Expecting to get list of data
  }
);

//Create Post and save to data
export const savePost = createAsyncThunk(
  "posts/savePost",
  async (postContent) => {
    const token = localStorage.getItem("authToken");
    const decode = jwtDecode(token);
    const userId = decode.id;

    const data = {
      title: "Post Title",
      content: postContent,
      user_id: userId,
    };

    const response = await axios.post(`${BASE_URL}/posts`, data);
    return response.data; //Not expecting to receive any data
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState: { posts: [], loading: true },
  reducers: {}, //Only specify synchronous function
  extraReducers: (builder) => {
    //Reducers for asynchronous function
    builder.addCase(fetchPostsByUser.fulfilled, (state, action) => {
      //Showing all the posts
      (state.posts = action.payload), (state.loading = false);
    }),
      builder.addCase(savePost.fulfilled, (state, action) => {
        //Creating new post
        state.posts = [action.payload, ...state.posts];
      });
  },
});

export default postsSlice.reducer;
