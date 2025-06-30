import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

/* Asynchronous Thunk */
//Getting Posts from data
export const fetchPostsByUser = createAsyncThunk(
  "posts/fetchByUser",
  async (userId) => {
    try {
      const postsRef = collection(db, `users/${userId}/posts`);

      const querySnapshot = await getDocs(postsRef);
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return docs;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
);

//Create Post and save to data
export const savePost = createAsyncThunk(
  "posts/savePost",
  async ({ userId, postContent }) => {
    try {
      const postsRef = collection(db, `users/${userId}/posts`);
      console.log(`users/${userId}/posts`);
      const newPostRef = doc(postsRef);
      console.log(postContent);
      await setDoc(newPostRef, { content: postContent, likes: [] });
      const newPost = await getDoc(newPostRef);

      const post = {
        id: newPost.id,
        ...newPost.data(),
      };

      return post;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
);

export const likePost = createAsyncThunk(
  "post/likePost",
  async ({ userId, postId }) => {
    try {
      const postRef = doc(db, `users/${userId}/posts/${postId}`);
      const docSnapshot = await getDoc(postRef);

      if (docSnapshot.exists()) {
        //if the post exist in the database
        const postData = docSnapshot.data();
        const likes = [...postData.likes, userId];

        await setDoc(postRef, { ...postData, likes });
      }

      return { userId, postId };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
);

export const removeLikeFromPost = createAsyncThunk(
  "post/removeLikeFromPost",
  async ({ userId, postId }) => {
    try {
      const postRef = doc(db, `users/${userId}/posts/${postId}`);
      const docSnapshot = await getDoc(postRef);

      if (docSnapshot.exists()) {
        const postData = docSnapshot.data();
        const likes = postData.likes.filter((id) => id !== userId);

        await setDoc(postRef, { ...postData, likes });
      }

      return { userId, postId };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState: { posts: [], loading: true },
  extraReducers: (builder) => {
    //Reducers for asynchronous function
    builder
      .addCase(fetchPostsByUser.fulfilled, (state, action) => {
        //Showing all the posts
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(savePost.fulfilled, (state, action) => {
        //Creating new post
        state.posts = [action.payload, ...state.posts];
      })
      .addCase(likePost.fulfilled, (state, action) => {
        //Like post
        const { userId, postId } = action.payload;

        const postIndex = state.posts.findIndex((post) => post.id === postId); //if the post exist in the state
        if (postIndex !== -1) {
          //if the post doesn't exist, it gives -1 as an index
          state.posts[postIndex].likes.push(userId);
        }
      })
      .addCase(removeLikeFromPost.fulfilled, (state, action) => {
        //Remove like from post
        const { userId, postId } = action.payload;

        const postIndex = state.posts.findIndex((post) => post.id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].likes = state.posts[postIndex].likes.filter(
            (id) => id !== userId
          );
        }
      });
  },
});

export default postsSlice.reducer;
