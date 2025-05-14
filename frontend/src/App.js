import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // ← 追加
import 'react-toastify/dist/ReactToastify.css'; // ← 追加

import Login from './pages/Login';
import Register from './pages/Register';
import TodoList from './pages/TodoList';
import PrivateRoute from './components/PrivateRoute';
import Headerbar from './components/Headerbar';

function App() {
  return (
    <Router>
      <Headerbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <TodoList />
            </PrivateRoute>
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
