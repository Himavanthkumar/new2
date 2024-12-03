import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 5000
});

export const fetchPosts = async pageParam => {
  try {
    const response = await api.get(`/posts?page=${pageParam}&limit=10`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch posts");
  }
};
