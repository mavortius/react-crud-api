import React, { useEffect, useState } from 'react';
import Axios from "axios";
import './App.css';

type Post = {
  userId: number,
  id?: number,
  title: string,
  body: string
}

const App: React.FC = () => {
  const apiUrl = "https://jsonplaceholder.typicode.com/posts";
  const cancelToken = Axios.CancelToken;
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [cancelTokenSource] = useState(cancelToken.source());
  const [loading, setLoading] = useState(true);
  const [editPost, setEditPost] = useState<Post>({ body: "", title: "", userId: 1 });

  useEffect(() => {
    Axios
      .get<Post[]>(apiUrl, {
        cancelToken: cancelTokenSource.token
      })
      .then((response) => {
        setPosts(response.data);
        setLoading(false);
      })
      .catch((ex) => {
        const err = Axios.isCancel(ex)
          ? "Request cancelled"
          : ex.code === "ECONNABORTED"
            ? "A timeout has occurred"
            : ex.response.status === 404
              ? "Resource not found"
              : "An unexpected error has occurred";
        setError(err);
        setLoading(false);
      });
  }, [cancelTokenSource.token]);


  const handleCancelClick = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("User cancelled operation");
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditPost({ ...editPost, title: e.currentTarget.value });
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditPost({ ...editPost, body: e.currentTarget.value });
  };

  const handleSaveClick = () => {
    if (editPost.id) {
      Axios
        .put<Post>(`${apiUrl}/${editPost.id}`, editPost,
          {
            headers: {
              "Content-Type": "application/json"
            }
          })
        .then(() => {
          setEditPost({
            body: "",
            title: "",
            userId: 1
          });
          setPosts(posts.filter(p => p.id !== editPost.id).concat(editPost));
        })
    } else {
      Axios
        .post<Post>(apiUrl, editPost,
          {
            headers: {
              "Content-Type": "application/json"
            }
          })
        .then((response) => {
          setPosts(posts.concat(response.data));
        });
    }
  };

  const handleUpdateClick = (post: Post) => {
    setEditPost(post);
  };

  const handleDeleteClick = (post: Post) => {
    Axios
      .delete(`${apiUrl}/${post.id}`)
      .then(() => {
        setPosts(posts.filter(p => p.id !== post.id));
      })
  };

  return (
    <div className="App">
      <div className="post-edit">
        <input type="text" placeholder="Enter title" value={editPost.title}
               onChange={handleTitleChange}/>
        <textarea placeholder="Enter body" value={editPost.body}
                  onChange={handleBodyChange}/>
        <button onClick={handleSaveClick}>Save</button>
      </div>
      {loading && (
        <button onClick={handleCancelClick}>Cancel</button>
      )}
      <ul className="posts">
        {posts.map(p => (
          <li key={p.id}>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
            <button onClick={() => handleUpdateClick(p)}>Update</button>
            <button onClick={() => handleDeleteClick(p)}>Delete</button>
          </li>
        ))}
      </ul>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default App;
